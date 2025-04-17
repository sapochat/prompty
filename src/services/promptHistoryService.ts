import { GeneratedPrompt, PromptConfig } from '@/types/prompt';
import { v4 as uuidv4 } from 'uuid';
import { dispatchPromptGeneratedEvent } from "@/hooks/usePromptHistory";

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
      id: uuidv4(),
      prompt: prompt,
      config: config,
      timestamp: Date.now(),
      modelUsed: modelUsed,
      batchId: batchId
    };
    history.unshift(newPrompt);
    localStorage.setItem('promptHistory', JSON.stringify(history));
    console.log("Prompt saved to local history:", newPrompt);
    dispatchPromptGeneratedEvent();
  } catch (error) {
    console.error("Error saving prompt to history:", error);
  }
};

/**
 * Get prompt history from localStorage
 */
export const getHistory = async (): Promise<GeneratedPrompt[]> => {
  try {
    // Get history from localStorage
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    console.log("Retrieved history from localStorage:", history);
    return history;
  } catch (error) {
    console.error("Error retrieving history:", error);
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
    console.error("Error deleting from history:", error);
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
    console.error("Error clearing history:", error);
  }
};
