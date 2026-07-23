import { describe, expect, it } from '@jest/globals';
import { findRoutineById, resolveRoutineSource } from '../find-routine';

describe('루틴 찾기', () => {
  it('기본 추천 루틴을 찾고 static source로 분류한다', () => {
    const routine = findRoutineById('gym_60');

    expect(routine?.label).toBe('1시간 루틴');
    expect(routine ? resolveRoutineSource(routine) : null).toBe('static');
  });

  it('AI mock 루틴을 찾고 ai source로 분류한다', () => {
    const routine = findRoutineById('ai_gym_60');

    expect(routine?.label).toBe('1시간 루틴');
    expect(routine ? resolveRoutineSource(routine) : null).toBe('ai');
  });
});
