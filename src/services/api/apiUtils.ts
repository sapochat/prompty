import { ApiResponse, PromptConfig } from '@/types/prompt';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { queryClient, PROMPT_CACHE_TTL } from '@/lib/queryClient';

// ============================================================================
// Constants
// ============================================================================

export const CACHE_EXPIRY = PROMPT_CACHE_TTL;
export const DEFAULT_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// Prompt cache (QueryClient-backed)
// ============================================================================

type CachedPrompt = { prompt: string; timestamp: number };

function promptCacheKey(provider: string, cacheKey: string): readonly unknown[] {
  return ['prompt', provider, cacheKey] as const;
}

/**
 * Returns a cached prompt for (provider, cacheKey) if it was written within
 * PROMPT_CACHE_TTL, otherwise null. We do our own timestamp check instead of
 * relying on QueryClient's staleness because setQueryData entries never go
 * "stale" on their own — staleness fires only via useQuery observers.
 */
export function getCachedPrompt(provider: string, cacheKey: string): string | null {
  const entry = queryClient.getQueryData<CachedPrompt>(promptCacheKey(provider, cacheKey));
  if (!entry) return null;
  if (!isCacheValid(entry.timestamp)) return null;
  logger.log('Using cached prompt result');
  return entry.prompt;
}

export function setCachedPrompt(provider: string, cacheKey: string, prompt: string): void {
  queryClient.setQueryData<CachedPrompt>(promptCacheKey(provider, cacheKey), {
    prompt,
    timestamp: Date.now(),
  });
}

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
    id: crypto.randomUUID(),
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
    id: crypto.randomUUID(),
    prompt,
  };
}

/**
 * Creates a cached success response
 */
export function createCachedResponse(prompt: string): ApiResponse {
  toast.success('Prompt generated from cache!');
  return {
    id: crypto.randomUUID(),
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
    id: crypto.randomUUID(),
    prompt: '',
    error: `${provider} API key not found. ${message}.`,
  };
}

// ============================================================================
// OpenAI-compatible chat completion
// ============================================================================

interface OpenAICompatibleChatOptions {
  endpoint: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  extraHeaders?: Record<string, string>;
  providerLabel: string;
}

/**
 * Calls any OpenAI-compatible `/chat/completions` endpoint (OpenAI, OpenRouter,
 * HuggingFace Inference Providers router, Novita's `/v3/openai/...` route, …)
 * and returns the cleaned message content. Throws on HTTP errors or malformed
 * responses; callers wrap with their own cache/handleApiError.
 */
export async function callOpenAICompatibleChat(
  options: OpenAICompatibleChatOptions
): Promise<string> {
  const response = await fetchWithTimeout(options.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.apiKey}`,
      ...options.extraHeaders,
    },
    body: JSON.stringify({
      model: options.model,
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userPrompt },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 800,
    }),
  });

  if (!response.ok) {
    let detail: string = response.statusText;
    try {
      const body = await response.json();
      detail = body?.error?.message ?? body?.error ?? body?.message ?? detail;
    } catch {
      // non-JSON body; keep statusText
    }
    logger.error(`${options.providerLabel} API error (${response.status}):`, detail);
    throw new Error(`${options.providerLabel} API error: ${detail}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || content.length === 0) {
    logger.error(`Invalid response from ${options.providerLabel}:`, data);
    throw new Error(`Invalid response from ${options.providerLabel} API`);
  }
  return cleanPromptText(content.trim());
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
