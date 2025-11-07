import { GoogleMapView } from '@/components/GoogleMapView';
import { PaceChart } from '@/components/PaceChart';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRuns } from '@/context/RunContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RunDetailsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const { runId } = useLocalSearchParams();
  const { runs, deleteRun } = useRuns();
  
  const run = runs.find(r => r.id === runId);

  if (!run) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'} items-center justify-center`}>
        <Text className={`text-lg ${isDark ? 'text-white' : 'text-black'}`}>Corrida não encontrada</Text>
        <TouchableOpacity 
          className={`mt-4 px-6 py-3 rounded-full ${isDark ? 'bg-primary-200' : 'bg-primary'}`}
          onPress={() => router.back()}>
          <Text className="text-white font-pbold">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = () => {
    const distanceInMeters = run.distanceInMeters || 0;
    const durationInMillis = run.durationInMillis || 0;
    if (distanceInMeters === 0 || durationInMillis === 0) return '--:--';
    const distanceKm = distanceInMeters / 1000;
    const timeSeconds = durationInMillis / 1000;
    const paceInSeconds = timeSeconds / distanceKm;
    const mins = Math.floor(paceInSeconds / 60);
    const secs = Math.floor(paceInSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = () => {
    const date = new Date(run.timestamp);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeOfDay = () => {
    const date = new Date(run.timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    deleteRun(run.id);
    router.back();
  };

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      {/* Header */}
      <View className="px-6 pt-16 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center">
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#E5E1E6' : '#1B1B1F'} />
        </TouchableOpacity>
        <Text className={`text-lg font-psemibold ${isDark ? 'text-white' : 'text-black'}`}>
          Detalhes da Corrida
        </Text>
        <TouchableOpacity
          onPress={handleDelete}
          className="w-10 h-10 items-center justify-center">
          <Ionicons name="trash-outline" size={24} color={isDark ? '#FF3B30' : '#FF3B30'} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View className={`mx-6 mb-6 rounded-3xl overflow-hidden ${isDark ? 'bg-gray-200' : 'bg-gray-100'}`} style={{ height: 300 }}>
        <GoogleMapView 
          pathPoints={run.pathPoints || []} 
          isDark={isDark}
        />
      </View>

      {/* Pace Chart */}
      {run.paceData && run.paceData.length > 0 && (
        <View className="px-6 mb-6">
          <PaceChart paceData={run.paceData} isDark={isDark} />
        </View>
      )}

      {/* Stats Cards */}
      <View className="px-6 mb-6">
        <View className="flex-row gap-4 mb-4">
          <View className={`flex-1 rounded-2xl p-4 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
            <View className="flex-row items-center mb-2">
              <Ionicons name="flame" size={16} color={isDark ? '#918F9A' : '#777680'} />
              <Text className={`text-xs ml-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                DISTÂNCIA
              </Text>
            </View>
            <Text className={`text-2xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
              {run.distanceInMeters ? (run.distanceInMeters / 1000).toFixed(2) : '0.00'} km
            </Text>
          </View>
          
          <View className={`flex-1 rounded-2xl p-4 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
            <View className="flex-row items-center mb-2">
              <Ionicons name="time" size={16} color={isDark ? '#918F9A' : '#777680'} />
              <Text className={`text-xs ml-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                TEMPO
              </Text>
            </View>
            <Text className={`text-2xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
              {formatTime(run.durationInMillis ? Math.floor(run.durationInMillis / 1000) : 0)}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-4 mb-4">
          <View className={`flex-1 rounded-2xl p-4 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
            <View className="flex-row items-center mb-2">
              <Ionicons name="speedometer" size={16} color={isDark ? '#918F9A' : '#777680'} />
              <Text className={`text-xs ml-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                RITMO
              </Text>
            </View>
            <Text className={`text-2xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
              {formatPace()}
            </Text>
              <Text className={`text-xs mt-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                por km
              </Text>
          </View>
          
          <View className={`flex-1 rounded-2xl p-4 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
            <View className="flex-row items-center mb-2">
              <Ionicons name="flash" size={16} color={isDark ? '#918F9A' : '#777680'} />
              <Text className={`text-xs ml-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                VELOCIDADE MÉDIA
              </Text>
            </View>
            <Text className={`text-2xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
              {run.avgSpeedInKMH && run.avgSpeedInKMH > 0 ? run.avgSpeedInKMH.toFixed(1) : '--'} km/h
            </Text>
          </View>
        </View>

        {/* Calories Card */}
        {run.caloriesBurned !== undefined && run.caloriesBurned !== null && run.caloriesBurned > 0 && (
          <View className={`rounded-2xl p-4 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
            <View className="flex-row items-center justify-center">
              <Ionicons name="flame" size={24} color="#FF6B35" />
              <Text className={`text-2xl font-pbold ml-3 ${isDark ? 'text-white' : 'text-black'}`}>
                {String(run.caloriesBurned)} kcal
              </Text>
            </View>
            <Text className={`text-sm text-center mt-2 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
              Calorias queimadas
            </Text>
          </View>
        )}
      </View>

      {/* Date & Time Info */}
      <View className={`mx-6 mb-6 rounded-2xl p-4 border ${isDark ? 'bg-gray-200 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}>
        <View className="flex-row items-center mb-2">
          <Ionicons name="calendar" size={16} color={isDark ? '#918F9A' : '#777680'} />
          <Text className={`text-sm font-psemibold ml-2 ${isDark ? 'text-white' : 'text-black'}`}>
            Data e Hora
          </Text>
        </View>
        <Text className={`text-base mt-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
          {formatDate()}
        </Text>
        <Text className={`text-sm mt-1 ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
          {formatTimeOfDay()}
        </Text>
      </View>
    </ScrollView>
  );
}

