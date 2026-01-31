import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getHistory, savePromptToHistory, deleteFromHistory, clearHistory } from './promptHistoryService';

// Mock the dispatchPromptGeneratedEvent function
vi.mock('@/hooks/usePromptHistory', () => ({
  dispatchPromptGeneratedEvent: vi.fn(),
}));

// Mock the logger
vi.mock('@/utils/logger', () => ({
  logger: {
    log: vi.fn(),
  },
}));

describe('promptHistoryService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getHistory', () => {
    it('returns empty array when no history exists', async () => {
      const history = await getHistory();
      expect(history).toEqual([]);
    });

    it('returns saved history', async () => {
      const mockHistory = [
        { id: '1', prompt: 'test prompt', config: {}, timestamp: Date.now(), modelUsed: 'gpt-4' }
      ];
      localStorage.setItem('promptHistory', JSON.stringify(mockHistory));

      const history = await getHistory();
      expect(history).toEqual(mockHistory);
    });

    it('handles multiple history items', async () => {
      const mockHistory = [
        { id: '1', prompt: 'first prompt', config: {}, timestamp: Date.now(), modelUsed: 'gpt-4' },
        { id: '2', prompt: 'second prompt', config: { style: ['abstract'] }, timestamp: Date.now() - 1000, modelUsed: 'claude-3' }
      ];
      localStorage.setItem('promptHistory', JSON.stringify(mockHistory));

      const history = await getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].id).toBe('1');
      expect(history[1].id).toBe('2');
    });
  });

  describe('savePromptToHistory', () => {
    it('adds prompt to empty history', async () => {
      await savePromptToHistory('test prompt', {}, 'gpt-4');

      const history = await getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].prompt).toBe('test prompt');
      expect(history[0].modelUsed).toBe('gpt-4');
    });

    it('prepends new prompt to existing history', async () => {
      await savePromptToHistory('first prompt', {}, 'gpt-4');
      await savePromptToHistory('second prompt', {}, 'gpt-4');

      const history = await getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].prompt).toBe('second prompt');
      expect(history[1].prompt).toBe('first prompt');
    });

    it('generates unique IDs for each prompt', async () => {
      await savePromptToHistory('prompt 1', {}, 'gpt-4');
      await savePromptToHistory('prompt 2', {}, 'gpt-4');

      const history = await getHistory();
      expect(history[0].id).not.toBe(history[1].id);
    });

    it('saves config with the prompt', async () => {
      const config = { style: ['abstract'], mood: ['calm'] };
      await savePromptToHistory('test prompt', config, 'gpt-4');

      const history = await getHistory();
      expect(history[0].config).toEqual(config);
    });

    it('includes timestamp in saved prompt', async () => {
      const beforeTime = Date.now();
      await savePromptToHistory('test prompt', {}, 'gpt-4');
      const afterTime = Date.now();

      const history = await getHistory();
      expect(history[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(history[0].timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('saves batchId when provided', async () => {
      await savePromptToHistory('batch prompt', {}, 'gpt-4', 'batch-123');

      const history = await getHistory();
      expect(history[0].batchId).toBe('batch-123');
    });

    it('saves prompt without batchId when not provided', async () => {
      await savePromptToHistory('regular prompt', {}, 'gpt-4');

      const history = await getHistory();
      expect(history[0].batchId).toBeUndefined();
    });
  });

  describe('deleteFromHistory', () => {
    it('removes prompt by id', async () => {
      await savePromptToHistory('test', {}, 'gpt-4');
      const history = await getHistory();
      const id = history[0].id;

      await deleteFromHistory(id);

      const updatedHistory = await getHistory();
      expect(updatedHistory).toHaveLength(0);
    });

    it('does nothing for non-existent id', async () => {
      await savePromptToHistory('test', {}, 'gpt-4');

      await deleteFromHistory('non-existent-id');

      const history = await getHistory();
      expect(history).toHaveLength(1);
    });

    it('removes only the specified prompt', async () => {
      await savePromptToHistory('first', {}, 'gpt-4');
      await savePromptToHistory('second', {}, 'gpt-4');
      await savePromptToHistory('third', {}, 'gpt-4');

      const history = await getHistory();
      const secondId = history[1].id;

      await deleteFromHistory(secondId);

      const updatedHistory = await getHistory();
      expect(updatedHistory).toHaveLength(2);
      expect(updatedHistory.map(h => h.prompt)).toEqual(['third', 'first']);
    });
  });

  describe('clearHistory', () => {
    it('removes all prompts', async () => {
      await savePromptToHistory('test1', {}, 'gpt-4');
      await savePromptToHistory('test2', {}, 'gpt-4');

      await clearHistory();

      const history = await getHistory();
      expect(history).toHaveLength(0);
    });

    it('works on empty history', async () => {
      await clearHistory();

      const history = await getHistory();
      expect(history).toHaveLength(0);
    });
  });
});
