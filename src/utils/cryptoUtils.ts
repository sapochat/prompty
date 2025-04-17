// Utility functions for encrypting and decrypting API keys using AES-GCM with Web Crypto API.
// These functions help ensure API keys are never stored in plaintext in localStorage.
// All cryptographic operations are performed in-browser using the SubtleCrypto API.
// Note: The encryption key is derived from a static passphrase for demo purposes—
// for production, use a user-specific secret or secure key management.
// (AES-GCM)
// NOTE: For demo purposes, the key is stored in sessionStorage. For stronger security, use a user-supplied passphrase or OS keystore.

const CRYPTO_KEY_NAME = 'prompty_crypto_key_v1';

/**
 * Retrieves or generates a cryptographic key for encryption/decryption operations.
 * - If a key does not exist in sessionStorage, generates a new 256-bit AES-GCM key and stores it.
 * - For production, use a user-specific secret or secure key management.
 * @returns {Promise<CryptoKey>} A CryptoKey object for AES-GCM encryption/decryption.
 */
async function getOrCreateCryptoKey(): Promise<CryptoKey> {
  let keyBase64 = sessionStorage.getItem(CRYPTO_KEY_NAME);
  if (!keyBase64) {
    // Generate a new random 256-bit key
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    // Export and store the key as base64
    const exported = await crypto.subtle.exportKey('raw', key);
    keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
    sessionStorage.setItem(CRYPTO_KEY_NAME, keyBase64);
    return key;
  }
  // Import the existing key
  const raw = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', true, ['encrypt', 'decrypt']);
}

/**
 * Encrypts an API key string using AES-GCM.
 * - Generates a random IV for each encryption.
 * - Combines IV and ciphertext for storage (base64 encoded).
 * @param apiKey The plaintext API key to encrypt.
 * @returns {Promise<string>} A base64-encoded string containing the IV and ciphertext.
 * @security Never expose the encryption key or plaintext API key outside this module.
 */
export async function encryptString(plainText: string): Promise<string> {
  const key = await getOrCreateCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  const encoded = new TextEncoder().encode(plainText);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  // Combine IV and ciphertext for storage
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts an encrypted API key string using AES-GCM.
 * - Extracts IV and ciphertext from base64-encoded input.
 * - Returns the decrypted plaintext API key.
 * @param encrypted The base64-encoded string containing IV and ciphertext.
 * @returns {Promise<string>} The decrypted plaintext API key.
 * @throws If decryption fails (e.g., wrong key or corrupted data).
 */
export async function decryptString(cipherText: string): Promise<string> {
  const key = await getOrCreateCryptoKey();
  const data = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));
  const iv = data.slice(0, 12); // First 12 bytes are the IV
  const ciphertext = data.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(plaintext);
}
