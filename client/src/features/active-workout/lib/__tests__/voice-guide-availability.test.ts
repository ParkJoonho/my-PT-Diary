import { describe, expect, it } from '@jest/globals';
import { hasOriginalVoiceGuide } from '../voice-guide-availability';

describe('원본 음성 가이드 노출 조건', () => {
  it('원본 사전에 있는 운동만 노출 대상으로 판정한다', () => {
    expect(hasOriginalVoiceGuide('스쿼트')).toBe(true);
    expect(hasOriginalVoiceGuide('스트레칭')).toBe(true);
    expect(hasOriginalVoiceGuide('러닝머신')).toBe(false);
    expect(hasOriginalVoiceGuide('가이드 없는 근력 운동')).toBe(false);
  });
});
