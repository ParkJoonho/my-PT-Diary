export type RoutineStepType = 'cardio' | 'strength' | 'stretch' | 'rest';
export type RoutineLocation = 'gym' | 'home';
export type RoutinePattern = 'general' | 'crossfit';
export type RoutineSource = 'mock-ai' | 'static';
export type RoutineSelectorTab = 'ai' | 'gym' | 'crossfit' | 'home';

export interface RoutineStep {
  name: string;
  detail: string;
  type: RoutineStepType;
  restAfter?: string;
  sets?: number;
  tag?: string;
}

export interface WorkoutRoutine {
  id: string;
  label: string;
  duration: string;
  location: RoutineLocation;
  pattern?: RoutinePattern;
  source?: RoutineSource;
  steps: RoutineStep[];
}
