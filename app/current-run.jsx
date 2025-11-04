import { IconSymbol } from '@/components/ui/icon-symbol';
import { SimpleMapView } from '@/components/SimpleMapView';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useRouter } from 'expo-router';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

export default function CurrentRunScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  
  const {
    isTracking,
    distance,
    time,
    pathPoints,
    startTracking,
    pauseTracking,
    finishRun,
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

  const handlePlayPause = () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please enable location permissions to track your run.');
      return;
    }
    
    if (isTracking) {
      pauseTracking();
    } else {
      startTracking();
    }
  };

  const handleFinish = async () => {
    // Allow finishing if there's at least some time tracked
    if (time === 0) {
      Alert.alert('No Run Data', 'Please start a run before finishing.');
      return;
    }

    // Warn if distance is 0 (common in emulator) but still allow saving
    if (distance === 0) {
      Alert.alert(
        'No Distance Recorded',
        'No distance was tracked. This is common when testing on an emulator.\n\nDo you want to save this run anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async () => {
              await finishRun();
              router.back();
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Finish Run',
      `Save this run?\nDistance: ${distance.toFixed(2)} km\nTime: ${formatTime(time)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async () => {
            await finishRun();
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
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center">
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#E5E1E6' : '#1B1B1F'} />
        </TouchableOpacity>
        <Text className={`text-lg font-psemibold ${isDark ? 'text-white' : 'text-black'}`}>
          Running
        </Text>
        <View className="w-10" />
      </View>

      {/* Map Area */}
      <View className={`flex-1 mx-6 mb-4 rounded-3xl overflow-hidden ${isDark ? 'bg-gray-200' : 'bg-gray-100'}`}>
        <SimpleMapView pathPoints={pathPoints} isDark={isDark} />
      </View>

      {/* Stats Card */}
      <View className={`mx-6 mb-8 rounded-3xl p-6 ${isDark ? 'bg-gray-200' : 'bg-white'} shadow-lg`}>
        {/* Main Stats */}
        <View className="flex-row justify-around mb-6">
          <View className="items-center">
            <Text className={`text-xs mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              DISTANCE
            </Text>
            <Text className={`text-3xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
              {distance.toFixed(2)} km
            </Text>
          </View>
          <View className="items-center">
            <View className="flex-row items-center mb-2">
              <Image
                source={require('@/assets/images/stopwatch.png')}
                className="w-4 h-4 mr-1"
                resizeMode="contain"
              />
              <Text className={`text-xs ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                TIME
              </Text>
            </View>
            <Text className={`text-3xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
              {formatTime(time)}
            </Text>
          </View>
          <View className="items-center">
            <Text className={`text-xs mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              PACE
            </Text>
            <Text className={`text-3xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
              {formatPace()}
            </Text>
          </View>
        </View>

        {/* Control Buttons */}
        <View className="flex-row justify-center gap-4">
          <TouchableOpacity
            className={`w-16 h-16 rounded-full items-center justify-center ${isDark ? 'bg-black-200' : 'bg-gray-100'}`}
            onPress={() => router.back()}>
            <IconSymbol name="stop.fill" size={24} color={isDark ? '#E5E1E6' : '#1B1B1F'} />
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
            className={`w-16 h-16 rounded-full items-center justify-center ${isDark ? 'bg-secondary/20' : 'bg-secondary/20'}`}
            onPress={handleFinish}>
            <IconSymbol name="flag.fill" size={24} color="#33A853" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
