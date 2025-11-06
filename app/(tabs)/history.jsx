import { useRuns } from '@/context/RunContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const { runs, deleteRun } = useRuns();

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) {
      return '0:00';
    }
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
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
          runs
            .filter(run => {
              try {
                return run && run.id && typeof run.id !== 'undefined' && run.id !== null;
              } catch (e) {
                return false;
              }
            })
            .map((run) => {
              try {
                if (!run || !run.id) return null;
                
                const distanceInMeters = run.distanceInMeters || 0;
                const distanceKm = typeof distanceInMeters === 'number' && !isNaN(distanceInMeters) 
                  ? (distanceInMeters / 1000).toFixed(2) 
                  : '0.00';
                
                const durationInMillis = run.durationInMillis || 0;
                const durationSeconds = typeof durationInMillis === 'number' && !isNaN(durationInMillis)
                  ? Math.floor(durationInMillis / 1000)
                  : 0;
                
                let dateStr = 'Data não disponível';
                if (run.timestamp) {
                  try {
                    const date = new Date(run.timestamp);
                    if (!isNaN(date.getTime())) {
                      dateStr = date.toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                    }
                  } catch (e) {
                    dateStr = 'Data não disponível';
                  }
                }
                
                const caloriesBurned = run.caloriesBurned && typeof run.caloriesBurned === 'number' && run.caloriesBurned > 0
                  ? String(run.caloriesBurned)
                  : null;
                
                const avgSpeed = run.avgSpeedInKMH && typeof run.avgSpeedInKMH === 'number' && run.avgSpeedInKMH > 0
                  ? String(run.avgSpeedInKMH)
                  : null;
                
                return (
                  <TouchableOpacity
                    key={String(run.id)}
                    className={`rounded-2xl p-4 mb-3 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}
                    onPress={() => router.push(`/run-details?runId=${String(run.id)}`)}
                    onLongPress={() => handleDelete(String(run.id))}>
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className={`text-lg font-psemibold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                          {String(distanceKm)} km
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className={`text-sm ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                            {String(dateStr)}
                          </Text>
                          {caloriesBurned && (
                            <View className="flex-row items-center ml-3">
                              <Ionicons name="flame" size={14} color="#FF6B35" />
                              <Text className={`text-xs ml-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                                {caloriesBurned} kcal
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className={`text-base font-pregular ${isDark ? 'text-white' : 'text-black'}`}>
                          {String(formatTime(durationSeconds))}
                        </Text>
                        {avgSpeed && (
                          <Text className={`text-xs ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                            {avgSpeed} km/h
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              } catch (error) {
                console.error('Error rendering run:', error, run);
                return null;
              }
            })
            .filter(item => item !== null)
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
