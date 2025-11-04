import { useRuns } from '@/context/RunContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const { runs, deleteRun } = useRuns();

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = (runId) => {
    Alert.alert(
      'Delete Run',
      'Are you sure you want to delete this run?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRun(runId),
        },
      ]
    );
  };

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <View className="px-6 pt-16 pb-8">
        <Text className={`text-2xl font-pbold mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
          Running History
        </Text>
        {runs.length > 0 ? (
          runs.map((run) => (
            <TouchableOpacity
              key={run.id}
              className={`rounded-2xl p-4 mb-3 ${isDark ? 'bg-gray-200' : 'bg-gray-100'}`}
              onLongPress={() => handleDelete(run.id)}>
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className={`text-lg font-psemibold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                    {(run.distanceInMeters / 1000).toFixed(2)} km
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    {new Date(run.timestamp).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className={`text-base font-pregular ${isDark ? 'text-white' : 'text-black'}`}>
                    {formatTime(Math.floor(run.durationInMillis / 1000))}
                  </Text>
                  <Text className={`text-xs ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    {run.avgSpeedInKMH > 0 ? `${run.avgSpeedInKMH} km/h` : ''}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className={`rounded-2xl p-8 items-center ${isDark ? 'bg-gray-200' : 'bg-gray-100'}`}>
            <Image
              source={require('@/assets/images/running_boy.png')}
              className="w-32 h-32 mb-4"
              resizeMode="contain"
            />
            <Text className={`text-center text-base ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              No runs recorded yet.
            </Text>
            <Text className={`text-center text-sm mt-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Start your first run to see your history here.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
