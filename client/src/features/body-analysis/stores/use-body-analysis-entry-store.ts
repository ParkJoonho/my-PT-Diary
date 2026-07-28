import { create } from 'zustand';

type BodyAnalysisEntryPoint = 'default' | 'shoe';

type BodyAnalysisEntryState = {
  consumeEntryPoint: () => BodyAnalysisEntryPoint;
  pendingEntryPoint: BodyAnalysisEntryPoint;
  setEntryPoint: (entryPoint: BodyAnalysisEntryPoint) => void;
};

export const useBodyAnalysisEntryStore = create<BodyAnalysisEntryState>(
  (set, get) => ({
    consumeEntryPoint: () => {
      const entryPoint = get().pendingEntryPoint;
      set({ pendingEntryPoint: 'default' });
      return entryPoint;
    },
    pendingEntryPoint: 'default',
    setEntryPoint: (entryPoint) => set({ pendingEntryPoint: entryPoint }),
  }),
);
