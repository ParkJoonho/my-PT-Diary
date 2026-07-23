import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

const workoutRecordSchema = z.object({
  completedAt: z.string(),
  completedOn: z.string(),
  durationSeconds: z.number(),
  id: z.string().uuid(),
  routineId: z.string(),
  routineLabel: z.string(),
  routineSource: z.string(),
  source: z.literal('routine'),
  steps: z.array(
    z.object({
      completed: z.boolean(),
      name: z.string(),
      type: z.string(),
    }),
  ),
  summary: z.object({
    cardioStepCount: z.number(),
    completedStepCount: z.number(),
    strengthStepCount: z.number(),
    stretchStepCount: z.number(),
    totalStepCount: z.number(),
  }),
  timeZone: z.string(),
  weeklyCompletionId: z.string().uuid(),
});

const routineCompletionResponseSchema = z.object({
  weeklyCompletion: z.object({
    completedOn: z.string(),
    id: z.string().uuid(),
    source: z.literal('routine'),
  }),
  workoutRecord: workoutRecordSchema,
});

const weeklyTrackerSummarySchema = z.object({
  days: z.array(
    z.object({
      completed: z.boolean(),
      completionCount: z.number(),
      date: z.string(),
      label: z.string(),
    }),
  ),
  referenceDate: z.string(),
  streakCount: z.number(),
  totalCompletedDays: z.number(),
});

const manualWorkoutRecordSchema = z.object({
  durationSeconds: z.number(),
  id: z.string().uuid(),
  manualDetail: z
    .object({
      cardio: z.unknown().optional(),
      location: z.string().optional(),
      memo: z.string().optional(),
      strengthExercises: z.array(z.unknown()).optional(),
    })
    .nullable(),
  performedOn: z.string(),
  source: z.literal('manual'),
  summary: z.object({
    cardioDurationSeconds: z.number(),
    cardioSteps: z.number(),
    strengthExerciseCount: z.number(),
    strengthSetCount: z.number(),
    totalVolumeKg: z.number(),
  }),
  title: z.string(),
  weeklyCompletionId: z.string().uuid(),
});

const conditionRecordSchema = z.object({
  checkedOn: z.string(),
  id: z.string().uuid(),
  summary: z.object({
    averageConditionScore: z.number().nullable(),
    averageSorenessScore: z.number().nullable(),
    selectedConditionCount: z.number(),
    selectedSorenessCount: z.number(),
    severeSorenessCount: z.number(),
  }),
});

const workoutReportSummarySchema = z.object({
  condition: z.object({
    averageConditionScore: z.number().nullable(),
    averageSorenessScore: z.number().nullable(),
  }),
  currentWeek: z.object({
    weekEndDate: z.string(),
    weekStartDate: z.string(),
    workoutDayCount: z.number(),
    workoutRecordCount: z.number(),
  }),
  referenceDate: z.string(),
  totals: z.object({
    cardioDurationSeconds: z.number(),
    conditionRecordCount: z.number(),
    durationSeconds: z.number(),
    totalVolumeKg: z.number(),
    workoutDayCount: z.number(),
    workoutRecordCount: z.number(),
  }),
  weeklyFrequency: z.array(z.unknown()),
});

