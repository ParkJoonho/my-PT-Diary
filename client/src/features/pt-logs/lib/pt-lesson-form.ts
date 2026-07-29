import { getClientTodayDate } from 'shared/lib/date';
import { KOREAN_DAYS } from '../data/pt-log-options';
import type { PtExerciseEntry, PtExerciseSet, PtLesson } from '../types/pt-log';

type PtSetMetricsInput = Pick<PtExerciseSet, 'reps' | 'weightKg'>;

export function generatePtLessonId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const randomValue = Math.floor(Math.random() * 16);
    const value = char === 'x' ? randomValue : (randomValue & 0x3) | 0x8;

    return value.toString(16);
  });
}

export function getKoreanDayOfWeek(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return KOREAN_DAYS[date.getDay()] ?? '';
}

export function calculateExerciseStats(sets: PtSetMetricsInput[]) {
  const volumeKg = sets.reduce(
    (total, set) => total + (set.weightKg || 0) * (set.reps || 0),
    0,
  );
  const maxSet = sets.reduce<PtSetMetricsInput>(
    (best, set) => (set.weightKg > best.weightKg ? set : best),
    { reps: 0, weightKg: 0 },
  );
  const lbWeight = Math.round(maxSet.weightKg * 2.20462 * 10) / 10;
  const estimatedOneRepMaxKg =
    maxSet.reps > 0 && maxSet.weightKg > 0
      ? Math.round(maxSet.weightKg * (1 + maxSet.reps / 30) * 10) / 10
      : 0;

  return {
    estimatedOneRepMaxKg,
    lbWeight,
    maxWeightKg: maxSet.weightKg,
    volumeKg,
  };
}

export function createEmptySet(): PtExerciseSet {
  return {
    id: generatePtLessonId(),
    reps: 0,
    weightKg: 0,
  };
}

export function createEmptyExercise(): PtExerciseEntry {
  return {
    ...calculateExerciseStats([
      createEmptySet(),
      createEmptySet(),
      createEmptySet(),
    ]),
    name: '',
    restTime: '',
    rir: '',
    sets: [createEmptySet(), createEmptySet(), createEmptySet()],
  };
}

export function createEmptyPtLesson(): PtLesson {
  const date = getClientTodayDate();

  return {
    bodyParts: [],
    comment: '',
    createdAt: Date.now(),
    date,
    dayOfWeek: getKoreanDayOfWeek(date),
    equipment: [],
    exercises: [createEmptyExercise()],
    id: generatePtLessonId(),
    sessionNumber: 1,
    summary: {
      exerciseCount: 1,
      setCount: 3,
      totalVolumeKg: 0,
    },
    warmUp: '',
  };
}

export function clonePtLesson(lesson: PtLesson): PtLesson {
  return {
    ...lesson,
    bodyParts: [...lesson.bodyParts],
    equipment: [...lesson.equipment],
    exercises: lesson.exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => ({ ...set })),
    })),
    summary: { ...lesson.summary },
  };
}
