import type { HomeRoutine } from 'features/workout-routines/types/routine';
import { type StateCreator, create } from 'zustand';
import type { CompletedStepMap } from '../types/active-workout';

export type ActiveWorkoutSessionSlice = {
  clearSelectedRoutine: () => void;
  selectedRoutine: HomeRoutine | null;
  setSelectedRoutine: (routine: HomeRoutine) => void;
};

export type ActiveWorkoutProgressSlice = {
  clearErrorMessage: (sessionId: string) => void;
  completedSteps: CompletedStepMap;
  countdown: number;
  countdownDone: boolean;
  decrementCountdown: (sessionId: string) => void;
  elapsedMilliseconds: number;
  elapsedSeconds: number;
  errorMessage: string | null;
  initializeProgress: (sessionId: string) => void;
  isPaused: boolean;
  lastResumedAtMs: number | null;
  progressSessionId: string | null;
  resetProgress: (sessionId: string) => void;
  setErrorMessage: (sessionId: string, message: string | null) => void;
  skipCountdown: (sessionId: string, nowMs?: number) => void;
  syncElapsedSeconds: (sessionId: string, nowMs?: number) => number;
  togglePause: (sessionId: string, nowMs?: number) => void;
  toggleStep: (sessionId: string, stepIndex: number) => void;
};

export type ActiveWorkoutStore = ActiveWorkoutSessionSlice &
  ActiveWorkoutProgressSlice;

const COUNTDOWN_START = 3;

function createInitialProgressState() {
  return {
    completedSteps: {} as CompletedStepMap,
    countdown: COUNTDOWN_START,
    countdownDone: false,
    elapsedMilliseconds: 0,
    elapsedSeconds: 0,
    errorMessage: null as string | null,
    isPaused: false,
    lastResumedAtMs: null as number | null,
    progressSessionId: null as string | null,
  };
}

function getNowMs(nowMs?: number) {
  return nowMs ?? Date.now();
}

function isProgressOwner(
  state: Pick<ActiveWorkoutProgressSlice, 'progressSessionId'>,
  sessionId: string,
) {
  return state.progressSessionId === sessionId;
}

function resolveElapsedMilliseconds(
  state: Pick<
    ActiveWorkoutProgressSlice,
    'countdownDone' | 'elapsedMilliseconds' | 'isPaused' | 'lastResumedAtMs'
  >,
  nowMs: number,
) {
  if (!state.countdownDone) {
    return 0;
  }

  if (state.isPaused || state.lastResumedAtMs === null) {
    return state.elapsedMilliseconds;
  }

  return state.elapsedMilliseconds + Math.max(nowMs - state.lastResumedAtMs, 0);
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
> = (set, get) => ({
  ...createInitialProgressState(),
  clearErrorMessage: (sessionId) => {
    set((state) =>
      isProgressOwner(state, sessionId) ? { errorMessage: null } : state,
    );
  },
  decrementCountdown: (sessionId) => {
    set((state) => {
      if (!isProgressOwner(state, sessionId) || state.countdownDone) {
        return state;
      }

      return {
        countdown: Math.max(state.countdown - 1, 0),
      };
    });
  },
  initializeProgress: (sessionId) => {
    set({
      ...createInitialProgressState(),
      progressSessionId: sessionId,
    });
  },
  resetProgress: (sessionId) => {
    set((state) =>
      isProgressOwner(state, sessionId) ? createInitialProgressState() : state,
    );
  },
  setErrorMessage: (sessionId, errorMessage) => {
    set((state) =>
      isProgressOwner(state, sessionId) ? { errorMessage } : state,
    );
  },
  skipCountdown: (sessionId, nowMs) => {
    set((state) => {
      if (!isProgressOwner(state, sessionId) || state.countdownDone) {
        return state;
      }

      return {
        countdown: 0,
        countdownDone: true,
        elapsedMilliseconds: 0,
        elapsedSeconds: 0,
        isPaused: false,
        lastResumedAtMs: getNowMs(nowMs),
      };
    });
  },
  syncElapsedSeconds: (sessionId, nowMs) => {
    const state = get();

    if (!isProgressOwner(state, sessionId)) {
      return state.elapsedSeconds;
    }

    const elapsedSeconds = Math.floor(
      resolveElapsedMilliseconds(state, getNowMs(nowMs)) / 1000,
    );

    if (state.elapsedSeconds !== elapsedSeconds) {
      set({ elapsedSeconds });
    }

    return elapsedSeconds;
  },
  togglePause: (sessionId, nowMs) => {
    set((state) => {
      if (!isProgressOwner(state, sessionId) || !state.countdownDone) {
        return state;
      }

      if (state.isPaused) {
        return {
          isPaused: false,
          lastResumedAtMs: getNowMs(nowMs),
        };
      }

      const elapsedMilliseconds = resolveElapsedMilliseconds(
        state,
        getNowMs(nowMs),
      );

      return {
        elapsedMilliseconds,
        elapsedSeconds: Math.floor(elapsedMilliseconds / 1000),
        isPaused: true,
        lastResumedAtMs: null,
      };
    });
  },
  toggleStep: (sessionId, stepIndex) => {
    set((state) => {
      if (!isProgressOwner(state, sessionId)) {
        return state;
      }

      return {
        completedSteps: {
          ...state.completedSteps,
          [stepIndex]: !state.completedSteps[stepIndex],
        },
      };
    });
  },
});

export const useActiveWorkoutStore = create<ActiveWorkoutStore>()(
  (...args) => ({
    ...createActiveWorkoutSessionSlice(...args),
    ...createActiveWorkoutProgressSlice(...args),
  }),
);
