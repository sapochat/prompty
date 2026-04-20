import { AIModel } from '@/types/prompt';
import { getApiKey as getOpenAIApiKey } from './api/openaiService';
import { getApiKey as getAnthropicApiKey } from './api/anthropicService';
import { getApiKey as getHuggingfaceApiKey } from './api/huggingfaceService';
import { getApiKey as getNovitaApiKey } from './api/novitaService';
import { getApiKey as getOpenRouterApiKey } from './api/openrouterService';
import { logger } from '@/utils/logger';

/**
 * List of all available models across all providers
 */
export const availableModels: AIModel[] = [
  // OpenAI models
  {
    id: 'gpt-5.4-nano',
    name: 'GPT-5.4 Nano',
    provider: 'openai',
    description: 'Fast and efficient for quick tasks.',
    requiresApiKey: true,
  },
  {
    id: 'gpt-5.4-mini',
    name: 'GPT-5.4 Mini',
    provider: 'openai',
    description: 'Balanced performance for most tasks.',
    requiresApiKey: true,
  },
  {
    id: 'gpt-5.4',
    name: 'GPT-5.4',
    provider: 'openai',
    description: 'Most capable model for complex tasks.',
    requiresApiKey: true,
  },
  // Anthropic models
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    description: 'Fastest Claude model for quick responses.',
    requiresApiKey: true,
  },
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    description: 'Balanced intelligence and speed.',
    requiresApiKey: true,
  },
  {
    id: 'claude-opus-4-7',
    name: 'Claude Opus 4.7',
    provider: 'anthropic',
    description: 'Most intelligent Claude model.',
    requiresApiKey: true,
  },
  // HuggingFace models
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    name: 'Mistral 7B v0.3',
    provider: 'huggingface',
    description: 'Fast open-source model.',
    requiresApiKey: true,
  },
  {
    id: 'meta-llama/Meta-Llama-3-8B-Instruct',
    name: 'Llama 3 8B',
    provider: 'huggingface',
    description: 'Balanced Meta model.',
    requiresApiKey: true,
  },
  {
    id: 'Qwen/Qwen2.5-72B-Instruct',
    name: 'Qwen 2.5 72B',
    provider: 'huggingface',
    description: 'Powerful multilingual model.',
    requiresApiKey: true,
  },
  // Novita models
  {
    id: 'meta-llama/llama-3.2-3b-instruct',
    name: 'Llama 3.2 3B',
    provider: 'novita',
    description: 'Fast and lightweight.',
    requiresApiKey: true,
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: 'novita',
    description: 'Balanced large model.',
    requiresApiKey: true,
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B',
    provider: 'novita',
    description: 'Latest Llama 4 model.',
    requiresApiKey: true,
  },
  // OpenRouter models
  {
    id: 'google/gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    provider: 'openrouter',
    description: 'Fast Google model.',
    requiresApiKey: true,
  },
  {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    provider: 'openrouter',
    description: 'Balanced Gemini model.',
    requiresApiKey: true,
  },
  {
    id: 'google/gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: 'openrouter',
    description: 'Most capable Gemini model.',
    requiresApiKey: true,
  },
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
    logger.error("Error getting enabled models:", error);
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

  logger.log("API keys status for model filtering:", {
    openai: openaiApiKey ? "available" : "missing",
    anthropic: anthropicApiKey ? "available" : "missing",
    huggingface: huggingfaceApiKey ? "available" : "missing",
    novita: novitaApiKey ? "available" : "missing",
    openrouter: openrouterApiKey ? "available" : "missing"
  });

  logger.log("Enabled models:", enabledModels);

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
    logger.error("Error saving enabled models:", error);
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
