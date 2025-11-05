import * as Location from 'expo-location';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

// Minimum distance threshold to filter GPS noise (in km)
const MIN_DISTANCE_THRESHOLD = 0.0005; // ~0.5 meters
// Maximum distance threshold to filter GPS jumps (in km)
const MAX_DISTANCE_THRESHOLD = 0.1; // ~100 meters

const LocationTrackingContext = createContext();

export function LocationTrackingProvider({ children }) {
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const [pathPoints, setPathPoints] = useState([]);
  
  const watchSubscription = useRef(null);
  const timerInterval = useRef(null);
  const startTime = useRef(null);
  const pausedTime = useRef(0);
  const lastLocation = useRef(null);
  const totalDistance = useRef(0);
  const isPaused = useRef(false);

  useEffect(() => {
    requestPermission();
    
    // Get current location immediately when provider mounts (for map display)
    const getInitialLocation = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 5000,
          }).catch(() => null);
          
          if (currentLocation?.coords) {
            setLocation(currentLocation);
          }
        }
      } catch (error) {
        console.log('Could not get initial location:', error);
      }
    };
    
    getInitialLocation();
    
    // Don't stop tracking on unmount - allow navigation while running
    // Tracking will continue in background
  }, []);

  const requestPermission = async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus === 'granted') {
        setHasPermission(true);
        
        try {
          const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
          if (backgroundStatus === 'granted') {
            console.log('Background location permission granted');
          }
        } catch (error) {
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
    return R * c;
  };

  const startTracking = async () => {
    if (!hasPermission) {
      await requestPermission();
      if (!hasPermission) {
        return;
      }
    }

    try {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        console.error('Location services are disabled');
        setHasPermission(false);
        return;
      }

      // If resuming from pause
      if (isPaused.current && pausedTime.current > 0) {
        setIsTracking(true);
        isPaused.current = false;
        startTime.current = Date.now() - (pausedTime.current * 1000);

        timerInterval.current = setInterval(() => {
          if (startTime.current) {
            const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
            setTime(elapsed);
          }
        }, 1000);

        watchSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
            distanceInterval: 5,
            mayShowUserSettingsDialog: true,
          },
          (location) => {
            if (!location?.coords) return;

            setLocation(location);
            
            const newPoint = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };

            if (lastLocation.current) {
              const distanceDelta = calculateDistance(
                lastLocation.current.latitude,
                lastLocation.current.longitude,
                newPoint.latitude,
                newPoint.longitude
              );

              if (distanceDelta > MIN_DISTANCE_THRESHOLD && distanceDelta < MAX_DISTANCE_THRESHOLD) {
                totalDistance.current += distanceDelta;
                setDistance(totalDistance.current);
                setPathPoints((prev) => [...prev, newPoint]);
                lastLocation.current = newPoint;
              } else if (distanceDelta >= MAX_DISTANCE_THRESHOLD) {
                console.log('GPS jump detected, ignoring:', distanceDelta);
              }
            } else {
              setPathPoints((prev) => [...prev, newPoint]);
              lastLocation.current = newPoint;
            }
          }
        );
        return;
      }

      // Starting fresh
      setIsTracking(true);
      isPaused.current = false;
      startTime.current = Date.now();
      pausedTime.current = 0;
      setDistance(0);
      totalDistance.current = 0;
      setTime(0);
      setPathPoints([]);
      lastLocation.current = null;

      timerInterval.current = setInterval(() => {
        if (startTime.current) {
          const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
          setTime(elapsed);
        }
      }, 1000);

      const getInitialLocationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 5000,
      }).catch(() => null);

      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 5,
          mayShowUserSettingsDialog: true,
        },
        (location) => {
          if (!location?.coords) return;

          setLocation(location);
          
          const newPoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          if (lastLocation.current) {
            const distanceDelta = calculateDistance(
              lastLocation.current.latitude,
              lastLocation.current.longitude,
              newPoint.latitude,
              newPoint.longitude
            );

            if (distanceDelta > MIN_DISTANCE_THRESHOLD && distanceDelta < MAX_DISTANCE_THRESHOLD) {
              totalDistance.current += distanceDelta;
              setDistance(totalDistance.current);
              setPathPoints((prev) => [...prev, newPoint]);
              lastLocation.current = newPoint;
            } else if (distanceDelta >= MAX_DISTANCE_THRESHOLD) {
              console.log('GPS jump detected, ignoring:', distanceDelta);
            }
          } else {
            setPathPoints([newPoint]);
            lastLocation.current = newPoint;
            setLocation(location);
          }
        }
      );

      getInitialLocationPromise.then((initialLocation) => {
        if (initialLocation?.coords && !lastLocation.current) {
          const initialPoint = {
            latitude: initialLocation.coords.latitude,
            longitude: initialLocation.coords.longitude,
          };
          setPathPoints([initialPoint]);
          setLocation(initialLocation);
          lastLocation.current = initialPoint;
        }
      });
    } catch (error) {
      console.error('Error starting tracking:', error);
      setIsTracking(false);
      setHasPermission(false);
    }
  };

  const pauseTracking = () => {
    setIsTracking(false);
    isPaused.current = true;
    
    if (startTime.current) {
      pausedTime.current = Math.floor((Date.now() - startTime.current) / 1000);
      setTime(pausedTime.current);
    }
    
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
    isPaused.current = false;
    startTime.current = null;
    pausedTime.current = 0;
    lastLocation.current = null;
    totalDistance.current = 0;
  };

  const resetRun = () => {
    stopTracking();
    setLocation(null);
    setDistance(0);
    setTime(0);
    setPathPoints([]);
  };

  return (
    <LocationTrackingContext.Provider
      value={{
        isTracking,
        hasPermission,
        location,
        distance,
        time,
        pathPoints,
        startTracking,
        pauseTracking,
        stopTracking,
        resetRun,
        requestPermission,
      }}>
      {children}
    </LocationTrackingContext.Provider>
  );
}

export function useLocationTracking() {
  const context = useContext(LocationTrackingContext);
  if (!context) {
    throw new Error('useLocationTracking must be used within LocationTrackingProvider');
  }
  return context;
}

