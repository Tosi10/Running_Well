import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

export function GoogleMapView({ pathPoints = [], isDark = false, currentLocation = null, isTracking = false }) {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [region, setRegion] = useState(null);
  const lastUpdateTime = useRef(0);
  const hasSetInitialLocation = useRef(false);

  // Calculate initial region - prioritize current location for immediate display
  const initialRegion = useMemo(() => {
    if (currentLocation?.latitude && currentLocation?.longitude) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005, // More zoomed in for better tracking
        longitudeDelta: 0.005,
      };
    }
    
    // Fallback to first path point if available
    if (pathPoints && pathPoints.length > 0) {
      return {
        latitude: pathPoints[0].latitude,
        longitude: pathPoints[0].longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
    }
    
    // Don't show any specific location - return null and show placeholder instead
    return null;
  }, []); // Only calculate once on mount

  // Update region when currentLocation becomes available (first time)
  useEffect(() => {
    if (currentLocation?.latitude && currentLocation?.longitude && !hasSetInitialLocation.current && mapReady) {
      const newRegion = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(newRegion);
      hasSetInitialLocation.current = true;
      
      // Animate to location when map is ready
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 500);
      }
    }
  }, [currentLocation, mapReady]);

  // Fit map to show all path points when not tracking (for saved runs)
  useEffect(() => {
    if (mapRef.current && mapReady && !isTracking && pathPoints.length > 0) {
      const coordinates = pathPoints.map(p => ({
        latitude: p.latitude,
        longitude: p.longitude,
      }));
      
      // Fit to show all coordinates with padding
      if (typeof mapRef.current.fitToCoordinates === 'function') {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [pathPoints, mapReady, isTracking]);

  // Update map region smoothly when tracking and location changes
  useEffect(() => {
    if (mapRef.current && mapReady && isTracking && currentLocation?.latitude && currentLocation?.longitude) {
      const now = Date.now();
      // Throttle updates to every 1.5 seconds to avoid performance issues while keeping map responsive
      if (now - lastUpdateTime.current > 1500) {
        const newRegion = {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        
        // Check if animateToRegion method exists before calling
        if (typeof mapRef.current.animateToRegion === 'function') {
          mapRef.current.animateToRegion(newRegion, 300); // Smooth animation
          lastUpdateTime.current = now;
        }
      }
    }
  }, [currentLocation, mapReady, isTracking]);

  // Show placeholder if no location and no path points
  if (!initialRegion && !currentLocation && pathPoints.length === 0) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.placeholder}>
          <View style={styles.placeholderContent}>
            {/* GPS Icon Animation */}
            <View style={styles.gpsIconContainer}>
              <View style={[styles.gpsIconRing, isDark && styles.gpsIconRingDark]} />
              <View style={[styles.gpsIconRingInner, isDark && styles.gpsIconRingInnerDark]} />
              <View style={[styles.gpsIcon, isDark && styles.gpsIconDark]}>
                <Ionicons name="locate" size={32} color={isDark ? '#BFC2FF' : '#4C52BF'} />
              </View>
            </View>
            <Text style={[styles.placeholderTitle, isDark && styles.placeholderTitleDark]}>
              Localizando sua posição...
            </Text>
            <Text style={[styles.placeholderSubtitle, isDark && styles.placeholderSubtitleDark]}>
              Aguarde enquanto obtemos sua localização GPS
            </Text>
            <ActivityIndicator 
              size="small" 
              color={isDark ? '#BFC2FF' : '#4C52BF'} 
              style={styles.loadingIndicator}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        region={region}
        mapType="standard"
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        onMapReady={() => setMapReady(true)}
        customMapStyle={isDark ? darkMapStyle : []}>
        
        {/* Route Polyline */}
        {pathPoints.length > 1 && (
          <Polyline
            coordinates={pathPoints.map(p => ({
              latitude: p.latitude,
              longitude: p.longitude,
            }))}
            strokeColor="#4C52BF"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Start Marker */}
        {pathPoints.length > 0 && !isTracking && (
          <Marker
            coordinate={{
              latitude: pathPoints[0].latitude,
              longitude: pathPoints[0].longitude,
            }}
            title="Início"
            pinColor="#33A853"
            identifier="start"
          />
        )}

        {/* End Marker - only show when not tracking */}
        {pathPoints.length > 1 && !isTracking && (
          <Marker
            coordinate={{
              latitude: pathPoints[pathPoints.length - 1].latitude,
              longitude: pathPoints[pathPoints.length - 1].longitude,
            }}
            title="Fim"
            pinColor="#FF3B30"
            identifier="end"
          />
        )}
      </MapView>
      
      {/* Info Overlay - only show when not tracking */}
      {!isTracking && pathPoints.length > 0 && (
        <View style={[styles.infoOverlay, isDark && styles.infoOverlayDark]}>
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            {pathPoints.length} {pathPoints.length === 1 ? 'ponto' : 'pontos'} • Rota
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#E4E1EC',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  containerDark: {
    backgroundColor: '#232533',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderContent: {
    alignItems: 'center',
    width: '100%',
  },
  gpsIconContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsIconRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4C52BF',
    opacity: 0.3,
  },
  gpsIconRingDark: {
    borderColor: '#BFC2FF',
  },
  gpsIconRingInner: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#4C52BF',
    opacity: 0.5,
  },
  gpsIconRingInnerDark: {
    borderColor: '#BFC2FF',
  },
  gpsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4C52BF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsIconDark: {
    backgroundColor: '#BFC2FF',
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B1B1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderTitleDark: {
    color: '#E5E1E6',
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#777680',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  placeholderSubtitleDark: {
    color: '#918F9A',
  },
  loadingIndicator: {
    marginTop: 8,
  },
  infoOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  infoOverlayDark: {
    backgroundColor: 'rgba(27, 27, 31, 0.9)',
  },
  infoText: {
    fontSize: 12,
    color: '#46464F',
    fontWeight: '600',
  },
  infoTextDark: {
    color: '#CDCDE0',
  },
});

// Dark map style (optional - makes map darker in dark mode)
const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#242f3e' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#242f3e' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

