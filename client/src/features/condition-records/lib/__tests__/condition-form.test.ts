import { describe, expect, it, jest } from '@jest/globals';
import {
  buildConditionPayload,
  createConditionFormState,
  getConditionScoreLabel,
  getSorenessScoreLabel,
  validateConditionForm,
} from '../condition-form';

jest.mock('shared/lib/date', () => ({
  getClientTimeZone: () => 'Asia/Seoul',
  getClientTodayDate: () => '2026-07-23',
}));

describe('컨디션 폼 로직', () => {
  it('컨디션 입력을 서버 payload로 변환한다', () => {
    const form = createConditionFormState();
    form.conditionScores.energy = 4;
    form.conditionScores.sleep = 3;
    form.muscleSoreness.legs = 2;
    form.memo = '하체 약간 뻐근함';

    expect(buildConditionPayload(form)).toEqual({
      checkedOn: '2026-07-23',
      conditionScores: {
        energy: 4,
        motivation: 0,
        sleep: 3,
        stress: 0,
      },
      memo: '하체 약간 뻐근함',
      muscleSoreness: {
        arms: 0,
        back: 0,
        chest: 0,
        core: 0,
        legs: 2,
        shoulders: 0,
      },
      timeZone: 'Asia/Seoul',
    });
  });

  it('입력값이 전부 비어 있으면 오류를 반환한다', () => {
    const form = createConditionFormState();

    expect(validateConditionForm(form)).toBe(
      '컨디션 점수, 근육통, 메모 중 하나는 입력해 주세요.',
    );
  });

  it('점수 라벨을 반환한다', () => {
    expect(getConditionScoreLabel(5)).toBe('매우 좋음');
    expect(getSorenessScoreLabel(4)).toBe('심함');
    expect(getConditionScoreLabel(0)).toBe('미선택');
    expect(getSorenessScoreLabel(0)).toBe('없음');
  });
});
