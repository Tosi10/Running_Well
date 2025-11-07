import { useColorScheme } from '@/hooks/use-color-scheme';
import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

export function PaceChart({ paceData = [], isDark = false }) {
  const colorScheme = useColorScheme();
  const darkMode = isDark || colorScheme === 'dark';

  // Filter out invalid pace data (pace = 0 or invalid)
  const validPaceData = paceData?.filter(point => 
    point && 
    typeof point.pace === 'number' && 
    point.pace > 0 && 
    point.pace < 30
  ) || [];

  if (!paceData || paceData.length === 0 || validPaceData.length === 0) {
    return (
      <View className={`rounded-2xl p-6 border ${darkMode ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
        <Text className={`text-center ${darkMode ? 'text-gray-100' : 'text-gray-400'}`}>
          Dados de pace não disponíveis para esta corrida
        </Text>
      </View>
    );
  }

  // Para corridas longas, amostrar pontos para não sobrecarregar o gráfico
  // Manter todos os pontos para corridas curtas, amostrar para longas
  let processedData = validPaceData;
  if (validPaceData.length > 50) {
    // Amostrar: manter primeiro, último, e pontos intermediários uniformemente distribuídos
    const sampleSize = 50;
    const step = Math.floor(validPaceData.length / sampleSize);
    processedData = [];
    for (let i = 0; i < validPaceData.length; i += step) {
      processedData.push(validPaceData[i]);
    }
    // Sempre incluir o último ponto
    if (processedData[processedData.length - 1] !== validPaceData[validPaceData.length - 1]) {
      processedData.push(validPaceData[validPaceData.length - 1]);
    }
  }

  // Prepare data for chart (use processed pace data)
  const chartData = processedData.map((point, index) => ({
    value: point.pace,
    label: index % Math.ceil(processedData.length / 5) === 0 
      ? `${Math.floor(point.time / 60)}:${String(point.time % 60).padStart(2, '0')}` 
      : '',
    labelTextStyle: {
      color: darkMode ? '#918F9A' : '#777680',
      fontSize: 10,
    },
  }));

  // Calculate average pace (use valid pace data)
  const avgPace = validPaceData.reduce((sum, point) => sum + point.pace, 0) / validPaceData.length;
  const minPace = Math.min(...validPaceData.map(p => p.pace));
  const maxPace = Math.max(...validPaceData.map(p => p.pace));

  // Format pace: convert minutes to min:sec format
  const formatPace = (minutes) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine color based on pace zones
  const getPaceColor = (pace) => {
    if (pace <= 4.0) return '#33A853'; // Fast (green)
    if (pace <= 5.5) return '#FFC107'; // Moderate (yellow)
    if (pace <= 7.0) return '#FF9800'; // Slow (orange)
    return '#FF5722'; // Very slow (red)
  };

  return (
    <View className={`rounded-2xl p-6 border ${darkMode ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
      <View className="mb-4">
        <Text className={`text-lg font-psemibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
          Análise de Ritmo
        </Text>
        <View className="flex-row justify-between mt-2">
          <View>
            <Text className={`text-xs ${darkMode ? 'text-gray-100' : 'text-gray-400'}`}>Ritmo Médio</Text>
            <Text className={`text-base font-pbold ${darkMode ? 'text-white' : 'text-black'}`}>
              {formatPace(avgPace)} /km
            </Text>
          </View>
          <View>
            <Text className={`text-xs ${darkMode ? 'text-gray-100' : 'text-gray-400'}`}>Mais Rápido</Text>
            <Text className={`text-base font-pbold ${darkMode ? 'text-white' : 'text-black'}`}>
              {formatPace(minPace)} /km
            </Text>
          </View>
          <View>
            <Text className={`text-xs ${darkMode ? 'text-gray-100' : 'text-gray-400'}`}>Mais Lento</Text>
            <Text className={`text-base font-pbold ${darkMode ? 'text-white' : 'text-black'}`}>
              {formatPace(maxPace)} /km
            </Text>
          </View>
        </View>
      </View>

      <LineChart
        data={chartData}
        height={200}
        width={Dimensions.get('window').width - 96} // Screen width minus padding (48px each side)
        color={darkMode ? '#BFC2FF' : '#4C52BF'}
        thickness={2}
        hideRules={false}
        rulesColor={darkMode ? '#333333' : '#E0E0E0'}
        rulesType="solid"
        yAxisColor={darkMode ? '#918F9A' : '#777680'}
        xAxisColor={darkMode ? '#918F9A' : '#777680'}
        yAxisTextStyle={{ color: darkMode ? '#918F9A' : '#777680', fontSize: 10 }}
        xAxisLabelTextStyle={{ color: darkMode ? '#918F9A' : '#777680', fontSize: 10 }}
        areaChart
        areaChart1Color={darkMode ? 'rgba(191, 194, 255, 0.2)' : 'rgba(76, 82, 191, 0.2)'}
        startFillColor={darkMode ? 'rgba(191, 194, 255, 0.3)' : 'rgba(76, 82, 191, 0.3)'}
        endFillColor={darkMode ? 'rgba(191, 194, 255, 0.1)' : 'rgba(76, 82, 191, 0.1)'}
        startOpacity={0.8}
        endOpacity={0.1}
        spacing={processedData.length > 20 ? Math.max(5, (Dimensions.get('window').width - 96) / processedData.length) : 30}
        initialSpacing={10}
        noOfSections={4}
        maxValue={Math.ceil(maxPace * 1.2)}
        minValue={Math.max(0, Math.floor(minPace * 0.8))}
        yAxisLabelPrefix=""
        yAxisLabelSuffix=" min/km"
        curved
        showVerticalLines
        verticalLinesColor={darkMode ? '#333333' : '#E0E0E0'}
        verticalLinesThickness={0.5}
        hideYAxisText={false}
        yAxisLabelWidth={50}
        xAxisLabelWidth={40}
        showDataPoint1
        dataPointsColor={darkMode ? '#BFC2FF' : '#4C52BF'}
        dataPointsRadius={3}
        textShiftY={-10}
        textShiftX={-5}
        textFontSize={10}
        textColor={darkMode ? '#918F9A' : '#777680'}
      />
    </View>
  );
}

