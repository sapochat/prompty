import { ApiResponse, PromptConfigWithCategories } from '@/types/prompt';
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
} from './apiUtils';
import { buildSectionedUserPrompt } from './promptBuilder';

const NOVITA_API_URL = 'https://api.novita.ai/v3/openai/chat/completions';

/**
 * Llama-specific response cleanup. Novita's Llama endpoints emit special
 * tokens, meta-commentary, and self-evaluation sections that the generic
 * cleanPromptText doesn't cover.
 */
function cleanLlamaResponse(text: string): string {
  let cleaned = text;

  const specialTokenPatterns = [
    /<\|reserved_special_token_\d+\|>/g,
    /<\|system\|>/g,
    /<\|end_header\|>/g,
    /<\|user\|>/g,
    /<\|assistant\|>/g,
    /\|<\/assistant\|>/g,
    /<\/assistant\|>/g,
    /<\|endoftext\|>/g,
    /<\|pad\|>/g,
    /<\/s>/g,
  ];
  specialTokenPatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '');
  });

  cleaned = cleaned.replace(
    /^(I'll create|Here's a|Here is a|A detailed image prompt|Image prompt:|This prompt describes|This image prompt|Final Image Prompt:|Prompt:).*/i,
    ''
  );

  const selfEvalPatterns = [
    /This response meets the requirements.*/gs,
    /Note: I've woven the parameters.*/gs,
    /I've created a cohesive image prompt.*/gs,
    /This prompt follows all the instructions.*/gs,
    /I've organized this into four paragraphs.*/gs,
    /The prompt is now complete and ready.*/gs,
  ];
  selfEvalPatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '');
  });

  const metaPhrases = [
    'meets the requirements',
    'following the guidelines',
    'four paragraphs',
    "I've ensured",
    "I've followed",
    "I've created",
    'woven the parameters',
    'without using headers',
    'cohesive narrative',
  ];
  cleaned = cleaned
    .split('\n')
    .filter((line) => !metaPhrases.some((p) => line.includes(p)))
    .join('\n');

  cleaned = cleaned
    .replace(/\|\s*$/, '')
    .replace(/\s*<\|pad\|>\s*$/, '')
    .replace(/(\|\s*)+$/, '')
    .replace(/\|\s*\|/g, '')
    .trim()
    .replace(/\n{3,}/g, '\n\n');

  return cleaned;
}

const NOVITA_SYSTEM_PROMPT =
  'You are a creative AI assistant that creates detailed image prompts for AI image generation. ' +
  'You must follow these rules strictly:\n' +
  '1. Create ONLY descriptive text suitable for image generation.\n' +
  '2. Organize content into 4 cohesive paragraphs: Content, Character, Style, and Setting.\n' +
  '3. DO NOT include any labels, headers, or formatting markers.\n' +
  '4. DO NOT include ANY meta-commentary or self-references about your process.\n' +
  '5. DO NOT include ANY special tokens or separators like |, <pad>, </s>, etc.\n' +
  '6. NEVER respond with anything other than the prompt text itself.';

export const generateNovitaPrompt = async (
  config: PromptConfigWithCategories
): Promise<ApiResponse> => {
  try {
    const cacheKey = generateCacheKey(config);
    const cached = getCachedPrompt('novita', cacheKey);
    if (cached) return createCachedResponse(cached);

    const apiKey = await getApiKey();
    if (!apiKey) return createMissingKeyResponse('Novita');

    if (!config.promptCategories || !Array.isArray(config.promptCategories)) {
      logger.error('Missing promptCategories in config', config);
      return {
        id: crypto.randomUUID(),
        prompt: '',
        error: 'Configuration error: missing prompt categories',
      };
    }

    const loadingToast = toast.loading('Generating prompt with Novita...');

    const modelName = config.model || 'meta-llama/llama-3.3-70b-instruct';
    const userPrompt = buildSectionedUserPrompt(config, config.promptCategories);

    logger.log('Sending to Novita API:', { endpoint: NOVITA_API_URL, model: modelName });

    const response = await fetchWithTimeout(NOVITA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: NOVITA_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 2048,
        temperature: 0.7,
        stream: false,
      }),
    });

    const rawResponseText = await response.text();

    if (!response.ok) {
      logger.error('Novita API error status:', response.status, response.statusText);
      let errorMessage = `Novita API error: ${response.statusText} (${response.status})`;
      try {
        if (rawResponseText && rawResponseText.includes('{')) {
          const jsonStart = rawResponseText.indexOf('{');
          const errorData = JSON.parse(rawResponseText.substring(jsonStart));
          errorMessage = errorData.error?.message || errorData.error || errorData.message || errorMessage;
        }
      } catch {
        // ignore JSON parse errors — fall through with default message
      }
      return { id: crypto.randomUUID(), prompt: '', error: errorMessage };
    }

    let responseData;
    try {
      responseData = JSON.parse(rawResponseText);
    } catch {
      return { id: crypto.randomUUID(), prompt: '', error: 'Invalid response format from Novita API' };
    }

    const generatedText = responseData.choices?.[0]?.message?.content;
    if (!generatedText) {
      logger.error('No generated text found in response:', responseData);
      return { id: crypto.randomUUID(), prompt: '', error: 'No prompt was generated from Novita API' };
    }

    const cleanedText = cleanLlamaResponse(generatedText);

    toast.dismiss(loadingToast);
    setCachedPrompt('novita', cacheKey, cleanedText);
    return createSuccessResponse(cleanedText.trim());
  } catch (error) {
    return handleApiError(error, 'Novita');
  }
};

export const getApiKey = async (): Promise<string> => {
  return getProviderApiKey(API_PROVIDERS.NOVITA);
};

export const saveApiKey = async (apiKey: string): Promise<void> => {
  return saveProviderApiKey(API_PROVIDERS.NOVITA, apiKey);
};
