import { NotFoundException } from '@nestjs/common';
import { CreateManualWorkoutRecordDto } from '../dto/create-manual-workout-record.dto';
import { CreateRoutineWorkoutCompletionDto } from '../dto/create-routine-workout-completion.dto';
import {
  WorkoutRecordSource,
  WorkoutStepType,
} from '../dto/workout-record-response.dto';
import {
  WorkoutRecordRow,
  WorkoutRecordsRepositoryPort,
} from '../workout-records.repository.port';
import { WorkoutRecordsService } from '../workout-records.service';

const 루틴완료요청: CreateRoutineWorkoutCompletionDto = {
  completedAt: '2026-07-23T12:34:56.000Z',
  completedOn: '2026-07-23',
  durationSeconds: 1820,
  routineId: 'gym_60',
  routineLabel: '1시간 루틴',
  routineSource: 'static',
  steps: [
    {
      completed: true,
      detail: '20분, 6km',
      name: '러닝머신',
      restAfter: '5분',
      tag: '유산소 운동',
      type: WorkoutStepType.Cardio,
    },
    {
      completed: true,
      detail: '10회 x 3세트',
      name: '푸시업',
      sets: 3,
      tag: '상체 근력 강화',
      type: WorkoutStepType.Strength,
    },
    {
      completed: false,
      detail: '5분',
      name: '스트레칭',
      tag: '유연성 향상',
      type: WorkoutStepType.Stretch,
    },
  ],
  timeZone: 'Asia/Seoul',
};

const 수동운동요청: CreateManualWorkoutRecordDto = {
  bodyComposition: {
    weightKg: 72.4,
  },
  cardio: {
    durationSeconds: 900,
    steps: 4200,
  },
  durationSeconds: 3600,
  location: 'gym',
  memo: '마지막 세트 힘듦',
  performedAt: '2026-07-24T12:34:56.000Z',
  performedOn: '2026-07-24',
  strengthExercises: [
    {
      name: '벤치프레스',
      sets: [
        { reps: 10, weightKg: 60 },
        { reps: 8, weightKg: 70 },
      ],
    },
  ],
  timeZone: 'Asia/Seoul',
  title: '상체 개인 운동',
};

function createRecordRow(overrides: Partial<WorkoutRecordRow> = {}) {
  return {
    body_composition: null,
    completed_at: '2026-07-23 12:34:56+00',
    completed_on: '2026-07-23',
    created_at: '2026-07-23 12:35:00+00',
    duration_seconds: 1820,
    id: 'record-1',
    manual_detail: null,
    performed_at: '2026-07-23 12:34:56+00',
    performed_on: '2026-07-23',
    routine_id: 'gym_60',
    routine_label: '1시간 루틴',
    routine_source: 'static',
    source: WorkoutRecordSource.Routine,
    steps: 루틴완료요청.steps,
    summary: {
      cardioDistanceMeters: 6000,
      cardioDurationSeconds: 1200,
      cardioStepCount: 1,
      cardioSteps: 0,
      completedStepCount: 2,
      strengthExerciseCount: 1,
      strengthSetCount: 3,
      strengthStepCount: 1,
      stretchStepCount: 0,
      totalStepCount: 3,
    },
    time_zone: 'Asia/Seoul',
    title: null,
    updated_at: '2026-07-23 12:35:00+00',
    user_key: 'user-a',
    weekly_completion_id: 'weekly-1',
    ...overrides,
  } satisfies WorkoutRecordRow;
}

