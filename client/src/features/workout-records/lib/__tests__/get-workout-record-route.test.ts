import { describe, expect, it } from '@jest/globals';
import type { WorkoutRecordDto } from 'shared/api/generated/models';
import { getWorkoutRecordRoute } from '../get-workout-record-route';

const baseRecord: WorkoutRecordDto = {
  bodyComposition: null,
  completedAt: '2026-07-24T01:23:45.000Z',
  completedOn: '2026-07-24',
  createdAt: '2026-07-24T01:23:45.000Z',
  durationSeconds: 1800,
  id: 'record-1',
  manualDetail: null,
  performedAt: '2026-07-24T01:23:45.000Z',
  performedOn: '2026-07-24',
  routineId: null,
  routineLabel: null,
  routineSource: null,
  source: 'manual',
  steps: [],
  summary: {},
  timeZone: 'Asia/Seoul',
  title: '테스트 운동',
  updatedAt: '2026-07-24T01:23:45.000Z',
  weeklyCompletionId: null,
};

describe('운동 기록 진입 라우트', () => {
  it('수동 기록은 수정 폼으로 연다', () => {
    expect(getWorkoutRecordRoute(baseRecord)).toEqual({
      name: '/exercise-form',
      params: {
        recordId: 'record-1',
      },
    });
  });

  it('루틴 완료 기록은 상세 화면으로 연다', () => {
    expect(
      getWorkoutRecordRoute({
        ...baseRecord,
        routineId: 'gym_60',
        routineLabel: '1시간 루틴',
        routineSource: 'static',
        source: 'routine',
      }),
    ).toEqual({
      name: '/exercise-record-detail',
      params: {
        recordId: 'record-1',
      },
    });
  });
});
