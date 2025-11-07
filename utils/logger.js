import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGS_STORAGE_KEY = '@running_well:debug_logs';
const MAX_LOGS = 500; // Manter apenas os últimos 500 logs

class Logger {
  async log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level, // 'info', 'warn', 'error', 'debug'
      message,
      data: data ? JSON.stringify(data) : null,
    };

    // Log no console também
    const consoleMethod = level === 'error' ? console.error : 
                          level === 'warn' ? console.warn : 
                          console.log;
    
    consoleMethod(`[${level.toUpperCase()}] ${message}`, data || '');

    // Salvar no AsyncStorage
    try {
      const existingLogsStr = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
      const existingLogs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
      
      // Adicionar novo log
      const updatedLogs = [logEntry, ...existingLogs].slice(0, MAX_LOGS);
      
      await AsyncStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Error saving log:', error);
    }
  }

  async info(message, data = null) {
    await this.log('info', message, data);
  }

  async warn(message, data = null) {
    await this.log('warn', message, data);
  }

  async error(message, data = null) {
    await this.log('error', message, data);
  }

  async debug(message, data = null) {
    await this.log('debug', message, data);
  }

  async getLogs() {
    try {
      const logsStr = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
      return logsStr ? JSON.parse(logsStr) : [];
    } catch (error) {
      console.error('Error getting logs:', error);
      return [];
    }
  }

  async clearLogs() {
    try {
      await AsyncStorage.removeItem(LOGS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  }

  async exportLogs() {
    const logs = await this.getLogs();
    return logs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${log.data ? ' ' + log.data : ''}`
    ).join('\n');
  }
}

export const logger = new Logger();

