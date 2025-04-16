import { AIModel, ApiResponse, PromptConfig, PromptConfigWithCategories, Category } from '@/types/prompt';
import { dispatchPromptGeneratedEvent } from "@/hooks/usePromptHistory";
import { getAvailableModels, availableModels, saveEnabledModels } from './modelService';
import { generateOpenAIPrompt, saveApiKey as saveOpenAIApiKey, getApiKey as getOpenAIApiKey } from './api/openaiService';
import { generateAnthropicPrompt, saveApiKey as saveAnthropicApiKey, getApiKey as getAnthropicApiKey } from './api/anthropicService';
import { generateHuggingfacePrompt, saveApiKey as saveHuggingfaceApiKey, getApiKey as getHuggingfaceApiKey } from './api/huggingfaceService';
import { generateNovitaPrompt, saveApiKey as saveNovitaApiKey, getApiKey as getNovitaApiKey } from './api/novitaService';
import { generateOpenRouterPrompt, saveApiKey as saveOpenRouterApiKey, getApiKey as getOpenRouterApiKey } from './api/openrouterService';
import { getHistory, deleteFromHistory, clearHistory, savePromptToHistory } from './promptHistoryService';
import { getDefaultConfig } from '@/components/category/CategoryUtils';
import { v4 as uuidv4 } from 'uuid';

// Re-export all the functions and constants for backward compatibility
export { 
  availableModels,
  getAvailableModels,
  getHistory,
  deleteFromHistory,
  clearHistory,
  saveEnabledModels
};

/**
 * Gets the API key for the specified provider
 */
export const getApiKey = async (provider: string): Promise<string> => {
  if (provider === 'openai') {
    return await getOpenAIApiKey();
  }
  if (provider === 'anthropic') {
    return await getAnthropicApiKey();
  }
  if (provider === 'huggingface') {
    return await getHuggingfaceApiKey();
  }
  if (provider === 'novita') {
    return await getNovitaApiKey();
  }
  if (provider === 'openrouter') {
    return await getOpenRouterApiKey();
  }
  return '';
};

/**
 * Saves the API key for the specified provider
 */
export const saveApiKey = async (provider: string, apiKey: string): Promise<void> => {
  if (provider === 'openai') {
    await saveOpenAIApiKey(apiKey);
  }
  if (provider === 'anthropic') {
    await saveAnthropicApiKey(apiKey);
  }
  if (provider === 'huggingface') {
    await saveHuggingfaceApiKey(apiKey);
  }
  if (provider === 'novita') {
    await saveNovitaApiKey(apiKey);
  }
  if (provider === 'openrouter') {
    await saveOpenRouterApiKey(apiKey);
  }
};

/**
 * Gets a list of all available providers based on API key availability
 */
export const getAvailableProviders = async (): Promise<string[]> => {
  const available = await getAvailableModels();
  return [...new Set(available.map(model => model.provider))];
};

/**
 * Saves the list of enabled providers to localStorage
 */
export const saveEnabledProviders = async (providers: string[]): Promise<void> => {
  try {
    localStorage.setItem('enabledProviders', JSON.stringify(providers));
  } catch (error) {
    console.error("Error saving enabled providers:", error);
  }
};

/**
 * Generates a prompt using the selected model and configuration
 */
export const generatePrompt = async (
  config: PromptConfigWithCategories,
  promptCategories: Category[],
  count: number = 1
): Promise<ApiResponse[] | null> => {
  const model = availableModels.find(m => m.id === config.model);

  if (!model) {
    console.error("Model not found");
    return null;
  }

  // If promptCategories is not in config but is provided as a separate argument,
  // make sure to include it in the config
  const enhancedConfig: any = {
    ...config,
    promptCategories: config.promptCategories || promptCategories
  };
  
  // Log the categories to verify they're being passed correctly
  console.log(`Generating prompt with model ${model.provider} (${model.id}) and ${enhancedConfig.promptCategories?.length || 0} categories`);

  const batchId = count > 1 ? uuidv4() : undefined;
  const results: ApiResponse[] = [];
  
  for (let i = 0; i < count; i++) {
    let result = null;
    
    // Add slight variation to config for each batch item to ensure different results
    const batchConfig: any = { ...enhancedConfig };
    
    if (count > 1 && i > 0) {
      // For second and third items in batch, add variation hints to ensure different outputs
      const variationHint = i === 1 ? 
        "Please provide a completely different variation with alternative elements and style." : 
        "Please create a third distinct variation with unique elements and approach.";
      
      batchConfig.extraDetails = batchConfig.extraDetails ? 
        `${batchConfig.extraDetails} [Batch variation ${i+1}/${count}: ${variationHint}]` : 
        `[Batch variation ${i+1}/${count}: ${variationHint}]`;
    }
    
    if (model.provider === 'openai') {
      result = await generateOpenAIPrompt(batchConfig);
    } else if (model.provider === 'anthropic') {
      result = await generateAnthropicPrompt(batchConfig);
    } else if (model.provider === 'huggingface') {
      result = await generateHuggingfacePrompt(batchConfig);
    } else if (model.provider === 'novita') {
      result = await generateNovitaPrompt(batchConfig);
    } else if (model.provider === 'openrouter') {
      result = await generateOpenRouterPrompt(batchConfig);
    } else {
      console.error("Provider not supported");
      continue;
    }
    
    if (result) {
      results.push(result);
      
      if (!result.error) {
        // Save the prompt to history for all providers
        // Extract a clean PromptConfig without promptCategories for history storage
        const historyConfig: PromptConfig = { ...config };
        // Need to delete promptCategories because it's not in the PromptConfig type
        if ('promptCategories' in historyConfig) {
          delete (historyConfig as any).promptCategories;
        }
        
        await savePromptToHistory(result.prompt, historyConfig, model.name, batchId);
      }
    }
  }
  
  if (results.length > 0 && !results.some(r => r.error)) {
    dispatchPromptGeneratedEvent();
  }
  
  return results.length > 0 ? results : null;
};

// User preferences management

/**
 * Gets the user's theme preference
 */
export const getUserTheme = async (): Promise<string> => {
  try {
    return localStorage.getItem('theme') || 'system';
  } catch (error) {
    console.error("Error retrieving theme:", error);
    return 'system';
  }
};

/**
 * Saves the user's theme preference
 */
export const saveUserTheme = async (theme: string): Promise<void> => {
  try {
    localStorage.setItem('theme', theme);
  } catch (error) {
    console.error("Error saving theme:", error);
  }
};

/**
 * Gets the user's prompt configuration
 */
export const getUserConfig = async (): Promise<PromptConfig | null> => {
  try {
    // First, check session storage for the loaded prompt config
    const loadedConfig = sessionStorage.getItem('loadPromptConfig');
    if (loadedConfig) {
      // Clear the session storage after loading
      sessionStorage.removeItem('loadPromptConfig');
      return JSON.parse(loadedConfig);
    }
    
    // Try to get from localStorage
    const configStr = localStorage.getItem('userConfig');
    if (configStr) {
      return JSON.parse(configStr) as PromptConfig;
    }
    
    // Return null if no config found
    return null;
  } catch (error) {
    console.error("Error retrieving user config:", error);
    return null;
  }
};

/**
 * Saves the user's prompt configuration
 */
export const saveUserConfig = async (config: PromptConfig): Promise<void> => {
  try {
    localStorage.setItem('userConfig', JSON.stringify(config));
  } catch (error) {
    console.error("Error saving user config:", error);
  }
};
