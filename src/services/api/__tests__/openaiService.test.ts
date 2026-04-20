import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getApiKey, saveApiKey } from '../openaiService';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    loading: vi.fn(() => 'loading-toast-id'),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/utils/promptData', () => ({
  promptCategories: [
    { id: 'subject', name: 'Subject' },
    { id: 'style', name: 'Style' },
  ],
}));

// Mock apiKeyService
const mockGetApiKey = vi.fn();
const mockSaveApiKey = vi.fn();

vi.mock('../../apiKeyService', () => ({
  getApiKey: (...args: unknown[]) => mockGetApiKey(...args),
  saveApiKey: (...args: unknown[]) => mockSaveApiKey(...args),
  API_PROVIDERS: {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    HUGGINGFACE: 'huggingface',
    NOVITA: 'novita',
    OPENROUTER: 'openrouter',
  },
}));

describe('openaiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getApiKey', () => {
    it('should call apiKeyService with openai provider', async () => {
      mockGetApiKey.mockResolvedValue('test-api-key');

      const result = await getApiKey();

      expect(mockGetApiKey).toHaveBeenCalledWith('openai');
      expect(result).toBe('test-api-key');
    });

    it('should return empty string when no key stored', async () => {
      mockGetApiKey.mockResolvedValue('');

      const result = await getApiKey();

      expect(result).toBe('');
    });
  });

  describe('saveApiKey', () => {
    it('should call apiKeyService saveApiKey with openai provider', async () => {
      await saveApiKey('new-api-key');

      expect(mockSaveApiKey).toHaveBeenCalledWith('openai', 'new-api-key');
    });

    it('should handle empty key', async () => {
      await saveApiKey('');

      expect(mockSaveApiKey).toHaveBeenCalledWith('openai', '');
    });
  });
});
