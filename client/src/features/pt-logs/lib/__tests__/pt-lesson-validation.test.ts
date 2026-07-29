import { describe, expect, it } from '@jest/globals';
import { createEmptyPtLesson } from '../pt-lesson-form';
import { validatePtLessonForm } from '../pt-lesson-validation';

describe('PT 수업일지 폼 검증', () => {
  it('잘못된 날짜 형식을 막는다', () => {
    const lesson = createEmptyPtLesson();
    lesson.date = '2026-13-40';

    expect(validatePtLessonForm(lesson)).toBe(
      '날짜는 YYYY-MM-DD 형식으로 정확히 입력해 주세요.',
    );
  });

  it('세션 번호 0을 막는다', () => {
    const lesson = createEmptyPtLesson();
    lesson.sessionNumber = 0;

    expect(validatePtLessonForm(lesson)).toBe('세션 번호는 1 이상이어야 해요.');
  });

  it('빈 운동명을 막는다', () => {
    const lesson = createEmptyPtLesson();
    const [exercise] = lesson.exercises;

    if (!exercise) {
      throw new Error('운동 세트가 비어 있으면 안 돼요.');
    }

    exercise.name = '';

    expect(validatePtLessonForm(lesson)).toBe(
      '1번 운동 종목명을 입력해 주세요.',
    );
  });

  it('음수 무게를 막는다', () => {
    const lesson = createEmptyPtLesson();
    const [exercise] = lesson.exercises;
    const [firstSet] = exercise?.sets ?? [];

    if (!exercise || !firstSet) {
      throw new Error('기본 운동 세트가 비어 있으면 안 돼요.');
    }

    exercise.name = '랫풀다운';
    firstSet.weightKg = -1;

    expect(validatePtLessonForm(lesson)).toBe(
      '1번 운동 1세트 무게는 0 이상이어야 해요.',
    );
  });
});
