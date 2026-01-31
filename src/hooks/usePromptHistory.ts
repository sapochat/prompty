import { useCallback } from 'react';
import { useHistoryStore } from '@/stores';
import { toast } from 'sonner';
import type { PromptConfig } from '@/types/prompt';

// Keep event for backward compatibility during migration
// TODO: Remove custom event once all consumers use Zustand directly
export const PROMPT_GENERATED_EVENT = 'promptGenerated';

// Function to dispatch the prompt generated event
export const dispatchPromptGeneratedEvent = () => {
  console.log("Dispatching prompt generated event");
  const event = new CustomEvent(PROMPT_GENERATED_EVENT);
  window.dispatchEvent(event);
};

/**
 * Hook for managing prompt history state.
 * Now backed by Zustand store with automatic persistence.
 */
export const usePromptHistory = () => {
  const { history, addPrompt, removePrompt, clearHistory } = useHistoryStore();

  const handleDeletePrompt = useCallback((id: string) => {
    removePrompt(id);
    toast.info('Prompt deleted from history');
  }, [removePrompt]);

  const handleClearAll = useCallback(() => {
    clearHistory();
    toast.info('All prompts cleared from history');
  }, [clearHistory]);

  // Save a new prompt to history
  const savePrompt = useCallback((
    prompt: string,
    config: PromptConfig,
    modelUsed: string,
    batchId?: string
  ) => {
    addPrompt(prompt, config, modelUsed, batchId);
  }, [addPrompt]);

  // Backward-compatible loadHistory function (now a no-op since Zustand handles persistence)
  const loadHistory = useCallback(() => {
    // No-op: Zustand persist middleware handles loading automatically
    console.log("loadHistory called - Zustand handles persistence automatically");
  }, []);

  return {
    history,
    // isLoading is always false with Zustand (sync operations)
    isLoading: false,
    // isInitialized is always true with Zustand (sync hydration from localStorage)
    isInitialized: true,
    loadHistory,
    handleDeletePrompt,
    handleClearAll,
    savePrompt,
  };
};
