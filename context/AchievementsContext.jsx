import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ACHIEVEMENTS_STORAGE_KEY = '@running_well:achievements';

export const AchievementsContext = createContext();

export function AchievementsProvider({ children }) {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const storedAchievements = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      if (storedAchievements) {
        setAchievements(JSON.parse(storedAchievements));
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const addAchievement = async (achievement) => {
    try {
      // Check if achievement already exists
      const existingAchievement = achievements.find(
        (a) => a.id === achievement.id
      );

      if (existingAchievement) {
        return; // Already exists, don't add again
      }

      const achievementWithTimestamp = {
        ...achievement,
        unlockedAt: new Date().toISOString(),
      };

      const newAchievements = [...achievements, achievementWithTimestamp];
      setAchievements(newAchievements);
      await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(newAchievements));

      console.log('Achievement unlocked:', achievementWithTimestamp);
      return achievementWithTimestamp;
    } catch (error) {
      console.error('Error adding achievement:', error);
    }
  };

  const checkGoalAchievement = useCallback(async (goalType, goalDistance, isCompleted) => {
    if (!isCompleted) return;

    const achievementId = `goal_${goalType}_${goalDistance}`;
    
    // Load current achievements from storage to check
    const currentAchievements = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    const existingAchievements = currentAchievements ? JSON.parse(currentAchievements) : [];
    const existingAchievement = existingAchievements.find(
      (a) => a.id === achievementId
    );

    if (existingAchievement) {
      return; // Already exists, don't add again
    }

    const goalTypeNames = {
      daily: 'Diária',
      weekly: 'Semanal',
      monthly: 'Mensal',
    };

    const achievementWithTimestamp = {
      id: achievementId,
      type: 'goal',
      title: `Meta ${goalTypeNames[goalType]} Concluída`,
      description: `Você completou sua meta ${goalTypeNames[goalType].toLowerCase()} de ${goalDistance} km!`,
      goalType,
      goalDistance,
      icon: 'flag',
      unlockedAt: new Date().toISOString(),
    };

    // Add to storage and update state
    const newAchievements = [...existingAchievements, achievementWithTimestamp];
    setAchievements(newAchievements);
    await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(newAchievements));

    console.log('Achievement unlocked:', achievementWithTimestamp);
    return achievementWithTimestamp;
  }, []);

  const getAllAchievements = useCallback(() => {
    return achievements;
  }, [achievements]);

  const getAchievementsByType = useCallback((type) => {
    return achievements.filter((a) => a.type === type);
  }, [achievements]);

  return (
    <AchievementsContext.Provider
      value={{
        achievements,
        addAchievement,
        checkGoalAchievement,
        getAllAchievements,
        getAchievementsByType,
      }}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within AchievementsProvider');
  }
  return context;
}

