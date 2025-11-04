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
    return {
      totalDistance: (totalDistance / 1000).toFixed(2),
      totalTime: Math.floor(totalTime / 1000),
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


