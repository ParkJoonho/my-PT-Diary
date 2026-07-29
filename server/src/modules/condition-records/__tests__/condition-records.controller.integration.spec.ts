import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import { ConditionRecordsController } from '../condition-records.controller';
import {
  CONDITION_LABELS,
  MUSCLE_SORENESS_LABELS,
} from '../condition-records.constants';
import {
  ConditionRecordRow,
  ConditionRecordsRepositoryPort,
} from '../condition-records.repository.port';
import { ConditionRecordsService } from '../condition-records.service';

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

const conditionRecordSchema = z.object({
  conditions: z.array(
    z.object({
      label: z.string(),
      score: z.number(),
    }),
  ),
  createdAt: z.number(),
  date: z.string(),
  id: z.string(),
  muscleSoreness: z.array(
    z.object({
      label: z.string(),
      score: z.number(),
    }),
  ),
  summary: z.object({
    averageConditionScore: z.number().nullable(),
    averageSorenessScore: z.number().nullable(),
    selectedConditionCount: z.number(),
    selectedSorenessCount: z.number(),
    severeSorenessCount: z.number(),
  }),
  weekNumber: z.number(),
});

function createConditionRow(
  overrides: Partial<ConditionRecordRow> = {},
): ConditionRecordRow {
  return {
    checked_on: '2026-07-23',
    condition_scores: CONDITION_LABELS.map((label) => ({
      label,
      score: getConditionScore(label),
    })),
    created_at: '2026-07-23 12:35:00+00',
    id: '11111111-1111-4111-8111-111111111111',
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

describe('컨디션 기록 컨트롤러 통합', () => {
  let app: INestApplication<App>;
  let repository: jest.Mocked<ConditionRecordsRepositoryPort>;

  beforeEach(async () => {
    repository = {
      createConditionRecord: jest.fn(),
      deleteConditionRecord: jest.fn(),
      findConditionRecord: jest.fn(),
      listConditionRecords: jest.fn(),
      updateConditionRecord: jest.fn(),
    };
    repository.createConditionRecord.mockResolvedValue(createConditionRow());
    repository.listConditionRecords.mockResolvedValue([createConditionRow()]);
    repository.findConditionRecord.mockResolvedValue(createConditionRow());
    repository.updateConditionRecord.mockResolvedValue(createConditionRow());
    repository.deleteConditionRecord.mockResolvedValue(createConditionRow());

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ConditionRecordsController],
      providers: [
        ConditionRecordsService,
        {
          provide: ConditionRecordsRepositoryPort,
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

  afterEach(async () => {
    await app.close();
  });

  it('잘못된 근육통 payload는 400을 반환한다', async () => {
    await request(app.getHttpServer())
      .post('/api/condition-records')
      .set('x-user-key', 'integration-user')
      .send({
        conditions: CONDITION_LABELS.map((label) => ({
          label,
          score: getConditionScore(label),
        })),
        date: '2026-07-23',
        muscleSoreness: {
          invalid: true,
        },
        timeZone: 'Asia/Seoul',
        weekNumber: 1,
      })
      .expect(400);
  });

  it('컨디션 기록을 생성하고 사용자 키를 저장소에 전달한다', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/condition-records')
      .set('x-user-key', 'integration-user')
      .send({
        conditions: CONDITION_LABELS.map((label) => ({
          label,
          score: getConditionScore(label),
        })),
        date: '2026-07-23',
        muscleSoreness: MUSCLE_SORENESS_LABELS.map((label) => ({
          label,
          score: getSorenessScore(label),
        })),
        timeZone: 'Asia/Seoul',
        weekNumber: 1,
      })
      .expect(201);

    const body = conditionRecordSchema.parse(response.body);
    expect(body.date).toBe('2026-07-23');
    expect(repository.createConditionRecord.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        date: '2026-07-23',
        userKey: 'integration-user',
        weekNumber: 1,
      }),
    );
  });

  it('잘못된 컨디션 점수는 400을 반환한다', async () => {
    await request(app.getHttpServer())
      .post('/api/condition-records')
      .set('x-user-key', 'integration-user')
      .send({
        conditions: CONDITION_LABELS.map((label) => ({
          label,
          score: label === '훈련 동기' ? 6 : 0,
        })),
        date: '2026-07-23',
        muscleSoreness: MUSCLE_SORENESS_LABELS.map((label) => ({
          label,
          score: label === '가슴' ? 5 : 0,
        })),
        timeZone: 'Asia/Seoul',
        weekNumber: 1,
      })
      .expect(400);
  });

  it('컨디션 목록 query를 검증하고 저장소에 전달한다', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/condition-records')
      .set('x-user-key', 'integration-user')
      .query({ from: '2026-07-01', to: '2026-07-31' })
      .expect(200);

    const body = z.array(conditionRecordSchema).parse(response.body);
    expect(body).toHaveLength(1);
    expect(repository.listConditionRecords.mock.calls[0]?.[0]).toEqual({
      from: '2026-07-01',
      to: '2026-07-31',
      userKey: 'integration-user',
    });
  });
});
