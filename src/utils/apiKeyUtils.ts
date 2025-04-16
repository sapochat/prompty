
/**
 * Utility function to mask an API key for display, showing only the last 4 characters.
 * @param key The API key to mask
 * @returns Masked string with bullets and last 4 characters
 */
export const maskApiKey = (key: string): string => {
  if (!key || key.length <= 4) return key;
  return '•'.repeat(Math.min(12, key.length - 4)) + key.slice(-4);
};
