import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { BACKGROUND_LOCATION_TASK, clearBackgroundLocationData, getBackgroundPathPoints, getBackgroundTotalDistance } from '../tasks/backgroundLocationTask';
import { logger } from '../utils/logger';

// Storage key para corrida em andamento
const ACTIVE_RUN_STORAGE_KEY = '@running_well:active_run';

// Verificar se está rodando em build nativo (TaskManager só funciona em builds nativos)
// Usar múltiplas verificações para garantir detecção correta
const isNativeBuild = (() => {
  // Verificar executionEnvironment
  const env = Constants.executionEnvironment;
  const isStandalone = env === 'standalone' || env === 'storeClient';
  
  // Verificar se não é Expo Go (Expo Go tem appOwnership diferente)
  const appOwnership = Constants.appOwnership || 'expo';
  const isNotExpoGo = appOwnership !== 'expo';
  
  // Verificar se TaskManager está disponível (mais confiável)
  let taskManagerAvailable = false;
  try {
    const TaskManager = require('expo-task-manager');
    taskManagerAvailable = !!TaskManager;
  } catch (e) {
    taskManagerAvailable = false;
  }
  
  // Considerar nativo se qualquer uma das condições for verdadeira
  const result = isStandalone || isNotExpoGo || taskManagerAvailable;
  
  console.log('🔍 Detecção de build nativo:', {
    executionEnvironment: env,
    appOwnership,
    isStandalone,
    isNotExpoGo,
    taskManagerAvailable,
    finalResult: result
  });
  
  return result;
})();

// Minimum distance threshold to filter GPS noise (in km)
// Reduzido para capturar mais pontos e fazer curvas suaves
const MIN_DISTANCE_THRESHOLD = 0.0001; // ~0.1 metros (muito pequeno para capturar curvas)
// Maximum distance threshold to filter GPS jumps (in km)
const MAX_DISTANCE_THRESHOLD = 0.2; // ~200 metros (aumentado para não perder pontos válidos)

const LocationTrackingContext = createContext();

