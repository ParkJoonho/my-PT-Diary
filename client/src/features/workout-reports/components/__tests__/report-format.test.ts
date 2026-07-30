import { describe, expect, it } from '@jest/globals';
import type { WorkoutReportSummaryDto } from 'shared/api/generated/models';
import {
  formatReportCompactNumber,
  formatShortDate,
  getWorkoutReportChartWidth,
  getWorkoutReportInsight,
} from '../report-format';

function createSummary(
  overrides: Partial<WorkoutReportSummaryDto> = {},
): WorkoutReportSummaryDto {
  return {
    bodyCompositionTrend: [],
    condition: {
      averageConditionScore: 4,
      averageSorenessScore: 2,
    },
    conditionTrend: [],
    currentWeek: {
      weekEndDate: '2026-07-25',
      weekStartDate: '2026-07-19',
      workoutDayCount: 2,
      workoutRecordCount: 3,
    },
    manualTotals: {
      totalVolumeKg: 1160,
      workoutRecordCount: 2,
    },
    referenceDate: '2026-07-23',
    totals: {
      cardioDurationSeconds: 900,
      conditionRecordCount: 1,
      durationSeconds: 3600,
      totalVolumeKg: 1160,
      workoutDayCount: 2,
      workoutRecordCount: 3,
    },
    volumeTrend: [],
    weightTrend: [],
    weeklyFrequency: [],
    ...overrides,
  };
}

describe('운동 리포트 포맷 유틸', () => {
  it('짧은 날짜 라벨을 월/일 형식으로 만든다', () => {
    expect(formatShortDate('2026-07-24')).toBe('7/24');
  });

  it('큰 수는 k 단위로 축약한다', () => {
    expect(formatReportCompactNumber(1160)).toBe('1.2k');
    expect(formatReportCompactNumber(840)).toBe('840');
  });

  it('기록 탭 내장 차트는 바깥 16과 카드 안쪽 16만 폭에서 차감한다', () => {
    expect(getWorkoutReportChartWidth(390, 'embedded')).toBe(326);
    expect(getWorkoutReportChartWidth(390, 'detail')).toBe(350);
  });

  it('볼륨 탭 인사이트를 이전 기록 대비로 만든다', () => {
    expect(
      getWorkoutReportInsight(
        createSummary({
          volumeTrend: [
            { date: '2026-07-21', value: 840 },
            { date: '2026-07-23', value: 1160 },
          ],
        }),
        'volume',
      ),
    ).toContain('320kg 늘었어요');
  });

  it('체중 탭 인사이트를 첫 기록 대비로 만든다', () => {
    expect(
      getWorkoutReportInsight(
        createSummary({
          weightTrend: [
            { date: '2026-07-01', value: 70.5 },
            { date: '2026-07-23', value: 72.0 },
          ],
        }),
        'weight',
      ),
    ).toBe('첫 기록 대비 1.5kg 늘었어요.');
  });

  it('컨디션 탭 인사이트를 평균과 비교한다', () => {
    expect(
      getWorkoutReportInsight(
        createSummary({
          conditionTrend: [
            { date: '2026-07-20', value: 3 },
            { date: '2026-07-21', value: 4 },
            { date: '2026-07-23', value: 5 },
          ],
        }),
        'condition',
      ),
    ).toBe('최근 컨디션이 평균(4.0) 이상으로 좋은 상태입니다.');
  });

  it('주간 빈도 인사이트를 평균 횟수 기준으로 만든다', () => {
    expect(
      getWorkoutReportInsight(
        createSummary({
          weeklyFrequency: [
            {
              weekEndDate: '2026-07-11',
              weekStartDate: '2026-07-05',
              workoutDayCount: 2,
              workoutRecordCount: 2,
            },
            {
              weekEndDate: '2026-07-18',
              weekStartDate: '2026-07-12',
              workoutDayCount: 4,
              workoutRecordCount: 4,
            },
          ],
        }),
        'frequency',
      ),
    ).toBe('주당 평균 3.0회 운동하고 있습니다. 꾸준히 잘하고 있어요!');
  });
});
