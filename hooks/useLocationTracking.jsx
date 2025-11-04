import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { useRuns } from '../context/RunContext';

// Minimum distance threshold to filter GPS noise (in km)
const MIN_DISTANCE_THRESHOLD = 0.0005; // ~0.5 meters
// Maximum distance threshold to filter GPS jumps (in km)
const MAX_DISTANCE_THRESHOLD = 0.1; // ~100 meters

export function useLocationTracking() {
  const { setCurrentRun, saveRun } = useRuns();
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const [pathPoints, setPathPoints] = useState([]);
  
  const watchSubscription = useRef(null);
  const timerInterval = useRef(null);
  const startTime = useRef(null);
  const lastLocation = useRef(null);
  const totalDistance = useRef(0); // Use ref to avoid stale closures

  useEffect(() => {
    requestPermission();
    return () => {
      stopTracking();
    };
  }, []);

  const requestPermission = async () => {
    try {
      // Request foreground permission first
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus === 'granted') {
        setHasPermission(true);
        
        // For Android, also request background permission (optional but recommended)
        try {
          const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
          if (backgroundStatus === 'granted') {
            console.log('Background location permission granted');
          }
        } catch (error) {
          // Background permission might not be available on all platforms
          console.log('Background permission not available:', error);
        }
      } else {
        setHasPermission(false);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setHasPermission(false);
    }
  };

  const startTracking = async () => {
    if (!hasPermission) {
      await requestPermission();
      if (!hasPermission) {
        return;
      }
    }

    try {
      // Check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        console.error('Location services are disabled');
        setHasPermission(false);
        return;
      }

      setIsTracking(true);
      startTime.current = Date.now();
      setDistance(0);
      totalDistance.current = 0;
      setTime(0);
      setPathPoints([]);
      lastLocation.current = null;

      // Get initial location immediately
      try {
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        if (initialLocation?.coords) {
          const initialPoint = {
            latitude: initialLocation.coords.latitude,
            longitude: initialLocation.coords.longitude,
          };
          setPathPoints([initialPoint]);
          lastLocation.current = initialPoint;
        }
      } catch (error) {
        console.log('Could not get initial location:', error);
      }

      // Start timer
      timerInterval.current = setInterval(() => {
        if (startTime.current) {
          const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
          setTime(elapsed);
        }
      }, 1000);

      // Start location tracking with optimized settings
      watchSubscription.current = await Location.watchPositionAsync(
        {
          // Use BestForNavigation for running (highest accuracy)
          accuracy: Location.Accuracy.BestForNavigation,
          // Update every 2 seconds (balance between accuracy and battery)
          timeInterval: 2000,
          // Update every 5 meters (more accurate for running)
          distanceInterval: 5,
          // Enable high accuracy mode
          mayShowUserSettingsDialog: true,
        },
        (location) => {
          if (!location?.coords) {
            return;
          }

          setLocation(location);
          
          const newPoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          // Filter out GPS noise and jumps
          if (lastLocation.current) {
            const distanceDelta = calculateDistance(
              lastLocation.current.latitude,
              lastLocation.current.longitude,
              newPoint.latitude,
              newPoint.longitude
            );

            // Filter: ignore very small movements (GPS noise)
            // and very large jumps (GPS errors)
            if (distanceDelta > MIN_DISTANCE_THRESHOLD && distanceDelta < MAX_DISTANCE_THRESHOLD) {
              totalDistance.current += distanceDelta;
              setDistance(totalDistance.current);
              setPathPoints((prev) => [...prev, newPoint]);
              lastLocation.current = newPoint;
            } else if (distanceDelta >= MAX_DISTANCE_THRESHOLD) {
              // GPS jump detected, log but don't add to distance
              console.log('GPS jump detected, ignoring:', distanceDelta);
            }
            // If distance is too small, ignore (GPS noise)
          } else {
            // First point
            setPathPoints([newPoint]);
            lastLocation.current = newPoint;
          }
        }
      );
    } catch (error) {
      console.error('Error starting tracking:', error);
      setIsTracking(false);
      setHasPermission(false);
    }
  };

  const pauseTracking = () => {
    setIsTracking(false);
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };

  const stopTracking = () => {
    pauseTracking();
    startTime.current = null;
    lastLocation.current = null;
    totalDistance.current = 0;
  };

  const finishRun = async () => {
    // Allow saving even if distance is 0 (for emulator testing)
    if (time > 0) {
      const run = {
        id: Date.now().toString(),
        distanceInMeters: Math.round(totalDistance.current * 1000),
        durationInMillis: time * 1000,
        timestamp: new Date().toISOString(),
        pathPoints: pathPoints,
        avgSpeedInKMH: time > 0 && totalDistance.current > 0 
          ? parseFloat((totalDistance.current / (time / 3600)).toFixed(2)) 
          : 0,
      };

      await saveRun(run);
    }

    stopTracking();
    setLocation(null);
    setDistance(0);
    setTime(0);
    setPathPoints([]);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  return {
    isTracking,
    hasPermission,
    location,
    distance,
    time,
    pathPoints,
    startTracking,
    pauseTracking,
    stopTracking,
    finishRun,
  };
}