export function LocationTrackingProvider({ children }) {
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const [pathPoints, setPathPoints] = useState([]);
  const [paceData, setPaceData] = useState([]); // Array de { time, distance, pace }
  
  const watchSubscription = useRef(null);
  const timerInterval = useRef(null);
  const paceInterval = useRef(null); // Intervalo para coletar dados de pace
  const backgroundLocationInterval = useRef(null); // Fallback interval for background
  const startTime = useRef(null);
  const pausedTime = useRef(0);
  const lastLocation = useRef(null);
  const totalDistance = useRef(0);
  const isPaused = useRef(false);
  const isTrackingRef = useRef(false); // Ref to track isTracking state for background intervals
  const lastPaceDataPoint = useRef({ time: 0, distance: 0 }); // Último ponto coletado
  const pathPointsBuffer = useRef([]); // Buffer para armazenar pontos em background
  const isAppInForeground = useRef(true); // Track app state
  const allPathPointsRef = useRef([]); // Ref para manter todos os pontos coletados
  const lastLocationUpdateTime = useRef(0); // Track last successful location update
  const hasRestoredRun = useRef(false); // Flag para evitar múltiplas restaurações
  const lastTaskCheckTime = useRef(0); // Track last time we checked if task is running

  // Função para salvar corrida em andamento
  const saveActiveRun = async () => {
    if (!isTrackingRef.current && time === 0 && distance === 0) {
      // Não há corrida ativa, limpar storage
      try {
        await AsyncStorage.removeItem(ACTIVE_RUN_STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing active run:', error);
      }
      return;
    }

    try {
      // CRÍTICO: Calcular tempo baseado em startTime ao invés de usar estado React
      // O estado pode estar desatualizado quando app está em background
      let calculatedTime = 0;
      if (startTime.current && !isPaused.current) {
        calculatedTime = Math.floor((Date.now() - startTime.current) / 1000);
      } else if (isPaused.current) {
        // Se está pausado, usar o tempo que estava quando pausou
        calculatedTime = Math.floor((Date.now() - startTime.current - pausedTime.current * 1000) / 1000);
      }

      const activeRunData = {
        isTracking: isTrackingRef.current,
        isPaused: isPaused.current,
        startTime: startTime.current,
        pausedTime: pausedTime.current,
        distance: totalDistance.current,
        time: calculatedTime, // Usar tempo calculado, não o estado
        pathPoints: allPathPointsRef.current.length > 0 ? allPathPointsRef.current : pathPoints,
        paceData: paceData,
        lastLocation: lastLocation.current,
        timestamp: startTime.current || Date.now(),
      };
      
      await AsyncStorage.setItem(ACTIVE_RUN_STORAGE_KEY, JSON.stringify(activeRunData));
      console.log('💾 Corrida em andamento salva automaticamente', { 
        distance: activeRunData.distance.toFixed(3), 
        time: calculatedTime,
        points: activeRunData.pathPoints.length 
      });
      await logger.info('Corrida em andamento salva', { 
        distance: activeRunData.distance, 
        time: calculatedTime,
        points: activeRunData.pathPoints.length 
      });
    } catch (error) {
      console.error('Error saving active run:', error);
    }
  };

  // Função para restaurar corrida em andamento
  const restoreActiveRun = async () => {
    try {
      const savedRunStr = await AsyncStorage.getItem(ACTIVE_RUN_STORAGE_KEY);
      if (!savedRunStr) {
        return false;
      }

      const savedRun = JSON.parse(savedRunStr);
      
      // Verificar se a corrida não é muito antiga (mais de 24 horas)
      const runAge = Date.now() - (savedRun.timestamp || Date.now());
      if (runAge > 24 * 60 * 60 * 1000) {
        console.log('Corrida salva muito antiga, ignorando...');
        await AsyncStorage.removeItem(ACTIVE_RUN_STORAGE_KEY);
        return false;
      }

      // Restaurar estado
      setIsTracking(savedRun.isTracking || false);
      isTrackingRef.current = savedRun.isTracking || false;
      isPaused.current = savedRun.isPaused || false;
      startTime.current = savedRun.startTime || null;
      pausedTime.current = savedRun.pausedTime || 0;
      totalDistance.current = savedRun.distance || 0;
      setDistance(savedRun.distance || 0);
      setTime(savedRun.time || 0);
      
      // Restaurar pontos do caminho
      if (savedRun.pathPoints && savedRun.pathPoints.length > 0) {
        allPathPointsRef.current = savedRun.pathPoints;
        setPathPoints(savedRun.pathPoints);
        if (savedRun.lastLocation) {
          lastLocation.current = savedRun.lastLocation;
        }
      }
      
      // Restaurar dados de pace
      if (savedRun.paceData && savedRun.paceData.length > 0) {
        setPaceData(savedRun.paceData);
        lastPaceDataPoint.current = savedRun.paceData[savedRun.paceData.length - 1] || { time: 0, distance: 0 };
      }

      console.log('✅ Corrida em andamento restaurada:', {
        distance: savedRun.distance?.toFixed(3),
        time: savedRun.time,
        points: savedRun.pathPoints?.length || 0,
      });

      // Se estava rastreando, continuar
      if (savedRun.isTracking && !savedRun.isPaused) {
        // Reiniciar timer
        if (startTime.current) {
          timerInterval.current = setInterval(() => {
            if (startTime.current) {
              const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
              setTime(elapsed);
            }
          }, 1000);
        }

        // Reiniciar tracking de localização
        try {
          if (isNativeBuild) {
            await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
              accuracy: Location.Accuracy.BestForNavigation,
              timeInterval: 500, // 0.5 segundos - atualização mais frequente
              distanceInterval: 0.01, // 10 metros (em km) - atualização a cada 10 metros
              foregroundService: {
                notificationTitle: "Running Well",
                notificationBody: "Rastreando sua corrida",
                notificationColor: "#4CAF50",
              },
              pausesUpdatesAutomatically: false,
              showsBackgroundLocationIndicator: true,
            });
            
            // Sincronizar dados de background imediatamente
            await syncBackgroundData();
            
            // Sincronizar novamente após 500ms para pegar pontos que podem ter sido salvos durante a primeira sincronização
            setTimeout(async () => {
              await syncBackgroundData();
            }, 500);
            
            if (backgroundLocationInterval.current) {
              clearInterval(backgroundLocationInterval.current);
            }
            backgroundLocationInterval.current = setInterval(() => {
              syncBackgroundData();
            }, 1000); // Sincronizar a cada 1 segundo para atualização mais frequente
          }
        } catch (error) {
          console.error('Error restarting location tracking:', error);
        }
      }

      return true;
    } catch (error) {
      console.error('Error restoring active run:', error);
      return false;
    }
  };

  useEffect(() => {
    requestPermission();
    
    // Restaurar corrida em andamento ao iniciar o app (apenas uma vez)
    if (!hasRestoredRun.current) {
      hasRestoredRun.current = true;
      restoreActiveRun();
    }
    
    // Get current location immediately when provider mounts (for map display)
    const getInitialLocation = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 5000,
          }).catch(() => null);
          
          if (currentLocation?.coords) {
            setLocation(currentLocation);
          }
        }
      } catch (error) {
        console.log('Could not get initial location:', error);
      }
    };
    
    getInitialLocation();

    // Listen for app state changes to sync background data and save active run
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && !isAppInForeground.current) {
        // App came to foreground - SINCRONIZAR dados de background imediatamente
        isAppInForeground.current = true;
        console.log('🔄 App voltou para foreground - sincronizando dados de background...');
        
        if (isTrackingRef.current && !isPaused.current) {
          // CRÍTICO: Verificar se a task ainda está rodando, se não, reiniciar
          if (isNativeBuild) {
            try {
              const isTaskRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
              if (!isTaskRunning) {
                console.warn('⚠️ Task de background parou! Reiniciando...');
                await logger.warn('Task de background parou, reiniciando', {});
                
                // Reiniciar a task
                await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
                  accuracy: Location.Accuracy.BestForNavigation,
                  timeInterval: 500,
                  distanceInterval: 0.01,
                  foregroundService: {
                    notificationTitle: "Running Well",
                    notificationBody: "Rastreando sua corrida",
                    notificationColor: "#4CAF50",
                  },
                  pausesUpdatesAutomatically: false,
                  showsBackgroundLocationIndicator: true,
                });
                console.log('✅ Task de background reiniciada com sucesso');
                await logger.info('Task de background reiniciada', {});
              } else {
                console.log('✅ Task de background ainda está rodando');
              }
            } catch (error) {
              console.error('❌ Erro ao verificar/reiniciar task:', error);
              await logger.error('Erro ao verificar/reiniciar task', { error: error.message });
            }
          }
          
          // Sincronizar dados coletados em background imediatamente
          await syncBackgroundData();
          
          // Sincronizar novamente após 500ms para pegar pontos que podem ter sido salvos durante a primeira sincronização
          setTimeout(async () => {
            await syncBackgroundData();
          }, 500);
          
          // Salvar corrida atualizada
          await saveActiveRun();
          
          // Se for build nativo, continuar sincronizando periodicamente
          if (isNativeBuild) {
            if (backgroundLocationInterval.current) {
              clearInterval(backgroundLocationInterval.current);
            }
            backgroundLocationInterval.current = setInterval(async () => {
              // Verificar periodicamente se a task ainda está rodando (a cada 5 segundos)
              const checkTaskInterval = 5000; // Verificar a cada 5 segundos
              const now = Date.now();
              if (!lastTaskCheckTime.current || (now - lastTaskCheckTime.current) > checkTaskInterval) {
                lastTaskCheckTime.current = now;
                try {
                  const isTaskRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
                  if (!isTaskRunning && isTrackingRef.current && !isPaused.current) {
                    console.warn('⚠️ Task parou durante sincronização! Reiniciando...');
                    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
                      accuracy: Location.Accuracy.BestForNavigation,
                      timeInterval: 500,
                      distanceInterval: 0.01,
                      foregroundService: {
                        notificationTitle: "Running Well",
                        notificationBody: "Rastreando sua corrida",
                        notificationColor: "#4CAF50",
                      },
                      pausesUpdatesAutomatically: false,
                      showsBackgroundLocationIndicator: true,
                    });
                    console.log('✅ Task reiniciada durante sincronização');
                  }
                } catch (error) {
                  console.error('Erro ao verificar task durante sincronização:', error);
                }
              }
              
              // Sincronizar dados
              syncBackgroundData();
            }, 2000); // Sincronizar a cada 2 segundos (reduzido de 1s para acumular mais pontos)
          } else {
            // Expo Go: usar fallback
            startBackgroundLocationFallback();
          }
        }
      } else if (nextAppState.match(/inactive|background/)) {
        isAppInForeground.current = false;
        console.log('📱 App foi para background - salvando corrida e continuando tracking...');
        
        // Salvar corrida antes de ir para background
        await saveActiveRun();
        
        // Se for Expo Go, usar fallback
        if (!isNativeBuild && isTrackingRef.current && !isPaused.current) {
          startBackgroundLocationFallback();
        }
      }
    });

    // Auto-save periódico enquanto está rastreando (a cada 10 segundos)
    const autoSaveInterval = setInterval(() => {
      if (isTrackingRef.current) {
        saveActiveRun();
      }
    }, 10000); // Salvar a cada 10 segundos

    return () => {
      subscription?.remove();
      clearInterval(autoSaveInterval);
      // Salvar corrida ao desmontar o componente (app fechando)
      if (isTrackingRef.current) {
        saveActiveRun();
      }
    };
  }, []); // Rodar apenas uma vez no mount

  const requestPermission = async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus === 'granted') {
        setHasPermission(true);
        
        try {
          const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
          if (backgroundStatus === 'granted') {
            console.log('Background location permission granted');
          }
        } catch (error) {
          console.log('Background permission not available:', error);
        }
      } else {
        setHasPermission(false);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setHasPermission(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Process location point - centralized function to avoid code duplication
  const processLocationPoint = (location) => {
    if (!location?.coords) return false;

    const newPoint = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: location.timestamp || Date.now(), // CRÍTICO: Preservar timestamp para sincronização
    };

    // Update last location update time
    lastLocationUpdateTime.current = Date.now();

    if (lastLocation.current) {
      const distanceDelta = calculateDistance(
        lastLocation.current.latitude,
        lastLocation.current.longitude,
        newPoint.latitude,
        newPoint.longitude
      );

      if (distanceDelta > MIN_DISTANCE_THRESHOLD && distanceDelta < MAX_DISTANCE_THRESHOLD) {
        totalDistance.current += distanceDelta;
        setDistance(totalDistance.current);
        
        // Always save to ref first (works in background and foreground)
        allPathPointsRef.current.push(newPoint);
        
        // If app is in foreground, update state immediately
        if (isAppInForeground.current) {
          setPathPoints((prev) => [...prev, newPoint]);
        } else {
          // If in background, also save to buffer for processing when app returns
          pathPointsBuffer.current.push(newPoint);
        }
        
        lastLocation.current = newPoint;
        setLocation(location); // Update location state
        return true;
      } else if (distanceDelta >= MAX_DISTANCE_THRESHOLD) {
        console.log('GPS jump detected, ignoring:', distanceDelta);
        return false;
      }
      return false; // Too small movement
    } else {
      // First point - always save
      allPathPointsRef.current.push(newPoint);
      if (isAppInForeground.current) {
        setPathPoints((prev) => [...prev, newPoint]);
      } else {
        pathPointsBuffer.current.push(newPoint);
      }
      lastLocation.current = newPoint;
      setLocation(location);
      return true;
    }
  };

  // Sincronizar dados coletados pela task de background do AsyncStorage
  const syncBackgroundData = async () => {
    if (!isTrackingRef.current || isPaused.current) return;
    
    try {
      const backgroundPoints = await getBackgroundPathPoints();
      const backgroundDistance = await getBackgroundTotalDistance();
      
      const currentPointsCount = allPathPointsRef.current.length;
      const currentDistance = totalDistance.current;
      
      console.log(`[Sync] 📊 Status: Background=${backgroundPoints.length} pontos | Local=${currentPointsCount} pontos | Diferença=${backgroundPoints.length - currentPointsCount}`);
      console.log(`[Sync] 📏 Distância: Background=${backgroundDistance.toFixed(3)} km | Local=${currentDistance.toFixed(3)} km`);
      
      // Log detalhado se não houver novos pontos
      // IMPORTANTE: No Expo Go, TaskManager não funciona, então é normal não ter pontos
      if (backgroundPoints.length === 0) {
        // Só mostrar warn se for build nativo (no Expo Go é esperado não funcionar)
        if (isNativeBuild) {
          console.warn('[Sync] ⚠️ Nenhum ponto coletado pela task de background!');
          await logger.warn('Nenhum ponto coletado pela task de background', { 
            isTracking: isTrackingRef.current,
            isPaused: isPaused.current,
            isNativeBuild,
            executionEnvironment: Constants.executionEnvironment,
            appOwnership: Constants.appOwnership
          });
        } else {
          // No Expo Go, é normal - TaskManager não funciona aqui
          console.log('[Sync] ℹ️ Expo Go detectado - TaskManager não funciona (normal)');
        }
      }
      
      if (backgroundPoints.length > 0) {
        // Converter pontos do formato da task para o formato do estado
        const newPoints = backgroundPoints
          .filter(p => p && p.latitude && p.longitude)
          .map((p, idx) => ({
            latitude: p.latitude,
            longitude: p.longitude,
            timestamp: p.timestamp || (Date.now() - (backgroundPoints.length - idx) * 100), // Preservar timestamp ou criar baseado em posição
            originalIndex: idx, // Manter índice original para ordenação
          }));
        
        // CRÍTICO: Estratégia melhorada para sincronização
        // Se temos menos pontos locais que no background, adicionar TODOS os pontos novos
        // Se temos mais ou igual, usar comparação mais inteligente
        
        let pointsToAdd = [];
        
        if (currentPointsCount < backgroundPoints.length) {
          // ESTRATÉGIA SIMPLES: Se temos menos pontos, adicionar todos os pontos que estão além do que temos
          // Isso garante que não perdemos pontos intermediários
          const diff = backgroundPoints.length - currentPointsCount;
          
          if (diff > 0) {
            // Pegar os últimos 'diff' pontos do background (os mais recentes que não temos)
            pointsToAdd = newPoints.slice(-diff);
            
            // Mas também verificar se algum ponto anterior é diferente (pode ter sido atualizado)
            const existingKeys = new Set(
              allPathPointsRef.current.map(p => 
                `${p.latitude.toFixed(6)}_${p.longitude.toFixed(6)}`
              )
            );
            
            // Adicionar também pontos que são diferentes dos que já temos (mesmo que não sejam os últimos)
            newPoints.forEach(p => {
              const key = `${p.latitude.toFixed(6)}_${p.longitude.toFixed(6)}`;
              if (!existingKeys.has(key) && !pointsToAdd.find(added => 
                `${added.latitude.toFixed(6)}_${added.longitude.toFixed(6)}` === key
              )) {
                pointsToAdd.push(p);
              }
            });
          }
        } else {
          // Temos mais ou igual pontos - usar comparação mais precisa
          const existingKeys = new Set(
            allPathPointsRef.current.map(p => 
              `${p.latitude.toFixed(6)}_${p.longitude.toFixed(6)}`
            )
          );
          
          pointsToAdd = newPoints.filter(p => {
            const key = `${p.latitude.toFixed(6)}_${p.longitude.toFixed(6)}`;
            return !existingKeys.has(key);
          });
        }
        
        if (pointsToAdd.length > 0) {
          console.log(`[Sync] ✅ ADICIONANDO ${pointsToAdd.length} NOVOS PONTOS!`);
          console.log(`[Sync] 📈 Antes: ${currentPointsCount} pontos → Depois: ${currentPointsCount + pointsToAdd.length} pontos`);
          console.log(`[Sync] 📍 Background tem ${backgroundPoints.length} pontos, local tinha ${currentPointsCount}`);
          
          // Ordenar pontos novos por timestamp/índice
          const sortedNewPoints = pointsToAdd.sort((a, b) => {
            if (a.timestamp !== b.timestamp) {
              return a.timestamp - b.timestamp;
            }
            return (a.originalIndex || 0) - (b.originalIndex || 0);
          });
          
          // Log das coordenadas dos primeiros e últimos pontos para debug
          if (sortedNewPoints.length > 0) {
            const first = sortedNewPoints[0];
            const last = sortedNewPoints[sortedNewPoints.length - 1];
            console.log(`[Sync] 🗺️ Primeiro ponto novo: ${first.latitude.toFixed(6)}, ${first.longitude.toFixed(6)}`);
            console.log(`[Sync] 🗺️ Último ponto novo: ${last.latitude.toFixed(6)}, ${last.longitude.toFixed(6)}`);
          }
          
          // Adicionar pontos novos ao final (mantendo ordem cronológica)
          sortedNewPoints.forEach(({ originalIndex, ...point }) => {
            allPathPointsRef.current.push(point);
          });
          
          // Atualizar estado do mapa com todos os pontos
          setPathPoints([...allPathPointsRef.current]);
          
          // Atualizar última localização
          if (allPathPointsRef.current.length > 0) {
            const lastPoint = allPathPointsRef.current[allPathPointsRef.current.length - 1];
            lastLocation.current = { latitude: lastPoint.latitude, longitude: lastPoint.longitude };
          }
          
          await logger.info('Pontos sincronizados do background', { 
            novosPontos: pointsToAdd.length,
            totalPontos: allPathPointsRef.current.length,
            pontosBackground: backgroundPoints.length,
            pontosLocaisAntes: currentPointsCount,
            primeiroPonto: sortedNewPoints[0] ? {
              lat: sortedNewPoints[0].latitude.toFixed(6),
              lon: sortedNewPoints[0].longitude.toFixed(6)
            } : null,
            ultimoPonto: sortedNewPoints[sortedNewPoints.length - 1] ? {
              lat: sortedNewPoints[sortedNewPoints.length - 1].latitude.toFixed(6),
              lon: sortedNewPoints[sortedNewPoints.length - 1].longitude.toFixed(6)
            } : null
          });
        } else {
          console.log(`[Sync] ⚠️ NENHUM PONTO NOVO! Background=${backgroundPoints.length}, Local=${currentPointsCount}`);
          if (backgroundPoints.length > currentPointsCount) {
            console.log(`[Sync] ⚠️ PROBLEMA: Background tem MAIS pontos (${backgroundPoints.length}) mas nenhum foi adicionado!`);
          }
        }
      }
      
      // Atualizar distância total - IMPORTANTE: usar a maior distância
      if (backgroundDistance > totalDistance.current) {
        const oldDistance = totalDistance.current;
        totalDistance.current = backgroundDistance;
        setDistance(backgroundDistance);
        lastLocationUpdateTime.current = Date.now();
        console.log(`[Sync] ✅ Distância atualizada: ${oldDistance.toFixed(3)} → ${backgroundDistance.toFixed(3)} km (+${(backgroundDistance - oldDistance).toFixed(3)} km)`);
        await logger.info('Distância sincronizada do background', { 
          distanciaAnterior: oldDistance,
          distanciaNova: backgroundDistance,
          diferenca: backgroundDistance - oldDistance
        });
      } else if (backgroundDistance < totalDistance.current) {
        // Se a distância do background for menor, pode ser que a task resetou
        console.warn(`[Sync] ⚠️ Distância do background (${backgroundDistance.toFixed(3)}) é menor que local (${totalDistance.current.toFixed(3)}) - mantendo local`);
      }
    } catch (error) {
      console.error('[Sync] ❌ Error syncing background data:', error);
      await logger.error('Erro ao sincronizar dados de background', { error: error.message });
    }
  };

  // Background location fallback - DEPRECATED (não usado mais com TaskManager)
  // This ensures we continue tracking even if watchPositionAsync stops working
  // CRITICAL: This runs indefinitely until tracking is stopped manually
  const startBackgroundLocationFallback = () => {
    if (backgroundLocationInterval.current) {
      clearInterval(backgroundLocationInterval.current);
    }

    // Interval frequency based on app state
    const intervalTime = !isAppInForeground.current ? 5000 : 10000; // 5s in background, 10s in foreground

    backgroundLocationInterval.current = setInterval(async () => {
      // CRITICAL: Only stop if explicitly paused or stopped
      if (!isTrackingRef.current || isPaused.current) {
        return;
      }

      try {
        const timeSinceLastUpdate = Date.now() - lastLocationUpdateTime.current;
        
        // ALWAYS use fallback when in background (watchPositionAsync may not work reliably)
        // OR if no updates for 10 seconds (even in foreground, as safety net)
        // This ensures we NEVER lose tracking, even if watchPositionAsync stops
        const shouldUseFallback = !isAppInForeground.current || timeSinceLastUpdate > 10000;
        
        if (shouldUseFallback) {
          // Try to get current position as fallback
          // Use Balanced accuracy in background to save battery, BestForNavigation in foreground
          const accuracy = !isAppInForeground.current 
            ? Location.Accuracy.Balanced 
            : Location.Accuracy.BestForNavigation;
            
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: accuracy,
            timeout: 10000, // 10 second timeout per call, but interval continues indefinitely
          }).catch((error) => {
            console.log('Background fallback location error (will retry):', error);
            return null;
          });

          if (currentLocation) {
            processLocationPoint(currentLocation);
            console.log('✅ Fallback location update successful');
          } else {
            // Even if this call fails, the interval continues - will retry next time
            console.log('⚠️ Fallback location call failed, will retry in', intervalTime / 1000, 'seconds');
          }
        }
      } catch (error) {
        // CRITICAL: Don't stop the interval on error - keep trying
        console.log('Background fallback location error (will retry):', error);
      }
      // Interval continues indefinitely - no timeout, no stop condition
    }, intervalTime);
    
    console.log('🔄 Background fallback started - will run indefinitely until tracking stops');
  };

  const startTracking = async () => {
    if (!hasPermission) {
      await requestPermission();
      if (!hasPermission) {
        return;
      }
    }

    // Always request background permission before starting tracking
    try {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission not granted. Tracking may stop when app goes to background.');
      }
    } catch (error) {
      console.log('Background permission request:', error);
    }

    try {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        console.error('Location services are disabled');
        setHasPermission(false);
        return;
      }

      // If resuming from pause
      if (isPaused.current && pausedTime.current > 0) {
        setIsTracking(true);
        isTrackingRef.current = true;
        isPaused.current = false;
        startTime.current = Date.now() - (pausedTime.current * 1000);

        timerInterval.current = setInterval(() => {
          if (startTime.current) {
            const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
            setTime(elapsed);
          }
        }, 1000);

        // Restart pace data collection
        paceInterval.current = setInterval(() => {
          if (startTime.current && totalDistance.current > 0) {
            const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
            const currentDistance = totalDistance.current;
            const lastPoint = lastPaceDataPoint.current;
            
            const timeSinceLastPoint = elapsed - lastPoint.time;
            const distanceSinceLastPoint = currentDistance - lastPoint.distance;
            
            // More frequent collection: 5 seconds or 50 meters
            const shouldCollect = lastPoint.time === 0 
              ? (elapsed >= 5 || currentDistance >= 0.02) // First point: at least 5s OR 20m (very permissive)
              : (timeSinceLastPoint >= 5 || distanceSinceLastPoint >= 0.05); // Then: every 5s OR 50m
            
            if (shouldCollect) {
              const pace = elapsed > 0 && currentDistance > 0 
                ? (elapsed / 60) / currentDistance
                : null;
              
              if (pace !== null && pace > 0 && pace < 30) {
                const newPacePoint = {
                  time: elapsed,
                  distance: currentDistance,
                  pace: parseFloat(pace.toFixed(2)),
                };
                
                setPaceData((prev) => {
                  const updated = [...prev, newPacePoint];
                  lastPaceDataPoint.current = newPacePoint;
                  return updated;
                });
              }
            }
          }
        }, 5000); // Check every 5 seconds

        // CRÍTICO: Sempre tentar usar TaskManager primeiro (mesmo se detecção falhar)
        // TaskManager funciona em builds nativos e é a única forma de tracking real em background
        let taskManagerStarted = false;
        
        try {
          // Tentar iniciar TaskManager (funciona em builds nativos)
          await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 500, // 0.5 segundos - atualização mais frequente
            distanceInterval: 0.01, // 10 metros (em km) - atualização a cada 10 metros
            foregroundService: {
              notificationTitle: "Running Well",
              notificationBody: "Rastreando sua corrida",
              notificationColor: "#4CAF50",
            },
            pausesUpdatesAutomatically: false,
            showsBackgroundLocationIndicator: true,
          });
          
          taskManagerStarted = true;
          console.log('✅ Background location task started - will run even when app is closed');
          console.log('📱 TaskManager está coletando GPS em background - pontos serão salvos automaticamente');
          await logger.info('TaskManager iniciado', {
            isNativeBuild,
            executionEnvironment: Constants.executionEnvironment,
            appOwnership: Constants.appOwnership
          });

          // Sincronizar dados de background imediatamente e depois periodicamente
          await syncBackgroundData();
          
          // Salvar corrida ao retomar de pause
          await saveActiveRun();
          
          // Start sync interval para pegar dados do AsyncStorage
          if (backgroundLocationInterval.current) {
            clearInterval(backgroundLocationInterval.current);
          }
          backgroundLocationInterval.current = setInterval(() => {
            syncBackgroundData();
          }, 1000); // Sincronizar a cada 1 segundo para atualização mais frequente
          
          lastLocationUpdateTime.current = Date.now();
          return;
        } catch (taskError) {
          console.error('❌ Erro ao iniciar background task:', taskError);
          await logger.error('Erro ao iniciar TaskManager', { 
            error: taskError.message,
            isNativeBuild,
            executionEnvironment: Constants.executionEnvironment
          });
        }
        
        // Se TaskManager não funcionou, usar watchPositionAsync como fallback
        if (!taskManagerStarted) {
          console.log('⚠️ TaskManager não disponível, usando watchPositionAsync (background tracking limitado)');
          
          watchSubscription.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.BestForNavigation,
              timeInterval: 500, // 0.5 segundos - mesmo intervalo do TaskManager
              distanceInterval: 0.005, // 5 metros (em km) - mais frequente que TaskManager para compensar
              mayShowUserSettingsDialog: true,
              foregroundService: {
                notificationTitle: "Running Well",
                notificationBody: "Rastreando sua corrida",
                notificationColor: "#4CAF50",
              },
            },
            (location) => {
              lastLocationUpdateTime.current = Date.now();
              processLocationPoint(location);
            }
          );
          
          // Fallback para quando TaskManager não funciona
          startBackgroundLocationFallback();
        }
        
        lastLocationUpdateTime.current = Date.now();
        return;
      }

      // Starting fresh
      setIsTracking(true);
      isTrackingRef.current = true;
      isPaused.current = false;
      startTime.current = Date.now();
      pausedTime.current = 0;
      setDistance(0);
      totalDistance.current = 0;
      setTime(0);
      setPathPoints([]);
      setPaceData([]); // Reset pace data
      pathPointsBuffer.current = [];
      allPathPointsRef.current = [];
      lastLocation.current = null;
      lastPaceDataPoint.current = { time: 0, distance: 0 }; // Reset last pace point

      timerInterval.current = setInterval(() => {
        if (startTime.current) {
          const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
          setTime(elapsed);
        }
      }, 1000);

      // Collect pace data every 10 seconds or every 100 meters (more frequent for better graph)
      // Also collect first point immediately when we have valid distance
      paceInterval.current = setInterval(() => {
        if (startTime.current && totalDistance.current > 0) {
          const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
          const currentDistance = totalDistance.current;
          const lastPoint = lastPaceDataPoint.current;
          
          // Only collect if enough time or distance has passed
          const timeSinceLastPoint = elapsed - lastPoint.time;
          const distanceSinceLastPoint = currentDistance - lastPoint.distance;
          
          // More frequent collection: 5 seconds or 50 meters
          // Also collect first point if we don't have any yet (very permissive for short runs)
          const shouldCollect = lastPoint.time === 0 
            ? (elapsed >= 5 || currentDistance >= 0.02) // First point: at least 5s OR 20m (very permissive)
            : (timeSinceLastPoint >= 5 || distanceSinceLastPoint >= 0.05); // Then: every 5s OR 50m
          
          if (shouldCollect) {
            // Calculate pace: minutes per kilometer
            const pace = elapsed > 0 && currentDistance > 0 
              ? (elapsed / 60) / currentDistance // minutes per km
              : null;
            
            if (pace !== null && pace > 0 && pace < 30) { // Valid pace range (0-30 min/km)
              const newPacePoint = {
                time: elapsed,
                distance: currentDistance,
                pace: parseFloat(pace.toFixed(2)),
              };
              
              setPaceData((prev) => {
                const updated = [...prev, newPacePoint];
                lastPaceDataPoint.current = newPacePoint;
                return updated;
              });
            }
          }
        }
      }, 5000); // Check every 5 seconds

      const getInitialLocationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 5000,
      }).catch(() => null);

      // Limpar dados anteriores de background
      await clearBackgroundLocationData();
      
      // CRÍTICO: Sempre tentar usar TaskManager primeiro (mesmo se detecção falhar)
      let taskManagerStarted = false;
      
      try {
        // Tentar iniciar TaskManager (funciona em builds nativos)
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 500, // 0.5 segundos - atualização mais frequente
          distanceInterval: 0.01, // 10 metros (em km) - atualização a cada 10 metros
          foregroundService: {
            notificationTitle: "Running Well",
            notificationBody: "Rastreando sua corrida",
            notificationColor: "#4CAF50",
          },
          pausesUpdatesAutomatically: false,
          showsBackgroundLocationIndicator: true,
        });
        
        taskManagerStarted = true;
        console.log('✅ Background location task started - will run even when app is closed');
        console.log('📱 TaskManager está coletando GPS em background - pontos serão salvos automaticamente');
        await logger.info('TaskManager iniciado (starting fresh)', {
          isNativeBuild,
          executionEnvironment: Constants.executionEnvironment,
          appOwnership: Constants.appOwnership
        });

        // Sincronizar dados de background imediatamente e depois periodicamente
        await syncBackgroundData();
        
        // Salvar corrida ao iniciar tracking
        await saveActiveRun();
        
        // Start sync interval para pegar dados do AsyncStorage
        if (backgroundLocationInterval.current) {
          clearInterval(backgroundLocationInterval.current);
        }
        backgroundLocationInterval.current = setInterval(() => {
          syncBackgroundData();
        }, 2000); // Sincronizar a cada 2 segundos (reduzido de 1s para acumular mais pontos)
      } catch (taskError) {
        console.error('❌ Erro ao iniciar background task:', taskError);
        await logger.error('Erro ao iniciar TaskManager (starting fresh)', { 
          error: taskError.message,
          isNativeBuild,
          executionEnvironment: Constants.executionEnvironment
        });
      }
      
      // Se TaskManager não funcionou, usar watchPositionAsync como fallback
      if (!taskManagerStarted) {
        console.log('⚠️ TaskManager não disponível, usando watchPositionAsync (background tracking limitado)');
        
        watchSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 500, // 0.5 segundos - mesmo intervalo do TaskManager
            distanceInterval: 0.005, // 5 metros (em km) - mais frequente que TaskManager para compensar
            mayShowUserSettingsDialog: true,
            foregroundService: {
              notificationTitle: "Running Well",
              notificationBody: "Rastreando sua corrida",
              notificationColor: "#4CAF50",
            },
          },
          (location) => {
            lastLocationUpdateTime.current = Date.now();
            processLocationPoint(location);
          }
        );
        
        // Fallback para quando TaskManager não funciona
        startBackgroundLocationFallback();
      }
      
      lastLocationUpdateTime.current = Date.now();

      getInitialLocationPromise.then((initialLocation) => {
        if (initialLocation?.coords && !lastLocation.current) {
          processLocationPoint(initialLocation);
        }
      });
    } catch (error) {
      console.error('Error starting tracking:', error);
      setIsTracking(false);
      isTrackingRef.current = false;
      setHasPermission(false);
    }
  };

  const pauseTracking = async () => {
    setIsTracking(false);
    isTrackingRef.current = false;
    isPaused.current = true;
    
    if (startTime.current) {
      pausedTime.current = Math.floor((Date.now() - startTime.current) / 1000);
      setTime(pausedTime.current);
    }
    
    // Salvar corrida ao pausar
    await saveActiveRun();
    
    // Parar a task de background (só se for build nativo e estiver rodando)
    if (isNativeBuild) {
      try {
        const isTaskRegistered = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        if (isTaskRegistered) {
          await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
          console.log('✅ Background location task paused');
        }
      } catch (error) {
        // Ignorar erro se task não existe
        console.log('Error stopping background task (ignoring):', error.message);
      }
    }
    
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    if (paceInterval.current) {
      clearInterval(paceInterval.current);
      paceInterval.current = null;
    }
    if (backgroundLocationInterval.current) {
      clearInterval(backgroundLocationInterval.current);
      backgroundLocationInterval.current = null;
    }
  };

  const stopTracking = async () => {
    await pauseTracking();
    isPaused.current = false;
    startTime.current = null;
    pausedTime.current = 0;
    lastLocation.current = null;
    totalDistance.current = 0;
  };

  const getAllPathPoints = () => {
    // ALWAYS use allPathPointsRef as primary source - it contains ALL points collected
    // This ref is updated in both foreground and background, so it's the most reliable
    const refPoints = allPathPointsRef.current || [];
    
    // Also get state points and buffer points as backup
    const statePoints = pathPoints || [];
    const bufferPoints = pathPointsBuffer.current || [];
    
    // Combine: ref points (most complete) + any points from state/buffer not in ref
    const refSet = new Set();
    refPoints.forEach(p => {
      if (p && typeof p.latitude === 'number' && typeof p.longitude === 'number') {
        const key = `${p.latitude.toFixed(6)}_${p.longitude.toFixed(6)}`;
        refSet.add(key);
      }
    });
    
    // Add any points from state/buffer that aren't in ref (shouldn't happen, but safety)
    const additionalPoints = [...statePoints, ...bufferPoints].filter(p => {
      if (!p || typeof p.latitude !== 'number' || typeof p.longitude !== 'number') return false;
      const key = `${p.latitude.toFixed(6)}_${p.longitude.toFixed(6)}`;
      return !refSet.has(key);
    });
    
    // Return ref points + any additional points
    const allPoints = [...refPoints, ...additionalPoints];
    
    // Remove duplicates (safety check)
    const uniquePoints = [];
    const seen = new Set();
    for (const point of allPoints) {
      if (!point || typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
        continue;
      }
      const key = `${point.latitude.toFixed(6)}_${point.longitude.toFixed(6)}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePoints.push(point);
      }
    }
    
    // If ref has points, return them (they are the most complete)
    if (refPoints.length > 0) {
      return uniquePoints;
    }
    
    // Fallback to state points if ref is empty (shouldn't happen, but safety)
    return statePoints.length > 0 ? statePoints : [];
  };

  const resetRun = async () => {
    // Resetar flag de restauração
    hasRestoredRun.current = false;
    
    // Limpar corrida salva
    try {
      await AsyncStorage.removeItem(ACTIVE_RUN_STORAGE_KEY);
      console.log('🗑️ Corrida em andamento removida do storage');
    } catch (error) {
      console.error('Error clearing active run:', error);
    }
    await stopTracking();
    
    // Parar task de background e limpar dados (só se for build nativo)
    if (isNativeBuild) {
      try {
        const isTaskRegistered = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        if (isTaskRegistered) {
          await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        }
      } catch (error) {
        // Ignorar erro se task não existe
        console.log('Error stopping background task (ignoring):', error.message);
      }
    }
    
    // Sempre limpar dados
    await clearBackgroundLocationData();
    
    
    setLocation(null);
    setDistance(0);
    setTime(0);
    setPathPoints([]);
    setPaceData([]);
    pathPointsBuffer.current = []; // Clear buffer
    allPathPointsRef.current = []; // Clear all points ref
    lastPaceDataPoint.current = { time: 0, distance: 0 };
    lastLocationUpdateTime.current = 0;
    if (backgroundLocationInterval.current) {
      clearInterval(backgroundLocationInterval.current);
      backgroundLocationInterval.current = null;
    }
  };

  return (
    <LocationTrackingContext.Provider
      value={{
        isTracking,
        hasPermission,
        location,
        distance,
        time,
        pathPoints,
        paceData,
        getAllPathPoints,
        startTracking,
        pauseTracking,
        stopTracking,
        resetRun,
        requestPermission,
      }}>
      {children}
    </LocationTrackingContext.Provider>
  );
}

export function useLocationTracking() {
  const context = useContext(LocationTrackingContext);
  if (!context) {
    throw new Error('useLocationTracking must be used within LocationTrackingProvider');
  }
  return context;
}

