import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/context/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PersonalParametersScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const { settings, updateSettings } = useSettings();

  const [formData, setFormData] = useState({
    userName: '',
    weight: '',
    height: '',
    age: '',
    gender: 'male',
  });

  // Load saved settings when component mounts
  useEffect(() => {
    if (settings) {
      setFormData({
        userName: settings.userName && settings.userName !== 'Nome do Usuário' ? settings.userName : '',
        weight: settings.weight ? settings.weight.toString() : '',
        height: settings.height ? settings.height.toString() : '',
        age: settings.age ? settings.age.toString() : '',
        gender: settings.gender || 'male',
      });
      console.log('Carregando parâmetros salvos:', {
        weight: settings.weight,
        height: settings.height,
        age: settings.age,
        gender: settings.gender,
      });
    }
  }, [settings]);

  const handleSave = () => {
    // Parse and validate numeric values
    const weight = formData.weight ? parseFloat(formData.weight) : null;
    const height = formData.height ? parseFloat(formData.height) : null;
    const age = formData.age ? parseInt(formData.age) : null;
    
    // Use provided values or fallback to current settings or defaults
    const updates = {
      userName: formData.userName || 'Nome do Usuário',
      weight: weight && !isNaN(weight) && weight > 0 ? weight : (settings.weight || 70),
      height: height && !isNaN(height) && height > 0 ? height : (settings.height || 170),
      age: age && !isNaN(age) && age > 0 ? age : (settings.age || 30),
      gender: formData.gender || 'male',
    };

    console.log('Salvando parâmetros pessoais:', updates);
    updateSettings(updates);
    Alert.alert('Sucesso', 'Parâmetros pessoais salvos!', [
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
            Parâmetros Pessoais
          </Text>
        </View>

        {/* Form */}
        <View className={`rounded-2xl p-6 mb-4 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
          {/* User Name */}
          <View className="mb-6">
            <Text className={`text-sm font-psemibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Nome
            </Text>
            <TextInput
              className={`rounded-xl px-4 py-3 ${isDark ? 'bg-black-200 text-white' : 'bg-white text-black'}`}
              value={formData.userName}
              onChangeText={(text) => setFormData({ ...formData, userName: text })}
              placeholder="Digite seu nome"
              placeholderTextColor={isDark ? '#918F9A' : '#777680'}
            />
          </View>

          {/* Weight */}
          <View className="mb-6">
            <Text className={`text-sm font-psemibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Peso (kg)
            </Text>
            <TextInput
              className={`rounded-xl px-4 py-3 ${isDark ? 'bg-black-200 text-white' : 'bg-white text-black'}`}
              value={formData.weight}
              onChangeText={(text) => setFormData({ ...formData, weight: text })}
              placeholder="Digite seu peso"
              placeholderTextColor={isDark ? '#918F9A' : '#777680'}
              keyboardType="numeric"
            />
          </View>

          {/* Height */}
          <View className="mb-6">
            <Text className={`text-sm font-psemibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Altura (cm)
            </Text>
            <TextInput
              className={`rounded-xl px-4 py-3 ${isDark ? 'bg-black-200 text-white' : 'bg-white text-black'}`}
              value={formData.height}
              onChangeText={(text) => setFormData({ ...formData, height: text })}
              placeholder="Digite sua altura"
              placeholderTextColor={isDark ? '#918F9A' : '#777680'}
              keyboardType="numeric"
            />
          </View>

          {/* Age */}
          <View className="mb-6">
            <Text className={`text-sm font-psemibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Idade
            </Text>
            <TextInput
              className={`rounded-xl px-4 py-3 ${isDark ? 'bg-black-200 text-white' : 'bg-white text-black'}`}
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              placeholder="Digite sua idade"
              placeholderTextColor={isDark ? '#918F9A' : '#777680'}
              keyboardType="numeric"
            />
          </View>

          {/* Gender */}
          <View className="mb-6">
            <Text className={`text-sm font-psemibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Gênero
            </Text>
            <View className="flex-row gap-3">
              {['male', 'female'].map((gender) => (
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
                    {gender === 'male' ? 'Masculino' : 'Feminino'}
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
          <Text className="text-white text-base font-psemibold">Salvar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

