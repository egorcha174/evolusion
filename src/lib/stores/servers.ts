import { writable, derived } from 'svelte/store';
import type { HAServerConfig } from '../types/ha';
import { HAClient } from '../api/ha-client';

// Server configurations store
export const servers = writable<HAServerConfig[]>([]);

// Active server ID
export const activeServerId = writable<string | null>(null);

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
        client.connect().catch(console.error);
      }
    }
    return client;
  }
);

// Server actions
export const serverActions = {
  add(server: HAServerConfig) {
    servers.update(s => [...s, server]);
  },
  
  remove(id: string) {
    const client = clients.get(id);
    if (client) {
      client.disconnect();
      clients.delete(id);
    }
    servers.update(s => s.filter(server => server.id !== id));
  },
  
  update(id: string, updates: Partial<HAServerConfig>) {
    servers.update(s => 
      s.map(server => server.id === id ? { ...server, ...updates } : server)
    );
  },
  
  setActive(id: string) {
    activeServerId.set(id);
  }
};

// Load from localStorage
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('ha_servers');
  if (stored) {
    try {
      servers.set(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load servers:', e);
    }
  }
  servers.subscribe(value => {
    localStorage.setItem('ha_servers', JSON.stringify(value));
  });
}
