import { QueryClient } from '@tanstack/react-query';

/**
 * TTL we want prompt-cache entries to live even when no React component is
 * observing them (e.g. between two generate clicks in the same provider).
 */
export const PROMPT_CACHE_TTL = 1000 * 60 * 60;

/**
 * Shared across the React tree (QueryClientProvider in App.tsx) and the
 * imperative prompt cache in apiUtils.ts. Keeping a single client means cache
 * state, staleness, and GC are handled in one place instead of per-service
 * Map instances that never get cleaned up.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
      // Unobserved setQueryData entries would otherwise evict at 5 min by
      // default, shorter than our prompt-cache TTL.
      gcTime: PROMPT_CACHE_TTL,
    },
    mutations: { retry: 1 },
  },
});
