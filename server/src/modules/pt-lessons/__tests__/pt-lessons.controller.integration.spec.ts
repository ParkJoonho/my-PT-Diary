import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import { PtLessonsController } from '../pt-lessons.controller';
import {
  PtLessonRow,
  PtLessonsRepositoryPort,
} from '../pt-lessons.repository.port';
import { PtLessonsService } from '../pt-lessons.service';

const ptLessonResponseSchema = z.object({
  bodyParts: z.array(z.string()),
  comment: z.string(),
  createdAt: z.number(),
  date: z.string(),
  dayOfWeek: z.string(),
  equipment: z.array(z.string()),
  exercises: z.array(
    z.object({
      estimatedOneRepMaxKg: z.number(),
      lbWeight: z.number(),
      maxWeightKg: z.number(),
      name: z.string(),
      restTime: z.string(),
      rir: z.string(),
      sets: z.array(
        z.object({
          id: z.string(),
          reps: z.number(),
          weightKg: z.number(),
        }),
      ),
      volumeKg: z.number(),
    }),
  ),
  id: z.string(),
  sessionNumber: z.number(),
  summary: z.object({
    exerciseCount: z.number(),
    setCount: z.number(),
    totalVolumeKg: z.number(),
  }),
  warmUp: z.string(),
});

function createPtLessonRow(
  overrides: Partial<PtLessonRow> = {},
): PtLessonRow {
  return {
    body_parts: ['등', '팔'],
    comment: '등 수축이 안정적으로 잡혔어요.',
    created_at: '2026-07-29 10:00:00+00',
    equipment: ['머신', '프리웨이트'],
    exercises: [
      {
        estimatedOneRepMaxKg: 57.3,
        lbWeight: 88.2,
        maxWeightKg: 40,
        name: '랫풀다운',
        restTime: '75초',
        rir: '2',
        sets: [
          {
            id: '9ef1ba09-3d67-4125-8738-d0455cffefb8',
            reps: 12,
            weightKg: 35,
          },
        ],
        volumeKg: 420,
      },
    ],
    id: '5c5ae75d-e587-4a34-90b7-86f0872e1fdd',
    lesson_date: '2026-07-29',
    session_number: 18,
    summary: {
      exerciseCount: 1,
      setCount: 1,
      totalVolumeKg: 420,
    },
    updated_at: '2026-07-29 10:00:00+00',
    user_key: 'user-a',
    warm_up: '밴드 풀어파트 2세트',
    weekly_completion_id: '6ef6633a-cdd4-4df7-acd6-c51ee7f59b59',
    ...overrides,
  };
}

describe('PT 수업일지 컨트롤러 통합', () => {
  let app: INestApplication<App>;
  let repository: jest.Mocked<PtLessonsRepositoryPort>;

  beforeEach(async () => {
    repository = {
      createPtLesson: jest.fn(),
      deletePtLesson: jest.fn(),
      findPtLesson: jest.fn(),
      listPtLessons: jest.fn(),
      updatePtLesson: jest.fn(),
    };
    repository.createPtLesson.mockResolvedValue(createPtLessonRow());
    repository.listPtLessons.mockResolvedValue([createPtLessonRow()]);
    repository.findPtLesson.mockResolvedValue(createPtLessonRow());
    repository.updatePtLesson.mockResolvedValue(createPtLessonRow());
    repository.deletePtLesson.mockResolvedValue(createPtLessonRow());

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PtLessonsController],
      providers: [
        PtLessonsService,
        {
          provide: PtLessonsRepositoryPort,
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

  it('PT 수업일지를 생성하고 사용자 키를 저장소에 전달한다', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/pt-lessons')
      .set('x-user-key', 'integration-user')
      .send({
        bodyParts: ['등', '팔'],
        comment: '등 수축이 안정적으로 잡혔어요.',
        date: '2026-07-29',
        equipment: ['머신', '프리웨이트'],
        exercises: [
          {
            estimatedOneRepMaxKg: 57.3,
            lbWeight: 88.2,
            maxWeightKg: 40,
            name: '랫풀다운',
            restTime: '75초',
            rir: '2',
            sets: [
              {
                id: '9ef1ba09-3d67-4125-8738-d0455cffefb8',
                reps: 12,
                weightKg: 35,
              },
            ],
            volumeKg: 420,
          },
        ],
        sessionNumber: 18,
        warmUp: '밴드 풀어파트 2세트',
      })
      .expect(201);

    const body = ptLessonResponseSchema.parse(response.body);
    expect(body.date).toBe('2026-07-29');
    expect(repository.createPtLesson.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        date: '2026-07-29',
        sessionNumber: 18,
        userKey: 'integration-user',
      }),
    );
  });

  it('잘못된 세트 id는 400을 반환한다', async () => {
    await request(app.getHttpServer())
      .post('/api/pt-lessons')
      .set('x-user-key', 'integration-user')
      .send({
        bodyParts: ['등'],
        comment: '',
        date: '2026-07-29',
        equipment: ['머신'],
        exercises: [
          {
            estimatedOneRepMaxKg: 57.3,
            lbWeight: 88.2,
            maxWeightKg: 40,
            name: '랫풀다운',
            restTime: '75초',
            rir: '2',
            sets: [
              {
                id: 'invalid',
                reps: 12,
                weightKg: 35,
              },
            ],
            volumeKg: 420,
          },
        ],
        sessionNumber: 18,
        warmUp: '',
      })
      .expect(400);
  });

  it('목록 query를 검증하고 저장소에 전달한다', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/pt-lessons')
      .set('x-user-key', 'integration-user')
      .query({ from: '2026-07-01', to: '2026-07-31' })
      .expect(200);

    const body = z.array(ptLessonResponseSchema).parse(response.body);
    expect(body).toHaveLength(1);
    expect(repository.listPtLessons.mock.calls[0]?.[0]).toEqual({
      from: '2026-07-01',
      to: '2026-07-31',
      userKey: 'integration-user',
    });
  });
});
