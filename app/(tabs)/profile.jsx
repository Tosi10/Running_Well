import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/context/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const { settings } = useSettings();

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <View className="px-6 pt-16 pb-8">
        <Text className={`text-2xl font-pbold mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
          Profile
        </Text>
        
        {/* Profile Card */}
        <View className={`rounded-3xl p-6 mb-6 ${isDark ? 'bg-gray-200' : 'bg-gray-100'}`}>
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-primary items-center justify-center bg-primary/20">
              <Ionicons name="person" size={48} color={isDark ? '#BFC2FF' : '#4C52BF'} />
            </View>
            <Text className={`text-xl font-pbold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
              {settings.userName}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Runner
            </Text>
          </View>
        </View>

        {/* Settings Items */}
        <View className={`rounded-2xl overflow-hidden mb-6 ${isDark ? 'bg-gray-200' : 'bg-gray-100'}`}>
          <TouchableOpacity
            className="flex-row items-center px-6 py-4 border-b border-gray-300/20"
            onPress={() => router.push('/personal-parameters')}>
            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-4">
              <IconSymbol name="person.fill" size={20} color={isDark ? '#BFC2FF' : '#4C52BF'} />
            </View>
            <Text className={`flex-1 text-base font-pregular ${isDark ? 'text-white' : 'text-black'}`}>
              Personal Parameters
            </Text>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#918F9A' : '#777680'} />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center px-6 py-4 border-b border-gray-300/20">
            <View className="w-10 h-10 rounded-full bg-secondary/20 items-center justify-center mr-4">
              <IconSymbol name="trophy.fill" size={20} color="#33A853" />
            </View>
            <Text className={`flex-1 text-base font-pregular ${isDark ? 'text-white' : 'text-black'}`}>
              Achievements
            </Text>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#918F9A' : '#777680'} />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center px-6 py-4">
            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-4">
              <IconSymbol name="gearshape.fill" size={20} color={isDark ? '#BFC2FF' : '#4C52BF'} />
            </View>
            <Text className={`flex-1 text-base font-pregular ${isDark ? 'text-white' : 'text-black'}`}>
              Settings
            </Text>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#918F9A' : '#777680'} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