describe('운동 기록 서비스', () => {
  let repository: jest.Mocked<WorkoutRecordsRepositoryPort>;
  let service: WorkoutRecordsService;

  beforeEach(() => {
    repository = {
      createManualWorkoutRecord: jest.fn(),
      createRoutineWorkoutCompletion: jest.fn(),
      deleteWorkoutRecord: jest.fn(),
      findWorkoutRecord: jest.fn(),
      listWorkoutRecords: jest.fn(),
      updateManualWorkoutRecord: jest.fn(),
    };
    service = new WorkoutRecordsService(repository);
  });

  it('루틴 완료 요청을 요약하고 주간 완료와 함께 저장한다', async () => {
    repository.createRoutineWorkoutCompletion.mockResolvedValue(
      createRecordRow(),
    );

    const result = await service.createRoutineWorkoutCompletion(
      'user-a',
      루틴완료요청,
    );

    const createArgs =
      repository.createRoutineWorkoutCompletion.mock.calls[0]?.[0];

    expect(createArgs).toEqual(
      expect.objectContaining({
        completedAt: '2026-07-23T12:34:56.000Z',
        completedOn: '2026-07-23',
        durationSeconds: 1820,
        routineId: 'gym_60',
        routineLabel: '1시간 루틴',
        routineSource: 'static',
        timeZone: 'Asia/Seoul',
        userKey: 'user-a',
        weeklyCompletionNote: '1시간 루틴 완료 2/3',
      }),
    );
    expect(createArgs?.summary).toEqual({
      cardioDistanceMeters: 6000,
      cardioDurationSeconds: 1200,
      cardioStepCount: 1,
      cardioSteps: 0,
      completedStepCount: 2,
      strengthExerciseCount: 1,
      strengthSetCount: 3,
      strengthStepCount: 1,
      stretchStepCount: 0,
      totalStepCount: 3,
    });
    expect(typeof createArgs?.recordId).toBe('string');
    expect(typeof createArgs?.weeklyCompletionId).toBe('string');
    expect(result.workoutRecord.id).toBe('record-1');
    expect(result.weeklyCompletion).toEqual({
      completedOn: '2026-07-23',
      id: createArgs?.weeklyCompletionId,
      source: 'routine',
    });
  });

  it('수동 운동 기록을 요약하고 주간 완료와 함께 저장한다', async () => {
    repository.createManualWorkoutRecord.mockResolvedValue(
      createRecordRow({
        body_composition: 수동운동요청.bodyComposition ?? null,
        completed_at: '2026-07-24 12:34:56+00',
        completed_on: '2026-07-24',
        duration_seconds: 3600,
        id: 'manual-record-1',
        manual_detail: {
          cardio: 수동운동요청.cardio,
          location: 수동운동요청.location,
          memo: 수동운동요청.memo,
          strengthExercises: 수동운동요청.strengthExercises,
        },
        performed_at: '2026-07-24 12:34:56+00',
        performed_on: '2026-07-24',
        routine_id: null,
        routine_label: null,
        routine_source: null,
        source: WorkoutRecordSource.Manual,
        steps: [],
        summary: {
          cardioDurationSeconds: 900,
          cardioSteps: 4200,
          strengthExerciseCount: 1,
          strengthSetCount: 2,
          totalVolumeKg: 1160,
        },
        title: '상체 개인 운동',
      }),
    );

    const result = await service.createManualWorkoutRecord(
      'user-a',
      수동운동요청,
    );

    const createArgs = repository.createManualWorkoutRecord.mock.calls[0]?.[0];

    expect(createArgs).toEqual(
      expect.objectContaining({
        durationSeconds: 3600,
        performedAt: '2026-07-24T12:34:56.000Z',
        performedOn: '2026-07-24',
        timeZone: 'Asia/Seoul',
        title: '상체 개인 운동',
        userKey: 'user-a',
      }),
    );
    expect(createArgs?.summary).toEqual({
      cardioDistanceMeters: 0,
      cardioDurationSeconds: 900,
      cardioSteps: 4200,
      strengthExerciseCount: 1,
      strengthSetCount: 2,
      totalVolumeKg: 1160,
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: 'manual-record-1',
        performedOn: '2026-07-24',
        source: WorkoutRecordSource.Manual,
        title: '상체 개인 운동',
      }),
    );
  });

  it('운동 기록 목록을 응답 DTO로 변환한다', async () => {
    repository.listWorkoutRecords.mockResolvedValue([createRecordRow()]);

    const result = await service.listWorkoutRecords('user-a', {
      from: '2026-07-01',
      source: WorkoutRecordSource.Routine,
      to: '2026-07-31',
    });

    expect(repository.listWorkoutRecords.mock.calls[0]?.[0]).toEqual({
      from: '2026-07-01',
      source: WorkoutRecordSource.Routine,
      to: '2026-07-31',
      userKey: 'user-a',
    });
    expect(result).toEqual([
      expect.objectContaining({
        completedOn: '2026-07-23',
        id: 'record-1',
        performedOn: '2026-07-23',
        routineId: 'gym_60',
        title: '1시간 루틴',
        weeklyCompletionId: 'weekly-1',
      }),
    ]);
  });

  it('상세 기록이 없으면 NotFoundException을 던진다', async () => {
    repository.findWorkoutRecord.mockResolvedValue(null);

    await expect(
      service.getWorkoutRecord('user-a', 'missing-record'),
    ).rejects.toThrow(NotFoundException);
  });

  it('삭제 요청을 저장소로 위임한다', async () => {
    repository.deleteWorkoutRecord.mockResolvedValue(createRecordRow());

    const result = await service.deleteWorkoutRecord('user-a', 'record-1');

    expect(repository.deleteWorkoutRecord.mock.calls[0]?.[0]).toEqual({
      id: 'record-1',
      userKey: 'user-a',
    });
    expect(result).toEqual({ deleted: true });
  });
});
