
import { AIModel } from '@/types/prompt';
import { getApiKey as getOpenAIApiKey } from './api/openaiService';
import { getApiKey as getAnthropicApiKey } from './api/anthropicService';
import { getApiKey as getHuggingfaceApiKey } from './api/huggingfaceService';
import { getApiKey as getNovitaApiKey } from './api/novitaService';
import { getApiKey as getOpenRouterApiKey } from './api/openrouterService';

/**
 * List of all available models across all providers
 */
export const availableModels: AIModel[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT 3.5 Turbo',
    provider: 'openai',
    description: 'Fast and cost-effective for general tasks.',
    requiresApiKey: true,
  },
  {
    id: 'gpt-4',
    name: 'GPT 4',
    provider: 'openai',
    description: 'Powerful model for complex tasks.',
    requiresApiKey: true,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    description: 'Fast model with strong reasoning.',
    requiresApiKey: true,
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    provider: 'huggingface',
    description: 'Open-source model for creative tasks.',
    requiresApiKey: true,
  },
  {
    id: 'meta-llama/Llama-3.1-8B-Instruct',
    name: 'Llama 3.1 (8B)',
    provider: 'huggingface',
    description: 'Meta\'s model with strong reasoning.',
    requiresApiKey: true,
  },
  {
    id: 'Qwen/Qwen2.5-1.5B-Chat',
    name: 'Qwen 2.5 (1.5B)',
    provider: 'huggingface',
    description: 'Efficient model with multilingual support.',
    requiresApiKey: true,
  },
  {
    id: 'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
    name: 'Llama 4 Maverick (17B)',
    provider: 'novita',
    description: 'Advanced model for creative applications.',
    requiresApiKey: true,
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Google Gemini 2.0 Flash',
    provider: 'openrouter',
    description: 'Fast Google model via OpenRouter.',
    requiresApiKey: true,
  },
  {
    id: 'mistralai/ministral-8b',
    name: 'Mistral AI Ministral 8B',
    provider: 'openrouter',
    description: 'Efficient model with strong reasoning.',
    requiresApiKey: true,
  }
];

/**
 * Gets a list of enabled models from localStorage
 */
const getEnabledModels = async (): Promise<string[]> => {
  try {
    const savedModels = localStorage.getItem('enabledModels');
    if (savedModels) {
      return JSON.parse(savedModels);
    }
    // By default, enable all models
    return availableModels.map(model => model.id);
  } catch (error) {
    console.error("Error getting enabled models:", error);
    return availableModels.map(model => model.id);
  }
};

/**
 * Returns a list of available models based on API key availability and enabled status
 */
export const getAvailableModels = async (): Promise<AIModel[]> => {
  const openaiApiKey = await getOpenAIApiKey();
  const anthropicApiKey = await getAnthropicApiKey();
  const huggingfaceApiKey = await getHuggingfaceApiKey();
  const novitaApiKey = await getNovitaApiKey();
  const openrouterApiKey = await getOpenRouterApiKey();
  const enabledModels = await getEnabledModels();

  console.log("API keys status for model filtering:", { 
    openai: openaiApiKey ? "available" : "missing", 
    anthropic: anthropicApiKey ? "available" : "missing", 
    huggingface: huggingfaceApiKey ? "available" : "missing",
    novita: novitaApiKey ? "available" : "missing",
    openrouter: openrouterApiKey ? "available" : "missing"
  });
  
  console.log("Enabled models:", enabledModels);

  return availableModels.filter(model => {
    // Check if model is enabled
    if (!enabledModels.includes(model.id)) return false;
    
    // Check if provider API key is available
    if (model.provider === 'openai' && (!openaiApiKey || openaiApiKey.length === 0)) return false;
    if (model.provider === 'anthropic' && (!anthropicApiKey || anthropicApiKey.length === 0)) return false;
    if (model.provider === 'huggingface' && model.requiresApiKey && (!huggingfaceApiKey || huggingfaceApiKey.length === 0)) return false;
    if (model.provider === 'novita' && (!novitaApiKey || novitaApiKey.length === 0)) return false;
    if (model.provider === 'openrouter' && (!openrouterApiKey || openrouterApiKey.length === 0)) return false;
    
    return true;
  });
};

/**
 * Saves the list of enabled models to localStorage
 */
export const saveEnabledModels = async (modelIds: string[]): Promise<void> => {
  try {
    localStorage.setItem('enabledModels', JSON.stringify(modelIds));
  } catch (error) {
    console.error("Error saving enabled models:", error);
  }
};

/**
 * Gets a list of available providers based on API key availability
 */
export const getAvailableProviders = async (): Promise<string[]> => {
  const available = await getAvailableModels();
  return [...new Set(available.map(model => model.provider))];
};

/**
 * Gets a list of all providers regardless of API key availability
 */
export const getAllProviders = (): string[] => {
  return [...new Set(availableModels.map(model => model.provider))];
};
