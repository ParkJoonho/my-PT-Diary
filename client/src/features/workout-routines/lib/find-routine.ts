import {
  MOCK_AI_GYM_ROUTINES,
  MOCK_AI_HOME_ROUTINES,
} from '../data/mock-routines';
import { RECOMMENDED_ROUTINES } from '../data/recommended-routines';
import type { HomeRoutine } from '../types/routine';

const ROUTINES: HomeRoutine[] = [
  ...MOCK_AI_GYM_ROUTINES,
  ...MOCK_AI_HOME_ROUTINES,
  ...RECOMMENDED_ROUTINES.map((routine) => ({
    ...routine,
    source: 'static' as const,
  })),
];

export function findRoutineById(routineId: string): HomeRoutine | null {
  return ROUTINES.find((routine) => routine.id === routineId) ?? null;
}

export function resolveRoutineSource(routine: HomeRoutine) {
  return routine.source === 'mock-ai' ? 'ai' : 'static';
}
