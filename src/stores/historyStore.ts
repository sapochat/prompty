import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GeneratedPrompt, PromptConfig } from '@/types/prompt';

interface HistoryState {
  history: GeneratedPrompt[];

  addPrompt: (prompt: string, config: PromptConfig, modelUsed: string, batchId?: string) => void;
  removePrompt: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],

      addPrompt: (prompt, config, modelUsed, batchId) => set((state) => ({
        history: [
          {
            id: crypto.randomUUID(),
            prompt,
            config,
            timestamp: Date.now(),
            modelUsed,
            batchId,
          },
          ...state.history
        ]
      })),

      removePrompt: (id) => set((state) => ({
        history: state.history.filter(p => p.id !== id)
      })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'prompt-history-storage',
    }
  )
);
