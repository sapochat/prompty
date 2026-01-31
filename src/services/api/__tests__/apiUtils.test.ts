import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchWithTimeout,
  generateCacheKey,
  getCachedResult,
  setCacheResult,
  isCacheValid,
  handleApiError,
  createErrorResponse,
  createSuccessResponse,
  createCachedResponse,
  createMissingKeyResponse,
  cleanPromptText,
  CACHE_EXPIRY,
  DEFAULT_TIMEOUT,
  CacheEntry,
} from '../apiUtils';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

describe('apiUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchWithTimeout', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return response on successful fetch', async () => {
      const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
        status: 200,
      });
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      const result = await fetchWithTimeout('https://api.example.com', {});

      expect(result).toBe(mockResponse);
      expect(fetch).toHaveBeenCalledWith('https://api.example.com', expect.objectContaining({
        signal: expect.any(AbortSignal),
      }));
    });

    it('should throw timeout error when request exceeds timeout', async () => {
      // Create a fetch that waits for abort signal
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(
          (_url: string, options: RequestInit) =>
            new Promise((_, reject) => {
              options.signal?.addEventListener('abort', () => {
                const abortError = new Error('Aborted');
                abortError.name = 'AbortError';
                reject(abortError);
              });
            })
        )
      );

      const fetchPromise = fetchWithTimeout('https://api.example.com', {}, 100);

      // Advance timers past the timeout
      await vi.advanceTimersByTimeAsync(150);

      await expect(fetchPromise).rejects.toThrow('Request timed out. Please try again.');
    });

    it('should use default timeout when not specified', async () => {
      const mockResponse = new Response('{}');
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      await fetchWithTimeout('https://api.example.com', {});

      expect(DEFAULT_TIMEOUT).toBe(30000);
    });

    it('should propagate non-timeout errors', async () => {
      const networkError = new Error('Network failure');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(networkError));

      await expect(
        fetchWithTimeout('https://api.example.com', {})
      ).rejects.toThrow('Network failure');
    });
  });

  describe('generateCacheKey', () => {
    it('should generate deterministic key for same config', () => {
      const config = {
        model: 'gpt-4',
        subject: ['portrait'],
        style: ['realistic'],
        extraDetails: 'high quality',
      };

      const key1 = generateCacheKey(config);
      const key2 = generateCacheKey(config);

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different configs', () => {
      const config1 = { model: 'gpt-4', subject: ['portrait'] };
      const config2 = { model: 'gpt-4', subject: ['landscape'] };

      const key1 = generateCacheKey(config1);
      const key2 = generateCacheKey(config2);

      expect(key1).not.toBe(key2);
    });

    it('should exclude promptCategories from cache key', () => {
      const config1 = { model: 'gpt-4', subject: ['portrait'] };
      const config2 = {
        model: 'gpt-4',
        subject: ['portrait'],
        promptCategories: [{ id: 'test', name: 'Test' }],
      } as const;

      const key1 = generateCacheKey(config1);
      // promptCategories should be excluded from cache key generation
      const key2 = generateCacheKey(config2 as unknown as Parameters<typeof generateCacheKey>[0]);

      expect(key1).toBe(key2);
    });

    it('should filter out empty arrays', () => {
      const config1 = { model: 'gpt-4', subject: ['portrait'], style: [] };
      const config2 = { model: 'gpt-4', subject: ['portrait'] };

      const key1 = generateCacheKey(config1);
      const key2 = generateCacheKey(config2);

      expect(key1).toBe(key2);
    });

    it('should sort entries for consistency', () => {
      const config1 = { model: 'gpt-4', subject: ['a'], style: ['b'] };
      const config2 = { model: 'gpt-4', style: ['b'], subject: ['a'] };

      const key1 = generateCacheKey(config1);
      const key2 = generateCacheKey(config2);

      expect(key1).toBe(key2);
    });
  });

  describe('isCacheValid', () => {
    it('should return true for recent timestamp', () => {
      const recentTimestamp = Date.now() - 1000; // 1 second ago
      expect(isCacheValid(recentTimestamp)).toBe(true);
    });

    it('should return false for expired timestamp', () => {
      const oldTimestamp = Date.now() - CACHE_EXPIRY - 1000; // Past expiry
      expect(isCacheValid(oldTimestamp)).toBe(false);
    });

    it('should respect custom TTL', () => {
      const timestamp = Date.now() - 5000; // 5 seconds ago
      expect(isCacheValid(timestamp, 10000)).toBe(true); // 10 second TTL
      expect(isCacheValid(timestamp, 3000)).toBe(false); // 3 second TTL
    });
  });

  describe('getCachedResult / setCacheResult', () => {
    it('should return null for empty cache', () => {
      const cache = new Map<string, CacheEntry>();
      const result = getCachedResult(cache, 'nonexistent-key');
      expect(result).toBeNull();
    });

    it('should return cached prompt for valid entry', () => {
      const cache = new Map<string, CacheEntry>();
      setCacheResult(cache, 'test-key', 'cached prompt');

      const result = getCachedResult(cache, 'test-key');
      expect(result).toBe('cached prompt');
    });

    it('should return null for expired cache entry', () => {
      const cache = new Map<string, CacheEntry>();
      cache.set('test-key', {
        prompt: 'old prompt',
        timestamp: Date.now() - CACHE_EXPIRY - 1000,
      });

      const result = getCachedResult(cache, 'test-key');
      expect(result).toBeNull();
    });
  });

  describe('handleApiError', () => {
    it('should handle Error instances', () => {
      const error = new Error('API failed');
      const result = handleApiError(error, 'TestProvider');

      expect(result).toEqual({
        id: 'test-uuid-1234',
        prompt: '',
        error: 'TestProvider: API failed',
      });
    });

    it('should handle string errors', () => {
      const result = handleApiError('Something went wrong', 'TestProvider');

      expect(result).toEqual({
        id: 'test-uuid-1234',
        prompt: '',
        error: 'TestProvider: Something went wrong',
      });
    });

    it('should handle unknown error types', () => {
      const result = handleApiError({ weird: 'object' }, 'TestProvider');

      expect(result).toEqual({
        id: 'test-uuid-1234',
        prompt: '',
        error: 'TestProvider: Unknown error occurred',
      });
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response with provider prefix', () => {
      const result = createErrorResponse('OpenAI', 'Rate limited');

      expect(result).toEqual({
        id: 'test-uuid-1234',
        prompt: '',
        error: 'OpenAI: Rate limited',
      });
    });
  });

  describe('createSuccessResponse', () => {
    it('should create success response with prompt', () => {
      const result = createSuccessResponse('Generated prompt text');

      expect(result).toEqual({
        id: 'test-uuid-1234',
        prompt: 'Generated prompt text',
      });
    });
  });

  describe('createCachedResponse', () => {
    it('should create cached response with prompt', () => {
      const result = createCachedResponse('Cached prompt text');

      expect(result).toEqual({
        id: 'test-uuid-1234',
        prompt: 'Cached prompt text',
      });
    });
  });

  describe('createMissingKeyResponse', () => {
    it('should create missing key error response', () => {
      const result = createMissingKeyResponse('Anthropic');

      expect(result.id).toBe('test-uuid-1234');
      expect(result.prompt).toBe('');
      expect(result.error).toContain('Anthropic');
      expect(result.error).toContain('API key');
    });
  });

  describe('cleanPromptText', () => {
    it('should return empty string for empty input', () => {
      expect(cleanPromptText('')).toBe('');
    });

    it('should remove "Title:" prefix', () => {
      const input = 'Title: A beautiful landscape';
      expect(cleanPromptText(input)).toBe('A beautiful landscape');
    });

    it('should remove "Prompt:" prefix', () => {
      const input = 'Prompt: A portrait of a woman';
      expect(cleanPromptText(input)).toBe('A portrait of a woman');
    });

    it('should remove quotes around entire prompt', () => {
      const input = '"A scenic mountain view"';
      expect(cleanPromptText(input)).toBe('A scenic mountain view');
    });

    it('should remove section headers', () => {
      const input = 'Content: The scene shows a forest. Style: Realistic painting.';
      const result = cleanPromptText(input);
      expect(result).not.toContain('Content:');
      expect(result).not.toContain('Style:');
    });

    it('should normalize multiple newlines', () => {
      const input = 'Paragraph one.\n\n\n\nParagraph two.';
      const result = cleanPromptText(input);
      expect(result).toBe('Paragraph one.\n\nParagraph two.');
    });

    it('should handle mixed case headers', () => {
      const input = 'CONTENT: test STYLE: test2';
      const result = cleanPromptText(input);
      expect(result).not.toContain('CONTENT:');
      expect(result).not.toContain('STYLE:');
    });
  });
});
