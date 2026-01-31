import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PromptConfig } from '@/types/prompt';
import { getDefaultConfig } from '@/components/category/CategoryUtils';

interface PromptState {
  config: PromptConfig;
  extraDetails: string;
  prefixText: string;

  setConfig: (config: Partial<PromptConfig>) => void;
  setExtraDetails: (details: string) => void;
  setPrefixText: (text: string) => void;
  resetConfig: () => void;
  loadConfig: (config: PromptConfig) => void;
}

export const usePromptStore = create<PromptState>()(
  persist(
    (set) => ({
      config: getDefaultConfig(),
      extraDetails: '',
      prefixText: '',

      setConfig: (partial) => set((state) => ({
        config: { ...state.config, ...partial }
      })),
      setExtraDetails: (extraDetails) => set({ extraDetails }),
      setPrefixText: (prefixText) => set({ prefixText }),
      resetConfig: () => set({
        config: getDefaultConfig(),
        extraDetails: '',
        prefixText: ''
      }),
      loadConfig: (config) => set({
        config,
        extraDetails: config.extraDetails ?? '',
        prefixText: config.prefixText ?? ''
      }),
    }),
    {
      name: 'prompt-config-storage',
      partialize: (state) => ({
        config: state.config,
        extraDetails: state.extraDetails,
        prefixText: state.prefixText
      }),
    }
  )
);
