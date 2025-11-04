import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

export function GoogleMapView({ pathPoints = [], isDark = false, currentLocation = null }) {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Calculate region to fit all points
  const region = useMemo(() => {
    if (!pathPoints || pathPoints.length === 0) {
      // Default region (you can change this to your location)
      return {
        latitude: currentLocation?.latitude || 37.78825,
        longitude: currentLocation?.longitude || -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const lats = pathPoints.map(p => p.latitude);
    const lngs = pathPoints.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latDelta = (maxLat - minLat) * 1.5 || 0.01; // Add padding
    const lngDelta = (maxLng - minLng) * 1.5 || 0.01;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  }, [pathPoints, currentLocation]);

  // Fit map to show all points when they change
  useEffect(() => {
    if (mapRef.current && mapReady && pathPoints.length > 0) {
      const coordinates = pathPoints.map(p => ({
        latitude: p.latitude,
        longitude: p.longitude,
      }));

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [pathPoints, mapReady]);

  if (pathPoints.length === 0) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.placeholder}>
          <View style={styles.placeholderContent}>
            <Text style={styles.iconContainer}>🗺️</Text>
            <View style={styles.textContainer}>
              <Text style={[styles.text, isDark && styles.textDark]}>
                Waiting for GPS signal...
              </Text>
            </View>
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
        initialRegion={region}
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
        {pathPoints.length > 0 && (
          <Marker
            coordinate={{
              latitude: pathPoints[0].latitude,
              longitude: pathPoints[0].longitude,
            }}
            title="Start"
            pinColor="#33A853"
            identifier="start"
          />
        )}

        {/* End Marker */}
        {pathPoints.length > 1 && (
          <Marker
            coordinate={{
              latitude: pathPoints[pathPoints.length - 1].latitude,
              longitude: pathPoints[pathPoints.length - 1].longitude,
            }}
            title="End"
            pinColor="#FF3B30"
            identifier="end"
          />
        )}
      </MapView>
      
      {/* Info Overlay */}
      <View style={[styles.infoOverlay, isDark && styles.infoOverlayDark]}>
        <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
          {pathPoints.length} {pathPoints.length === 1 ? 'point' : 'points'} • Route
        </Text>
      </View>
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
  },
  placeholderContent: {
    alignItems: 'center',
  },
  iconContainer: {
    fontSize: 64,
    marginBottom: 12,
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: '#777680',
    textAlign: 'center',
  },
  textDark: {
    color: '#918F9A',
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

