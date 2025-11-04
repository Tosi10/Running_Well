import { useRuns } from '@/context/RunContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
      'Deletar Corrida',
      'Tem certeza que deseja deletar esta corrida?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
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
          Histórico de Corridas
        </Text>
        {runs.length > 0 ? (
          runs.map((run) => (
            <TouchableOpacity
              key={run.id}
              className={`rounded-2xl p-4 mb-3 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}
              onPress={() => router.push(`/run-details?runId=${run.id}`)}
              onLongPress={() => handleDelete(run.id)}>
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className={`text-lg font-psemibold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                    {(run.distanceInMeters / 1000).toFixed(2)} km
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    {new Date(run.timestamp).toLocaleDateString('pt-BR', {
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
          <View className={`rounded-2xl p-8 items-center border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
            <View className="w-32 h-32 rounded-full items-center justify-center mb-4 bg-primary/20">
              <Ionicons name="fitness" size={64} color={isDark ? '#BFC2FF' : '#4C52BF'} />
            </View>
            <Text className={`text-center text-base ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Ainda não há corridas registradas.
            </Text>
            <Text className={`text-center text-sm mt-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Comece sua primeira corrida para ver seu histórico aqui.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
