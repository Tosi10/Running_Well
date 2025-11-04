import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/context/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PersonalParametersScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const { settings, updateSettings } = useSettings();

  const [formData, setFormData] = useState({
    userName: settings.userName || '',
    weight: settings.weight?.toString() || '',
    height: settings.height?.toString() || '',
    age: settings.age?.toString() || '',
    gender: settings.gender || 'male',
  });

  const handleSave = () => {
    const updates = {
      userName: formData.userName || 'User Name',
      weight: parseFloat(formData.weight) || settings.weight,
      height: parseFloat(formData.height) || settings.height,
      age: parseInt(formData.age) || settings.age,
      gender: formData.gender,
    };

    updateSettings(updates);
    Alert.alert('Success', 'Personal parameters saved!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
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
            Personal Parameters
          </Text>
        </View>

        {/* Form */}
        <View className={`rounded-2xl p-6 mb-4 ${isDark ? 'bg-gray-200' : 'bg-gray-100'}`}>
          {/* User Name */}
          <View className="mb-6">
            <Text className={`text-sm font-psemibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Name
            </Text>
            <TextInput
              className={`rounded-xl px-4 py-3 ${isDark ? 'bg-black-200 text-white' : 'bg-white text-black'}`}
              value={formData.userName}
              onChangeText={(text) => setFormData({ ...formData, userName: text })}
              placeholder="Enter your name"
              placeholderTextColor={isDark ? '#918F9A' : '#777680'}
            />
          </View>

          {/* Weight */}
          <View className="mb-6">
            <Text className={`text-sm font-psemibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Weight (kg)
            </Text>
            <TextInput
              className={`rounded-xl px-4 py-3 ${isDark ? 'bg-black-200 text-white' : 'bg-white text-black'}`}
              value={formData.weight}
              onChangeText={(text) => setFormData({ ...formData, weight: text })}
              placeholder="Enter your weight"
              placeholderTextColor={isDark ? '#918F9A' : '#777680'}
              keyboardType="numeric"
            />
          </View>

          {/* Height */}
          <View className="mb-6">
            <Text className={`text-sm font-psemibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Height (cm)
            </Text>
            <TextInput
              className={`rounded-xl px-4 py-3 ${isDark ? 'bg-black-200 text-white' : 'bg-white text-black'}`}
              value={formData.height}
              onChangeText={(text) => setFormData({ ...formData, height: text })}
              placeholder="Enter your height"
              placeholderTextColor={isDark ? '#918F9A' : '#777680'}
              keyboardType="numeric"
            />
          </View>

          {/* Age */}
          <View className="mb-6">
            <Text className={`text-sm font-psemibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Age
            </Text>
            <TextInput
              className={`rounded-xl px-4 py-3 ${isDark ? 'bg-black-200 text-white' : 'bg-white text-black'}`}
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              placeholder="Enter your age"
              placeholderTextColor={isDark ? '#918F9A' : '#777680'}
              keyboardType="numeric"
            />
          </View>

          {/* Gender */}
          <View className="mb-6">
            <Text className={`text-sm font-psemibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Gender
            </Text>
            <View className="flex-row gap-3">
              {['male', 'female', 'other'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  className={`flex-1 rounded-xl py-3 items-center ${
                    formData.gender === gender
                      ? isDark
                        ? 'bg-primary-200'
                        : 'bg-primary'
                      : isDark
                      ? 'bg-black-200'
                      : 'bg-white'
                  }`}
                  onPress={() => setFormData({ ...formData, gender })}>
                  <Text
                    className={`font-pregular ${
                      formData.gender === gender ? 'text-white' : isDark ? 'text-gray-100' : 'text-black'
                    }`}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center ${isDark ? 'bg-primary-200' : 'bg-primary'}`}
          onPress={handleSave}>
          <Text className="text-white text-base font-psemibold">Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

