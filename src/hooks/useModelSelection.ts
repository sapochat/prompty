
import { useState, useEffect, useCallback } from 'react';
import { AIModel } from '@/types/prompt';
import { getAvailableModels, availableModels } from '@/services/modelService';

/**
 * Hook for handling model selection and filtering
 */
export const useModelSelection = (initialModelId?: string) => {
  const [isLoadingKeys, setIsLoadingKeys] = useState<boolean>(true);
  const [filteredModels, setFilteredModels] = useState<typeof availableModels>([]);
  
  // Group models by provider for display in UI
  const modelsByProvider = filteredModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, typeof availableModels>);

  // Get list of available providers
  const availableProvidersList = Object.keys(modelsByProvider);

  // Load available models based on API keys
  const loadApiKeys = useCallback(async () => {
    setIsLoadingKeys(true);
    try {
      const models = await getAvailableModels();
      console.log("Available models:", models.map(m => m.id).join(", "));
      setFilteredModels(models);
      return models;
    } catch (error) {
      console.error("Error loading API keys:", error);
      return [];
    } finally {
      setIsLoadingKeys(false);
    }
  }, []);

  // Initial load of models
  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  return {
    isLoadingKeys,
    filteredModels,
    modelsByProvider,
    availableProvidersList,
    loadApiKeys  // Expose this function to allow reloading models from outside
  };
};
