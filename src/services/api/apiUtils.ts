import { ApiResponse, PromptConfig } from '@/types/prompt';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

// ============================================================================
// Constants
// ============================================================================

export const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour
export const DEFAULT_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// Timeout Utilities
// ============================================================================

/**
 * Wraps a fetch call with a timeout using AbortController
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// Cache Utilities
// ============================================================================

export interface CacheEntry {
  prompt: string;
  timestamp: number;
}

/**
 * Generates a deterministic cache key from a prompt config
 */
export function generateCacheKey(config: PromptConfig): string {
  const { model, extraDetails, ...restConfig } = config;
  const sortedEntries = Object.entries(restConfig)
    .filter(([key, value]) => {
      // Exclude non-serializable or meta fields
      if (key === 'promptCategories') return false;
      return value && (!Array.isArray(value) || value.length > 0);
    })
    .sort(([a], [b]) => a.localeCompare(b));

  return JSON.stringify({
    model,
    extraDetails,
    categories: sortedEntries,
  });
}

/**
 * Checks if a cache entry is still valid
 */
export function isCacheValid(timestamp: number, ttlMs = CACHE_EXPIRY): boolean {
  return Date.now() - timestamp < ttlMs;
}

/**
 * Gets a cached result if valid, otherwise returns null
 */
export function getCachedResult(
  cache: Map<string, CacheEntry>,
  cacheKey: string
): string | null {
  const cached = cache.get(cacheKey);
  if (cached && isCacheValid(cached.timestamp)) {
    logger.log('Using cached prompt result');
    return cached.prompt;
  }
  return null;
}

/**
 * Stores a result in the cache
 */
export function setCacheResult(
  cache: Map<string, CacheEntry>,
  cacheKey: string,
  prompt: string
): void {
  cache.set(cacheKey, {
    prompt,
    timestamp: Date.now(),
  });
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  provider: string,
  message: string
): ApiResponse {
  const errorMessage = `${provider}: ${message}`;
  logger.error(`Error generating prompt with ${provider}:`, message);
  toast.error(`Error: ${message}`);

  return {
    id: uuidv4(),
    prompt: '',
    error: errorMessage,
  };
}

/**
 * Handles API errors and returns a standardized response
 */
export function handleApiError(
  error: unknown,
  provider: string
): ApiResponse {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Unknown error occurred';
  }

  return createErrorResponse(provider, message);
}

/**
 * Creates a success response
 */
export function createSuccessResponse(prompt: string): ApiResponse {
  toast.success('Prompt generated successfully!');
  return {
    id: uuidv4(),
    prompt,
  };
}

/**
 * Creates a cached success response
 */
export function createCachedResponse(prompt: string): ApiResponse {
  toast.success('Prompt generated from cache!');
  return {
    id: uuidv4(),
    prompt,
  };
}

/**
 * Creates a missing API key error response
 */
export function createMissingKeyResponse(provider: string): ApiResponse {
  const message = `Please add your ${provider} API key in settings`;
  toast.error(message);
  return {
    id: uuidv4(),
    prompt: '',
    error: `${provider} API key not found. ${message}.`,
  };
}

// ============================================================================
// Response Cleaning
// ============================================================================

/**
 * Cleans up generated prompt text by removing section headers and formatting
 */
export function cleanPromptText(text: string): string {
  if (!text) return '';

  // Remove common prefixes
  let cleaned = text
    .replace(
      /^(Title|Prompt|Image Prompt|Here's a prompt|Here is a prompt|Description):\s*/i,
      ''
    )
    .replace(/^"(.*)"$/, '$1')
    .trim();

  // Remove section headers
  cleaned = cleaned
    .replace(
      /\b(Content|Character|Style|Setting|Background|Mood|Lighting|Details):\s+/gi,
      ''
    )
    .replace(
      /\n\s*\b(Content|Character|Style|Setting|Background|Mood|Lighting|Details):\s*/gi,
      '\n\n'
    )
    .trim();

  // Normalize whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned;
}
