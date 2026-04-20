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
  return getProviderApiKey(API_PROVIDERS.OPENAI);
};

export const saveApiKey = async (apiKey: string): Promise<void> => {
  return saveProviderApiKey(API_PROVIDERS.OPENAI, apiKey);
};

export const generateOpenAIPrompt = async (config: PromptConfig): Promise<ApiResponse | null> => {
  const cacheKey = generateCacheKey(config);
  const cached = getCachedPrompt('openai', cacheKey);
  if (cached) return createCachedResponse(cached);

  const apiKey = await getProviderApiKey(API_PROVIDERS.OPENAI);
  if (!apiKey) return createMissingKeyResponse('OpenAI');

  const loadingToast = toast.loading('Generating prompt with OpenAI...');
  try {
    const prompt = await callOpenAICompatibleChat({
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey,
      model: config.model || 'gpt-5.4-mini',
      systemPrompt: SECTIONED_SYSTEM_PROMPT,
      userPrompt: buildSectionedUserPrompt(config),
      temperature: 0.8,
      providerLabel: 'OpenAI',
    });
    setCachedPrompt('openai', cacheKey, prompt);
    return createSuccessResponse(prompt);
  } catch (error: unknown) {
    return handleApiError(error, 'OpenAI');
  } finally {
    toast.dismiss(loadingToast);
  }
};
