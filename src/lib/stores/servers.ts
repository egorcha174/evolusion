import { writable, get, derived } from 'svelte/store';
import type { HAServerConfig } from '../types/ha';
import { HAClient } from '../api/ha-client';
import { encryptToken, decryptToken } from '$utils/crypto';
import { CONFIG, MESSAGES } from '$constants/config';
import { notifications } from './notifications';
import { isLoading } from './loading';
import { z } from 'zod';

// Zod схема для валидации конфигурации сервера
const HAServerConfigSchema = z.object({
  id: z.string().min(1, 'ID обязателен'),
  name: z.string().min(1, 'Имя обязательно').max(100, 'Имя слишком длинное'),
  url: z.string().url('Неверный формат URL'),
  accessToken: z.string().min(10, 'Токен слишком короткий'),
  enabled: z.boolean().default(true)
});

// Server configurations store
export const servers = writable<HAServerConfig[]>([]);

// Active server ID
export const activeServerId = writable<string | null>(null);

// Connection status store
export type ConnectionStatus = { status: 'ok' | 'error' | 'pending'; message?: string };
export const serverConnectionStatus = writable<Record<string, ConnectionStatus>>({});

// HA Clients map
const clients = new Map<string, HAClient>();

// Функция для установки статуса подключения
export function setConnectionStatus(id: string, status: 'ok' | 'error' | 'pending', message?: string) {
  serverConnectionStatus.update((prev) => ({
    ...prev,
    [id]: { status, message },
  }));
}

// Загрузка серверов из localStorage с валидацией и дешифрованием
export function loadServersFromStorage(): HAServerConfig[] {
  try {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    
    // Валидируем и дешифруем каждый сервер
    const validated = parsed.map((server: any) => {
      try {
        // Дешифруем токен
        const decrypted = {
          ...server,
          accessToken: decryptToken(server.accessToken)
        };
        
        // Валидируем
        return HAServerConfigSchema.parse(decrypted);
      } catch (error) {
        console.error('[Servers] Ошибка валидации сервера:', error);
        return null;
      }
    }).filter(Boolean);

    return validated;
  } catch (error) {
    console.error('[Servers] Ошибка при загрузке серверов:', error);
    notifications.show({
      type: 'error',
      title: MESSAGES.STORAGE_ERROR,
      message: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
    
    // Очищаем поврежденные данные
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    return [];
  }
}

// Сохранение серверов в localStorage с шифрованием
export function saveServersToStorage(serversData: HAServerConfig[]): void {
  try {
    const encrypted = serversData.map(server => ({
      ...server,
      accessToken: encryptToken(server.accessToken)
    }));

    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(encrypted));
  } catch (error) {
    console.error('[Servers] Ошибка при сохранении серверов:', error);
    notifications.show({
      type: 'error',
      title: MESSAGES.STORAGE_ERROR,
      message: 'Не удалось сохранить данные серверов'
    });
  }
}

// Добавление нового сервера
export async function addServer(config: Omit<HAServerConfig, 'id'>): Promise<{ success: boolean; error?: string }> {
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

    notifications.show({
      type: 'success',
      title: 'Сервер добавлен',
      message: `Сервер "${config.name}" успешно добавлен`
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    
    notifications.show({
      type: 'error',
      title: MESSAGES.VALIDATION_ERROR,
      message,
      duration: 5000
    });

    return { success: false, error: message };
  } finally {
    isLoading.stop();
  }
}

// Удаление сервера
export function removeServer(serverId: string): void {
  // Отключаем клиент если есть
  const client = clients.get(serverId);
  if (client) {
    client.disconnect();
    clients.delete(serverId);
  }

  servers.update(s => {
    const updated = s.filter(server => server.id !== serverId);
    saveServersToStorage(updated);
    return updated;
  });

  serverConnectionStatus.update(s => {
    const { [serverId]: _, ...rest } = s;
    return rest;
  });

  notifications.show({
    type: 'info',
    title: 'Сервер удален',
    message: 'Сервер успешно удален из списка'
  });
}

// Active client store с улучшенной обработкой ошибок
export const activeClient = derived(
  [servers, activeServerId],
  ([$servers, $activeServerId]) => {
    if (!$activeServerId) return null;

    let client = clients.get($activeServerId);
    
    if (!client) {
      const serverConfig = $servers.find(s => s.id === $activeServerId);
      
      if (serverConfig && serverConfig.enabled) {
        client = new HAClient(serverConfig);
        clients.set($activeServerId, client);
        
        setConnectionStatus($activeServerId, 'pending');
        
        client.connect()
          .then(() => {
            setConnectionStatus($activeServerId, 'ok');
            notifications.show({
              type: 'success',
              title: MESSAGES.CONNECTION_SUCCESS,
              message: `Подключение к ${serverConfig.name} успешно установлено`
            });
          })
          .catch((err) => {
            const message = err instanceof Error ? err.message : String(err);
            console.error('[Servers] Ошибка подключения:', err);
            
            setConnectionStatus($activeServerId, 'error', message);
            
            notifications.show({
              type: 'error',
              title: MESSAGES.CONNECTION_ERROR,
              message,
              duration: 5000
            });
          });
      }
    }
    
    return client;
  }
);

// Инициализация: загружаем серверы при старте
if (typeof window !== 'undefined') {
  const loadedServers = loadServersFromStorage();
  servers.set(loadedServers);
}
