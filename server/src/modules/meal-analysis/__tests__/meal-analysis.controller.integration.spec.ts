import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import { MealAnalysisController } from '../meal-analysis.controller';
import { MealAnalysisService } from '../meal-analysis.service';
import { 식단분석예시 } from './meal-analysis.fixtures';

describe('식단 분석 컨트롤러 통합', () => {
  let app: INestApplication<App>;
  let service: jest.Mocked<MealAnalysisService>;

  beforeEach(async () => {
    service = {
      analyzeMeal: jest.fn(),
      createMealRecord: jest.fn(),
      generateDietGuide: jest.fn(),
      getDailySummary: jest.fn(),
      listMealRecords: jest.fn(),
    } as unknown as jest.Mocked<MealAnalysisService>;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MealAnalysisController],
      providers: [
        {
          provide: MealAnalysisService,
          useValue: service,
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

  afterEach(async () => {
    await app.close();
  });

  it('모든 경로에서 x-user-key를 요구한다', async () => {
    await request(app.getHttpServer())
      .get('/api/meal-analysis/records')
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/meal-analysis/analyze')
      .send({
        imageBase64: 'a'.repeat(200),
        mealType: 'lunch',
      })
      .expect(400);
  });

  it('식사 전 사진과 식사 유형이 있어야 분석한다', async () => {
    await request(app.getHttpServer())
      .post('/api/meal-analysis/analyze')
      .set('x-user-key', 'integration-user')
      .send({ mealType: 'lunch' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/meal-analysis/analyze')
      .set('x-user-key', 'integration-user')
      .send({
        imageBase64: 'a'.repeat(200),
        mealType: 'late-night',
      })
      .expect(400);
  });

  it('전후 사진 분석 요청을 서비스에 전달한다', async () => {
    service.analyzeMeal.mockResolvedValue({
      analysis: 식단분석예시,
      analyzedAt: '2026-07-28T01:23:45.000Z',
    });

    const response = await request(app.getHttpServer())
      .post('/api/meal-analysis/analyze')
      .set('x-user-key', 'integration-user')
      .send({
        afterImageBase64: 'b'.repeat(200),
        eatingDurationMinutes: 20,
        imageBase64: 'a'.repeat(200),
        mealType: 'lunch',
      })
      .expect(200);

    expect(service.analyzeMeal.mock.calls[0]).toEqual([
      {
        afterImageBase64: 'b'.repeat(200),
        eatingDurationMinutes: 20,
        imageBase64: 'a'.repeat(200),
        mealType: 'lunch',
      },
    ]);
    const body = z
      .object({
        analysis: z.object({
          totalCalories: z.number(),
        }),
      })
      .parse(response.body);
    expect(body.analysis.totalCalories).toBe(550);
  });

  it('날짜별 기록과 일일 합계를 현재 사용자로 조회한다', async () => {
    service.listMealRecords.mockResolvedValue([]);
    service.getDailySummary.mockResolvedValue({
      date: '2026-07-28',
      mealCount: 0,
      totalCalories: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      totalProtein: 0,
      totalSodium: 0,
    });

    await request(app.getHttpServer())
      .get('/api/meal-analysis/records')
      .set('x-user-key', 'integration-user')
      .query({ date: '2026-07-28' })
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/meal-analysis/daily-summary')
      .set('x-user-key', 'integration-user')
      .query({ date: '2026-07-28' })
      .expect(200);

    expect(service.listMealRecords.mock.calls[0]).toEqual([
      'integration-user',
      '2026-07-28',
    ]);
    expect(service.getDailySummary.mock.calls[0]).toEqual([
      'integration-user',
      '2026-07-28',
    ]);
  });
});
