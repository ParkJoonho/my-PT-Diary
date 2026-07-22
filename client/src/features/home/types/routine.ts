import type { WorkoutRoutine } from '../data/routines';

export type HomeRoutineTab = 'ai' | 'gym' | 'crossfit' | 'home';
export type HomeLocation = 'gym' | 'home';

export type HomeRoutine = WorkoutRoutine & {
  source?: 'mock-ai' | 'static';
};

export type WeeklyDay = {
  completionCount?: number;
  date?: string;
  label: string;
  completed: boolean;
};

export type HomeTabItem = {
  key: 'home' | 'exercise' | 'pt-log' | 'ai-hub' | 'condition';
  label: string;
  implemented: boolean;
};
