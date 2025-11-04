import { useRuns } from '@/context/RunContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { getTotalStats, getWeeklyStats, getMonthlyStats } = useRuns();
  
  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();
  const totalStats = getTotalStats();

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <View className="px-6 pt-16 pb-8">
        <Text className={`text-2xl font-pbold mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
          Estatísticas
        </Text>
        
        {/* Weekly Stats Card */}
        <View className={`rounded-2xl p-6 mb-4 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
          <Text className={`text-lg font-psemibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            Esta Semana
          </Text>
          <View className="flex-row justify-between mb-4">
            <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="flame" size={12} color={isDark ? '#918F9A' : '#777680'} />
                  <Text className={`text-xs ml-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    Distância
                  </Text>
                </View>
              <Text className={`text-xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
                {weeklyStats.distance} km
              </Text>
            </View>
            <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="time" size={12} color={isDark ? '#918F9A' : '#777680'} />
                  <Text className={`text-xs ml-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    Tempo
                  </Text>
                </View>
              <Text className={`text-xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
                {formatTime(weeklyStats.time)}
              </Text>
            </View>
            <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="flash" size={12} color={isDark ? '#918F9A' : '#777680'} />
                  <Text className={`text-xs ml-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    Corridas
                  </Text>
                </View>
              <Text className={`text-xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
                {weeklyStats.runs}
              </Text>
            </View>
          </View>
        </View>

        {/* All Time Stats */}
        <View className={`rounded-2xl p-6 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
          <Text className={`text-lg font-psemibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            Desde o Início
          </Text>
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="flame" size={12} color={isDark ? '#918F9A' : '#777680'} />
                  <Text className={`text-xs ml-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    Distância Total
                  </Text>
                </View>
                <Text className={`text-2xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
                  {totalStats.totalDistance} km
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="time" size={12} color={isDark ? '#918F9A' : '#777680'} />
                  <Text className={`text-xs ml-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    Tempo Total
                  </Text>
                </View>
                <Text className={`text-2xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
                  {formatTime(totalStats.totalTime)}
                </Text>
              </View>
            </View>
            
            <View className="flex-row justify-between mt-4">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="flash" size={12} color={isDark ? '#918F9A' : '#777680'} />
                  <Text className={`text-xs ml-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    Total de Corridas
                  </Text>
                </View>
                <Text className={`text-2xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
                  {totalStats.totalRuns}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="speedometer" size={12} color={isDark ? '#918F9A' : '#777680'} />
                  <Text className={`text-xs ml-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    Velocidade Média
                  </Text>
                </View>
                <Text className={`text-2xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
                  {totalStats.avgSpeed} km/h
                </Text>
              </View>
            </View>

            {totalStats.bestRun && (
              <View className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-primary-200' : 'bg-primary/20'}`}>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="trophy" size={16} color={isDark ? '#BFC2FF' : '#4C52BF'} />
                  <Text className={`text-sm font-psemibold ml-2 ${isDark ? 'text-white' : 'text-primary'}`}>
                    Melhor Corrida
                  </Text>
                </View>
                <Text className={`text-lg font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
                  {(totalStats.bestRun.distanceInMeters / 1000).toFixed(2)} km
                </Text>
                <Text className={`text-sm mt-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                  {formatTime(Math.floor(totalStats.bestRun.durationInMillis / 1000))} • {new Date(totalStats.bestRun.timestamp).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
