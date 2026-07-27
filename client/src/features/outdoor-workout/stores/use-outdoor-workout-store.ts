import { create } from 'zustand';
import type { OutdoorWorkoutPlanResult } from '../types/outdoor-workout';

type OutdoorWorkoutStore = {
  clearPlanResult: () => void;
  planResult: OutdoorWorkoutPlanResult | null;
  setPlanResult: (result: OutdoorWorkoutPlanResult) => void;
};

export const useOutdoorWorkoutStore = create<OutdoorWorkoutStore>((set) => ({
  clearPlanResult: () => {
    set({ planResult: null });
  },
  planResult: null,
  setPlanResult: (planResult) => {
    set({ planResult });
  },
}));
