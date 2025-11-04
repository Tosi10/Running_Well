import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

const MAP_PADDING = 40;

export function SimpleMapView({ pathPoints = [], isDark = false }) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const { points, bounds } = useMemo(() => {
    if (!pathPoints || pathPoints.length === 0 || containerSize.width === 0 || containerSize.height === 0) {
      return { points: [], bounds: null };
    }

    // Calculate bounds
    const lats = pathPoints.map(p => p.latitude);
    const lngs = pathPoints.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.001; // Avoid division by zero
    const lngRange = maxLng - minLng || 0.001;

    // Normalize points to screen coordinates
    const normalizedPoints = pathPoints.map(point => {
      const x = MAP_PADDING + ((point.longitude - minLng) / lngRange) * (containerSize.width - MAP_PADDING * 2);
      const y = MAP_PADDING + ((maxLat - point.latitude) / latRange) * (containerSize.height - MAP_PADDING * 2);
      return `${x},${y}`;
    });

    return {
      points: normalizedPoints,
      bounds: { minLat, maxLat, minLng, maxLng },
    };
  }, [pathPoints, containerSize]);

  return (
    <View 
      style={[styles.container, isDark && styles.containerDark]}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }}>
      {pathPoints.length === 0 ? (
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
      ) : containerSize.width > 0 && containerSize.height > 0 ? (
        <>
          <Svg width={containerSize.width} height={containerSize.height} style={styles.svg}>
            {pathPoints.length === 1 ? (
              // Single point
              <Circle
                cx={points[0].split(',')[0]}
                cy={points[0].split(',')[1]}
                r="6"
                fill={isDark ? '#4C52BF' : '#4C52BF'}
                stroke={isDark ? '#BFC2FF' : '#FFFFFF'}
                strokeWidth="2"
              />
            ) : (
              <>
                {/* Path line */}
                <Polyline
                  points={points.join(' ')}
                  fill="none"
                  stroke={isDark ? '#4C52BF' : '#4C52BF'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Start point (green) */}
                <Circle
                  cx={points[0].split(',')[0]}
                  cy={points[0].split(',')[1]}
                  r="8"
                  fill="#33A853"
                  stroke={isDark ? '#FFFFFF' : '#FFFFFF'}
                  strokeWidth="2"
                />
                
                {/* End point (red) */}
                <Circle
                  cx={points[points.length - 1].split(',')[0]}
                  cy={points[points.length - 1].split(',')[1]}
                  r="8"
                  fill="#FF3B30"
                  stroke={isDark ? '#FFFFFF' : '#FFFFFF'}
                  strokeWidth="2"
                />
                
                {/* Intermediate points */}
                {points.slice(1, -1).map((point, index) => {
                  const [x, y] = point.split(',').map(Number);
                  return (
                    <Circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={isDark ? '#BFC2FF' : '#4C52BF'}
                      opacity="0.6"
                    />
                  );
                })}
              </>
            )}
          </Svg>
          <View style={[styles.infoOverlay, isDark && styles.infoOverlayDark]}>
            <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
              {pathPoints.length} {pathPoints.length === 1 ? 'point' : 'points'} • Route
            </Text>
          </View>
        </>
      ) : null}
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
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
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

