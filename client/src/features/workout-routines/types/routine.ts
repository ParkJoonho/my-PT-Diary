import type { WorkoutRoutine } from '../data/recommended-routines';

export type HomeRoutineTab = 'ai' | 'gym' | 'crossfit' | 'home';
export type HomeLocation = 'gym' | 'home';

export type HomeRoutine = WorkoutRoutine & {
  source?: 'mock-ai' | 'static';
};
