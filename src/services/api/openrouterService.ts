import { ApiResponse, PromptConfig } from '@/types/prompt';
import { v4 as uuidv4 } from 'uuid';
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
 * Retrieves the OpenRouter API key from localStorage
 */
export const getApiKey = async (): Promise<string> => {
  return getProviderApiKey(API_PROVIDERS.OPENROUTER);
};

/**
 * Saves the OpenRouter API key to localStorage
 */
export const saveApiKey = async (apiKey: string): Promise<void> => {
  return saveProviderApiKey(API_PROVIDERS.OPENROUTER, apiKey);
};

/**
 * Generates a prompt using the OpenRouter API
 */
export const generateOpenRouterPrompt = async (config: PromptConfig): Promise<ApiResponse | null> => {
  try {
    // Check cache first
    const cacheKey = generateCacheKey(config);
    const cached = getCachedResult(promptCache, cacheKey);
    if (cached) return createCachedResponse(cached);

    // Get the API key
    const apiKey = await getApiKey();

    if (!apiKey) return createMissingKeyResponse('OpenRouter');
    
    // Show a loading toast with progress indication
    const loadingToast = toast.loading('Generating prompt with OpenRouter...');
    
    // Enhanced system prompt that specifically asks NOT to use section titles or headers
    const systemPrompt = 
      "You are an expert image prompt engineer specializing in creating vivid, detailed descriptions. " +
      "Create a structured, cohesive prompt with distinct paragraphs for Content, Character, Style, and Setting elements. " +
      "For each section that has user parameters, create a flowing, detailed paragraph. " +
      "Be creative with any missing sections, inventing appropriate details that complement the specified elements. " +
      "IMPORTANT: DO NOT include section titles or headers like 'Content:', 'Style:', etc. in your response. " +
      "Maintain a consistent narrative across all paragraphs without using labels. " +
      "Craft text that works effectively as an AI image generation prompt.";

    // Reorganize the categories into our preferred sections
    const sections = {
      content: ["subject", "style", "medium", "artists", "photographers", "details", "quality"],
      character: ["gender", "bodyType", "clothing", "accessories", "expression", "pose", "angle", "hairStyle"],
      style: ["lighting", "colors", "mood", "color_grading", "composition", "camera", "camera_type"],
      setting: ["setting", "era", "place", "weather", "timeOfDay", "season"]
    };
    
    // Build a structured user prompt with our sections clearly defined
    let userPrompt = "Create a detailed image prompt with the following parameters, organized into paragraphs:\n\n";
    
    // Function to add section parameters if they exist
    const addSectionParams = (sectionName: string, sectionKeys: string[]) => {
      let hasContent = false;
      let sectionPrompt = `${sectionName}:\n`;
      
      for (const key of sectionKeys) {
        const value = config[key as keyof PromptConfig];
        if (!value || (Array.isArray(value) && value.length === 0)) continue;
        
        const category = promptCategories.find((c) => c.id === key);
        if (!category) continue;
        
        const formattedValue = Array.isArray(value) ? value.join(', ') : value;
        sectionPrompt += `- ${category.name}: ${formattedValue}\n`;
        hasContent = true;
      }
      
      return hasContent ? sectionPrompt + "\n" : "";
    };
    
    // Add each section if it has content
    userPrompt += addSectionParams("Content", sections.content);
    userPrompt += addSectionParams("Character", sections.character);
    userPrompt += addSectionParams("Style", sections.style);
    userPrompt += addSectionParams("Setting", sections.setting);
    
    if (config.extraDetails) {
      userPrompt += `Additional Details: ${config.extraDetails}\n\n`;
    }
    
    userPrompt += "INSTRUCTIONS:\n" +
      "1. Create a cohesive image prompt with separate paragraphs for Content, Character, Style, and Setting (in that order).\n" +
      "2. Each section should be a detailed paragraph WITHOUT SECTION TITLES OR HEADERS.\n" +
      "3. For sections with few or no specified parameters, be creative and invent appropriate details.\n" +
      "4. Make sure all paragraphs work together to describe a unified, consistent scene.\n" +
      "5. The prompt should be directly usable for AI image generation without requiring editing.\n" +
      "6. DO NOT use section labels, headers, or titles like 'Content:', 'Style:', etc. in your response.\n" +
      "7. DO NOT use bullet points or other formatting in your response.";

    logger.log('Calling OpenRouter API');

    // Call the OpenRouter API directly
    const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Flux Image Prompt Generator',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model || 'google/gemini-2.5-flash',
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 800,
      })
    });
    
    toast.dismiss(loadingToast);
    
    if (!response.ok) {
      const errorData = await response.json();
      logger.error(`OpenRouter API error (${response.status}):`, errorData);
      
      return {
        id: uuidv4(),
        prompt: '',
        error: `OpenRouter API error: ${errorData.error?.message || response.statusText}`
      };
    }
    
    const data = await response.json();

    logger.log("OpenRouter API response received");
    
    if (!data.choices || data.choices.length === 0) {
      logger.error('Invalid response from OpenRouter:', data);
      
      return {
        id: uuidv4(),
        prompt: '',
        error: 'Invalid response from OpenRouter API'
      };
    }
    
    let generatedPrompt = data.choices[0].message.content.trim();
    
    // Apply enhanced cleanup to remove section titles and other unwanted formatting
    generatedPrompt = cleanPromptText(generatedPrompt);
    
    // Add prefix text if provided
    if (config.prefixText && config.prefixText.trim()) {
      generatedPrompt = `${config.prefixText.trim()} ${generatedPrompt}`;
    }
    
    // Cache the result
    setCacheResult(promptCache, cacheKey, generatedPrompt);

    // Finalize the response
    return createSuccessResponse(generatedPrompt);

  } catch (error: unknown) {
    return handleApiError(error, 'OpenRouter');
  }
};
