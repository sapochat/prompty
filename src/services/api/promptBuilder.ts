import { PromptConfig, PromptConfigWithCategories, Category } from '@/types/prompt';
import { promptCategories as defaultPromptCategories } from '@/utils/promptData';

export const SECTIONED_SYSTEM_PROMPT =
  "You are an expert image prompt engineer specializing in creating vivid, detailed descriptions. " +
  "Create a structured, cohesive prompt with distinct paragraphs for Content, Character, Style, and Setting elements. " +
  "For each section that has user parameters, create a flowing, detailed paragraph. " +
  "Be creative with any missing sections, inventing appropriate details that complement the specified elements. " +
  "IMPORTANT: DO NOT include section titles or headers like 'Content:', 'Style:', etc. in your response. " +
  "Maintain a consistent narrative across all paragraphs without using labels. " +
  "Craft text that works effectively as an AI image generation prompt.";

export const FLAT_SYSTEM_PROMPT =
  "You are an expert image prompt engineer. Create a detailed image generation prompt based on these parameters. " +
  "Your response should be 4 paragraphs: content, character, style, and setting. " +
  "DO NOT include section headers. DO NOT explain what you're doing. ONLY output the prompt text.";

const SECTION_KEYS = {
  Content: ['subject', 'style', 'medium', 'artists', 'photographers', 'details', 'quality'],
  Character: ['gender', 'bodyType', 'clothing', 'accessories', 'expression', 'pose', 'angle', 'hairStyle'],
  Style: ['lighting', 'colors', 'mood', 'color_grading', 'composition', 'camera', 'camera_type'],
  Setting: ['setting', 'era', 'place', 'weather', 'timeOfDay', 'season'],
} as const;

const SECTIONED_INSTRUCTIONS =
  "INSTRUCTIONS:\n" +
  "1. Create a cohesive image prompt with separate paragraphs for Content, Character, Style, and Setting (in that order).\n" +
  "2. Each section should be a detailed paragraph WITHOUT SECTION TITLES OR HEADERS.\n" +
  "3. For sections with few or no specified parameters, be creative and invent appropriate details.\n" +
  "4. Make sure all paragraphs work together to describe a unified, consistent scene.\n" +
  "5. The prompt should be directly usable for AI image generation without requiring editing.\n" +
  "6. DO NOT use section labels, headers, or titles like 'Content:', 'Style:', etc. in your response.\n" +
  "7. DO NOT use bullet points or other formatting in your response.";

function formatSection(
  sectionName: string,
  keys: readonly string[],
  config: PromptConfig | PromptConfigWithCategories,
  categories: Category[]
): string {
  const lines: string[] = [];
  for (const key of keys) {
    const value = config[key as keyof PromptConfig];
    if (!value || (Array.isArray(value) && value.length === 0)) continue;

    const category = categories.find((c) => c.id === key);
    if (!category) continue;

    const formatted = Array.isArray(value) ? value.join(', ') : value;
    lines.push(`- ${category.name}: ${formatted}`);
  }
  return lines.length > 0 ? `${sectionName}:\n${lines.join('\n')}\n\n` : '';
}

/**
 * Builds a sectioned user prompt for OpenAI-compatible image-prompt generation.
 * Pass `categories` explicitly when the caller already holds them (e.g. Novita
 * receives them in `config.promptCategories`); otherwise we fall back to the
 * bundled defaults.
 */
export function buildSectionedUserPrompt(
  config: PromptConfig | PromptConfigWithCategories,
  categories: Category[] = defaultPromptCategories
): string {
  let userPrompt = 'Create a detailed image prompt with the following parameters, organized into paragraphs:\n\n';
  for (const [name, keys] of Object.entries(SECTION_KEYS)) {
    userPrompt += formatSection(name, keys, config, categories);
  }
  if (config.extraDetails) {
    userPrompt += `Additional Details: ${config.extraDetails}\n\n`;
  }
  userPrompt += SECTIONED_INSTRUCTIONS;
  return userPrompt;
}

/**
 * Builds a flat "category: value" user prompt used by the Anthropic and
 * HuggingFace adapters.
 */
export function buildFlatUserPrompt(config: PromptConfig): string {
  let userPrompt = 'Create a detailed image prompt with the following parameters:\n\n';
  for (const [categoryId, value] of Object.entries(config)) {
    if (
      !value ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      categoryId === 'model' ||
      categoryId === 'promptCategories'
    ) {
      continue;
    }
    const category = defaultPromptCategories.find((c) => c.id === categoryId);
    if (!category) continue;
    const formatted = Array.isArray(value) ? value.join(', ') : value;
    userPrompt += `${category.name}: ${formatted}\n`;
  }
  if (config.extraDetails) {
    userPrompt += `\nAdditional details: ${config.extraDetails}`;
  }
  return userPrompt;
}
