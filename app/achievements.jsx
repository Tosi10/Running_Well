import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAchievements } from '@/context/AchievementsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AchievementsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const { getAllAchievements } = useAchievements();
  
  const achievements = getAllAchievements();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getIconName = (icon) => {
    const iconMap = {
      flag: 'flag',
      trophy: 'trophy',
      fitness: 'fitness',
      flame: 'flame',
      star: 'star',
    };
    return iconMap[icon] || 'star';
  };

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <View className="px-6 pt-16 pb-8">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center mr-4">
            <IconSymbol name="chevron.left" size={24} color={isDark ? '#E5E1E6' : '#1B1B1F'} />
          </TouchableOpacity>
          <Text className={`text-2xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
            Conquistas
          </Text>
        </View>

        {achievements.length > 0 ? (
          <View className="gap-4">
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                className={`rounded-2xl p-5 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
                <View className="flex-row items-start">
                  <View className={`w-16 h-16 rounded-full items-center justify-center mr-4 ${
                    achievement.type === 'goal' 
                      ? isDark ? 'bg-secondary/30' : 'bg-secondary/20'
                      : isDark ? 'bg-primary-200/30' : 'bg-primary/20'
                  }`}>
                    <Ionicons 
                      name={getIconName(achievement.icon)} 
                      size={32} 
                      color={achievement.type === 'goal' ? '#33A853' : (isDark ? '#BFC2FF' : '#4C52BF')} 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-lg font-psemibold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                      {achievement.title}
                    </Text>
                    <Text className={`text-sm mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                      {achievement.description}
                    </Text>
                    {achievement.unlockedAt && (
                      <Text className={`text-xs ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                        Desbloqueado em {formatDate(achievement.unlockedAt)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={`rounded-2xl p-8 items-center border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
            <View className="w-32 h-32 rounded-full items-center justify-center mb-4 bg-primary/20">
              <Ionicons name="trophy-outline" size={64} color={isDark ? '#BFC2FF' : '#4C52BF'} />
            </View>
            <Text className={`text-center text-lg font-psemibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              Nenhuma conquista ainda
            </Text>
            <Text className={`text-center text-sm ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Complete suas metas para desbloquear conquistas!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

