import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import { DatabaseService } from '../src/database/database.service';
import { AppModule } from '../src/app.module';

const errorResponseSchema = z.object({
  issues: z.array(
    z.object({
      code: z.string(),
      message: z.string(),
      path: z.string(),
    }),
  ),
  message: z.string(),
});

const workoutCompletionSchema = z.object({
  completedOn: z.string(),
  createdAt: z.string(),
  id: z.string().uuid(),
  note: z.string().nullable(),
  source: z.string(),
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
  weekEndDate: z.string(),
  weekStartDate: z.string(),
});

describe('WeeklyTrackerController (e2e)', () => {
  let app: INestApplication<App>;
  let databaseService: DatabaseService;

  const userKey = `weekly-tracker-e2e-${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    databaseService = app.get(DatabaseService);
    await databaseService.query(
      'DELETE FROM workout_completions WHERE user_key = $1',
      [userKey],
    );
  });

  afterAll(async () => {
    await databaseService.query(
      'DELETE FROM workout_completions WHERE user_key = $1',
      [userKey],
    );
    await app.close();
  });

  it('rejects requests without x-user-key', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/weekly-tracker')
      .expect(400);

    const body = errorResponseSchema.parse(response.body);
    expect(body.message).toBe('Request validation failed.');
  });

  it('rejects invalid completion payloads', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/weekly-tracker/workouts')
      .set('x-user-key', userKey)
      .send({
        completedOn: '2026-02-31',
        source: 'invalid-source',
      })
      .expect(400);

    const body = errorResponseSchema.parse(response.body);
    expect(body.message).toBe('Request validation failed.');
    expect(body.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'completedOn',
        }),
        expect.objectContaining({
          path: 'source',
        }),
      ]),
    );
  });

  it('creates, summarizes, lists, and deletes weekly tracker completions', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/weekly-tracker/workouts')
      .set('x-user-key', userKey)
      .send({
        completedOn: '2026-07-21',
        note: '화요일 운동 완료',
        source: 'personal_exercise',
      })
      .expect(201);

    const createdWorkout = workoutCompletionSchema.parse(createResponse.body);

    expect(createdWorkout).toEqual(
      expect.objectContaining({
        completedOn: '2026-07-21',
        note: '화요일 운동 완료',
        source: 'personal_exercise',
      }),
    );

    const summaryResponse = await request(app.getHttpServer())
      .get('/api/weekly-tracker')
      .set('x-user-key', userKey)
      .query({ referenceDate: '2026-07-22' })
      .expect(200);

    const summaryBody = weeklyTrackerSummarySchema.parse(summaryResponse.body);

    expect(summaryBody).toEqual({
      days: [
        {
          completed: false,
          completionCount: 0,
          date: '2026-07-20',
          label: '월',
        },
        {
          completed: true,
          completionCount: 1,
          date: '2026-07-21',
          label: '화',
        },
        {
          completed: false,
          completionCount: 0,
          date: '2026-07-22',
          label: '수',
        },
        {
          completed: false,
          completionCount: 0,
          date: '2026-07-23',
          label: '목',
        },
        {
          completed: false,
          completionCount: 0,
          date: '2026-07-24',
          label: '금',
        },
        {
          completed: false,
          completionCount: 0,
          date: '2026-07-25',
          label: '토',
        },
        {
          completed: false,
          completionCount: 0,
          date: '2026-07-26',
          label: '일',
        },
      ],
      referenceDate: '2026-07-22',
      streakCount: 1,
      totalCompletedDays: 1,
      weekEndDate: '2026-07-26',
      weekStartDate: '2026-07-20',
    });

    const listResponse = await request(app.getHttpServer())
      .get('/api/weekly-tracker/workouts')
      .set('x-user-key', userKey)
      .query({ referenceDate: '2026-07-22' })
      .expect(200);

    const listBody = z.array(workoutCompletionSchema).parse(listResponse.body);

    expect(listBody).toHaveLength(1);
    expect(listBody[0]).toEqual(
      expect.objectContaining({
        completedOn: '2026-07-21',
        id: createdWorkout.id,
        note: '화요일 운동 완료',
        source: 'personal_exercise',
      }),
    );

    await request(app.getHttpServer())
      .delete(`/api/weekly-tracker/workouts/${createdWorkout.id}`)
      .set('x-user-key', userKey)
      .expect(200)
      .expect({ deleted: true });

    await request(app.getHttpServer())
      .get('/api/weekly-tracker/workouts')
      .set('x-user-key', userKey)
      .query({ referenceDate: '2026-07-22' })
      .expect(200)
      .expect([]);
  });
});
