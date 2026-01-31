import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GeneratedPrompt, PromptConfig } from '@/types/prompt';
import { v4 as uuidv4 } from 'uuid';

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
            id: uuidv4(),
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
