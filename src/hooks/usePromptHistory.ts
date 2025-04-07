
import { useState, useEffect, useRef, useCallback } from 'react';
import { GeneratedPrompt } from '@/types/prompt';
import { getHistory, deleteFromHistory, clearHistory } from '@/services/promptHistoryService';
import { toast } from 'sonner';
import { debounce } from 'lodash';

// Create a custom event for prompt generation
export const PROMPT_GENERATED_EVENT = 'promptGenerated';

// Function to dispatch the prompt generated event
export const dispatchPromptGeneratedEvent = () => {
  console.log("Dispatching prompt generated event");
  const event = new CustomEvent(PROMPT_GENERATED_EVENT);
  window.dispatchEvent(event);
};

export const usePromptHistory = () => {
  const [history, setHistory] = useState<GeneratedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const loadingRef = useRef(false);

  const loadHistory = useCallback(async () => {
    // Prevent multiple simultaneous loading attempts
    if (loadingRef.current) {
      console.log("Already loading prompt history, skipping");
      return;
    }

    try {
      setIsLoading(true);
      loadingRef.current = true;
      console.log("Loading prompt history");
      
      const loadedHistory = await getHistory();
      console.log("Loaded history:", loadedHistory);
      
      setHistory(loadedHistory);
      setIsInitialized(true);
    } catch (error) {
      console.error("Error loading history:", error);
      toast.error("Failed to load prompt history");
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Create a debounced version of loadHistory
  const debouncedLoadHistory = useCallback(
    debounce(() => {
      loadHistory();
    }, 300),
    [loadHistory]
  );

  useEffect(() => {
    // Load history initially
    loadHistory();

    // Set up event listener for prompt generation
    const handlePromptGenerated = () => {
      console.log("Prompt generated event received");
      debouncedLoadHistory();
    };

    window.addEventListener(PROMPT_GENERATED_EVENT, handlePromptGenerated);

    return () => {
      window.removeEventListener(PROMPT_GENERATED_EVENT, handlePromptGenerated);
    };
  }, [debouncedLoadHistory, loadHistory]);

  const handleDeletePrompt = async (id: string) => {
    try {
      await deleteFromHistory(id);
      await loadHistory();
      toast.info('Prompt deleted from history');
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast.error("Failed to delete prompt");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearHistory();
      await loadHistory();
      toast.info('All prompts cleared from history');
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Failed to clear history");
    }
  };

  return {
    history,
    isLoading,
    isInitialized,
    loadHistory,
    handleDeletePrompt,
    handleClearAll
  };
};
