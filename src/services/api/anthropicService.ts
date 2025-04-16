import { ApiResponse, PromptConfig } from '@/types/prompt';
import { v4 as uuidv4 } from 'uuid';
import { promptCategories } from "@/utils/promptData";
import { toast } from 'sonner';
import { getApiKey as getProviderApiKey, saveApiKey as saveProviderApiKey, API_PROVIDERS } from '../apiKeyService';

// Cache for storing generated prompts to avoid redundant API calls
const promptCache = new Map<string, {prompt: string, timestamp: number}>();
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour cache expiry

// Generate a cache key from prompt config
const generateCacheKey = (config: PromptConfig): string => {
  const { model, extraDetails, ...restConfig } = config;
  const sortedEntries = Object.entries(restConfig)
    .filter(([_, value]) => value && (!Array.isArray(value) || value.length > 0))
    .sort(([a], [b]) => a.localeCompare(b));
  
  return JSON.stringify({
    model,
    extraDetails,
    categories: sortedEntries
  });
};

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

export const generateAnthropicPrompt = async (config: PromptConfig): Promise<ApiResponse | null> => {
  try {
    // Check cache first
    const cacheKey = generateCacheKey(config);
    const cachedResult = promptCache.get(cacheKey);
    
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_EXPIRY) {
      console.log('Using cached prompt result');
      
      // Create API response from cache
      const apiResponse: ApiResponse = {
        id: uuidv4(),
        prompt: cachedResult.prompt,
      };
      
      // No longer saving to history here - handled by promptService.ts
      toast.success("Prompt generated from cache!");
      
      return apiResponse;
    }

    // Get API key
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      toast.error("Please add your Anthropic API key in settings");
      return {
        id: uuidv4(),
        prompt: '',
        error: 'Anthropic API key not found. Please add your API key in settings.',
      };
    }
    
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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-sonnet-20240229',
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
      console.error('Anthropic API error:', errorData);
      throw new Error('Error calling Anthropic API');
    }
    
    const data = await response.json();
    const generatedPrompt = data.content[0].text;
    
    // Cache the result
    promptCache.set(cacheKey, {
      prompt: generatedPrompt,
      timestamp: Date.now()
    });
    
    // Create API response
    const apiResponse: ApiResponse = {
      id: uuidv4(),
      prompt: generatedPrompt,
    };
    
    // No longer saving to history here - handled by promptService.ts
    toast.success("Prompt generated successfully!");
    return apiResponse;
  } catch (error: any) {
    // Handle any errors that occurred
    const errorMessage = error.message || 'Unknown error occurred';
    console.error("Error generating prompt with Anthropic:", errorMessage);
    toast.error(`Error: ${errorMessage}`);
    
    return {
      id: uuidv4(),
      prompt: '',
      error: errorMessage,
    };
  }
};
