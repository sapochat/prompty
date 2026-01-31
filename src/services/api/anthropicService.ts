import { PromptConfig } from '@/types/prompt';
import { promptCategories } from "@/utils/promptData";
import { toast } from 'sonner';
import { getApiKey as getProviderApiKey, saveApiKey as saveProviderApiKey, API_PROVIDERS } from '../apiKeyService';
import { logger } from '@/utils/logger';
import {
  fetchWithTimeout,
  generateCacheKey,
  getCachedResult,
  setCacheResult,
  createCachedResponse,
  createSuccessResponse,
  createMissingKeyResponse,
  handleApiError,
  cleanPromptText,
  CacheEntry
} from './apiUtils';

// Cache for storing generated prompts to avoid redundant API calls
const promptCache = new Map<string, CacheEntry>();

/**
 * Retrieves the Anthropic API key
 */
export const getApiKey = async (): Promise<string> => {
  return getProviderApiKey(API_PROVIDERS.ANTHROPIC);
};

/**
 * Saves the Anthropic API key
 */
export const saveApiKey = async (apiKey: string): Promise<void> => {
  return saveProviderApiKey(API_PROVIDERS.ANTHROPIC, apiKey);
};

export const generateAnthropicPrompt = async (config: PromptConfig) => {
  try {
    // Check cache first
    const cacheKey = generateCacheKey(config);
    const cached = getCachedResult(promptCache, cacheKey);
    if (cached) return createCachedResponse(cached);

    // Get API key
    const apiKey = await getApiKey();

    if (!apiKey) return createMissingKeyResponse('Anthropic');
    
    // Show a loading toast with progress indication
    const loadingToast = toast.loading('Generating prompt with Claude...');
    
    // System prompt for Claude
    const systemPrompt = 
      "You are an expert image prompt engineer. Create a detailed image generation prompt based on these parameters. " +
      "Your response should be 4 paragraphs: content, character, style, and setting. " +
      "DO NOT include section headers. DO NOT explain what you're doing. ONLY output the prompt text.";
    
    // Construct the user prompt
    let userPrompt = "Create a detailed image prompt with the following parameters:\n\n";
    
    // Parse the config and add the user's selections
    for (const [categoryId, valueOrValues] of Object.entries(config)) {
      if (
        !valueOrValues || 
        valueOrValues === '' || 
        (Array.isArray(valueOrValues) && valueOrValues.length === 0) ||
        categoryId === 'model' ||
        categoryId === 'promptCategories'
      ) {
        continue; // Skip empty values or special fields
      }
      
      // Find the proper category name from the promptCategories
      const category = promptCategories.find(c => c.id === categoryId);
      if (category) {
        const formattedValue = Array.isArray(valueOrValues) ? valueOrValues.join(', ') : valueOrValues;
        userPrompt += `${category.name}: ${formattedValue}\n`;
      }
    }
    
    // Add extra details if present
    if (config.extraDetails) {
      userPrompt += `\nAdditional details: ${config.extraDetails}`;
    }
    
    // Make direct API call to Anthropic
    const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model || 'claude-4-5-sonnet-latest',
        max_tokens: 800,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      })
    });
    
    toast.dismiss(loadingToast);
    
    if (!response.ok) {
      const errorData = await response.text();
      logger.error('Anthropic API error:', errorData);
      throw new Error('Error calling Anthropic API');
    }
    
    const data = await response.json();
    const generatedPrompt = cleanPromptText(data.content[0].text);

    // Cache the result
    setCacheResult(promptCache, cacheKey, generatedPrompt);

    // No longer saving to history here - handled by promptService.ts
    return createSuccessResponse(generatedPrompt);
  } catch (error: unknown) {
    return handleApiError(error, 'Anthropic');
  }
};
