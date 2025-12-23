/**
 * Utility functions for encrypting and decrypting sensitive data
 * Uses @noble/ciphers for cryptographically secure encryption
 * Implements XChaCha20-Poly1305 AEAD cipher
 */

import { xchacha20poly1305 } from '@noble/ciphers/chacha';

// ========================================
// ENCRYPTION KEY MANAGEMENT

/**
 * Generates a secure encryption key from environment or creates a new one
 * In production, this should come from environment variables
 */
function getEncryptionKey(): Uint8Array {
  // WARNING: In production, use a key from environment variables!
  // For now, we'll derive from a constant (not ideal, but better than XOR)
  const keyString = 'evolusion-ha-secure-key-v2-xchacha20poly1305';
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyString);
  
  // Ensure key is exactly 32 bytes
  const key = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    key[i] = keyData[i % keyData.length];
  }
  
  return key;
}

const ENCRYPTION_KEY = getEncryptionKey();

// ========================================
// CORE ENCRYPTION FUNCTIONS
// ========================================

/**
 * Encrypts data using XChaCha20-Poly1305
 * @param plaintext - The data to encrypt
 * @returns Base64-encoded encrypted data with nonce prepended
 */
function encryptWithXChaCha20(plaintext: string): string {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Generate random 24-byte nonce for XChaCha20
    const nonce = crypto.getRandomValues(new Uint8Array(24));

    // Create cipher and encrypt
    const cipher = xchacha20poly1305(ENCRYPTION_KEY, nonce);
    const encrypted = cipher.encrypt(data);

    // Combine nonce + encrypted data
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce, 0);
    combined.set(encrypted, nonce.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('[Crypto] Encryption error:', error);
    throw new Error('Не удалось зашифровать данные');
  }
}

/**
 * Decrypts data encrypted with XChaCha20-Poly1305
 * @param encryptedData - Base64-encoded encrypted data with nonce
 * @returns Decrypted plaintext string
 */
function decryptWithXChaCha20(encryptedData: string): string {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract nonce (first 24 bytes) and ciphertext
    const nonce = combined.slice(0, 24);
    const ciphertext = combined.slice(24);
    
    // Decrypt
    const cipher = xchacha20poly1305(ENCRYPTION_KEY, nonce);
    const decrypted = cipher.decrypt(ciphertext);
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('[Crypto] Decryption error:', error);
    throw new Error('Не удалось расшифровать данные');
  }
}

// ========================================
// PUBLIC API
// ========================================

/**
 * Encrypts a token string
 * @param token - The token to encrypt
 * @returns Encrypted and base64-encoded token
 */
export function encryptToken(token: string): string {
  return encryptWithXChaCha20(token);
}

/**
 * Decrypts an encrypted token string
 * @param encryptedToken - The encrypted token to decrypt
 * @returns Decrypted token
 */
export function decryptToken(encryptedToken: string): string {
  return decryptWithXChaCha20(encryptedToken);
}

/**
 * Encrypts an entire server configuration object
 * @param data - The server configuration object to encrypt
 * @returns Encrypted and base64-encoded JSON string
 */
export function encryptServerConfig(data: any): string {
  const jsonString = JSON.stringify(data);
  return encryptWithXChaCha20(jsonString);
}

/**
 * Decrypts an encrypted server configuration
 * @param encryptedData - The encrypted server configuration string
 * @returns Decrypted server configuration object
 */
export function decryptServerConfig(encryptedData: string): any {
  const jsonString = decryptWithXChaCha20(encryptedData);
  return JSON.parse(jsonString);
}

/**
 * Encrypts generic data (async version for compatibility)
 * @param data - The data to encrypt (as JSON string)
 * @returns Promise with encrypted data
 */
export function encryptData(data: string): Promise<string> {
  return Promise.resolve(encryptWithXChaCha20(data));
}

/**
 * Decrypts encrypted data (async version for compatibility)
 * @param encryptedData - The encrypted data to decrypt
 * @returns Promise with decrypted data
 */
export function decryptData(encryptedData: string): Promise<string> {
  return Promise.resolve(decryptWithXChaCha20(encryptedData));
}

/**
 * Generates a random UUID v4
 * @returns Random UUID string
 */
export function generateId(): string {
  return crypto.randomUUID();
}
