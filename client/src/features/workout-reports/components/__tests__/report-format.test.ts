import { describe, expect, it } from '@jest/globals';
import type {
  ConditionRecordDto,
  WorkoutRecordDto,
} from 'shared/api/generated/models';
import {
  buildBodyCompositionTrend,
  buildConditionTrend,
  buildVolumeTrend,
} from '../report-format';

function createWorkoutRecord(
  overrides: Partial<WorkoutRecordDto> = {},
): WorkoutRecordDto {
  return {
    bodyComposition: null,
    completedAt: '2026-07-23T12:34:56.000Z',
    completedOn: '2026-07-23',
    createdAt: '2026-07-23T12:35:00.000Z',
    durationSeconds: 3600,
    id: 'record-1',
    manualDetail: null,
    performedAt: '2026-07-23T12:34:56.000Z',
    performedOn: '2026-07-23',
    routineId: null,
    routineLabel: null,
    routineSource: null,
    source: 'manual',
    steps: [],
    summary: {},
    timeZone: 'Asia/Seoul',
    title: '운동',
    updatedAt: '2026-07-23T12:35:00.000Z',
    weeklyCompletionId: null,
    ...overrides,
  };
}

function createConditionRecord(
  overrides: Partial<ConditionRecordDto> = {},
): ConditionRecordDto {
  return {
    checkedOn: '2026-07-23',
    conditionScores: {
      energy: 4,
      motivation: 4,
      sleep: 4,
      stress: 4,
    },
    createdAt: '2026-07-23T12:35:00.000Z',
    id: 'condition-1',
    memo: null,
    muscleSoreness: {
      arms: 0,
      back: 0,
      chest: 0,
      core: 0,
      legs: 0,
      shoulders: 0,
    },
    summary: {
      averageConditionScore: 4,
      averageSorenessScore: null,
      selectedConditionCount: 4,
      selectedSorenessCount: 0,
      severeSorenessCount: 0,
    },
    timeZone: 'Asia/Seoul',
    updatedAt: '2026-07-23T12:35:00.000Z',
    ...overrides,
  };
}

describe('운동 리포트 추이 포맷', () => {
  it('볼륨 추이를 날짜순 최근 8개로 만든다', () => {
    const trend = buildVolumeTrend(
      Array.from({ length: 10 }, (_, index) =>
        createWorkoutRecord({
          id: `record-${index}`,
          performedOn: `2026-07-${String(index + 1).padStart(2, '0')}`,
          summary: { totalVolumeKg: index * 100 },
        }),
      ),
    );

    expect(trend).toHaveLength(8);
    expect(trend[0]).toEqual({ date: '2026-07-03', value: 200 });
    expect(trend.at(-1)).toEqual({ date: '2026-07-10', value: 900 });
  });

  it('컨디션 추이를 날짜순으로 만든다', () => {
    expect(
      buildConditionTrend([
        createConditionRecord({
          checkedOn: '2026-07-03',
          summary: {
            averageConditionScore: 3,
            averageSorenessScore: null,
            selectedConditionCount: 1,
            selectedSorenessCount: 0,
            severeSorenessCount: 0,
          },
        }),
        createConditionRecord({
          checkedOn: '2026-07-01',
          summary: {
            averageConditionScore: 5,
            averageSorenessScore: null,
            selectedConditionCount: 1,
            selectedSorenessCount: 0,
            severeSorenessCount: 0,
          },
        }),
      ]),
    ).toEqual([
      { date: '2026-07-01', value: 5 },
      { date: '2026-07-03', value: 3 },
    ]);
  });

  it('체성분 추이를 체중이 있는 기록으로 만든다', () => {
    expect(
      buildBodyCompositionTrend([
        createWorkoutRecord({
          bodyComposition: { weightKg: 72.4 },
          performedOn: '2026-07-02',
        }),
        createWorkoutRecord({
          bodyComposition: null,
          performedOn: '2026-07-01',
        }),
      ]),
    ).toEqual([
      {
        bodyFatPercentage: undefined,
        date: '2026-07-02',
        skeletalMuscleMassKg: undefined,
        weightKg: 72.4,
      },
    ]);
  });
});
