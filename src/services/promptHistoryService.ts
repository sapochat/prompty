import { GeneratedPrompt, PromptConfig } from '@/types/prompt';
import { dispatchPromptGeneratedEvent } from "@/hooks/usePromptHistory";
import { logger } from '@/utils/logger';

/**
 * Save a generated prompt to local history.
 * Prompts are stored in localStorage as an array.
 * Handles errors gracefully and dispatches a custom event on success.
 */
export const savePromptToHistory = async (
  prompt: string,
  config: PromptConfig,
  modelUsed: string,
  batchId?: string
) => {
  try {
    // Using localStorage for prompt history
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]') as GeneratedPrompt[];
    const newPrompt = {
      id: crypto.randomUUID(),
      prompt: prompt,
      config: config,
      timestamp: Date.now(),
      modelUsed: modelUsed,
      batchId: batchId
    };
    history.unshift(newPrompt);
    localStorage.setItem('promptHistory', JSON.stringify(history));
    logger.log("Prompt saved to local history:", newPrompt);
    dispatchPromptGeneratedEvent();
  } catch (error) {
    logger.error("Error saving prompt to history:", error);
  }
};

/**
 * Get prompt history from localStorage
 */
export const getHistory = async (): Promise<GeneratedPrompt[]> => {
  try {
    // Get history from localStorage
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    logger.log("Retrieved history from localStorage:", history);
    return history;
  } catch (error) {
    logger.error("Error retrieving history:", error);
    return [];
  }
};

/**
 * Delete a prompt from history by ID
 */
export const deleteFromHistory = async (id: string): Promise<void> => {
  try {
    // Remove from localStorage
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    const updatedHistory = history.filter((item: GeneratedPrompt) => item.id !== id);
    localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));
  } catch (error) {
    logger.error("Error deleting from history:", error);
  }
};

/**
 * Clear entire prompt history
 */
export const clearHistory = async (): Promise<void> => {
  try {
    // Clear localStorage history
    localStorage.setItem('promptHistory', '[]');
  } catch (error) {
    logger.error("Error clearing history:", error);
  }
};
