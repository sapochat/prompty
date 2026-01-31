import { useCallback } from 'react';
import { useGenerationStore } from '@/stores';
import { generatePrompt, getApiKey } from '@/services/promptService';
import { dispatchPromptGeneratedEvent } from './usePromptHistory';
import { Category, PromptConfig, PromptConfigWithCategories } from '@/types/prompt';
import { toast } from 'sonner';
import { availableModels } from '@/services/modelService';
import { getErrorMessage } from '@/utils/errorUtils';

/**
 * Hook for handling prompt generation with loading state and robust error handling.
 * Handles prompt validation, API key checks, and user feedback via toasts.
 * Now backed by Zustand store for generation state.
 */
export const usePromptGeneration = () => {
  const { isGenerating, setGenerating, setError } = useGenerationStore();

  const generatePromptHelper = useCallback(async (
    promptConfig: PromptConfig,
    extraDetails: string,
    prefixText: string,
    promptCategories: Category[],
    count: number = 1
  ) => {
    // Validate model selection
    if (!promptConfig.model) {
      toast.error("Please select a model before generating a prompt.");
      return;
    }

    const selectedModel = availableModels.find(model => model.id === promptConfig.model);

    if (!selectedModel) {
      toast.error("Please select a valid model from the list.");
      return;
    }

    // Check for API key
    const apiKey = await getApiKey(selectedModel.provider);
    if (!apiKey) {
      toast.error(`Missing API key: Please add your ${selectedModel.provider} API key in the header settings.`);
      return;
    }

    // Create a config object that includes all required properties
    const configForGeneration: PromptConfigWithCategories = {
      ...promptConfig,
      extraDetails,
      prefixText,
      promptCategories
    };

    setGenerating(true);
    setError(null);

    try {
      // Pass the complete config and categories separately
      const results = await generatePrompt(configForGeneration, promptCategories, count);

      if (results) {
        const errors = results.filter(r => r.error);
        const successfulResults = results.filter(r => !r.error);

        if (errors.length > 0) {
          errors.forEach(error => {
            toast.error(`Error generating prompt: ${error.error || 'Unknown error occurred.'}`);
          });
        }

        if (successfulResults.length > 0) {
          // Dispatch event for backward compatibility with components listening for new prompts
          dispatchPromptGeneratedEvent();

          if (count === 1) {
            toast.success("Prompt generated and added to history");
          } else {
            toast.success(`${successfulResults.length} prompts generated and added to history`);
          }
        }

        return results;
      }

      toast.error("Failed to generate prompt. Please try again.");
      return null;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      setError(message);

      // Handle network and unexpected errors
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        toast.error('Network error: Please check your internet connection and try again.');
      } else {
        toast.error(`Failed to generate prompt: ${message}`);
      }

      console.error("Error in handleGeneratePrompt:", error);
      return null;
    } finally {
      setGenerating(false);
    }
  }, [setGenerating, setError]);

  return {
    isGenerating,
    generatePromptHelper
  };
};
