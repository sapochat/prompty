import { create } from 'zustand';

interface GenerationState {
  isGenerating: boolean;
  lastError: string | null;

  setGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useGenerationStore = create<GenerationState>()((set) => ({
  isGenerating: false,
  lastError: null,

  setGenerating: (isGenerating) => set({ isGenerating }),
  setError: (lastError) => set({ lastError }),
  clearError: () => set({ lastError: null }),
}));
