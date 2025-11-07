import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@/utils/logger';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function DebugLogsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const allLogs = await logger.getLogs();
      setLogs(allLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    Alert.alert(
      'Limpar Logs',
      'Tem certeza que deseja limpar todos os logs?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            await logger.clearLogs();
            setLogs([]);
          },
        },
      ]
    );
  };

  const exportLogs = async () => {
    try {
      const logText = await logger.exportLogs();
      const fileName = `running-well-logs-${Date.now()}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, logText);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo');
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      Alert.alert('Erro', 'Não foi possível exportar os logs');
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return '#EF4444';
      case 'warn':
        return '#F59E0B';
      case 'info':
        return isDark ? '#60A5FA' : '#3B82F6';
      default:
        return isDark ? '#9CA3AF' : '#6B7280';
    }
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      {/* Header */}
      <View className={`px-6 pt-16 pb-4 flex-row items-center justify-between border-b ${isDark ? 'border-gray-300/20' : 'border-gray-300'}`}>
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className={`flex-1 text-xl font-pbold ${isDark ? 'text-white' : 'text-black'}`}>
          Logs de Debug
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={exportLogs} className="p-2">
            <Ionicons name="share-outline" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearLogs} className="p-2">
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logs List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className={isDark ? 'text-gray-400' : 'text-gray-500'}>Carregando logs...</Text>
        </View>
      ) : logs.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="document-outline" size={64} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <Text className={`mt-4 text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Nenhum log disponível
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="px-4 py-4">
            {logs.map((log, index) => (
              <View
                key={index}
                className={`mb-3 p-3 rounded-lg border-l-4 ${isDark ? 'bg-gray-200/50 border-gray-300/30' : 'bg-gray-100 border-gray-300'}`}
                style={{ borderLeftColor: getLevelColor(log.level) }}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text
                    className="text-xs font-pbold"
                    style={{ color: getLevelColor(log.level) }}
                  >
                    {log.level.toUpperCase()}
                  </Text>
                  <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <Text className={`text-sm font-pregular mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                  {log.message}
                </Text>
                {log.data && (
                  <Text className={`text-xs font-pregular mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {log.data}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

