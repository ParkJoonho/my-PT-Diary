import { resolveRoutineSource } from 'features/workout-routines/lib/find-routine';
import type { HomeRoutine } from 'features/workout-routines/types/routine';
import type { CreateRoutineWorkoutCompletionDto } from 'shared/api/generated/models';
import {
  formatClientDate,
  getClientTimeZone,
  getUtcISOString,
} from 'shared/lib/date';
import type { CompletedStepMap } from '../types/active-workout';

export function createRoutineCompletionPayload({
  completedSteps,
  durationSeconds,
  now = new Date(),
  routine,
}: {
  completedSteps: CompletedStepMap;
  durationSeconds: number;
  now?: Date;
  routine: HomeRoutine;
}): CreateRoutineWorkoutCompletionDto {
  return {
    completedAt: getUtcISOString(now),
    completedOn: formatClientDate(now),
    durationSeconds,
    routineId: routine.id,
    routineLabel: routine.label,
    routineSource: resolveRoutineSource(routine),
    steps: routine.steps.map((step, index) => ({
      completed: completedSteps[index] ?? false,
      detail: step.detail,
      name: step.name,
      restAfter: step.restAfter,
      sets: step.sets,
      tag: step.tag,
      type: step.type,
    })),
    timeZone: getClientTimeZone(),
  };
}
