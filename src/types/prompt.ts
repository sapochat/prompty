
export interface Category {
  id: string;
  name: string;
  description: string;
  options: CategoryOption[];
}

export interface CategoryOption {
  id: string;
  name: string;
  description?: string;
  value: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'huggingface' | 'novita' | 'openrouter';
  description: string;
  requiresApiKey: boolean;
}

// Base prompt config without categories
export interface PromptConfig {
  subject?: string[];
  style?: string[];
  medium?: string[];
  artists?: string[];
  lighting?: string[];
  mood?: string[];
  setting?: string[];
  colors?: string[];
  era?: string[];
  composition?: string[];
  camera?: string[];
  quality?: string[];
  photographers?: string[];
  details?: string[];
  gender?: string[];
  bodyType?: string[];
  clothing?: string[];
  accessories?: string[];
  expression?: string[];
  pose?: string[];
  angle?: string[];
  hairStyle?: string[];
  place?: string[];
  weather?: string[];
  timeOfDay?: string[];
  season?: string[];
  camera_type?: string[];
  color_grading?: string[];
  extraDetails?: string;
  prefixText?: string;
  model?: string;
  // Allow string or string[] values for other properties not explicitly defined
  [key: string]: string | string[] | undefined;
}

// Extended interface for configurations that include categories
export interface PromptConfigWithCategories extends Omit<PromptConfig, 'promptCategories'> {
  promptCategories?: Category[];
  // This allows other string/string[] properties while excluding promptCategories from the index signature
}

export interface GeneratedPrompt {
  id: string;
  prompt: string;
  config: PromptConfig;
  timestamp: number;
  modelUsed: string;
  batchId?: string;
  createdAt?: number | string | Date;
}

// Define PromptHistoryItem type for explorer list
export type PromptHistoryItem = GeneratedPrompt;

export interface ApiResponse {
  id: string;
  prompt: string;
  error?: string;
}
