import { describe, it, expect, beforeEach } from 'vitest';
import { useHistoryStore } from './historyStore';

describe('historyStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useHistoryStore.setState({ history: [] });
  });

  describe('initial state', () => {
    it('starts with empty history', () => {
      const { history } = useHistoryStore.getState();
      expect(history).toEqual([]);
    });
  });

  describe('addPrompt', () => {
    it('adds a prompt to history', () => {
      const { addPrompt } = useHistoryStore.getState();

      addPrompt('test prompt', { style: ['abstract'] }, 'GPT-4');

      const { history } = useHistoryStore.getState();
      expect(history).toHaveLength(1);
      expect(history[0].prompt).toBe('test prompt');
      expect(history[0].modelUsed).toBe('GPT-4');
      expect(history[0].config).toEqual({ style: ['abstract'] });
    });

    it('prepends new prompts (most recent first)', () => {
      const { addPrompt } = useHistoryStore.getState();

      addPrompt('first', {}, 'model');
      addPrompt('second', {}, 'model');

      const { history } = useHistoryStore.getState();
      expect(history[0].prompt).toBe('second');
      expect(history[1].prompt).toBe('first');
    });

    it('generates unique IDs for each prompt', () => {
      const { addPrompt } = useHistoryStore.getState();

      addPrompt('prompt 1', {}, 'model');
      addPrompt('prompt 2', {}, 'model');

      const { history } = useHistoryStore.getState();
      expect(history[0].id).not.toBe(history[1].id);
    });

    it('supports batch IDs', () => {
      const { addPrompt } = useHistoryStore.getState();

      addPrompt('batch prompt', {}, 'model', 'batch-123');

      const { history } = useHistoryStore.getState();
      expect(history[0].batchId).toBe('batch-123');
    });

    it('includes timestamp in added prompt', () => {
      const { addPrompt } = useHistoryStore.getState();
      const beforeTime = Date.now();

      addPrompt('test', {}, 'model');

      const afterTime = Date.now();
      const { history } = useHistoryStore.getState();
      expect(history[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(history[0].timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('preserves existing history when adding new prompt', () => {
      const { addPrompt } = useHistoryStore.getState();

      addPrompt('existing prompt', {}, 'model');
      addPrompt('new prompt', {}, 'model');

      const { history } = useHistoryStore.getState();
      expect(history).toHaveLength(2);
      expect(history.map(h => h.prompt)).toContain('existing prompt');
      expect(history.map(h => h.prompt)).toContain('new prompt');
    });
  });

  describe('removePrompt', () => {
    it('removes a prompt by id', () => {
      const { addPrompt, removePrompt } = useHistoryStore.getState();

      addPrompt('test', {}, 'model');
      const { history: before } = useHistoryStore.getState();
      const id = before[0].id;

      removePrompt(id);

      const { history: after } = useHistoryStore.getState();
      expect(after).toHaveLength(0);
    });

    it('does nothing for non-existent id', () => {
      const { addPrompt, removePrompt } = useHistoryStore.getState();

      addPrompt('test', {}, 'model');

      removePrompt('non-existent-id');

      const { history } = useHistoryStore.getState();
      expect(history).toHaveLength(1);
    });

    it('removes only the specified prompt', () => {
      const { addPrompt, removePrompt } = useHistoryStore.getState();

      addPrompt('first', {}, 'model');
      addPrompt('second', {}, 'model');
      addPrompt('third', {}, 'model');

      const { history: before } = useHistoryStore.getState();
      const secondId = before[1].id;

      removePrompt(secondId);

      const { history: after } = useHistoryStore.getState();
      expect(after).toHaveLength(2);
      expect(after.map(h => h.prompt)).toEqual(['third', 'first']);
    });
  });

  describe('clearHistory', () => {
    it('removes all prompts', () => {
      const { addPrompt, clearHistory } = useHistoryStore.getState();

      addPrompt('one', {}, 'model');
      addPrompt('two', {}, 'model');

      clearHistory();

      const { history } = useHistoryStore.getState();
      expect(history).toHaveLength(0);
    });

    it('works on empty history', () => {
      const { clearHistory } = useHistoryStore.getState();

      clearHistory();

      const { history } = useHistoryStore.getState();
      expect(history).toHaveLength(0);
    });

    it('allows adding prompts after clearing', () => {
      const { addPrompt, clearHistory } = useHistoryStore.getState();

      addPrompt('before clear', {}, 'model');
      clearHistory();
      addPrompt('after clear', {}, 'model');

      const { history } = useHistoryStore.getState();
      expect(history).toHaveLength(1);
      expect(history[0].prompt).toBe('after clear');
    });
  });
});
