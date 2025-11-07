import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

// Nome da task - deve ser único no app
export const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Storage keys
const PATH_POINTS_STORAGE_KEY = '@running_well:background_path_points';
const LAST_LOCATION_STORAGE_KEY = '@running_well:last_location';
const TOTAL_DISTANCE_STORAGE_KEY = '@running_well:total_distance';

// Thresholds para filtrar ruído GPS
// Reduzido para capturar mais pontos e fazer curvas suaves
const MIN_DISTANCE_THRESHOLD = 0.0001; // ~0.1 metros (muito pequeno para capturar curvas)
const MAX_DISTANCE_THRESHOLD = 0.2; // ~200 metros (aumentado para não perder pontos válidos)

// Função para calcular distância entre dois pontos (Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Funções helper para ler/escrever AsyncStorage (definidas antes da task)
const getStoredPoints = async () => {
  try {
    const data = await AsyncStorage.getItem(PATH_POINTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[Background Task] Error reading points:', error);
    return [];
  }
};

const getStoredDistance = async () => {
  try {
    const data = await AsyncStorage.getItem(TOTAL_DISTANCE_STORAGE_KEY);
    return data ? parseFloat(data) : 0;
  } catch (error) {
    console.error('[Background Task] Error reading distance:', error);
    return 0;
  }
};

// Definir a task de background
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('[Background Task] ❌ Error:', error);
    logger.error('Background task error', { error: error.message }).catch(() => {});
    return;
  }

  if (data) {
    const { locations } = data;
    
    if (!locations || locations.length === 0) {
      console.log('[Background Task] ⚠️ No locations received');
      return;
    }

    // Processar a primeira localização (mais recente)
    const location = locations[0];
    
    if (location?.coords) {
      const newPoint = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp || Date.now(),
      };

      try {
        // Carregar dados existentes
        const storedPoints = await getStoredPoints();
        const storedDistance = await getStoredDistance();

        let newDistance = storedDistance;
        let shouldSave = false;
        let reason = '';

        if (storedPoints.length > 0) {
          const last = storedPoints[storedPoints.length - 1];
          const delta = calculateDistance(
            last.latitude,
            last.longitude,
            newPoint.latitude,
            newPoint.longitude
          );

          // Filtrar ruído e saltos
          if (delta > MIN_DISTANCE_THRESHOLD && delta < MAX_DISTANCE_THRESHOLD) {
            newDistance += delta;
            storedPoints.push(newPoint);
            shouldSave = true;
            reason = 'valid';
          } else if (delta <= MIN_DISTANCE_THRESHOLD) {
            reason = `too_small (${delta.toFixed(4)} km)`;
          } else if (delta >= MAX_DISTANCE_THRESHOLD) {
            reason = `jump (${delta.toFixed(4)} km)`;
            console.log('[Background Task] ⚠️ GPS jump detected, ignoring:', delta.toFixed(4), 'km');
          }
        } else {
          // Primeiro ponto - sempre salvar
          storedPoints.push(newPoint);
          shouldSave = true;
          reason = 'first_point';
        }

        if (shouldSave) {
          // Manter apenas os últimos 10000 pontos
          const trimmedPoints = storedPoints.slice(-10000);
          
          await AsyncStorage.multiSet([
            [PATH_POINTS_STORAGE_KEY, JSON.stringify(trimmedPoints)],
            [LAST_LOCATION_STORAGE_KEY, JSON.stringify(newPoint)],
            [TOTAL_DISTANCE_STORAGE_KEY, String(newDistance)],
          ]);
          
          console.log('📍 [Background Task] ✅ Point saved:', {
            lat: newPoint.latitude.toFixed(6),
            lon: newPoint.longitude.toFixed(6),
            totalPoints: trimmedPoints.length,
            totalDistance: newDistance.toFixed(3),
            reason,
          });
          // Log assíncrono não bloqueia a task
          logger.info('Background point saved', {
            lat: newPoint.latitude.toFixed(6),
            lon: newPoint.longitude.toFixed(6),
            totalPoints: trimmedPoints.length,
            totalDistance: newDistance.toFixed(3),
            reason,
          }).catch(() => {}); // Ignorar erros de logging
        } else {
          // Log quando ponto é rejeitado (mas não muito frequente para não sobrecarregar)
          if (Math.random() < 0.1) { // Log apenas 10% das rejeições
            console.log(`[Background Task] ⏭️ Point skipped: ${reason}`);
          }
        }
      } catch (err) {
        console.error('[Background Task] ❌ Save error:', err);
        logger.error('Background task save error', { error: err.message }).catch(() => {});
      }
    } else {
      console.log('[Background Task] ⚠️ Location without coords');
    }
  } else {
    console.log('[Background Task] ⚠️ No data received');
  }
});

// Função para limpar dados de background (chamada quando para o tracking)
export const clearBackgroundLocationData = async () => {
  try {
    await AsyncStorage.multiRemove([
      PATH_POINTS_STORAGE_KEY,
      LAST_LOCATION_STORAGE_KEY,
      TOTAL_DISTANCE_STORAGE_KEY,
    ]);
  } catch (error) {
    console.error('[Background Task] Error clearing data:', error);
  }
};

// Função para obter pontos salvos em background
export const getBackgroundPathPoints = async () => {
  try {
    const pathPointsStr = await AsyncStorage.getItem(PATH_POINTS_STORAGE_KEY);
    return pathPointsStr ? JSON.parse(pathPointsStr) : [];
  } catch (error) {
    console.error('[Background Task] Error getting path points:', error);
    return [];
  }
};

// Função para obter distância total salva em background
export const getBackgroundTotalDistance = async () => {
  try {
    const totalDistanceStr = await AsyncStorage.getItem(TOTAL_DISTANCE_STORAGE_KEY);
    return totalDistanceStr ? parseFloat(totalDistanceStr) : 0;
  } catch (error) {
    console.error('[Background Task] Error getting total distance:', error);
    return 0;
  }
};

