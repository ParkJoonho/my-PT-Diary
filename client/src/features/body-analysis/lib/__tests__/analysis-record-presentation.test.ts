import { describe, expect, it } from '@jest/globals';
import {
  getAnalysisRecordCardMeta,
  getAnalysisRecordTypeLabel,
  isComparableAnalysisRecordType,
} from '../analysis-record-presentation';

describe('분석 기록 표시 메타', () => {
  it('body-comparison 기록은 전용 제목과 grade 배지를 사용한다', () => {
    expect(
      getAnalysisRecordCardMeta({
        analysisType: 'body-comparison',
        analyzedAt: '2026-07-28T01:23:45.000Z',
        createdAt: '2026-07-28T01:23:45.000Z',
        id: 'record_1',
        qualitativeData: {
          grade: 'A',
          summary: '상체와 코어 안정성이 좋아졌어요.',
        },
        quantitativeData: {
          score: 84,
        },
      }),
    ).toEqual({
      badgeText: 'A',
      comparable: false,
      summary: '상체와 코어 안정성이 좋아졌어요.',
      title: '전·후 비교 분석',
    });
  });

  it('body 기록만 비교 가능 타입으로 본다', () => {
    expect(isComparableAnalysisRecordType('body')).toBe(true);
    expect(isComparableAnalysisRecordType('body-comparison')).toBe(false);
  });

  it('타입 라벨을 한글로 반환한다', () => {
    expect(getAnalysisRecordTypeLabel('body')).toBe('체형 분석');
    expect(getAnalysisRecordTypeLabel('body-comparison')).toBe('전·후 비교');
  });
});
