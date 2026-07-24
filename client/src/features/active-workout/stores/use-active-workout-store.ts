import type { HomeRoutine } from 'features/workout-routines/types/routine';
import { type StateCreator, create } from 'zustand';
import type { CompletedStepMap } from '../types/active-workout';

export type ActiveWorkoutSessionSlice = {
  clearSelectedRoutine: () => void;
  selectedRoutine: HomeRoutine | null;
  setSelectedRoutine: (routine: HomeRoutine) => void;
};

export type ActiveWorkoutProgressSlice = {
  clearErrorMessage: () => void;
  completedSteps: CompletedStepMap;
  countdown: number;
  countdownDone: boolean;
  decrementCountdown: () => void;
  elapsedSeconds: number;
  errorMessage: string | null;
  initializeProgress: () => void;
  incrementElapsedSeconds: () => void;
  isPaused: boolean;
  resetProgress: () => void;
  setErrorMessage: (message: string | null) => void;
  skipCountdown: () => void;
  togglePause: () => void;
  toggleStep: (stepIndex: number) => void;
};

export type ActiveWorkoutStore = ActiveWorkoutSessionSlice &
  ActiveWorkoutProgressSlice;

const COUNTDOWN_START = 3;

function createInitialProgressState() {
  return {
    completedSteps: {} as CompletedStepMap,
    countdown: COUNTDOWN_START,
    countdownDone: false,
    elapsedSeconds: 0,
    errorMessage: null as string | null,
    isPaused: false,
  };
}

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

const createActiveWorkoutProgressSlice: StateCreator<
  ActiveWorkoutStore,
  [],
  [],
  ActiveWorkoutProgressSlice
> = (set) => ({
  ...createInitialProgressState(),
  clearErrorMessage: () => {
    set({ errorMessage: null });
  },
  decrementCountdown: () => {
    set((state) => ({
      countdown: Math.max(state.countdown - 1, 0),
    }));
  },
  initializeProgress: () => {
    set(createInitialProgressState());
  },
  incrementElapsedSeconds: () => {
    set((state) => ({
      elapsedSeconds: state.elapsedSeconds + 1,
    }));
  },
  resetProgress: () => {
    set(createInitialProgressState());
  },
  setErrorMessage: (errorMessage) => {
    set({ errorMessage });
  },
  skipCountdown: () => {
    set({
      countdown: 0,
      countdownDone: true,
    });
  },
  togglePause: () => {
    set((state) => ({
      isPaused: !state.isPaused,
    }));
  },
  toggleStep: (stepIndex) => {
    set((state) => ({
      completedSteps: {
        ...state.completedSteps,
        [stepIndex]: !state.completedSteps[stepIndex],
      },
    }));
  },
});

export const useActiveWorkoutStore = create<ActiveWorkoutStore>()(
  (...args) => ({
    ...createActiveWorkoutSessionSlice(...args),
    ...createActiveWorkoutProgressSlice(...args),
  }),
);
