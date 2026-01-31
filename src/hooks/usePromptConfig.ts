import { useCallback } from 'react';
import { usePromptStore } from '@/stores';
import type { PromptConfig } from '@/types/prompt';

// Keep event for backward compatibility during migration
// TODO: Remove custom event once all consumers use Zustand directly
export const PROMPT_CONFIG_LOADED_EVENT = 'promptConfigLoaded';

// Function to dispatch the prompt config loaded event
export const dispatchPromptConfigLoadedEvent = (config: PromptConfig) => {
  console.log("Dispatching prompt config loaded event with:", config);
  const event = new CustomEvent(PROMPT_CONFIG_LOADED_EVENT, { detail: config });
  window.dispatchEvent(event);
};

/**
 * Hook for managing prompt configuration state.
 * Now backed by Zustand store with automatic persistence.
 *
 * @param _initialConfig - Deprecated: Initial config is now ignored since Zustand handles persistence
 */
export const usePromptConfig = (_initialConfig?: PromptConfig) => {
  const {
    config: promptConfig,
    extraDetails,
    prefixText,
    setConfig,
    setExtraDetails,
    setPrefixText,
    resetConfig,
    loadConfig
  } = usePromptStore();

  // Maintain backward-compatible setter that accepts both values and updater functions
  const setPromptConfig = useCallback((
    newConfigOrUpdater: PromptConfig | ((prev: PromptConfig) => PromptConfig)
  ) => {
    if (typeof newConfigOrUpdater === 'function') {
      // Handle updater function pattern: setPromptConfig(prev => ({...prev, ...changes}))
      const updatedConfig = newConfigOrUpdater(promptConfig);
      setConfig(updatedConfig);
    } else {
      // Handle direct value pattern: setPromptConfig(newConfig)
      setConfig(newConfigOrUpdater);
    }
  }, [promptConfig, setConfig]);

  // Handle loading a complete config (from history, etc.)
  const handleLoadConfig = useCallback((config: PromptConfig) => {
    loadConfig(config);
    // Dispatch event for backward compatibility with components listening for this event
    dispatchPromptConfigLoadedEvent(config);
  }, [loadConfig]);

  return {
    promptConfig,
    setPromptConfig,
    extraDetails,
    setExtraDetails,
    prefixText,
    setPrefixText,
    resetConfig,
    loadConfig: handleLoadConfig,
    // isInitialized is always true with Zustand (sync hydration from localStorage)
    isInitialized: true,
  };
};