describe('운동 기록 E2E', () => {
  let app: INestApplication<App>;
  let databaseService: DatabaseService;

  const userKey = `workout-records-e2e-${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    databaseService = app.get(DatabaseService);
    await cleanupUserRecords();
  });

  afterAll(async () => {
    await cleanupUserRecords();
    await app.close();
  });

  it('루틴 완료 생성, 목록·상세 조회, 주간 트래커 반영, 삭제를 수행한다', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/workout-records/routine-completions')
      .set('x-user-key', userKey)
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
            detail: '20분, 6km',
            name: '러닝머신',
            restAfter: '5분',
            tag: '유산소 운동',
            type: 'cardio',
          },
          {
            completed: true,
            detail: '10회 x 3세트',
            name: '푸시업',
            sets: 3,
            tag: '상체 근력 강화',
            type: 'strength',
          },
          {
            completed: false,
            detail: '5분',
            name: '스트레칭',
            tag: '유연성 향상',
            type: 'stretch',
          },
        ],
        timeZone: 'Asia/Seoul',
      })
      .expect(201);

    const created = routineCompletionResponseSchema.parse(createResponse.body);

    expect(created.workoutRecord).toEqual(
      expect.objectContaining({
        completedOn: '2026-07-23',
        durationSeconds: 1800,
        routineId: 'gym_60',
        routineLabel: '1시간 루틴',
        routineSource: 'static',
        source: 'routine',
        timeZone: 'Asia/Seoul',
      }),
    );
    expect(created.workoutRecord.summary).toEqual({
      cardioStepCount: 1,
      completedStepCount: 2,
      strengthStepCount: 1,
      stretchStepCount: 0,
      totalStepCount: 3,
    });

    const summaryAfterCreateResponse = await request(app.getHttpServer())
      .get('/api/weekly-tracker')
      .set('x-user-key', userKey)
      .query({ referenceDate: '2026-07-23' })
      .expect(200);

    const summaryAfterCreate = weeklyTrackerSummarySchema.parse(
      summaryAfterCreateResponse.body,
    );
    expect(summaryAfterCreate.days).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          completed: true,
          completionCount: 1,
          date: '2026-07-23',
        }),
      ]),
    );
    expect(summaryAfterCreate.streakCount).toBe(1);

    const listResponse = await request(app.getHttpServer())
      .get('/api/workout-records')
      .set('x-user-key', userKey)
      .query({ from: '2026-07-01', to: '2026-07-31', source: 'routine' })
      .expect(200);

    const listBody = z.array(workoutRecordSchema).parse(listResponse.body);
    expect(listBody).toHaveLength(1);
    expect(listBody[0]?.id).toBe(created.workoutRecord.id);

    const detailResponse = await request(app.getHttpServer())
      .get(`/api/workout-records/${created.workoutRecord.id}`)
      .set('x-user-key', userKey)
      .expect(200);

    const detailBody = workoutRecordSchema.parse(detailResponse.body);
    expect(detailBody.weeklyCompletionId).toBe(
      created.workoutRecord.weeklyCompletionId,
    );

    await request(app.getHttpServer())
      .delete(`/api/workout-records/${created.workoutRecord.id}`)
      .set('x-user-key', userKey)
      .expect(200)
      .expect({ deleted: true });

    await request(app.getHttpServer())
      .get(`/api/workout-records/${created.workoutRecord.id}`)
      .set('x-user-key', userKey)
      .expect(404);

    const summaryAfterDeleteResponse = await request(app.getHttpServer())
      .get('/api/weekly-tracker')
      .set('x-user-key', userKey)
      .query({ referenceDate: '2026-07-23' })
      .expect(200);

    const summaryAfterDelete = weeklyTrackerSummarySchema.parse(
      summaryAfterDeleteResponse.body,
    );
    expect(summaryAfterDelete.days).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          completed: false,
          completionCount: 0,
          date: '2026-07-23',
        }),
      ]),
    );
    expect(summaryAfterDelete.streakCount).toBe(0);
  });

  it('수동 운동·컨디션 기록을 저장하고 리포트와 주간 트래커에 반영한다', async () => {
    const manualCreateResponse = await request(app.getHttpServer())
      .post('/api/workout-records/manual')
      .set('x-user-key', userKey)
      .send({
        cardio: {
          durationSeconds: 900,
          steps: 4200,
        },
        durationSeconds: 3600,
        location: 'gym',
        performedAt: '2026-07-25T12:34:56.000Z',
        performedOn: '2026-07-25',
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
      })
      .expect(201);

    const manualRecord = manualWorkoutRecordSchema.parse(
      manualCreateResponse.body,
    );
    expect(manualRecord.summary).toEqual(
      expect.objectContaining({
        cardioDurationSeconds: 900,
        cardioSteps: 4200,
        strengthExerciseCount: 1,
        strengthSetCount: 2,
        totalVolumeKg: 1160,
      }),
    );

    const manualUpdateResponse = await request(app.getHttpServer())
      .put(`/api/workout-records/${manualRecord.id}`)
      .set('x-user-key', userKey)
      .send({
        durationSeconds: 1800,
        memo: '가볍게 수정',
        performedAt: '2026-07-26T12:34:56.000Z',
        performedOn: '2026-07-26',
        timeZone: 'Asia/Seoul',
        title: '수정한 개인 운동',
      })
      .expect(200);

    const updatedManualRecord = manualWorkoutRecordSchema.parse(
      manualUpdateResponse.body,
    );
    expect(updatedManualRecord).toEqual(
      expect.objectContaining({
        performedOn: '2026-07-26',
        title: '수정한 개인 운동',
      }),
    );

    const conditionCreateResponse = await request(app.getHttpServer())
      .post('/api/condition-records')
      .set('x-user-key', userKey)
      .send({
        checkedOn: '2026-07-26',
        conditionScores: {
          energy: 4,
          motivation: 5,
          sleep: 3,
          stress: 0,
        },
        muscleSoreness: {
          arms: 0,
          back: 1,
          chest: 2,
          core: 0,
          legs: 3,
          shoulders: 0,
        },
        timeZone: 'Asia/Seoul',
      })
      .expect(201);

    const conditionRecord = conditionRecordSchema.parse(
      conditionCreateResponse.body,
    );
    expect(conditionRecord.summary).toEqual(
      expect.objectContaining({
        averageConditionScore: 4,
        averageSorenessScore: 2,
        severeSorenessCount: 1,
      }),
    );

    const reportResponse = await request(app.getHttpServer())
      .get('/api/workout-reports/summary')
      .set('x-user-key', userKey)
      .query({ referenceDate: '2026-07-26' })
      .expect(200);

    const report = workoutReportSummarySchema.parse(reportResponse.body);
    expect(report.currentWeek).toEqual(
      expect.objectContaining({
        weekEndDate: '2026-07-26',
        weekStartDate: '2026-07-20',
      }),
    );
    expect(report.totals).toEqual(
      expect.objectContaining({
        conditionRecordCount: 1,
        workoutRecordCount: 1,
      }),
    );

    const trackerResponse = await request(app.getHttpServer())
      .get('/api/weekly-tracker')
      .set('x-user-key', userKey)
      .query({ referenceDate: '2026-07-26' })
      .expect(200);

    const tracker = weeklyTrackerSummarySchema.parse(trackerResponse.body);
    expect(tracker.days).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          completed: true,
          date: '2026-07-26',
        }),
      ]),
    );
  });

  it('다른 사용자의 운동 기록은 조회할 수 없다', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/workout-records/routine-completions')
      .set('x-user-key', userKey)
      .send({
        completedAt: '2026-07-24T12:34:56.000Z',
        completedOn: '2026-07-24',
        durationSeconds: 600,
        routineId: 'home_30',
        routineLabel: '30분 루틴',
        routineSource: 'static',
        steps: [
          {
            completed: true,
            detail: '15회 x 3세트',
            name: '푸시업',
            type: 'strength',
          },
        ],
        timeZone: 'Asia/Seoul',
      })
      .expect(201);

    const created = routineCompletionResponseSchema.parse(createResponse.body);

    await request(app.getHttpServer())
      .get(`/api/workout-records/${created.workoutRecord.id}`)
      .set('x-user-key', `${userKey}-other`)
      .expect(404);
  });

  async function cleanupUserRecords() {
    await databaseService.query(
      'DELETE FROM condition_records WHERE user_key LIKE $1',
      [`${userKey}%`],
    );
    await databaseService.query(
      'DELETE FROM workout_records WHERE user_key LIKE $1',
      [`${userKey}%`],
    );
    await databaseService.query(
      'DELETE FROM workout_completions WHERE user_key LIKE $1',
      [`${userKey}%`],
    );
  }
});
