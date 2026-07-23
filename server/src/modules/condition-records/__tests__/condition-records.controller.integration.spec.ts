import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import { ConditionRecordsController } from '../condition-records.controller';
import {
  ConditionRecordRow,
  ConditionRecordsRepositoryPort,
} from '../condition-records.repository.port';
import { ConditionRecordsService } from '../condition-records.service';

const conditionRecordSchema = z.object({
  checkedOn: z.string(),
  conditionScores: z.object({
    energy: z.number(),
    motivation: z.number(),
    sleep: z.number(),
    stress: z.number(),
  }),
  id: z.string(),
  memo: z.string().nullable(),
  muscleSoreness: z.object({
    arms: z.number(),
    back: z.number(),
    chest: z.number(),
    core: z.number(),
    legs: z.number(),
    shoulders: z.number(),
  }),
  summary: z.object({
    averageConditionScore: z.number().nullable(),
    averageSorenessScore: z.number().nullable(),
    selectedConditionCount: z.number(),
    selectedSorenessCount: z.number(),
    severeSorenessCount: z.number(),
  }),
  timeZone: z.string(),
});

function createConditionRow(
  overrides: Partial<ConditionRecordRow> = {},
): ConditionRecordRow {
  return {
    checked_on: '2026-07-23',
    condition_scores: {
      energy: 4,
      motivation: 5,
      sleep: 3,
      stress: 0,
    },
    created_at: '2026-07-23 12:35:00+00',
    id: '11111111-1111-4111-8111-111111111111',
    memo: '수면 부족',
    muscle_soreness: {
      arms: 0,
      back: 1,
      chest: 2,
      core: 0,
      legs: 3,
      shoulders: 0,
    },
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
    ...overrides,
  };
}

describe('컨디션 기록 컨트롤러 통합', () => {
  let app: INestApplication<App>;
  let repository: jest.Mocked<ConditionRecordsRepositoryPort>;

  beforeEach(async () => {
    repository = {
      deleteConditionRecord: jest.fn(),
      findConditionRecord: jest.fn(),
      listConditionRecords: jest.fn(),
      updateConditionRecord: jest.fn(),
      upsertConditionRecord: jest.fn(),
    };
    repository.upsertConditionRecord.mockResolvedValue(createConditionRow());
    repository.listConditionRecords.mockResolvedValue([createConditionRow()]);
    repository.findConditionRecord.mockResolvedValue(createConditionRow());
    repository.updateConditionRecord.mockResolvedValue(
      createConditionRow({ memo: '수정함' }),
    );
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
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('컨디션 기록을 생성하고 사용자 키를 저장소에 전달한다', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/condition-records')
      .set('x-user-key', 'integration-user')
      .send({
        checkedOn: '2026-07-23',
        conditionScores: {
          energy: 4,
          motivation: 5,
          sleep: 3,
          stress: 0,
        },
        memo: '수면 부족',
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

    const body = conditionRecordSchema.parse(response.body);
    expect(body.checkedOn).toBe('2026-07-23');
    expect(repository.upsertConditionRecord.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        checkedOn: '2026-07-23',
        userKey: 'integration-user',
      }),
    );
  });

  it('잘못된 컨디션 점수는 400을 반환한다', async () => {
    await request(app.getHttpServer())
      .post('/api/condition-records')
      .set('x-user-key', 'integration-user')
      .send({
        checkedOn: '2026-07-23',
        conditionScores: {
          energy: 6,
          motivation: 5,
          sleep: 3,
          stress: 0,
        },
        muscleSoreness: {
          arms: 0,
          back: 1,
          chest: 2,
          core: 0,
          legs: 5,
          shoulders: 0,
        },
        timeZone: 'Asia/Seoul',
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
