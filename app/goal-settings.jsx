import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/context/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GoalSettingsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const { settings, updateSettings } = useSettings();

  const [formData, setFormData] = useState({
    goalEnabled: false,
    goalType: 'weekly',
    goalDistance: '10',
  });

  useEffect(() => {
    // Sync formData with settings when component mounts or settings change
    setFormData({
      goalEnabled: settings.goalEnabled ?? false,
      goalType: settings.goalType || 'weekly',
      goalDistance: settings.goalDistance?.toString() || '10',
    });
  }, [settings.goalEnabled, settings.goalType, settings.goalDistance]);

  const handleToggleGoal = () => {
    const newEnabledState = !formData.goalEnabled;

    if (formData.goalEnabled && !newEnabledState) {
      // User wants to disable - show confirmation
      Alert.alert(
        'Desativar Meta?',
        'Tem certeza que deseja desativar sua meta de corrida? Seu progresso será resetado.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              // Keep it enabled - don't change state
            },
          },
          {
            text: 'Desativar',
            style: 'destructive',
            onPress: async () => {
              // Save disabled state immediately
              const updates = {
                goalEnabled: false,
                goalType: formData.goalType,
                goalDistance: settings.goalDistance || 10,
              };
              await updateSettings(updates);
              router.back();
            },
          },
        ]
      );
      // Don't update state here - wait for user confirmation
      return;
    } else if (!formData.goalEnabled && newEnabledState) {
      // User wants to enable - just show the configuration fields
      // Don't save yet - let user choose type and distance first
      setFormData({ ...formData, goalEnabled: true });
    }
  };

  const handleSave = () => {
    // Only save when goal is enabled and user wants to update settings
    if (!formData.goalEnabled) {
      return;
    }

    const distance = parseFloat(formData.goalDistance);
    
      if (isNaN(distance) || distance <= 0) {
        Alert.alert('Entrada Inválida', 'Por favor, digite uma distância válida maior que 0.');
        return;
      }

    const updates = {
      goalEnabled: true,
      goalType: formData.goalType,
      goalDistance: distance,
    };

    updateSettings(updates);
    Alert.alert('Sucesso', 'Configurações da meta atualizadas!', [
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
            Meta de Corrida
          </Text>
        </View>

        {/* Enable Goal Toggle */}
        <View className={`rounded-2xl p-6 mb-4 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
          <TouchableOpacity
            className="flex-row items-center justify-between"
            onPress={handleToggleGoal}>
            <View className="flex-row items-center flex-1 mr-4">
              <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-4 flex-shrink-0">
                <Ionicons name="flag" size={20} color={isDark ? '#BFC2FF' : '#4C52BF'} />
              </View>
              <View className="flex-1">
                <Text className={`text-base font-psemibold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                  Ativar Meta
                </Text>
                <Text className={`text-xs ${isDark ? 'text-gray-100' : 'text-gray-400'}`} numberOfLines={2}>
                  Acompanhe seu progresso em direção a uma meta de corrida
                </Text>
              </View>
            </View>
            <View className={`w-12 h-6 rounded-full flex-shrink-0 ${formData.goalEnabled ? (isDark ? 'bg-primary-200' : 'bg-primary') : 'bg-gray-300'} items-center justify-center`}>
              <View className={`w-5 h-5 rounded-full bg-white absolute ${formData.goalEnabled ? 'right-1' : 'left-1'}`} />
            </View>
          </TouchableOpacity>
        </View>

        {formData.goalEnabled && (
          <>
            {/* Goal Type */}
            <View className={`rounded-2xl p-6 mb-4 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
              <Text className={`text-sm font-psemibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                Tipo de Meta
              </Text>
              <View className="flex-row gap-3">
                {['daily', 'weekly', 'monthly'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    className={`flex-1 rounded-xl py-3 items-center ${
                      formData.goalType === type
                        ? isDark
                          ? 'bg-primary-200'
                          : 'bg-primary'
                        : isDark
                        ? 'bg-black-200'
                        : 'bg-white'
                    }`}
                    onPress={() => setFormData({ ...formData, goalType: type })}>
                    <Text
                      className={`font-pregular text-sm ${
                        formData.goalType === type ? 'text-white' : isDark ? 'text-gray-100' : 'text-black'
                      }`}>
                      {type === 'daily' ? 'Diária' : type === 'weekly' ? 'Semanal' : 'Mensal'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Goal Distance */}
            <View className={`rounded-2xl p-6 mb-4 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
              <Text className={`text-sm font-psemibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                Distância Alvo (km)
              </Text>
              <TextInput
                className={`rounded-xl px-4 py-3 text-lg font-pbold ${isDark ? 'bg-black-200 text-white' : 'bg-white text-black'}`}
                value={formData.goalDistance}
                onChangeText={(text) => setFormData({ ...formData, goalDistance: text })}
                placeholder="Digite a distância alvo"
                placeholderTextColor={isDark ? '#918F9A' : '#777680'}
                keyboardType="numeric"
              />
              <Text className={`text-xs mt-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                Defina sua meta de distância {formData.goalType === 'daily' ? 'diária' : formData.goalType === 'weekly' ? 'semanal' : 'mensal'} em quilômetros
              </Text>
            </View>
          </>
        )}

        {/* Save Button - Only show when goal is enabled */}
        {formData.goalEnabled && (
          <TouchableOpacity
            className={`rounded-2xl py-4 items-center ${isDark ? 'bg-primary-200' : 'bg-primary'}`}
            onPress={handleSave}>
            <Text className="text-white text-base font-psemibold">Salvar Alterações</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}


