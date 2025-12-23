/**
 * Utility functions for encrypting and decrypting sensitive data
 * Uses Web Crypto API (AES-GCM) for secure encryption
 * Temporary solution until @noble/ciphers is properly installed
 */

// ========================================
// ENCRYPTION KEY MANAGEMENT
// ========================================

/**
 * Derives a crypto key from a passphrase
 */
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('evolusion-ha-salt-v1'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

let ENCRYPTION_KEY: CryptoKey | null = null;
const KEY_PASSPHRASE = 'evolusion-ha-secure-key-v2-aes-gcm';

/**
 * Gets or creates the encryption key
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  if (!ENCRYPTION_KEY) {
    ENCRYPTION_KEY = await deriveKey(KEY_PASSPHRASE);
  }
  return ENCRYPTION_KEY;
}

// ========================================
// CORE ENCRYPTION FUNCTIONS
// ========================================

/**
 * Encrypts data using AES-GCM
 */
async function encryptWithAES(plaintext: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const key = await getEncryptionKey();
    
    // Generate random 12-byte IV for AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('[Crypto] Encryption error:', error);
    throw new Error('Не удалось зашифровать данные');
  }
}

/**
 * Decrypts data encrypted with AES-GCM
 */
async function decryptWithAES(encryptedData: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV (first 12 bytes) and ciphertext
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    
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
 */
export async function encryptToken(token: string): Promise<string> {
  return await encryptWithAES(token);
}

/**
 * Decrypts an encrypted token string
 */
export async function decryptToken(encryptedToken: string): Promise<string> {
  return await decryptWithAES(encryptedToken);
}

/**
 * Encrypts an entire server configuration object
 */
export async function encryptServerConfig(data: any): Promise<string> {
  const jsonString = JSON.stringify(data);
  return await encryptWithAES(jsonString);
}

/**
 * Decrypts an encrypted server configuration
 */
export async function decryptServerConfig(encryptedData: string): Promise<any> {
  const jsonString = await decryptWithAES(encryptedData);
  return JSON.parse(jsonString);
}

/**
 * Encrypts generic data
 */
export async function encryptData(data: string): Promise<string> {
  return await encryptWithAES(data);
}

/**
 * Decrypts encrypted data
 */
export async function decryptData(encryptedData: string): Promise<string> {
  return await decryptWithAES(encryptedData);
}

/**
 * Generates a random UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}
