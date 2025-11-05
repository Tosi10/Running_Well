import { GoogleMapView } from '@/components/GoogleMapView';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocationTracking } from '@/context/LocationTrackingProvider';
import { useRuns } from '@/context/RunContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CurrentRunScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  
  const { saveRun } = useRuns();
  const {
    isTracking,
    distance,
    time,
    pathPoints,
    location,
    startTracking,
    pauseTracking,
    resetRun,
    hasPermission,
  } = useLocationTracking();

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = () => {
    if (distance === 0 || time === 0) return '--:--';
    const paceInSeconds = time / distance; // seconds per km
    const mins = Math.floor(paceInSeconds / 60);
    const secs = Math.floor(paceInSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Allow navigation - run continues in background
  const handleBackPress = () => {
    router.back();
  };

  const handlePlayPause = () => {
    if (!hasPermission) {
      Alert.alert('Permissão Necessária', 'Por favor, habilite as permissões de localização para rastrear sua corrida.');
      return;
    }
    
    if (isTracking) {
      pauseTracking();
    } else {
      startTracking();
    }
  };

  const handleStop = () => {
    // Only show confirmation if there's an active run or data
    if (isTracking || time > 0 || distance > 0) {
      Alert.alert(
        'Zerar Corrida',
        'Tem certeza que deseja zerar o cronômetro e perder todos os dados desta corrida?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Zerar',
            style: 'destructive',
            onPress: () => {
              resetRun();
            },
          },
        ]
      );
    }
    // If no tracking or data, don't do anything - button should be disabled/not visible
  };

  const handleFinish = async () => {
    // Allow finishing if there's at least some time tracked
    if (time === 0) {
      Alert.alert('Sem Dados de Corrida', 'Por favor, inicie uma corrida antes de finalizar.');
      return;
    }

    // Calculate total distance in meters for the run
    // We need to access the totalDistance ref from the context
    // For now, we'll use the distance state which should be accurate
    const distanceInMeters = Math.round(distance * 1000);

    // Warn if distance is 0 (common in emulator) but still allow saving
    if (distance === 0) {
      Alert.alert(
        'Nenhuma Distância Registrada',
        'Nenhuma distância foi rastreada. Isso é comum ao testar em um emulador.\n\nDeseja salvar esta corrida mesmo assim?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Salvar',
            onPress: async () => {
              const run = {
                id: Date.now().toString(),
                distanceInMeters: 0,
                durationInMillis: time * 1000,
                timestamp: new Date().toISOString(),
                pathPoints: pathPoints,
                avgSpeedInKMH: 0,
              };
              await saveRun(run);
              resetRun();
              router.back();
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Finalizar Corrida',
      `Salvar esta corrida?\nDistância: ${distance.toFixed(2)} km\nTempo: ${formatTime(time)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salvar',
          onPress: async () => {
            const run = {
              id: Date.now().toString(),
              distanceInMeters: distanceInMeters,
              durationInMillis: time * 1000,
              timestamp: new Date().toISOString(),
              pathPoints: pathPoints,
              avgSpeedInKMH: time > 0 && distance > 0 
                ? parseFloat((distance / (time / 3600)).toFixed(2)) 
                : 0,
            };
            await saveRun(run);
            resetRun();
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      {/* Top Bar */}
      <View className="px-6 pt-16 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={handleBackPress}
          className="w-10 h-10 items-center justify-center">
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#E5E1E6' : '#1B1B1F'} />
        </TouchableOpacity>
        <Text className={`text-lg font-psemibold ${isDark ? 'text-white' : 'text-black'}`}>
          Correndo
        </Text>
        <View className="w-10" />
      </View>

      {/* Map Area - Reduced height to make room for controls */}
      <View className={`mx-6 mb-4 rounded-3xl overflow-hidden ${isDark ? 'bg-gray-200' : 'bg-gray-100'}`} style={{ height: '55%' }}>
        <GoogleMapView 
          pathPoints={pathPoints} 
          isDark={isDark}
          isTracking={isTracking}
          currentLocation={location?.coords ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          } : null}
        />
      </View>

      {/* Stats Card - Added safe area bottom padding */}
      <View 
        className={`mx-6 rounded-3xl p-6 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-white border-gray-300'} shadow-lg`}
        style={{ marginBottom: Math.max(insets.bottom, 16) }}>
        {/* Main Stats */}
        <View className="flex-row justify-around mb-6">
          <View className="items-center">
            <Text className={`text-xs mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              DISTÂNCIA
            </Text>
            <Text className={`text-3xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
              {distance.toFixed(2)} km
            </Text>
          </View>
          <View className="items-center">
            <View className="flex-row items-center mb-2">
              <Ionicons name="time" size={16} color={isDark ? '#918F9A' : '#777680'} />
              <Text className={`text-xs ml-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                TEMPO
              </Text>
            </View>
            <Text className={`text-3xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
              {formatTime(time)}
            </Text>
          </View>
          <View className="items-center">
            <Text className={`text-xs mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              RITMO
            </Text>
            <Text className={`text-3xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
              {formatPace()}
            </Text>
          </View>
        </View>

        {/* Control Buttons */}
        <View className="flex-row justify-center gap-4">
          <TouchableOpacity
            className={`w-16 h-16 rounded-full items-center justify-center border-2 ${isDark ? 'bg-red-500/30 border-red-500' : 'bg-red-500/40 border-red-500'}`}
            onPress={handleStop}>
            <Ionicons name="stop" size={24} color={isDark ? '#DC2626' : '#B91C1C'} />
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`w-20 h-20 rounded-full items-center justify-center ${isDark ? 'bg-primary-200' : 'bg-primary'}`}
            onPress={handlePlayPause}>
            <IconSymbol 
              name={isTracking ? "pause.fill" : "play.fill"} 
              size={32} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`w-16 h-16 rounded-full items-center justify-center border-2 ${isDark ? 'bg-secondary/30 border-secondary' : 'bg-secondary/40 border-secondary'}`}
            onPress={handleFinish}>
            <Ionicons name="flag" size={24} color={isDark ? '#33A853' : '#1B8652'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
