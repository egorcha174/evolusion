import { writable, derived } from 'svelte/store';
import type { HAServerConfig } from '../types/ha';
import { HAClient } from '../api/ha-client';
import {
  encryptServerConfig,
  decryptServerConfig,
  encryptData,
  decryptData
} from '$utils/crypto';
import { MESSAGES } from '$constants/config';
import { notifications } from './notifications';
import { isLoading } from './loading';
import { z } from 'zod';

// ========================================
// SCHEMA
// ========================================

const HAServerConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  url: z.string().url(),
  token: z.string().min(10),
  enabled: z.boolean().default(true)
});

// ========================================
// STORAGE KEYS
// ========================================

const SERVERS_KEY = 'ha_servers_enc';
const ACTIVE_KEY = 'ha_active_server';

// ========================================
// STORES
// ========================================

export const servers = writable<HAServerConfig[]>([]);
export const activeServerId = writable<string | null>(null);
export const serverConnectionStatus = writable<
  Record<string, { status: 'ok' | 'error' | 'pending'; message?: string }>
>({});

const clients = new Map<string, HAClient>();

// ========================================
// STORAGE HELPERS
// ========================================

async function loadEncrypted<T>(key: string): Promise<T | null> {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    const decrypted = await decryptData(encrypted);
    return JSON.parse(decrypted) as T;
  } catch (e) {
    console.error('[Storage] load error', key, e);
    return null;
  }
}

async function saveEncrypted(key: string, data: unknown): Promise<void> {
  try {
    const encrypted = await encryptData(JSON.stringify(data));
    localStorage.setItem(key, encrypted);
  } catch (e) {
    console.error('[Storage] save error', key, e);
  }
}

// ========================================
// CONNECTION MANAGEMENT
// ========================================

function setStatus(id: string, status: 'ok' | 'error' | 'pending', message?: string) {
  serverConnectionStatus.update((s) => ({ ...s, [id]: { status, message } }));
}

function disconnectClient(id: string) {
  const client = clients.get(id);
  if (client) {
    client.disconnect();
    clients.delete(id);
  }
}

export function disconnectAllClients() {
  clients.forEach((c) => c.disconnect());
  clients.clear();
}

function createClient(id: string, config: HAServerConfig) {
  const client = new HAClient(config);
  clients.set(id, client);

  setStatus(id, 'pending');

  client
    .connect()
    .then(() => {
      setStatus(id, 'ok');
      notifications.show({
        type: 'success',
        title: MESSAGES.CONNECTION_SUCCESS,
        message: `Подключение к ${config.name} установлено`
      });
    })
    .catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus(id, 'error', msg);
      notifications.show({
        type: 'error',
        title: MESSAGES.CONNECTION_ERROR,
        message: msg,
        duration: 5000
      });
      client.disconnect();
      clients.delete(id);
    });

  return client;
}

// ========================================
// CRUD
// ========================================

export async function addServer(config: Omit<HAServerConfig, 'id'>) {
  try {
    isLoading.start();

    const server: HAServerConfig = {
      ...config,
      id: crypto.randomUUID()
    };

    HAServerConfigSchema.parse(server);

    servers.update((list) => [...list, server]);

    notifications.show({
      type: 'success',
      title: 'Сервер добавлен',
      message: `Сервер "${server.name}" успешно добавлен`
    });

    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    notifications.show({
      type: 'error',
      title: MESSAGES.VALIDATION_ERROR,
      message: msg
    });
    return { success: false, error: msg };
  } finally {
    isLoading.stop();
  }
}

export function removeServer(id: string) {
  disconnectClient(id);

  servers.update((list) => list.filter((s) => s.id !== id));

  serverConnectionStatus.update((s) => {
    const { [id]: _, ...rest } = s;
    return rest;
  });

  activeServerId.update((a) => (a === id ? null : a));

  notifications.show({
    type: 'info',
    title: 'Сервер удалён',
    message: 'Сервер успешно удалён'
  });
}

// ========================================
// ACTIVE CLIENT
// ========================================

export const activeClient = derived(
  [servers, activeServerId],
  ([$servers, $id]) => {
    if (!$id) return null;

    let client = clients.get($id);
    if (client) return client;

    const config = $servers.find((s) => s.id === $id);
    if (config && config.enabled) {
      return createClient($id, config);
    }

    return null;
  }
);

// ========================================
// INITIALIZATION
// ========================================

if (typeof window !== 'undefined') {
  (async () => {
    // -----------------------------
    // 1. Load servers
    // -----------------------------
    const raw = await loadEncrypted<string[]>(SERVERS_KEY);
    let list: HAServerConfig[] = [];

    if (Array.isArray(raw)) {
      list = (
        await Promise.all(
          raw.map(async (enc) => {
            try {
              const dec = await decryptServerConfig(enc);
              return HAServerConfigSchema.parse(dec);
            } catch (e) {
              console.error('[Servers] invalid encrypted config', e);
              return null;
            }
          })
        )
      ).filter((s): s is HAServerConfig => s !== null);
    }

    servers.set(list);

    // -----------------------------
    // 2. Load active server
    // -----------------------------
    const active = await loadEncrypted<string | null>(ACTIVE_KEY);
    activeServerId.set(active ?? null);

    // -----------------------------
    // 3. Persist on change
    // -----------------------------
    servers.subscribe(async (value) => {
      const encrypted = await Promise.all(value.map((s) => encryptServerConfig(s)));
      await saveEncrypted(SERVERS_KEY, encrypted);
    });

    activeServerId.subscribe(async (value) => {
      await saveEncrypted(ACTIVE_KEY, value);
    });

    console.log('[Servers] init complete:', list.length, 'servers');
  })();
}
