import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiKey, saveApiKey } from '@/services/apiKeyService';

const API_KEYS_QUERY_KEY = ['apiKeys'] as const;

export const useApiKey = (provider: string) => {
  return useQuery({
    queryKey: [...API_KEYS_QUERY_KEY, provider],
    queryFn: () => getApiKey(provider),
    staleTime: Infinity, // API keys don't change often
  });
};

export const useApiKeyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ provider, apiKey }: { provider: string; apiKey: string }) =>
      saveApiKey(provider, apiKey),
    onSuccess: (_, { provider }) => {
      queryClient.invalidateQueries({ queryKey: [...API_KEYS_QUERY_KEY, provider] });
      queryClient.invalidateQueries({ queryKey: ['availableModels'] });
    },
  });
};

export const useAllApiKeys = () => {
  const providers = ['openai', 'anthropic', 'huggingface', 'novita', 'openrouter'];

  return useQuery({
    queryKey: API_KEYS_QUERY_KEY,
    queryFn: async () => {
      const keys: Record<string, string> = {};
      for (const provider of providers) {
        keys[provider] = await getApiKey(provider);
      }
      return keys;
    },
  });
};
