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

export const getApiKey = async (): Promise<string> => {
  return getProviderApiKey(API_PROVIDERS.OPENAI);
};

export const saveApiKey = async (apiKey: string): Promise<void> => {
  return saveProviderApiKey(API_PROVIDERS.OPENAI, apiKey);
};

export const generateOpenAIPrompt = async (config: PromptConfig): Promise<ApiResponse | null> => {
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
    
    // Get the API key
    const apiKey = await getProviderApiKey(API_PROVIDERS.OPENAI);
    
    if (!apiKey) {
      console.error('No OpenAI API key provided');
      toast.error("Please add your OpenAI API key in the settings menu");
      return {
        id: uuidv4(),
        prompt: '',
        error: 'No OpenAI API key provided. Please add your API key in the settings.',
      };
    }
    
    // Show a loading toast with progress indication
    const loadingToast = toast.loading('Generating prompt with OpenAI...');
    
    // Make a direct API call - no Supabase Edge Function needed
    console.log('Making direct OpenAI API call for prompt generation');
    
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
    
    try {
      // Make a direct fetch call to the OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.8,
          max_tokens: 800,
        })
      });
      
      toast.dismiss(loadingToast);
      
      // Check if the response was successful
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`OpenAI API error (${response.status}):`, errorData);
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        console.error('Invalid response from OpenAI:', data);
        throw new Error('Invalid response from OpenAI API');
      }
      
      let generatedPrompt = data.choices[0].message.content.trim();
      
      // Apply enhanced cleanup to remove section titles and other unwanted formatting
      const cleanPromptText = (text: string): string => {
        if (!text) return '';
        
        // Remove common prefixes like "Title:", "Prompt:", etc.
        let cleaned = text
          .replace(/^(Title|Prompt|Image Prompt|Here's a prompt|Here is a prompt|Description):\s*/i, '')
          .replace(/^"(.*)"$/, '$1') // Remove quotes if the entire prompt is quoted
          .trim();
          
        // Remove section headers/titles like "Content:", "Setting:", "Style:", etc.
        cleaned = cleaned
          .replace(/\b(Content|Character|Style|Setting|Background|Mood|Lighting|Details):\s+/gi, '')
          .replace(/\n\s*\b(Content|Character|Style|Setting|Background|Mood|Lighting|Details):\s*/gi, '\n\n')
          .trim();
        
        // Replace multiple consecutive newlines with just two (to maintain paragraph separation)
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
        
        return cleaned;
      };
      
      generatedPrompt = cleanPromptText(generatedPrompt);
      
      // Add prefix text if provided
      if (config.prefixText && config.prefixText.trim()) {
        generatedPrompt = `${config.prefixText.trim()} ${generatedPrompt}`;
      }
      
      // Cache the result
      promptCache.set(cacheKey, {
        prompt: generatedPrompt,
        timestamp: Date.now()
      });
      
      // Finalize the response
      const apiResponse: ApiResponse = {
        id: uuidv4(),
        prompt: generatedPrompt,
      };
  
      // No longer saving to history here - handled by promptService.ts
      toast.success("Prompt generated successfully!");
      return apiResponse;
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("Error in direct OpenAI API call:", error);
      throw error;
    }
  } catch (error: any) {
    console.error("Error generating prompt with OpenAI:", error);
    toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
    
    return {
      id: uuidv4(),
      prompt: '',
      error: error.message || 'Unknown error occurred',
    };
  }
};
