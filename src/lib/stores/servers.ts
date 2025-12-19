import { writable, derived } from 'svelte/store';
import type { HAServerConfig } from '../types/ha';
import { HAClient } from '../api/ha-client';

// Server configurations store
export const servers = writable<HAServerConfig[]>([]);

// Active server ID
export const activeServerId = writable<string | null>(null);

// Connection status store
export type ConnectionStatus = { status: 'ok' | 'error' | 'pending'; message?: string };
export const serverConnectionStatus = writable<Record<string, ConnectionStatus>>({});

export function setConnectionStatus(id: string, status: 'ok' | 'error' | 'pending', message?: string) {
  serverConnectionStatus.update((prev) => ({
    ...prev,
    [id]: { status, message },
  }));
}

// HA Clients map
const clients = new Map<string, HAClient>();

// Active client store
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
          .then(() => setConnectionStatus($activeServerId, 'ok'))
          .catch((err) => {
            console.error('HA Connection error:', err);
            setConnectionStatus($activeServerId, 'error', err.message instanceof Error ? err.message : String(err));
          });
      }
    }
    return client;
  }
);
