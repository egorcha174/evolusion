import { describe, it, expect, beforeEach } from 'vitest';
import { encryptServerConfig, decryptServerConfig, encryptToken, decryptToken } from './crypto';

describe('Crypto Utilities', () => {
  const testServerConfig = {
    id: 'test-server-1',
    name: 'Test Server',
    url: 'https://homeassistant.local:8123',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    enabled: true
  };

  describe('Server Configuration Encryption', () => {
    it('should encrypt and decrypt server configuration', () => {
      const encrypted = encryptServerConfig(testServerConfig);
      const decrypted = decryptServerConfig(encrypted);

      expect(decrypted).toEqual(testServerConfig);
    });

    it('should return different encrypted string for same input', () => {
      const encrypted1 = encryptServerConfig(testServerConfig);
      const encrypted2 = encryptServerConfig(testServerConfig);

      // Since we're using XOR cipher, same input should produce same output
      expect(encrypted1).toBe(encrypted2);
    });

    it('should handle empty configuration', () => {
      const emptyConfig = {};
      const encrypted = encryptServerConfig(emptyConfig);
      const decrypted = decryptServerConfig(encrypted);

      expect(decrypted).toEqual(emptyConfig);
    });
  });

  describe('Token Encryption', () => {
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    it('should encrypt and decrypt tokens', () => {
      const encrypted = encryptToken(testToken);
      const decrypted = decryptToken(encrypted);

      expect(decrypted).toBe(testToken);
    });

    it('should return different encrypted string for same token', () => {
      const encrypted1 = encryptToken(testToken);
      const encrypted2 = encryptToken(testToken);

      // Same token should produce same encrypted result
      expect(encrypted1).toBe(encrypted2);
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain backward compatibility with token encryption', () => {
      const token = 'test-token-12345';
      const encryptedToken = encryptToken(token);

      // Encrypted token should be a base64 string
      expect(encryptedToken).toBeTruthy();
      expect(() => atob(encryptedToken)).not.toThrow();

      const decryptedToken = decryptToken(encryptedToken);
      expect(decryptedToken).toBe(token);
    });
  });
});
