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

// Inference Providers router. The legacy `api-inference.huggingface.co`
// endpoint was retired as part of HF's 2026 serverless migration; the router
// below speaks OpenAI-compatible chat completions and auto-selects a supported
// provider when the model id is suffixed with `:auto`.
const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';

export const getApiKey = async (): Promise<string> => {
  return getProviderApiKey(API_PROVIDERS.HUGGINGFACE);
};

export const saveApiKey = async (apiKey: string): Promise<void> => {
  return saveProviderApiKey(API_PROVIDERS.HUGGINGFACE, apiKey);
};

export const generateHuggingfacePrompt = async (config: PromptConfig): Promise<ApiResponse | null> => {
  const cacheKey = generateCacheKey(config);
  const cached = getCachedPrompt('huggingface', cacheKey);
  if (cached) return createCachedResponse(cached);

  const apiKey = await getApiKey();
  if (!apiKey) return createMissingKeyResponse('HuggingFace');

  const loadingToast = toast.loading('Generating prompt with Huggingface...');
  try {
    const baseModel = config.model || 'mistralai/Mistral-7B-Instruct-v0.3';
    // `:auto` lets HF pick any supported Inference Provider for the model.
    const routedModel = baseModel.includes(':') ? baseModel : `${baseModel}:auto`;

    const prompt = await callOpenAICompatibleChat({
      endpoint: HF_ROUTER_URL,
      apiKey,
      model: routedModel,
      systemPrompt: SECTIONED_SYSTEM_PROMPT,
      userPrompt: buildSectionedUserPrompt(config),
      temperature: 0.7,
      providerLabel: 'HuggingFace',
    });

    setCachedPrompt('huggingface', cacheKey, prompt);
    return createSuccessResponse(prompt);
  } catch (error: unknown) {
    return handleApiError(error, 'HuggingFace');
  } finally {
    toast.dismiss(loadingToast);
  }
};
