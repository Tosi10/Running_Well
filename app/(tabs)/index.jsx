import { useRuns } from '@/context/RunContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const { runs, getTotalStats } = useRuns();
  const stats = getTotalStats();

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const recentRuns = runs.slice(0, 3);

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <View className="px-6 pt-16 pb-8">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className={`text-2xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
              Running Well
            </Text>
            <Text className={`text-sm mt-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Ready to run?
            </Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 rounded-full overflow-hidden"
            onPress={() => router.push('/profile')}>
            <Image
              source={require('@/assets/images/demo_profile_pic.png')}
              className="w-full h-full"
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>

        {/* Quick Start Card */}
        <TouchableOpacity
          className={`rounded-3xl p-6 mb-6 ${isDark ? 'bg-primary-200' : 'bg-primary'}`}
          onPress={() => router.push('/current-run')}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white text-2xl font-pbold mb-2">Start Running</Text>
              <Text className="text-white/80 text-sm">Track your run in real-time</Text>
            </View>
            <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center overflow-hidden">
              <Image
                source={require('@/assets/images/running_boy.png')}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Stats Cards */}
        <View className="flex-row gap-4 mb-6">
          <View className={`flex-1 rounded-2xl p-4 ${isDark ? 'bg-gray-200' : 'bg-gray-100'}`}>
            <View className="flex-row items-center mb-2">
              <Image
                source={require('@/assets/images/fire.png')}
                className="w-4 h-4 mr-2"
                resizeMode="contain"
              />
              <Text className={`text-xs ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                Total Distance
              </Text>
            </View>
            <Text className={`text-2xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
              {stats.totalDistance} km
            </Text>
          </View>
          <View className={`flex-1 rounded-2xl p-4 ${isDark ? 'bg-gray-200' : 'bg-gray-100'}`}>
            <View className="flex-row items-center mb-2">
              <Image
                source={require('@/assets/images/stopwatch.png')}
                className="w-4 h-4 mr-2"
                resizeMode="contain"
              />
              <Text className={`text-xs ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                Total Time
              </Text>
            </View>
            <Text className={`text-2xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
              {formatTime(stats.totalTime)}
            </Text>
          </View>
        </View>

        {/* Recent Runs */}
        <View className="mt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-lg font-psemibold ${isDark ? 'text-white' : 'text-black'}`}>
              Recent Runs
            </Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text className={`text-sm text-primary ${isDark ? 'text-primary-100' : 'text-primary'}`}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {recentRuns.length > 0 ? (
            recentRuns.map((run) => (
              <TouchableOpacity
                key={run.id}
                className={`rounded-2xl p-4 mb-3 ${isDark ? 'bg-gray-200' : 'bg-gray-100'}`}>
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className={`text-base font-psemibold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                      {(run.distanceInMeters / 1000).toFixed(2)} km
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                      {new Date(run.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className={`text-base font-pregular ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    {formatTime(Math.floor(run.durationInMillis / 1000))}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className={`rounded-2xl p-4 ${isDark ? 'bg-gray-200' : 'bg-gray-100'}`}>
              <Text className={`text-center ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                No runs yet. Start your first run!
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
