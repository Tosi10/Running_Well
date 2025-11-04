import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const RUNS_STORAGE_KEY = '@running_well:runs';

export const RunContext = createContext();

export function RunProvider({ children }) {
  const [runs, setRuns] = useState([]);
  const [currentRun, setCurrentRun] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      const storedRuns = await AsyncStorage.getItem(RUNS_STORAGE_KEY);
      if (storedRuns) {
        setRuns(JSON.parse(storedRuns));
      }
    } catch (error) {
      console.error('Error loading runs:', error);
    }
  };

  const saveRun = async (run) => {
    try {
      // Ensure run has an ID
      const runWithId = { ...run, id: run.id || Date.now().toString() };
      
      // Load current runs to ensure we have the latest data
      const currentRuns = await AsyncStorage.getItem(RUNS_STORAGE_KEY);
      const existingRuns = currentRuns ? JSON.parse(currentRuns) : [];
      
      const newRuns = [runWithId, ...existingRuns];
      setRuns(newRuns);
      await AsyncStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(newRuns));
      
      console.log('Run saved successfully:', runWithId);
    } catch (error) {
      console.error('Error saving run:', error);
    }
  };

  const deleteRun = async (runId) => {
    try {
      const filteredRuns = runs.filter(r => r.id !== runId);
      setRuns(filteredRuns);
      await AsyncStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(filteredRuns));
    } catch (error) {
      console.error('Error deleting run:', error);
    }
  };

  const getTotalStats = useCallback(() => {
    const totalDistance = runs.reduce((sum, run) => sum + (run.distanceInMeters || 0), 0);
    const totalTime = runs.reduce((sum, run) => sum + (run.durationInMillis || 0), 0);
    const totalRuns = runs.length;
    const avgSpeed = totalRuns > 0 
      ? runs.reduce((sum, run) => sum + (run.avgSpeedInKMH || 0), 0) / totalRuns 
      : 0;
    
    // Find best run (longest distance)
    const bestRun = runs.length > 0 
      ? runs.reduce((best, run) => 
          (run.distanceInMeters || 0) > (best.distanceInMeters || 0) ? run : best
        )
      : null;

    return {
      totalDistance: (totalDistance / 1000).toFixed(2),
      totalTime: Math.floor(totalTime / 1000),
      totalRuns,
      avgSpeed: avgSpeed.toFixed(1),
      bestRun,
    };
  }, [runs]);

  const getWeeklyStats = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyRuns = runs.filter(run => {
      const runDate = new Date(run.timestamp);
      return runDate >= startOfWeek;
    });

    const weeklyDistance = weeklyRuns.reduce((sum, run) => sum + (run.distanceInMeters || 0), 0);
    const weeklyTime = weeklyRuns.reduce((sum, run) => sum + (run.durationInMillis || 0), 0);
    const weeklyCount = weeklyRuns.length;

    return {
      distance: (weeklyDistance / 1000).toFixed(2),
      time: Math.floor(weeklyTime / 1000),
      runs: weeklyCount,
    };
  }, [runs]);

  const getMonthlyStats = useCallback(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyRuns = runs.filter(run => {
      const runDate = new Date(run.timestamp);
      return runDate >= startOfMonth;
    });

    const monthlyDistance = monthlyRuns.reduce((sum, run) => sum + (run.distanceInMeters || 0), 0);
    const monthlyTime = monthlyRuns.reduce((sum, run) => sum + (run.durationInMillis || 0), 0);
    const monthlyCount = monthlyRuns.length;

    return {
      distance: (monthlyDistance / 1000).toFixed(2),
      time: Math.floor(monthlyTime / 1000),
      runs: monthlyCount,
    };
  }, [runs]);

  const getGoalProgress = useCallback((goalType, goalDistance) => {
    if (!goalDistance || goalDistance <= 0) {
      return {
        current: 0,
        target: 0,
        percentage: 0,
      };
    }

    const now = new Date();
    let startDate;

    switch (goalType) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return {
          current: 0,
          target: goalDistance,
          percentage: 0,
        };
    }

    const relevantRuns = runs.filter(run => {
      const runDate = new Date(run.timestamp);
      return runDate >= startDate;
    });

    const currentDistance = relevantRuns.reduce((sum, run) => sum + (run.distanceInMeters || 0), 0) / 1000; // Convert to km
    const percentage = Math.min((currentDistance / goalDistance) * 100, 100);

    return {
      current: parseFloat(currentDistance.toFixed(2)),
      target: goalDistance,
      percentage: parseFloat(percentage.toFixed(1)),
    };
  }, [runs]);

  return (
    <RunContext.Provider
      value={{
        runs,
        currentRun,
        isTracking,
        setCurrentRun,
        setIsTracking,
        saveRun,
        deleteRun,
        getTotalStats,
        getWeeklyStats,
        getMonthlyStats,
        getGoalProgress,
      }}>
      {children}
    </RunContext.Provider>
  );
}

export function useRuns() {
  const context = useContext(RunContext);
  if (!context) {
    throw new Error('useRuns must be used within RunProvider');
  }
  return context;
}


