import { ApiResponse, PromptConfig } from '@/types/prompt';
import { toast } from 'sonner';
import { getApiKey as getProviderApiKey, saveApiKey as saveProviderApiKey, API_PROVIDERS } from '../apiKeyService';
import {
  callOpenAICompatibleChat,
  generateCacheKey,
  getCachedPrompt,
  setCachedPrompt,
  createCachedResponse,
  createSuccessResponse,
  createMissingKeyResponse,
  handleApiError,
} from './apiUtils';
import { SECTIONED_SYSTEM_PROMPT, buildSectionedUserPrompt } from './promptBuilder';

export const getApiKey = async (): Promise<string> => {
  return getProviderApiKey(API_PROVIDERS.OPENROUTER);
};

export const saveApiKey = async (apiKey: string): Promise<void> => {
  return saveProviderApiKey(API_PROVIDERS.OPENROUTER, apiKey);
};

export const generateOpenRouterPrompt = async (config: PromptConfig): Promise<ApiResponse | null> => {
  const cacheKey = generateCacheKey(config);
  const cached = getCachedPrompt('openrouter', cacheKey);
  if (cached) return createCachedResponse(cached);

  const apiKey = await getApiKey();
  if (!apiKey) return createMissingKeyResponse('OpenRouter');

  const loadingToast = toast.loading('Generating prompt with OpenRouter...');
  try {
    let prompt = await callOpenAICompatibleChat({
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey,
      model: config.model || 'google/gemini-3-pro-preview',
      systemPrompt: SECTIONED_SYSTEM_PROMPT,
      userPrompt: buildSectionedUserPrompt(config),
      temperature: 0.8,
      extraHeaders: {
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Prompty',
      },
      providerLabel: 'OpenRouter',
    });

    if (config.prefixText && config.prefixText.trim()) {
      prompt = `${config.prefixText.trim()} ${prompt}`;
    }

    setCachedPrompt('openrouter', cacheKey, prompt);
    return createSuccessResponse(prompt);
  } catch (error: unknown) {
    return handleApiError(error, 'OpenRouter');
  } finally {
    toast.dismiss(loadingToast);
  }
};
