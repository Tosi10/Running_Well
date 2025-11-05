import { useRuns } from '@/context/RunContext';
import { useSettings } from '@/context/SettingsContext';
import { useAchievements } from '@/context/AchievementsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const { runs, getTotalStats, getGoalProgress } = useRuns();
  const { settings } = useSettings();
  const { checkGoalAchievement } = useAchievements();
  const stats = getTotalStats();
  
  const goalProgress = settings.goalEnabled
    ? getGoalProgress(settings.goalType, settings.goalDistance, settings.goalStartDate)
    : null;

  // Check for goal completion and unlock achievement
  useEffect(() => {
    if (settings.goalEnabled && goalProgress && goalProgress.percentage >= 100) {
      checkGoalAchievement(
        settings.goalType,
        settings.goalDistance,
        true
      );
    }
  }, [goalProgress, settings.goalEnabled, settings.goalType, settings.goalDistance, checkGoalAchievement]);

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
              Pronto para correr?
            </Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 rounded-full overflow-hidden items-center justify-center bg-primary/20"
            onPress={() => router.push('/profile')}>
            <Ionicons name="person" size={24} color={isDark ? '#BFC2FF' : '#4C52BF'} />
          </TouchableOpacity>
        </View>

        {/* Quick Start Card */}
        <TouchableOpacity
          className={`rounded-3xl p-6 mb-6 ${isDark ? 'bg-primary-200' : 'bg-primary'}`}
          onPress={() => router.push('/current-run')}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white text-2xl font-pbold mb-2">Iniciar Corrida</Text>
              <Text className="text-white/80 text-sm">Acompanhe sua corrida em tempo real</Text>
            </View>
            <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name="fitness" size={32} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Goal Card */}
        {settings.goalEnabled && goalProgress && (
          <TouchableOpacity
            className={`rounded-2xl p-5 mb-6 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}
            onPress={() => router.push('/goal-settings')}>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="flag" size={20} color={isDark ? '#BFC2FF' : '#4C52BF'} />
                <Text className={`text-base font-psemibold ml-2 ${isDark ? 'text-white' : 'text-black'}`}>
                  {settings.goalType === 'daily' ? 'Meta Diária' : settings.goalType === 'weekly' ? 'Meta Semanal' : 'Meta Mensal'}
                </Text>
              </View>
              <Text className={`text-sm font-pregular ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                {goalProgress.current} / {goalProgress.target} km
              </Text>
            </View>
            <View className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-black-200' : 'bg-white'}`}>
              <View
                className={`h-full rounded-full ${
                  goalProgress.percentage >= 100
                    ? 'bg-secondary'
                    : isDark
                    ? 'bg-primary-200'
                    : 'bg-primary'
                }`}
                style={{ width: `${Math.min(goalProgress.percentage, 100)}%` }}
              />
            </View>
            <View className="flex-row items-center justify-between mt-2">
              <Text className={`text-xs ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                {goalProgress.percentage}% completo
              </Text>
              {goalProgress.percentage >= 100 && (
                <View className="flex-row items-center">
                  <Ionicons name="trophy" size={14} color="#33A853" />
                  <Text className={`text-xs ml-1 font-psemibold ${isDark ? 'text-secondary' : 'text-secondary'}`}>
                    Meta Atingida!
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Stats Cards */}
        <View className="flex-row gap-4 mb-6">
          <View className={`flex-1 rounded-2xl p-4 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
              <View className="flex-row items-center mb-2">
                <Ionicons name="flame" size={16} color={isDark ? '#918F9A' : '#777680'} />
                <Text className={`text-xs ml-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                  Distância Total
                </Text>
              </View>
            <Text className={`text-2xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
              {stats.totalDistance} km
            </Text>
          </View>
          <View className={`flex-1 rounded-2xl p-4 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
              <View className="flex-row items-center mb-2">
                <Ionicons name="time" size={16} color={isDark ? '#918F9A' : '#777680'} />
                <Text className={`text-xs ml-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                  Tempo Total
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
              Corridas Recentes
            </Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text className={`text-sm text-primary ${isDark ? 'text-primary-100' : 'text-primary'}`}>
                Ver Todas
              </Text>
            </TouchableOpacity>
          </View>
          {recentRuns.length > 0 ? (
            recentRuns.map((run) => (
              <TouchableOpacity
                key={run.id}
                className={`rounded-2xl p-4 mb-3 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}
                onPress={() => router.push(`/run-details?runId=${run.id}`)}>
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className={`text-base font-psemibold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                      {(run.distanceInMeters / 1000).toFixed(2)} km
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                      {new Date(run.timestamp).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <Text className={`text-base font-pregular ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    {formatTime(Math.floor(run.durationInMillis / 1000))}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className={`rounded-2xl p-4 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
              <Text className={`text-center ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                Ainda não há corridas. Comece sua primeira corrida!
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
