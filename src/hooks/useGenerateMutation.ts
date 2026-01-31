import { useMutation } from '@tanstack/react-query';
import { generatePrompt } from '@/services/promptService';
import { toast } from 'sonner';
import type { PromptConfigWithCategories, Category, ApiResponse } from '@/types/prompt';
import { getErrorMessage } from '@/utils/errorUtils';

interface GenerateParams {
  config: PromptConfigWithCategories;
  categories: Category[];
  count?: number;
}

export const useGenerateMutation = () => {
  return useMutation({
    mutationFn: async ({ config, categories, count = 1 }: GenerateParams): Promise<ApiResponse[] | null> => {
      return generatePrompt(config, categories, count);
    },
    onSuccess: (results) => {
      if (results && results.length > 0) {
        const successCount = results.filter(r => !r.error).length;
        const failCount = results.filter(r => r.error).length;

        if (successCount > 0) {
          toast.success(
            successCount === 1
              ? "Prompt generated and added to history"
              : `${successCount} prompts generated and added to history`
          );
        }

        if (failCount > 0) {
          toast.error(`${failCount} prompt(s) failed to generate`);
        }
      }
    },
    onError: (error: unknown) => {
      toast.error(`Generation failed: ${getErrorMessage(error)}`);
    },
  });
};
