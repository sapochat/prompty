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
  CacheEntry
} from './apiUtils';

// Cache for storing generated prompts to avoid redundant API calls
const promptCache = new Map<string, CacheEntry>();

export const getApiKey = async (): Promise<string> => {
  return getProviderApiKey(API_PROVIDERS.HUGGINGFACE);
};

export const saveApiKey = async (apiKey: string): Promise<void> => {
  return saveProviderApiKey(API_PROVIDERS.HUGGINGFACE, apiKey);
};

export const generateHuggingfacePrompt = async (config: PromptConfig) => {
  try {
    // Check cache first
    const cacheKey = generateCacheKey(config);
    const cached = getCachedResult(promptCache, cacheKey);
    if (cached) return createCachedResponse(cached);

    // Get API key
    const apiKey = await getApiKey();

    if (!apiKey) return createMissingKeyResponse('HuggingFace');
    
    // Show a loading toast with progress indication
    const loadingToast = toast.loading('Generating prompt with Huggingface...');
    
    // Direct API call to Huggingface
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
    
    // Add a system prompt
    const fullPrompt = 
      "You are an expert image prompt engineer. Create a detailed image generation prompt based on these parameters. " +
      "Your response should be 4 paragraphs: content, character, style, and setting. " +
      "DO NOT include section headers. DO NOT explain what you're doing. ONLY output the prompt text.\n\n" +
      userPrompt;
    
    // Default to Mistral 7B if no model specified
    const modelToUse = config.model || 'mistralai/Mistral-7B-Instruct-v0.3';
    const apiUrl = `https://api-inference.huggingface.co/models/${modelToUse}`;

    const response = await fetchWithTimeout(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true
        }
      })
    });
    
    toast.dismiss(loadingToast);
    
    if (!response.ok) {
      const errorData = await response.text();
      logger.error('Huggingface API error:', errorData);
      throw new Error('Error calling Huggingface API');
    }
    
    const data = await response.json();
    
    // Extract the text from the response (format varies by model)
    let generatedPrompt = '';
    
    if (Array.isArray(data) && data[0] && typeof data[0].generated_text === 'string') {
      // Standard format for most models
      generatedPrompt = data[0].generated_text;
    } else if (typeof data === 'object' && typeof data.generated_text === 'string') {
      // Alternate format
      generatedPrompt = data.generated_text;
    } else {
      logger.error('Unexpected response format from Huggingface:', data);
      throw new Error('Received invalid response from Huggingface API');
    }
    
    // Extract just the generated part, not the input prompt
    const cleanedPrompt = generatedPrompt.replace(fullPrompt, '').trim();
    
    // Cache the result
    setCacheResult(promptCache, cacheKey, cleanedPrompt);

    // No longer saving to history here - handled by promptService.ts
    return createSuccessResponse(cleanedPrompt);
  } catch (error: unknown) {
    return handleApiError(error, 'HuggingFace');
  }
};
