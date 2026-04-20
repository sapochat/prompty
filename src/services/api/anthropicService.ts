import { PromptConfig } from '@/types/prompt';
import { toast } from 'sonner';
import { getApiKey as getProviderApiKey, saveApiKey as saveProviderApiKey, API_PROVIDERS } from '../apiKeyService';
import { logger } from '@/utils/logger';
import {
  fetchWithTimeout,
  generateCacheKey,
  getCachedPrompt,
  setCachedPrompt,
  createCachedResponse,
  createSuccessResponse,
  createMissingKeyResponse,
  handleApiError,
  cleanPromptText,
} from './apiUtils';
import { FLAT_SYSTEM_PROMPT, buildFlatUserPrompt } from './promptBuilder';

export const getApiKey = async (): Promise<string> => {
  return getProviderApiKey(API_PROVIDERS.ANTHROPIC);
};

export const saveApiKey = async (apiKey: string): Promise<void> => {
  return saveProviderApiKey(API_PROVIDERS.ANTHROPIC, apiKey);
};

export const generateAnthropicPrompt = async (config: PromptConfig) => {
  try {
    const cacheKey = generateCacheKey(config);
    const cached = getCachedPrompt('anthropic', cacheKey);
    if (cached) return createCachedResponse(cached);

    const apiKey = await getApiKey();
    if (!apiKey) return createMissingKeyResponse('Anthropic');

    const loadingToast = toast.loading('Generating prompt with Claude...');

    const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model || 'claude-sonnet-4-6',
        max_tokens: 800,
        temperature: 0.7,
        system: FLAT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildFlatUserPrompt(config) }],
      }),
    });

    toast.dismiss(loadingToast);

    if (!response.ok) {
      const errorData = await response.text();
      logger.error('Anthropic API error:', errorData);
      throw new Error('Error calling Anthropic API');
    }

    const data = await response.json();
    const generatedPrompt = cleanPromptText(data.content[0].text);

    setCachedPrompt('anthropic', cacheKey, generatedPrompt);
    return createSuccessResponse(generatedPrompt);
  } catch (error: unknown) {
    return handleApiError(error, 'Anthropic');
  }
};
