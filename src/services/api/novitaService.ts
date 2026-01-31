import { ApiResponse, Category, PromptConfigWithCategories } from '@/types/prompt';
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

// Novita API URLs based on their documentation - using OpenAI-compatible API
const NOVITA_BASE_URL = 'https://api.novita.ai/v3/openai';
const NOVITA_API_URL = `${NOVITA_BASE_URL}/chat/completions`;

const promptCache = new Map<string, CacheEntry>();

export const generateNovitaPrompt = async (config: PromptConfigWithCategories): Promise<ApiResponse> => {
  try {
    const cacheKey = generateCacheKey(config);
    const cached = getCachedResult(promptCache, cacheKey);
    if (cached) return createCachedResponse(cached);

    const apiKey = await getApiKey();
    if (!apiKey) return createMissingKeyResponse('Novita');

    // Create improved system prompt with clear constraints for Llama 4
    const systemPrompt =
      "You are a creative AI assistant that creates detailed image prompts for AI image generation. " +
      "You must follow these rules strictly:\n" +
      "1. Create ONLY descriptive text suitable for image generation.\n" +
      "2. Organize content into 4 cohesive paragraphs: Content, Character, Style, and Setting.\n" +
      "3. DO NOT include any labels, headers, or formatting markers.\n" +
      "4. DO NOT include ANY meta-commentary or self-references about your process.\n" +
      "5. DO NOT include ANY special tokens or separators like |, <pad>, </s>, etc.\n" +
      "6. NEVER respond with anything other than the prompt text itself.";

    // Construct the user prompt from the config object
    let userPrompt = "Create a detailed image prompt with the following parameters:\n\n";

    // Define our preferred sections
    const sections = {
      content: ["subject", "style", "medium", "artists", "photographers", "details", "quality"],
      character: ["gender", "bodyType", "clothing", "accessories", "expression", "pose", "angle", "hairStyle"],
      style: ["lighting", "colors", "mood", "color_grading", "composition", "camera", "camera_type"],
      setting: ["setting", "era", "place", "weather", "timeOfDay", "season"]
    };

    // Function to add section parameters if they exist
    const addSectionParams = (sectionName: string, sectionKeys: string[]) => {
      let hasContent = false;
      let sectionPrompt = `${sectionName}:\n`;

      for (const key of sectionKeys) {
        const value = config[key];
        if (!value || (Array.isArray(value) && value.length === 0)) continue;

        // Find the category from the promptCategories to get its name
        const category = config.promptCategories?.find((c: Category) => c.id === key);
        if (!category) continue;

        const formattedValue = Array.isArray(value) ? value.join(', ') : value;
        sectionPrompt += `- ${category.name}: ${formattedValue}\n`;
        hasContent = true;
      }

      return hasContent ? sectionPrompt + "\n" : "";
    };

    // Check if we have promptCategories before using them
    if (!config.promptCategories || !Array.isArray(config.promptCategories)) {
      logger.error("Missing promptCategories in config", config);
      return {
        id: crypto.randomUUID(),
        prompt: '',
        error: 'Configuration error: missing prompt categories'
      };
    }

    // Add each section if it has content
    userPrompt += addSectionParams("Content", sections.content);
    userPrompt += addSectionParams("Character", sections.character);
    userPrompt += addSectionParams("Style", sections.style);
    userPrompt += addSectionParams("Setting", sections.setting);

    if (config.extraDetails) {
      userPrompt += `Additional Details: ${config.extraDetails}\n\n`;
    }

    // Improved, more direct instructions
    userPrompt += "STRICT INSTRUCTIONS:\n" +
      "1. Write EXACTLY FOUR paragraphs - Content, Character, Style, and Setting.\n" +
      "2. DO NOT include ANY paragraph headers, labels, or formatting markers.\n" +
      "3. NEVER write anything like 'Here's a prompt' or explain what you're doing.\n" +
      "4. NEVER include special tokens like |, <pad>, </s>, etc.\n" +
      "5. Your entire response must contain ONLY the prompt text itself.\n" +
      "6. DO NOT include ANY self-evaluation or comments about meeting requirements.\n" +
      "7. DO NOT respond with anything that isn't part of the actual prompt.\n" +
      "8. Be creative but concise, focusing only on descriptive content.";

    // Set the model to the specified model
    const modelName = config.model || "meta-llama/llama-3.3-70b-instruct";

    // Format the request for the API
    const novitaPayload = {
      model: modelName,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 2048,
      temperature: 0.7,
      stream: false
    };

    logger.log("Sending to Novita API:", { endpoint: NOVITA_API_URL, model: modelName });

    // Make the API call to Novita using OpenAI-compatible endpoint
    const response = await fetchWithTimeout(NOVITA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(novitaPayload)
    });

    // Log the raw response for debugging
    const rawResponseText = await response.text();

    // Check if the response is successful
    if (!response.ok) {
      logger.error("Novita API error status:", response.status, response.statusText);

      let errorMessage = `Novita API error: ${response.statusText} (${response.status})`;

      try {
        if (rawResponseText && rawResponseText.includes('{')) {
          const jsonStartIndex = rawResponseText.indexOf('{');
          const errorData = JSON.parse(rawResponseText.substring(jsonStartIndex));
          errorMessage = errorData.error?.message || errorData.error || errorData.message || errorMessage;
        }
      } catch {
        // Ignore parse errors
      }

      return {
        id: crypto.randomUUID(),
        prompt: '',
        error: errorMessage
      };
    }

    // Parse the response
    let responseData;
    try {
      responseData = JSON.parse(rawResponseText);
    } catch {
      return {
        id: crypto.randomUUID(),
        prompt: '',
        error: 'Invalid response format from Novita API'
      };
    }

    // Extract the generated text according to OpenAI API structure
    const generatedText = responseData.choices?.[0]?.message?.content;

    if (!generatedText) {
      logger.error("No generated text found in response:", responseData);
      return {
        id: crypto.randomUUID(),
        prompt: '',
        error: 'No prompt was generated from Novita API'
      };
    }

    // Enhanced cleaning function specific for Llama responses
    const cleanLlamaResponse = (text: string) => {
      // Remove special tokens
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
        /<\/s>/g
      ];

      specialTokenPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
      });

      // Remove common patterns that appear in Llama responses
      cleaned = cleaned.replace(/^(I'll create|Here's a|Here is a|A detailed image prompt|Image prompt:|This prompt describes|This image prompt|Final Image Prompt:|Prompt:).*/i, '');

      // Remove self-evaluation sections - expanded patterns
      const selfEvalPatterns = [
        /This response meets the requirements.*/gs,
        /Note: I've woven the parameters.*/gs,
        /I've created a cohesive image prompt.*/gs,
        /This prompt follows all the instructions.*/gs,
        /I've organized this into four paragraphs.*/gs,
        /The prompt is now complete and ready.*/gs
      ];

      selfEvalPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
      });

      // Remove any lines with common meta-commentary phrases
      const metaCommentaryLines = cleaned.split('\n').filter(line => {
        return !(
          line.includes("meets the requirements") ||
          line.includes("following the guidelines") ||
          line.includes("four paragraphs") ||
          line.includes("I've ensured") ||
          line.includes("I've followed") ||
          line.includes("I've created") ||
          line.includes("woven the parameters") ||
          line.includes("without using headers") ||
          line.includes("cohesive narrative")
        );
      });

      cleaned = metaCommentaryLines.join('\n');

      // Clean up formatting artifacts
      cleaned = cleaned.replace(/\|\s*$/, ''); // Remove trailing pipe
      cleaned = cleaned.replace(/\s*<\|pad\|>\s*$/, ''); // Remove pad tokens
      cleaned = cleaned.replace(/(\|\s*)+$/, ''); // Remove multiple trailing pipes
      cleaned = cleaned.replace(/\|\s*\|/g, ''); // Clean up multiple pipe characters

      // Trim and remove extra whitespace
      cleaned = cleaned.trim().replace(/\n{3,}/g, '\n\n');

      return cleaned;
    };

    // Use our enhanced Llama cleaning function
    const cleanedText = cleanLlamaResponse(generatedText);

    setCacheResult(promptCache, cacheKey, cleanedText);
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
