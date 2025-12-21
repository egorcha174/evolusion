import { writable, get, derived } from 'svelte/store';
import type { HAServerConfig } from '../types/ha';
import { HAClient } from '../api/ha-client';
import { encryptToken, decryptToken } from '../utils/crypto';
import { CONFIG, MESSAGES } from '../constants/config';
import { notifications } from './notifications';
import { isLoading } from './loading';
import { z } from 'zod';

// ========================================
// TYPES & SCHEMAS
// ========================================

// Zod схема для валидации конфигурации сервера
const HAServerConfigSchema = z.object({
  id: z.string().min(1, 'ID обязателен'),
  name: z.string().min(1, 'Имя обязательно').max(100, 'Имя слишком длинное'),
  url: z.string().url('Неверный формат URL'),
  accessToken: z.string().min(10, 'Токен слишком короткий'),
  enabled: z.boolean().default(true)
});

export type ConnectionStatus = { 
  status: 'ok' | 'error' | 'pending'; 
  message?: string 
};

// ========================================
// STORES
// ========================================

// Server configurations store
export const servers = writable<HAServerConfig[]>([]);

// Active server ID
export const activeServerId = writable<string | null>(null);

// Connection status store
export const serverConnectionStatus = writable<Record<string, ConnectionStatus>>({});

// HA Clients map
const clients = new Map<string, HAClient>();

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Извлекает сообщение об ошибке из различных типов ошибок
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Неизвестная ошибка';
}

/**
 * Показывает уведомление с заданными параметрами
 */
function showNotification(
  type: 'success' | 'error' | 'info',
  title: string,
  message: string,
  duration?: number
): void {
  notifications.show({ type, title, message, duration });
}

/**
 * Валидирует и дешифрует конфигурацию сервера
 */
function validateAndDecryptServer(server: any): HAServerConfig | null {
  try {
    const decrypted = {
      ...server,
      accessToken: decryptToken(server.accessToken)
    };
    return HAServerConfigSchema.parse(decrypted);
  } catch (error) {
    console.error('[Servers] Ошибка валидации сервера:', error);
    return null;
  }
}

/**
 * Шифрует accessToken в конфигурации сервера
 */
function encryptServer(server: HAServerConfig): any {
  return {
    ...server,
    accessToken: encryptToken(server.accessToken)
  };
}

// ========================================
// CONNECTION MANAGEMENT
// ========================================

/**
 * Устанавливает статус подключения для сервера
 */
export function setConnectionStatus(
  id: string, 
  status: 'ok' | 'error' | 'pending', 
  message?: string
): void {
  serverConnectionStatus.update((prev) => ({
    ...prev,
    [id]: { status, message }
  }));
}

/**
 * Отключает и удаляет клиент для указанного сервера
 */
function disconnectClient(serverId: string): void {
  const client = clients.get(serverId);
  if (client) {
    client.disconnect();
    clients.delete(serverId);
  }
}

/**
 * Отключает все клиенты и очищает Map
 */
export function disconnectAllClients(): void {
  clients.forEach((client) => client.disconnect());
  clients.clear();
}

/**
 * Создает и подключает клиент для указанного сервера
 */
function createAndConnectClient(
  serverId: string,
  serverConfig: HAServerConfig
): HAClient {
  const client = new HAClient(serverConfig);
  clients.set(serverId, client);
  
  setConnectionStatus(serverId, 'pending');
  
  client.connect()
    .then(() => {
      setConnectionStatus(serverId, 'ok');
      showNotification(
        'success',
        MESSAGES.CONNECTION_SUCCESS,
        `Подключение к ${serverConfig.name} успешно установлено`
      );
    })
    .catch((err) => {
      const message = getErrorMessage(err);
      console.error('[Servers] Ошибка подключения:', err);
      
      setConnectionStatus(serverId, 'error', message);
      showNotification('error', MESSAGES.CONNECTION_ERROR, message, 5000);
    });
  
  return client;
}

// ========================================
// STORAGE OPERATIONS
// ========================================

/**
 * Загружает серверы из localStorage с валидацией и дешифрованием
 */
export function loadServersFromStorage(): HAServerConfig[] {
  try {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    // Валидируем и дешифруем каждый сервер
    const validated = parsed
      .map(validateAndDecryptServer)
      .filter((server): server is HAServerConfig => server !== null);
    
    return validated;
  } catch (error) {
    console.error('[Servers] Ошибка при загрузке серверов:', error);
    showNotification(
      'error',
      MESSAGES.STORAGE_ERROR,
      getErrorMessage(error)
    );
    
    // Очищаем поврежденные данные
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    return [];
  }
}

/**
 * Сохраняет серверы в localStorage с шифрованием
 */
export function saveServersToStorage(serversData: HAServerConfig[]): void {
  try {
    const encrypted = serversData.map(encryptServer);
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(encrypted));
  } catch (error) {
    console.error('[Servers] Ошибка при сохранении серверов:', error);
    showNotification(
      'error',
      MESSAGES.STORAGE_ERROR,
      'Не удалось сохранить данные серверов'
    );
  }
}

// ========================================
// SERVER CRUD OPERATIONS
// ========================================

/**
 * Добавляет новый сервер
 */
export async function addServer(
  config: Omit<HAServerConfig, 'id'>
): Promise<{ success: boolean; error?: string }> {
  try {
    isLoading.start();
    
    // Валидация конфигурации
    const newServer: HAServerConfig = {
      ...config,
      id: crypto.randomUUID()
    };
    
    HAServerConfigSchema.parse(newServer);
    
    // Добавляем сервер
    servers.update(s => {
      const updated = [...s, newServer];
      saveServersToStorage(updated);
      return updated;
    });
    
    showNotification(
      'success',
      'Сервер добавлен',
      `Сервер "${config.name}" успешно добавлен`
    );
    
    return { success: true };
  } catch (error) {
    const message = getErrorMessage(error);
    showNotification('error', MESSAGES.VALIDATION_ERROR, message, 5000);
    return { success: false, error: message };
  } finally {
    isLoading.stop();
  }
}

/**
 * Удаляет сервер
 */
export function removeServer(serverId: string): void {
  // Отключаем клиент если есть
  disconnectClient(serverId);
  
  // Удаляем сервер из списка
  servers.update(s => {
    const updated = s.filter(server => server.id !== serverId);
    saveServersToStorage(updated);
    return updated;
  });
  
  // Удаляем статус подключения
  serverConnectionStatus.update(s => {
    const { [serverId]: _, ...rest } = s;
    return rest;
  });
  
  showNotification(
    'info',
    'Сервер удален',
    'Сервер успешно удален из списка'
  );
}

// ========================================
// DERIVED STORES
// ========================================

/**
 * Active client store с улучшенной обработкой ошибок
 */
export const activeClient = derived(
  [servers, activeServerId],
  ([$servers, $activeServerId]) => {
    if (!$activeServerId) return null;
    
    // Проверяем существующий клиент
    let client = clients.get($activeServerId);
    if (client) return client;
    
    // Находим конфигурацию сервера
    const serverConfig = $servers.find(s => s.id === $activeServerId);
    
    // Создаем новый клиент если сервер найден и включен
    if (serverConfig?.enabled) {
      return createAndConnectClient($activeServerId, serverConfig);
    }
    
    return null;
  }
);

// ========================================
// INITIALIZATION
// ========================================

/**
 * Инициализация: загружаем серверы при старте
 */
if (typeof window !== 'undefined') {
  const loadedServers = loadServersFromStorage();
  servers.set(loadedServers);
}
