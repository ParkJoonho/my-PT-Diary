import { formatExerciseTimeLabel } from 'features/workout-records/lib/manual-workout-form';
import type { HomeRoutine } from 'features/workout-routines/types/routine';
import type { CreateManualWorkoutRecordDto } from 'shared/api/generated/models';
import {
  formatClientDate,
  getClientTimeZone,
  getUtcISOString,
} from 'shared/lib/date';
import type { CompletedStepMap } from '../types/active-workout';

export function createManualWorkoutPayload({
  completedSteps,
  durationSeconds,
  now = new Date(),
  routine,
}: {
  completedSteps: CompletedStepMap;
  durationSeconds: number;
  now?: Date;
  routine: HomeRoutine;
}): CreateManualWorkoutRecordDto {
  const completedCount = routine.steps.filter(
    (_, index) => completedSteps[index],
  ).length;
  const strengthExercises = routine.steps
    .filter((step, index) => step.type === 'strength' && completedSteps[index])
    .map((step) => {
      const { reps, sets } = parseRepsFromDetail(step.detail);
      const seconds = parseSecondsFromDetail(step.detail);
      const actualSets = step.sets || sets;

      return {
        estimated1RM: 0,
        lbWeight: 0,
        maxWeight: 0,
        name: step.name,
        restTime: step.restAfter ?? '',
        rir: '',
        sets: Array.from({ length: actualSets }, () => ({
          reps: reps > 0 ? reps : seconds > 0 ? seconds : undefined,
          weightKg: 0,
        })),
        volume: 0,
      };
    });

  let treadmillMinutes = 0;
  let cycleMinutes = 0;
  let stairClimberMinutes = 0;
  let totalDistanceMeters = 0;

  routine.steps.forEach((step, index) => {
    if (step.type !== 'cardio' || !completedSteps[index]) {
      return;
    }

    const minutes = parseMinutesFromDetail(step.detail);
    const distanceMeters = parseDistanceMetersFromDetail(step.detail);
    totalDistanceMeters += distanceMeters;

    if (step.name.includes('러닝머신')) {
      treadmillMinutes += minutes;
      return;
    }

    if (step.name.includes('사이클')) {
      cycleMinutes += minutes;
      return;
    }

    if (step.name.includes('계단')) {
      stairClimberMinutes += minutes;
    }
  });

  const cardioDurationSeconds =
    (treadmillMinutes + cycleMinutes + stairClimberMinutes) * 60;
  const steps =
    routine.location === 'home' && cardioDurationSeconds > 0
      ? Math.round((cardioDurationSeconds / 60) * 120)
      : undefined;

  return {
    activityLevel: routine.location === 'home' ? '홈트레이닝' : '헬스장',
    cardio:
      cardioDurationSeconds > 0 || steps || totalDistanceMeters > 0
        ? {
            cycleMinutes: cycleMinutes || undefined,
            distanceMeters: totalDistanceMeters || undefined,
            durationSeconds: cardioDurationSeconds || undefined,
            stairClimberMinutes: stairClimberMinutes || undefined,
            steps,
            treadmillMinutes: treadmillMinutes || undefined,
          }
        : undefined,
    dailyReport: `[${routine.location === 'home' ? '홈' : '헬스장'}] ${routine.label} (${routine.duration}) 완료 · ${completedCount}/${routine.steps.length}개 항목`,
    durationSeconds: Math.max(durationSeconds, 1),
    exerciseTime: formatExerciseTimeLabel(durationSeconds),
    location: routine.location,
    performedAt: getUtcISOString(now),
    performedOn: formatClientDate(now),
    strengthExercises: strengthExercises.length ? strengthExercises : undefined,
    timeZone: getClientTimeZone(),
  };
}

function parseRepsFromDetail(detail: string) {
  const repsMatch = detail.match(/(\d+)회/);
  const setsMatch = detail.match(/x\s*(\d+)세트/);

  return {
    reps: repsMatch ? Number.parseInt(repsMatch[1] ?? '0', 10) : 0,
    sets: setsMatch ? Number.parseInt(setsMatch[1] ?? '1', 10) : 1,
  };
}

function parseSecondsFromDetail(detail: string) {
  const secondsMatch = detail.match(/(\d+)초/);

  return secondsMatch ? Number.parseInt(secondsMatch[1] ?? '0', 10) : 0;
}

function parseMinutesFromDetail(detail: string) {
  const minutesMatch = detail.match(/(\d+)분/);

  return minutesMatch ? Number.parseInt(minutesMatch[1] ?? '0', 10) : 0;
}

function parseDistanceMetersFromDetail(detail: string) {
  const kilometersMatch = detail.match(/(\d+(?:\.\d+)?)km/);

  if (!kilometersMatch?.[1]) {
    return 0;
  }

  return Math.round(Number(kilometersMatch[1]) * 1000);
}
