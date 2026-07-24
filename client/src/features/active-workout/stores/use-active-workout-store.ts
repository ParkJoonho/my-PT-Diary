import type { HomeRoutine } from 'features/workout-routines/types/routine';
import { create, type StateCreator } from 'zustand';

export type ActiveWorkoutSessionSlice = {
  clearSelectedRoutine: () => void;
  selectedRoutine: HomeRoutine | null;
  setSelectedRoutine: (routine: HomeRoutine) => void;
};

export type ActiveWorkoutStore = ActiveWorkoutSessionSlice;

const createActiveWorkoutSessionSlice: StateCreator<
  ActiveWorkoutStore,
  [],
  [],
  ActiveWorkoutSessionSlice
> = (set) => ({
  clearSelectedRoutine: () => {
    set({ selectedRoutine: null });
  },
  selectedRoutine: null,
  setSelectedRoutine: (routine) => {
    set({ selectedRoutine: routine });
  },
});

export const useActiveWorkoutStore = create<ActiveWorkoutStore>()(
  (...args) => ({
    ...createActiveWorkoutSessionSlice(...args),
  }),
);
