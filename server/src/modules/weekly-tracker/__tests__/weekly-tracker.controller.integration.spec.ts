import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import { WeeklyWorkoutSource } from '../dto/create-weekly-workout.dto';
import { WeeklyTrackerController } from '../weekly-tracker.controller';
import {
  WeeklyTrackerRepositoryPort,
  WorkoutCompletionRow,
} from '../weekly-tracker.repository.port';
import { WeeklyTrackerService } from '../weekly-tracker.service';

const 주간요약응답스키마 = z.object({
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

describe('주간 트래커 컨트롤러 통합', () => {
  let app: INestApplication<App>;
  let repository: jest.Mocked<WeeklyTrackerRepositoryPort>;

  beforeEach(async () => {
    repository = {
      createWorkoutCompletion: jest.fn<
        Promise<WorkoutCompletionRow>,
        [never]
      >(),
      deleteWorkoutCompletion: jest.fn<Promise<void>, [never]>(),
      getCompletionCountsForWeek: jest.fn(),
      listDistinctCompletedDatesUntil: jest.fn(),
      listWorkoutCompletionsForWeek: jest.fn(),
    };

    repository.createWorkoutCompletion.mockResolvedValue({
      completed_on: '2026-07-22',
      created_at: '2026-07-22T10:00:00.000Z',
      id: 'workout-1',
      note: '테스트',
      source: WeeklyWorkoutSource.PersonalExercise,
    });
    repository.getCompletionCountsForWeek.mockResolvedValue([
      { completedOn: '2026-07-22', completionCount: 1 },
    ]);
    repository.listDistinctCompletedDatesUntil.mockResolvedValue([
      '2026-07-22',
    ]);
    repository.listWorkoutCompletionsForWeek.mockResolvedValue([
      {
        completed_on: '2026-07-22',
        created_at: '2026-07-22T10:00:00.000Z',
        id: 'workout-1',
        note: '테스트',
        source: WeeklyWorkoutSource.PersonalExercise,
      },
    ]);
    repository.deleteWorkoutCompletion.mockResolvedValue(undefined);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [WeeklyTrackerController],
      providers: [
        WeeklyTrackerService,
        {
          provide: WeeklyTrackerRepositoryPort,
          useValue: repository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('헤더가 있으면 요약 데이터를 반환한다', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/weekly-tracker')
      .set('x-user-key', 'integration-user')
      .query({ referenceDate: '2026-07-22' })
      .expect(200);

    const body = 주간요약응답스키마.parse(response.body);
    expect(body.referenceDate).toBe('2026-07-22');
    expect(body.days).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          completed: true,
          date: '2026-07-22',
          label: '수',
        }),
      ]),
    );
  });

  it('잘못된 날짜 형식은 400을 반환한다', async () => {
    await request(app.getHttpServer())
      .get('/api/weekly-tracker')
      .set('x-user-key', 'integration-user')
      .query({ referenceDate: '2026/07/22' })
      .expect(400);
  });
});
