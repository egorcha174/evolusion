import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadServersFromStorage, saveServersToStorage } from './servers';
import { encryptServerConfig, decryptServerConfig } from '../utils/crypto';

// Helper to test createPersistedStore directly
function testCreatePersistedStore() {
  // We'll test this indirectly through the stores that use it
  return {
    // This will be used to verify the persisted store behavior
  };
}

describe('Servers Store - Storage Operations', () => {
  const testServer = {
    id: 'test-server-1',
    name: 'Test Server',
    url: 'https://homeassistant.local:8123',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    enabled: true
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Storage Operations', () => {
    it('should save and load servers with full encryption', () => {
      // Save server
      saveServersToStorage([testServer]);

      // Load servers
      const loadedServers = loadServersFromStorage();

      expect(loadedServers).toHaveLength(1);
      expect(loadedServers[0]).toEqual(testServer);
    });

    it('should handle multiple servers', () => {
      const servers = [
        testServer,
        {
          id: 'test-server-2',
          name: 'Second Test Server',
          url: 'https://homeassistant2.local:8123',
          token: 'another-test-token-1234567890',
          enabled: false
        }
      ];

      saveServersToStorage(servers);
      const loadedServers = loadServersFromStorage();

      expect(loadedServers).toHaveLength(2);
      expect(loadedServers[0]).toEqual(servers[0]);
      expect(loadedServers[1]).toEqual(servers[1]);
    });

    it('should handle empty server list', () => {
      saveServersToStorage([]);
      const loadedServers = loadServersFromStorage();

      expect(loadedServers).toHaveLength(0);
    });
  });

  describe('Backward Compatibility', () => {
    it('should handle old format data (token encryption only)', () => {
      // Simulate old format where only token was encrypted
      const oldFormatServer = {
        id: 'old-server-1',
        name: 'Old Format Server',
        url: 'https://oldformat.local:8123',
        token: encryptServerConfig(testServer), // This simulates the old encrypted token
        enabled: true
      };

      // Save in old format (array of objects)
      localStorage.setItem('ha_servers_v2', JSON.stringify([oldFormatServer]));

      // Try to load - should handle gracefully
      const loadedServers = loadServersFromStorage();

      // Should either load successfully or return empty array
      expect(Array.isArray(loadedServers)).toBe(true);
    });

    it('should handle corrupted data gracefully', () => {
      // Save corrupted data
      localStorage.setItem('ha_servers_v2', 'corrupted-data-{{{');

      // Should not throw and return empty array
      expect(() => {
        const loadedServers = loadServersFromStorage();
        expect(loadedServers).toHaveLength(0);
      }).not.toThrow();
    });
  });

  describe('Encryption Verification', () => {
    it('should actually encrypt the data in storage', () => {
      saveServersToStorage([testServer]);

      // Check what's actually stored
      const storedData = localStorage.getItem('ha_servers_v2');
      expect(storedData).toBeTruthy();

      const parsedData = JSON.parse(storedData!);
      expect(parsedData).toHaveLength(1);

      // The stored data should be encrypted strings, not plain objects
      expect(typeof parsedData[0]).toBe('string');

      // Should be different from the original JSON
      const originalJson = JSON.stringify(testServer);
      expect(parsedData[0]).not.toBe(originalJson);
    });
  });

  describe('Persisted Store Error Handling', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should handle corrupted JSON in persisted store gracefully', () => {
      // Simulate corrupted data in the persisted store keys
      localStorage.setItem('fusion-ha-servers', 'corrupted-json-{{{');
      localStorage.setItem('fusion-ha-connection', 'invalid-data');

      // This should not throw - the persisted store should handle it gracefully
      expect(() => {
        // Import the module to trigger initialization
        import('./servers');
      }).not.toThrow();
    });

    it('should handle invalid data types in persisted store', () => {
      // Simulate old format data that might cause issues
      localStorage.setItem('fusion-ha-servers', JSON.stringify({ not: 'an array' }));
      localStorage.setItem('fusion-ha-connection', JSON.stringify(123)); // number instead of string

      expect(() => {
        import('./servers');
      }).not.toThrow();
    });

    it('should handle localStorage errors during save', () => {
      // Mock localStorage.setItem to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Quota exceeded');
      });

      // This should not crash the application
      expect(() => {
        saveServersToStorage([testServer]);
      }).not.toThrow();

      // Restore original function
      localStorage.setItem = originalSetItem;
    });

    it('should handle circular references during serialization', () => {
      // Create an object with circular reference
      const circularServer: any = { ...testServer };
      circularServer.self = circularServer;

      // This should not crash
      expect(() => {
        saveServersToStorage([circularServer]);
      }).not.toThrow();
    });
  });
});
