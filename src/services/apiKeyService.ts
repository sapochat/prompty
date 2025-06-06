// API key service - local storage only implementation
// No cloud integration needed for local deployment

// Keys stored in local storage will be prefixed with this to avoid collisions
const LOCAL_STORAGE_PREFIX = 'prompty_api_key_';

// API key provider names
export const API_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  HUGGINGFACE: 'huggingface',
  NOVITA: 'novita',
  OPENROUTER: 'openrouter'
};

import { encryptString, decryptString } from '@/utils/cryptoUtils';
// This service manages API key storage and retrieval, ensuring keys are encrypted at rest.
// It also handles error cases and user feedback for secure and robust UX.

/**
 * Get an API key from environment variables
 * This is used for initial setup if the key is provided via .env
 */
const getApiKeyFromEnv = (provider: string): string => {
  const envMapping: Record<string, string> = {
    [API_PROVIDERS.OPENAI]: import.meta.env.VITE_OPENAI_API_KEY || '',
    [API_PROVIDERS.ANTHROPIC]: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
    [API_PROVIDERS.HUGGINGFACE]: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
    [API_PROVIDERS.NOVITA]: import.meta.env.VITE_NOVITA_API_KEY || '',
    [API_PROVIDERS.OPENROUTER]: import.meta.env.VITE_OPENROUTER_API_KEY || ''
  };

  return envMapping[provider] || '';
};

/**
 * Get the API key for a specific provider
 * Only uses localStorage since we're running completely locally
 */
export const getApiKey = async (provider: string): Promise<string> => {
  try {
    // Check localStorage first
    const encryptedKey = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${provider}`);
    let decryptedKey = '';
    if (encryptedKey) {
      try {
        decryptedKey = await decryptString(encryptedKey);
      } catch (e) {
        console.warn('Failed to decrypt API key, possibly legacy/plaintext:', e);
        // fallback to plaintext (legacy)
        decryptedKey = encryptedKey;
      }
    }
    // If no key in localStorage, check environment variables
    if (!decryptedKey) {
      const envKey = getApiKeyFromEnv(provider);
      if (envKey) {
        await saveApiKey(provider, envKey);
        return envKey;
      }
    }
    return decryptedKey || '';
  } catch (error) {
    console.error(`Error retrieving ${provider} API key:`, error);
    return '';
  }
};

/**
 * Save an API key for a specific provider
 * Only saves to localStorage since we're running completely locally
 */
export const saveApiKey = async (provider: string, apiKey: string): Promise<void> => {
  console.log(`Saving ${provider} API key:`, apiKey ? "Key provided" : "No key provided");
  try {
    // Encrypt before saving
    const encryptedKey = await encryptString(apiKey);
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${provider}`, encryptedKey);
    // Dispatch an event to notify components that API keys have changed
    window.dispatchEvent(new CustomEvent('apiKeysUpdated'));
  } catch (error) {
    console.error(`Error saving ${provider} API key:`, error);
    throw error;
  }
};

/**
 * Delete an API key for a specific provider
 */
export const deleteApiKey = async (provider: string): Promise<void> => {
  try {
    // Remove from localStorage
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${provider}`);
    
    // Dispatch an event to notify components that API keys have changed
    window.dispatchEvent(new CustomEvent('apiKeysUpdated'));
  } catch (error) {
    console.error(`Error deleting ${provider} API key:`, error);
    throw error;
  }
}; 