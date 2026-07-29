import type { PtLesson } from '../types/pt-log';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map((segment) => Number(segment));
  const date = new Date(`${value}T00:00:00`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}

export function validatePtLessonForm(lesson: PtLesson) {
  if (!lesson.date.trim()) {
    return '날짜를 입력해 주세요.';
  }

  if (!isValidIsoDate(lesson.date.trim())) {
    return '날짜는 YYYY-MM-DD 형식으로 정확히 입력해 주세요.';
  }

  if (!Number.isInteger(lesson.sessionNumber) || lesson.sessionNumber < 1) {
    return '세션 번호는 1 이상이어야 해요.';
  }

  const emptyExerciseIndex = lesson.exercises.findIndex(
    (exercise) => exercise.name.trim().length === 0,
  );

  if (emptyExerciseIndex >= 0) {
    return `${emptyExerciseIndex + 1}번 운동 종목명을 입력해 주세요.`;
  }

  for (const [exerciseIndex, exercise] of lesson.exercises.entries()) {
    for (const [setIndex, set] of exercise.sets.entries()) {
      if (set.weightKg < 0) {
        return `${exerciseIndex + 1}번 운동 ${setIndex + 1}세트 무게는 0 이상이어야 해요.`;
      }

      if (set.reps < 0) {
        return `${exerciseIndex + 1}번 운동 ${setIndex + 1}세트 횟수는 0 이상이어야 해요.`;
      }
    }
  }

  return null;
}
