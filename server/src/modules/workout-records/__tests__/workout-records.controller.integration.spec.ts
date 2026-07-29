import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import {
  WorkoutRecordSource,
  WorkoutStepType,
} from '../dto/workout-record-response.dto';
import { WorkoutRecordsController } from '../workout-records.controller';
import {
  WorkoutRecordRow,
  WorkoutRecordsRepositoryPort,
} from '../workout-records.repository.port';
import { WorkoutRecordsService } from '../workout-records.service';

const workoutRecordSchema = z.object({
  bodyComposition: z.unknown().nullable(),
  completedAt: z.string(),
  completedOn: z.string(),
  durationSeconds: z.number(),
  id: z.string(),
  manualDetail: z.unknown().nullable(),
  performedAt: z.string(),
  performedOn: z.string(),
  routineId: z.string().nullable(),
  routineLabel: z.string().nullable(),
  routineSource: z.string().nullable(),
  source: z.string(),
  steps: z.array(z.object({ completed: z.boolean(), name: z.string() })),
  summary: z.object({
    completedStepCount: z.number(),
    totalStepCount: z.number(),
  }),
  timeZone: z.string(),
  title: z.string().nullable(),
  weeklyCompletionId: z.string().nullable(),
});

const createResponseSchema = z.object({
  weeklyCompletion: z.object({
    completedOn: z.string(),
    id: z.string(),
    source: z.string(),
  }),
  workoutRecord: workoutRecordSchema,
});

const errorResponseSchema = z.object({
  issues: z.array(
    z.object({
      path: z.string(),
    }),
  ),
  message: z.string(),
});

function createRecordRow(overrides: Partial<WorkoutRecordRow> = {}) {
  return {
    body_composition: null,
    completed_at: '2026-07-23 12:34:56+00',
    completed_on: '2026-07-23',
    created_at: '2026-07-23 12:35:00+00',
    duration_seconds: 1820,
    id: '11111111-1111-4111-8111-111111111111',
    manual_detail: null,
    performed_at: '2026-07-23 12:34:56+00',
    performed_on: '2026-07-23',
    routine_id: 'gym_60',
    routine_label: '1시간 루틴',
    routine_source: 'static',
    source: WorkoutRecordSource.Routine,
    steps: [
      {
        completed: true,
        detail: '10회 x 3세트',
        name: '푸시업',
        type: WorkoutStepType.Strength,
      },
    ],
    summary: {
      cardioStepCount: 0,
      completedStepCount: 1,
      strengthStepCount: 1,
      stretchStepCount: 0,
      totalStepCount: 1,
    },
    time_zone: 'Asia/Seoul',
    title: null,
    updated_at: '2026-07-23 12:35:00+00',
    user_key: 'user-a',
    weekly_completion_id: '22222222-2222-4222-8222-222222222222',
    ...overrides,
  } satisfies WorkoutRecordRow;
}

