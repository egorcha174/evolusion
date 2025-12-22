/**
 * Utility functions for encrypting and decrypting sensitive data
 * Uses base64 encoding for basic obfuscation in browser storage
 */

const ENCRYPTION_KEY = 'evolusion-ha-secure-key';

/**
 * Simple XOR cipher for basic encryption
 * Note: This is NOT cryptographically secure, but provides basic obfuscation
 * for tokens stored in localStorage
 */
function xorCipher(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

/**
 * Encrypts a token string
 * @param token - The token to encrypt
 * @returns Encrypted and base64-encoded token
 */
export function encryptToken(token: string): string {
  try {
    const xored = xorCipher(token, ENCRYPTION_KEY);
    return btoa(xored);
  } catch (error) {
    console.error('[Crypto] Encryption error:', error);
    throw new Error('Не удалось зашифровать токен');
  }
}

/**
 * Decrypts an encrypted token string
 * @param encryptedToken - The encrypted token to decrypt
 * @returns Decrypted token
 */
export function decryptToken(encryptedToken: string): string {
  try {
    const decoded = atob(encryptedToken);
    return xorCipher(decoded, ENCRYPTION_KEY);
  } catch (error) {
    console.error('[Crypto] Decryption error:', error);
    throw new Error('Не удалось расшифровать токен');
  }
}

/**
 * Encrypts an entire server configuration object
 * @param data - The server configuration object to encrypt
 * @returns Encrypted and base64-encoded JSON string
 */
export function encryptServerConfig(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    const xored = xorCipher(jsonString, ENCRYPTION_KEY);
    return btoa(xored);
  } catch (error) {
    console.error('[Crypto] Server config encryption error:', error);
    throw new Error('Не удалось зашифровать конфигурацию сервера');
  }
}

/**
 * Decrypts an encrypted server configuration
 * @param encryptedData - The encrypted server configuration string
 * @returns Decrypted server configuration object
 */
export function decryptServerConfig(encryptedData: string): any {
  try {
    const decoded = atob(encryptedData);
    const xored = xorCipher(decoded, ENCRYPTION_KEY);
    return JSON.parse(xored);
  } catch (error) {
    console.error('[Crypto] Server config decryption error:', error);
    throw new Error('Не удалось расшифровать конфигурацию сервера');
  }
}

/**
 * Generates a random UUID v4
 * @returns Random UUID string
 */
export function generateId(): string {
  return crypto.randomUUID();
}
