
import { useState, useEffect, useCallback } from 'react';
import { PromptConfig } from '@/types/prompt';
import { getUserConfig, saveUserConfig } from '@/services/promptService';
import { getDefaultConfig } from '@/components/category/CategoryUtils';

// Create a custom event for prompt config loading
export const PROMPT_CONFIG_LOADED_EVENT = 'promptConfigLoaded';

// Function to dispatch the prompt config loaded event
export const dispatchPromptConfigLoadedEvent = (config: PromptConfig) => {
  console.log("Dispatching prompt config loaded event with:", config);
  const event = new CustomEvent(PROMPT_CONFIG_LOADED_EVENT, { detail: config });
  window.dispatchEvent(event);
};

export const usePromptConfig = (initialConfig?: PromptConfig) => {
  const [promptConfig, setPromptConfig] = useState<PromptConfig>(initialConfig || getDefaultConfig());
  const [extraDetails, setExtraDetails] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load user config initially
  const loadUserConfig = useCallback(async () => {
    if (initialConfig) {
      setExtraDetails(initialConfig.extraDetails || '');
      setIsInitialized(true);
      return;
    }

    try {
      const config = await getUserConfig();
      if (config) {
        console.log("Loaded user config:", config);
        setPromptConfig(prev => ({
          ...prev,
          ...config,
          model: config.model || prev.model,
        }));
        
        if (config.extraDetails) {
          setExtraDetails(config.extraDetails);
        }
      } else {
        console.log("No user config found, using default config");
      }
    } catch (error) {
      console.error("Error loading user config:", error);
    } finally {
      setIsInitialized(true);
    }
  }, [initialConfig]);

  // Save prompt config when it changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const saveConfig = async () => {
      try {
        const configToSave = {
          ...promptConfig,
          extraDetails,
        };
        
        await saveUserConfig(configToSave);
        console.log("Saved user config:", configToSave);
      } catch (error) {
        console.error("Error saving user config:", error);
      }
    };
    
    const timeoutId = setTimeout(saveConfig, 1000);
    return () => clearTimeout(timeoutId);
  }, [promptConfig, extraDetails, isInitialized]);

  // Handle the promptConfigLoaded event
  useEffect(() => {
    const handlePromptConfigLoaded = (event: CustomEvent<PromptConfig>) => {
      console.log("Prompt config loaded event received with config:", event.detail);
      const config = event.detail;
      
      setPromptConfig(prev => ({
        ...prev,
        ...config,
        model: config.model || prev.model,
      }));
      
      setExtraDetails(config.extraDetails || '');
    };

    // Add event listener
    window.addEventListener(
      PROMPT_CONFIG_LOADED_EVENT, 
      handlePromptConfigLoaded as EventListener
    );

    // Initial load
    loadUserConfig();

    return () => {
      window.removeEventListener(
        PROMPT_CONFIG_LOADED_EVENT, 
        handlePromptConfigLoaded as EventListener
      );
    };
  }, [loadUserConfig]);

  return {
    promptConfig,
    setPromptConfig,
    extraDetails,
    setExtraDetails,
    isInitialized
  };
};
