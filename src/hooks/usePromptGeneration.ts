
import { useState, useCallback } from 'react';
import { generatePrompt, getApiKey } from '@/services/promptService';
import { Category, PromptConfig, PromptConfigWithCategories } from '@/types/prompt';
import { toast } from 'sonner';
import { availableModels } from '@/services/modelService';

/**
 * Hook for handling prompt generation with loading state and error handling
 */
export const usePromptGeneration = () => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  const generatePromptHelper = useCallback(async (
    promptConfig: PromptConfig,
    extraDetails: string,
    prefixText: string,
    promptCategories: Category[],
    count: number = 1
  ) => {
    if (!promptConfig.model) {
      toast.error("Please select a model");
      return;
    }
    
    const selectedModel = availableModels.find(model => model.id === promptConfig.model);
    
    if (!selectedModel) {
      toast.error("Please select a valid model");
      return;
    }
    
    const apiKey = await getApiKey(selectedModel.provider);
    if (!apiKey) {
      toast.error(`Please add your ${selectedModel.provider} API key in the header settings`);
      return;
    }

    // Create a config object that includes all required properties
    const configForGeneration: PromptConfigWithCategories = {
      ...promptConfig,
      extraDetails,
      prefixText,
      promptCategories // Now this is properly typed
    };
    
    setIsGenerating(true);
    
    try {
      // Pass the complete config and categories separately
      const results = await generatePrompt(configForGeneration, promptCategories, count);
      
      if (results) {
        const errors = results.filter(r => r.error);
        
        if (errors.length > 0) {
          errors.forEach(error => {
            toast.error(`Error generating prompt: ${error.error}`);
          });
        } else {
          if (count === 1) {
            toast.success("Prompt generated and added to history");
          } else {
            toast.success(`${count} prompts generated and added to history`);
          }
        }
      }
    } catch (error) {
      console.error("Error in handleGeneratePrompt:", error);
      toast.error(`Failed to generate prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    generatePromptHelper
  };
};
