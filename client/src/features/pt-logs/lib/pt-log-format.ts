import type { PtDateRange, PtLesson } from '../types/pt-log';
import { getKoreanDayOfWeek } from './pt-lesson-form';

export function formatPtLessonDate(dateString: string) {
  if (!dateString) {
    return '';
  }

  const [year, month, day] = dateString
    .split('-')
    .map((value) => Number(value));

  if (!year || !month || !day) {
    return dateString;
  }

  return `${month}/${day} (${getKoreanDayOfWeek(dateString)})`;
}

export function formatShortPtDate(dateString: string) {
  const [, month, day] = dateString.split('-').map((value) => Number(value));

  if (!month || !day) {
    return dateString;
  }

  return `${month}/${day}`;
}

export function formatPtDateRangeLabel(range: PtDateRange) {
  if (!range.start) {
    return '전체';
  }

  if (!range.end || range.start === range.end) {
    return formatShortPtDate(range.start);
  }

  return `${formatShortPtDate(range.start)} ~ ${formatShortPtDate(range.end)}`;
}

export function filterPtLessonsByRange(
  lessons: PtLesson[],
  range: PtDateRange,
) {
  if (!range.start) {
    return lessons;
  }

  if (!range.end || range.start === range.end) {
    return lessons.filter((lesson) => lesson.date === range.start);
  }

  const { end, start } = range;

  return lessons.filter((lesson) => lesson.date >= start && lesson.date <= end);
}

export function getPtLessonTotalVolume(lesson: PtLesson) {
  return lesson.exercises.reduce(
    (total, exercise) => total + exercise.volumeKg,
    0,
  );
}
