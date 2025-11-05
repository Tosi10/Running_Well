import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const SETTINGS_STORAGE_KEY = '@running_well:settings';

const defaultSettings = {
  // Personal Parameters
  userName: 'Nome do Usuário',
  weight: 70, // kg
  height: 170, // cm
  age: 30,
  gender: 'male', // 'male' | 'female' | 'other'
  
  // Units
  distanceUnit: 'km', // 'km' | 'miles'
  weightUnit: 'kg', // 'kg' | 'lbs'
  
  // Notifications
  notificationsEnabled: true,
  
  // App Settings
  theme: 'auto', // 'light' | 'dark' | 'auto'
  
  // Goals
  goalEnabled: false,
  goalType: 'weekly', // 'daily' | 'weekly' | 'monthly'
  goalDistance: 10, // km
  goalStartDate: null, // Timestamp when goal was created/updated (ISO string)
};

export const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetSettings = async () => {
    try {
      setSettings(defaultSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSettings,
        resetSettings,
      }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