describe('운동 기록 컨트롤러 통합', () => {
  let app: INestApplication<App>;
  let repository: jest.Mocked<WorkoutRecordsRepositoryPort>;

  beforeEach(async () => {
    repository = {
      createManualWorkoutRecord: jest.fn(),
      createRoutineWorkoutCompletion: jest.fn(),
      deleteWorkoutRecord: jest.fn(),
      findWorkoutRecord: jest.fn(),
      listWorkoutRecords: jest.fn(),
      updateManualWorkoutRecord: jest.fn(),
    };
    repository.createRoutineWorkoutCompletion.mockResolvedValue(
      createRecordRow(),
    );
    repository.listWorkoutRecords.mockResolvedValue([createRecordRow()]);
    repository.findWorkoutRecord.mockResolvedValue(createRecordRow());
    repository.deleteWorkoutRecord.mockResolvedValue(createRecordRow());
    repository.createManualWorkoutRecord.mockResolvedValue(
      createRecordRow({
        body_composition: null,
        completed_at: '2026-07-24 12:34:56+00',
        completed_on: '2026-07-24',
        duration_seconds: 3600,
        manual_detail: {
          location: 'gym',
          strengthExercises: [{ name: '벤치프레스', sets: [{ reps: 10 }] }],
        },
        performed_at: '2026-07-24 12:34:56+00',
        performed_on: '2026-07-24',
        routine_id: null,
        routine_label: null,
        routine_source: null,
        source: WorkoutRecordSource.Manual,
        steps: [],
        title: '상체 개인 운동',
      }),
    );
    repository.updateManualWorkoutRecord.mockResolvedValue(
      createRecordRow({
        performed_at: '2026-07-25 12:34:56+00',
        completed_on: '2026-07-25',
        performed_on: '2026-07-25',
        routine_id: null,
        routine_label: null,
        routine_source: null,
        source: WorkoutRecordSource.Manual,
        steps: [],
        title: '수정한 개인 운동',
      }),
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutRecordsController],
      providers: [
        WorkoutRecordsService,
        {
          provide: WorkoutRecordsRepositoryPort,
          useValue: repository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  it('수동 운동 기록을 생성하고 사용자 키를 저장소에 전달한다', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/workout-records/manual')
      .set('x-user-key', 'integration-user')
      .send({
        durationSeconds: 3600,
        performedAt: '2026-07-24T12:34:56.000Z',
        performedOn: '2026-07-24',
        strengthExercises: [
          {
            name: '벤치프레스',
            sets: [{ reps: 10, weightKg: 60 }],
          },
        ],
        timeZone: 'Asia/Seoul',
        title: '상체 개인 운동',
      })
      .expect(201);

    const body = workoutRecordSchema.parse(response.body);
    expect(body.source).toBe('manual');
    expect(repository.createManualWorkoutRecord.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        performedOn: '2026-07-24',
        title: '상체 개인 운동',
        userKey: 'integration-user',
      }),
    );
  });

  it('수동 운동 기록을 수정한다', async () => {
    const response = await request(app.getHttpServer())
      .put('/api/workout-records/11111111-1111-4111-8111-111111111111')
      .set('x-user-key', 'integration-user')
      .send({
        durationSeconds: 1800,
        memo: '가볍게 진행',
        performedAt: '2026-07-25T12:34:56.000Z',
        performedOn: '2026-07-25',
        timeZone: 'Asia/Seoul',
        title: '수정한 개인 운동',
      })
      .expect(200);

    const body = workoutRecordSchema.parse(response.body);
    expect(body.title).toBe('수정한 개인 운동');
    expect(repository.updateManualWorkoutRecord.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        recordId: '11111111-1111-4111-8111-111111111111',
        userKey: 'integration-user',
      }),
    );
  });

  afterEach(async () => {
    await app.close();
  });

  it('루틴 완료 요청을 생성하고 사용자 키를 저장소에 전달한다', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/workout-records/routine-completions')
      .set('x-user-key', 'integration-user')
      .send({
        completedAt: '2026-07-23T12:34:56.000Z',
        completedOn: '2026-07-23',
        durationSeconds: 1800,
        routineId: 'gym_60',
        routineLabel: '1시간 루틴',
        routineSource: 'static',
        steps: [
          {
            completed: true,
            detail: '10회 x 3세트',
            name: '푸시업',
            type: 'strength',
          },
        ],
        timeZone: 'Asia/Seoul',
      })
      .expect(201);

    const body = createResponseSchema.parse(response.body);
    expect(body.workoutRecord.routineId).toBe('gym_60');
    expect(
      repository.createRoutineWorkoutCompletion.mock.calls[0]?.[0],
    ).toEqual(
      expect.objectContaining({
        completedOn: '2026-07-23',
        routineId: 'gym_60',
        userKey: 'integration-user',
      }),
    );
  });

  it('잘못된 루틴 완료 요청은 400을 반환한다', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/workout-records/routine-completions')
      .set('x-user-key', 'integration-user')
      .send({
        completedAt: '2026-07-23T12:34:56+09:00',
        completedOn: '2026-02-31',
        durationSeconds: -1,
        routineId: '',
        routineLabel: '1시간 루틴',
        routineSource: 'static',
        steps: [],
        timeZone: 'Asia/Seoul',
      })
      .expect(400);

    const body = errorResponseSchema.parse(response.body);
    expect(body.message).toBe('Request validation failed.');
    expect(body.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'completedAt' }),
        expect.objectContaining({ path: 'completedOn' }),
        expect.objectContaining({ path: 'durationSeconds' }),
        expect.objectContaining({ path: 'routineId' }),
        expect.objectContaining({ path: 'steps' }),
      ]),
    );
  });

  it('목록 조회 query를 검증하고 저장소에 전달한다', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/workout-records')
      .set('x-user-key', 'integration-user')
      .query({ from: '2026-07-01', source: 'routine', to: '2026-07-31' })
      .expect(200);

    const body = z.array(workoutRecordSchema).parse(response.body);
    expect(body).toHaveLength(1);
    expect(repository.listWorkoutRecords.mock.calls[0]?.[0]).toEqual({
      from: '2026-07-01',
      source: WorkoutRecordSource.Routine,
      to: '2026-07-31',
      userKey: 'integration-user',
    });
  });
});
