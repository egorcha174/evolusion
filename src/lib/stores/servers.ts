import { writable, get, derived } from 'svelte/store';
import type { HAServerConfig } from '../types/ha';
import { HAClient } from '../api/ha-client';
import { encryptToken, decryptToken, encryptServerConfig, decryptServerConfig, encryptData, decryptData } from '$utils/crypto';
import { CONFIG, MESSAGES } from '$constants/config';
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
  token: z.string().min(10, 'Токен слишком короткий'),
  enabled: z.boolean().default(true)
});

export type ConnectionStatus = {
  status: 'ok' | 'error' | 'pending';
  message?: string
};

// ========================================
// ENCRYPTED STORAGE UTILITIES
// ========================================

/**
 * Загружает данные из localStorage с дешифровкой
 */
async function loadEncryptedData(key: string): Promise<any> {
  try {
    const encrypted = localStorage.getItem(key);
    if (encrypted) {
      const decrypted = await decryptData(encrypted);
      return JSON.parse(decrypted);
    }
    return null;
  } catch (error) {
    console.error('[EncryptedStorage] Error loading data for', key, error);
    return null;
  }
}

/**
 * Сохраняет данные в localStorage с шифрованием
 */
async function saveEncryptedData(key: string, data: any): Promise<void> {
  try {
    const encrypted = await encryptData(JSON.stringify(data));
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error('[EncryptedStorage] Error saving data for', key, error);
  }
}

// ========================================
// ENCRYPTED PERSISTED STORE
// ========================================

/**
 * Создает зашифрованный persisted-store для Svelte
 * Автоматически синхронизирует состояние с зашифрованным localStorage
 */
function createEncryptedPersistedStore<T>(key: string, initial: T) {
  const { subscribe, set, update } = writable<T>(initial);

  if (typeof window !== 'undefined') {
    // Загружаем и дешифруем данные при инициализации
    (async () => {
      try {
        const loaded = await loadEncryptedData(key);
        if (loaded !== null) {
          console.log('[EncryptedStore] init', key, loaded);
          set(loaded);
        } else {
          set(initial);
        }
      } catch (e) {
        console.error('[EncryptedStore] error loading from storage for', key, e);
        set(initial);
      }
    })();

    // Подписываемся на изменения и сохраняем с шифрованием
    subscribe(async (value) => {
      try {
        console.log('[EncryptedStore] update', key, value);
        await saveEncryptedData(key, value);
      } catch (e) {
        console.error('[EncryptedStore] save error for', key, e);
      }
    });
  }

  return {
    subscribe,
    set,
    update
  };
}

// ========================================
// ENCRYPTED PERSISTED STORES
// ========================================

// Server configurations encrypted persisted store
const persistedServers = createEncryptedPersistedStore<HAServerConfig[]>('ha_servers_enc', []);

// Active server ID encrypted persisted store
const persistedActiveServerId = createEncryptedPersistedStore<string | null>('ha_connection_enc', null);

// ========================================
// STORES
// ========================================

export const servers = writable<HAServerConfig[]>([]);

// Active server ID
export const activeServerId = writable<string | null>(null);

// Active server ID storage key
const ACTIVE_SERVER_STORAGE_KEY = 'active_server_id';

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
    // Пробуем расшифровать как полную конфигурацию (новый формат)
    // Если это строка - значит это зашифрованная конфигурация
    if (typeof server === 'string') {
      const decrypted = decryptServerConfig(server);
      return HAServerConfigSchema.parse(decrypted);
    }
    // Если это объект с зашифрованным токеном - старый формат
    else if (server && typeof server.token === 'string' && server.token) {
      const decrypted = {
        ...server,
        token: decryptToken(server.token)
      };
      return HAServerConfigSchema.parse(decrypted);
    }
    // Если это объект с зашифрованным accessToken - старый формат (для обратной совместимости)
    else if (server && typeof server.accessToken === 'string' && server.accessToken) {
      const decrypted = {
        ...server,
        token: decryptToken(server.accessToken)
      };
      return HAServerConfigSchema.parse(decrypted);
    }
    // Если это уже расшифрованный объект
    else {
      return HAServerConfigSchema.parse(server);
    }
  } catch (error) {
    console.error('[Servers] Ошибка валидации сервера:', error);
    return null;
  }
}

/**
 * Шифрует всю конфигурацию сервера
 */
function encryptServer(server: HAServerConfig): string {
  return encryptServerConfig(server);
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

      // Отключаем клиент при ошибке подключения
      client.disconnect();
      clients.delete(serverId);
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
      .filter((server: any): server is HAServerConfig => server !== null);

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

/**
 * Сохраняет активный сервер ID в localStorage
 */
export function saveActiveServerIdToStorage(serverId: string | null): void {
  try {
    if (serverId) {
      localStorage.setItem(ACTIVE_SERVER_STORAGE_KEY, serverId);
    } else {
      localStorage.removeItem(ACTIVE_SERVER_STORAGE_KEY);
    }
  } catch (error) {
    console.error('[Servers] Ошибка при сохранении активного сервера:', error);
  }
}

/**
 * Загружает активный сервер ID из localStorage
 */
export function loadActiveServerIdFromStorage(): string | null {
  try {
    const stored = localStorage.getItem(ACTIVE_SERVER_STORAGE_KEY);
    return stored || null;
  } catch (error) {
    console.error('[Servers] Ошибка при загрузке активного сервера:', error);
    return null;
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
    const updated = s.filter((server: HAServerConfig) => server.id !== serverId);
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
// INITIALIZATION & SYNCHRONIZATION
// ========================================

/**
 * Инициализация: загружаем серверы и активный сервер при старте
 * и синхронизируем с persisted stores
 */
if (typeof window !== 'undefined') {
  // Подписываемся на persisted stores и синхронизируем с writable stores
  persistedServers.subscribe((value) => {
    servers.set(value || []);
  });

  persistedActiveServerId.subscribe((value) => {
    activeServerId.set(value || null);
  });

  // Подписываемся на изменения writable stores и синхронизируем с persisted stores
  servers.subscribe((value) => {
    persistedServers.set(value);
  });

  activeServerId.subscribe((value) => {
    persistedActiveServerId.set(value);
  });
}
