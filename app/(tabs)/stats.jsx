import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <View className="px-6 pt-16 pb-8">
        <Text className={`text-2xl font-pbold mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
          Statistics
        </Text>
        
        {/* Weekly Stats Card */}
        <View className={`rounded-2xl p-6 mb-4 ${isDark ? 'bg-gray-200' : 'bg-gray-100'}`}>
          <Text className={`text-lg font-psemibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            This Week
          </Text>
          <View className="flex-row justify-between mb-4">
            <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="flame" size={12} color={isDark ? '#918F9A' : '#777680'} />
                  <Text className={`text-xs ml-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    Distance
                  </Text>
                </View>
              <Text className={`text-xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
                0 km
              </Text>
            </View>
            <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="time" size={12} color={isDark ? '#918F9A' : '#777680'} />
                  <Text className={`text-xs ml-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    Time
                  </Text>
                </View>
              <Text className={`text-xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
                0:00
              </Text>
            </View>
            <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="flash" size={12} color={isDark ? '#918F9A' : '#777680'} />
                  <Text className={`text-xs ml-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                    Runs
                  </Text>
                </View>
              <Text className={`text-xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
                0
              </Text>
            </View>
          </View>
        </View>

        {/* All Time Stats */}
        <View className={`rounded-2xl p-6 ${isDark ? 'bg-gray-200' : 'bg-gray-100'}`}>
          <Text className={`text-lg font-psemibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            All Time
          </Text>
          <View className={`rounded-xl p-4 items-center ${isDark ? 'bg-black-200' : 'bg-white'}`}>
            <Text className={`text-4xl mb-2`}>📈</Text>
            <Text className={`text-center text-sm ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Statistics will appear here as you run.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
