import { WorkoutRecordSource } from '../../workout-records/dto/workout-record-response.dto';
import { WorkoutRecordRow } from '../../workout-records/workout-records.repository.port';
import {
  CONDITION_LABELS,
  MUSCLE_SORENESS_LABELS,
} from '../../condition-records/condition-records.constants';
import { ConditionRecordRow } from '../../condition-records/condition-records.repository.port';
import { WorkoutReportsRepositoryPort } from '../workout-reports.repository.port';
import { WorkoutReportsService } from '../workout-reports.service';

function getConditionScore(label: string) {
  switch (label) {
    case '훈련 동기':
      return 5;
    case '수면시간':
      return 3;
    case '수행력':
      return 4;
    default:
      return 0;
  }
}

function getSorenessScore(label: string) {
  switch (label) {
    case '가슴':
      return 2;
    case '광배근':
      return 1;
    case '대퇴사두근':
      return 3;
    default:
      return 0;
  }
}

function createWorkoutRecordRow(
  overrides: Partial<WorkoutRecordRow> = {},
): WorkoutRecordRow {
  return {
    body_composition: null,
    completed_at: '2026-07-23 12:34:56+00',
    completed_on: '2026-07-23',
    created_at: '2026-07-23 12:35:00+00',
    duration_seconds: 3600,
    id: 'workout-1',
    manual_detail: null,
    performed_on: '2026-07-23',
    routine_id: null,
    routine_label: null,
    routine_source: null,
    source: WorkoutRecordSource.Manual,
    steps: [],
    summary: {
      cardioDurationSeconds: 900,
      totalVolumeKg: 1160,
    },
    time_zone: 'Asia/Seoul',
    title: '상체 개인 운동',
    updated_at: '2026-07-23 12:35:00+00',
    user_key: 'user-a',
    weekly_completion_id: 'weekly-1',
    ...overrides,
  };
}

function createConditionRecordRow(
  overrides: Partial<ConditionRecordRow> = {},
): ConditionRecordRow {
  return {
    checked_on: '2026-07-23',
    condition_scores: CONDITION_LABELS.map((label) => ({
      label,
      score: getConditionScore(label),
    })),
    created_at: '2026-07-23 12:35:00+00',
    id: 'condition-1',
    muscle_soreness: MUSCLE_SORENESS_LABELS.map((label) => ({
      label,
      score: getSorenessScore(label),
    })),
    summary: {
      averageConditionScore: 4,
      averageSorenessScore: 2,
      selectedConditionCount: 3,
      selectedSorenessCount: 3,
      severeSorenessCount: 1,
    },
    time_zone: 'Asia/Seoul',
    updated_at: '2026-07-23 12:35:00+00',
    user_key: 'user-a',
    week_number: 1,
    ...overrides,
  };
}

describe('운동 리포트 서비스', () => {
  let repository: jest.Mocked<WorkoutReportsRepositoryPort>;
  let service: WorkoutReportsService;

  beforeEach(() => {
    repository = {
      listConditionRecordsForReport: jest.fn(),
      listWorkoutRecordsForReport: jest.fn(),
    };
    service = new WorkoutReportsService(repository);
  });

  it('운동 기록과 컨디션 기록을 리포트 요약으로 집계한다', async () => {
    repository.listWorkoutRecordsForReport.mockResolvedValue([
      createWorkoutRecordRow(),
      createWorkoutRecordRow({
        completed_at: '2026-07-21 12:34:56+00',
        completed_on: '2026-07-21',
        duration_seconds: 1800,
        id: 'workout-2',
        performed_on: '2026-07-21',
        summary: {
          cardioDurationSeconds: 0,
          totalVolumeKg: 840,
        },
      }),
      createWorkoutRecordRow({
        completed_on: '2026-07-10',
        id: 'workout-3',
        performed_on: '2026-07-10',
      }),
    ]);
    repository.listConditionRecordsForReport.mockResolvedValue([
      createConditionRecordRow(),
      createConditionRecordRow({
        checked_on: '2026-07-22',
        id: 'condition-2',
        summary: {
          averageConditionScore: 3,
          averageSorenessScore: 1,
          selectedConditionCount: 3,
          selectedSorenessCount: 2,
          severeSorenessCount: 0,
        },
      }),
    ]);

    const result = await service.getSummary('user-a', {
      referenceDate: '2026-07-23',
    });

    expect(result.currentWeek).toEqual({
      weekEndDate: '2026-07-26',
      weekStartDate: '2026-07-20',
      workoutDayCount: 2,
      workoutRecordCount: 2,
    });
    expect(result.totals).toEqual({
      cardioDurationSeconds: 1800,
      conditionRecordCount: 2,
      durationSeconds: 9000,
      totalVolumeKg: 3160,
      workoutDayCount: 3,
      workoutRecordCount: 3,
    });
    expect(result.condition).toEqual({
      averageConditionScore: 3.5,
      averageSorenessScore: 1.5,
    });
    expect(result.weeklyFrequency).toHaveLength(12);
    expect(result.weeklyFrequency.at(-1)).toEqual(
      expect.objectContaining({
        weekEndDate: '2026-07-26',
        weekStartDate: '2026-07-20',
        workoutRecordCount: 2,
      }),
    );
  });
});
