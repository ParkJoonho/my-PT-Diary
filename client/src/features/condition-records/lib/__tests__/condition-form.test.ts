import { describe, expect, it, jest } from '@jest/globals';
import {
  buildConditionPayload,
  createConditionFormState,
  validateConditionForm,
} from '../condition-form';
import {
  getConditionScoreLabel,
  getSorenessScoreLabel,
} from '../condition-record-metadata';

jest.mock('shared/lib/date', () => ({
  getClientTimeZone: () => 'Asia/Seoul',
  getClientTodayDate: () => '2026-07-23',
}));

describe('컨디션 폼 로직', () => {
  it('컨디션 입력을 서버 payload로 변환한다', () => {
    const form = createConditionFormState();
    const firstCondition = form.conditions[0];
    const thirdCondition = form.conditions[2];
    const targetSoreness = form.muscleSoreness[8];

    if (!firstCondition || !thirdCondition || !targetSoreness) {
      throw new Error('테스트용 컨디션 항목이 필요해요.');
    }

    form.conditions[0] = { ...firstCondition, score: 4 };
    form.conditions[2] = { ...thirdCondition, score: 3 };
    form.muscleSoreness[8] = { ...targetSoreness, score: 2 };

    expect(buildConditionPayload(form)).toEqual({
      conditions: form.conditions,
      date: '2026-07-23',
      muscleSoreness: form.muscleSoreness,
      timeZone: 'Asia/Seoul',
      weekNumber: 1,
    });
  });

  it('주차가 숫자가 아니면 오류를 반환한다', () => {
    const form = createConditionFormState();
    form.weekNumberInput = 'abc';

    expect(validateConditionForm(form)).toBe('주차는 숫자로 입력해 주세요.');
  });

  it('점수 라벨을 반환한다', () => {
    expect(getConditionScoreLabel(5)).toBe('매우 좋음');
    expect(getSorenessScoreLabel(4)).toBe('3일 이상 아픔');
    expect(getConditionScoreLabel(0)).toBe('');
    expect(getSorenessScoreLabel(0)).toBe('');
  });
});
