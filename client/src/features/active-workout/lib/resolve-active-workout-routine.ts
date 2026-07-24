import { findRoutineById } from 'features/workout-routines/lib/find-routine';
import type { HomeRoutine } from 'features/workout-routines/types/routine';

export function resolveActiveWorkoutRouteRoutine({
  routeRoutineId,
  selectedRoutine,
}: {
  routeRoutineId?: string;
  selectedRoutine?: HomeRoutine | null;
}) {
  if (
    selectedRoutine &&
    (!routeRoutineId || selectedRoutine.id === routeRoutineId)
  ) {
    return selectedRoutine;
  }

  if (!routeRoutineId) {
    return null;
  }

  return findRoutineById(routeRoutineId);
}
