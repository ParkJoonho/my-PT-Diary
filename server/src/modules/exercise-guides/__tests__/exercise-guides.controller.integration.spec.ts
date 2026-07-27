import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import {
  BODY_PART_EXERCISE_GUIDES,
  EQUIPMENT_EXERCISE_GUIDES,
} from '../exercise-guides.catalog';
import { ExerciseGuideCatalogRecord } from '../exercise-guides.repository.port';
import { ExerciseGuidesController } from '../exercise-guides.controller';
import { ExerciseGuidesRepositoryPort } from '../exercise-guides.repository.port';
import { ExerciseGuidesService } from '../exercise-guides.service';

const 운동가이드응답스키마 = z.object({
  bodyPart: z.string(),
  catalogType: z.enum(['body_part', 'equipment']),
  description: z.string(),
  duration: z.string(),
  equipment: z.string(),
  equipmentTypes: z.array(z.string()),
  id: z.string(),
  likeCount: z.number(),
  likedByMe: z.boolean(),
  targetMuscles: z.string().nullable(),
  title: z.string(),
  videoUrl: z.string(),
});

describe('운동 배우기 컨트롤러 통합', () => {
  let app: INestApplication<App>;
  let repository: jest.Mocked<ExerciseGuidesRepositoryPort>;
  let allGuides: ExerciseGuideCatalogRecord[];

  beforeEach(async () => {
    repository = {
      addLike: jest.fn<Promise<void>, [never]>(),
      createGuide: jest.fn(),
      deleteGuide: jest.fn(),
      getGuideById: jest.fn(),
      listLikeStatsForGuideIds: jest.fn(),
      listGuides: jest.fn(),
      removeLike: jest.fn<Promise<void>, [never]>(),
      updateGuide: jest.fn(),
    };

    allGuides = [...BODY_PART_EXERCISE_GUIDES, ...EQUIPMENT_EXERCISE_GUIDES].map(
      (guide) => ({
        ...guide,
        createdAt: '2026-07-27T09:00:00.000Z',
        updatedAt: '2026-07-27T09:00:00.000Z',
      }),
    );
    repository.listGuides.mockImplementation(async (params) =>
      params?.catalogType
        ? allGuides.filter((guide) => guide.catalogType === params.catalogType)
        : allGuides,
    );
    repository.getGuideById.mockImplementation(
      async (guideId: string) =>
        allGuides.find((guide) => guide.id === guideId) ?? null,
    );
    repository.listLikeStatsForGuideIds.mockResolvedValue([]);
    repository.addLike.mockResolvedValue(undefined);
    repository.removeLike.mockResolvedValue(undefined);
    repository.createGuide.mockRejectedValue(new Error('not used'));
    repository.updateGuide.mockRejectedValue(new Error('not used'));
    repository.deleteGuide.mockResolvedValue(false);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseGuidesController],
      providers: [
        ExerciseGuidesService,
        {
          provide: ExerciseGuidesRepositoryPort,
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

  it('목록 조회는 헤더가 있으면 200과 가이드 배열을 반환한다', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/exercise-guides')
      .set('x-user-key', 'integration-user')
      .expect(200);

    const body = z.array(운동가이드응답스키마).parse(response.body);

    expect(body).toHaveLength(20);
    expect(body[0]?.id).toBe('r1');
  });

  it('카탈로그 타입 필터는 기구별 8개만 반환한다', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/exercise-guides')
      .set('x-user-key', 'integration-user')
      .query({ catalogType: 'equipment' })
      .expect(200);

    const body = z.array(운동가이드응답스키마).parse(response.body);

    expect(body).toHaveLength(8);
    expect(body.every((guide) => guide.catalogType === 'equipment')).toBe(true);
  });

  it('잘못된 카탈로그 타입은 400을 반환한다', async () => {
    await request(app.getHttpServer())
      .get('/api/exercise-guides')
      .set('x-user-key', 'integration-user')
      .query({ catalogType: 'invalid' })
      .expect(400);
  });

  it('없는 가이드 상세는 404를 반환한다', async () => {
    await request(app.getHttpServer())
      .get('/api/exercise-guides/missing-guide')
      .set('x-user-key', 'integration-user')
      .expect(404);
  });

  it('좋아요 본문이 잘못되면 400을 반환한다', async () => {
    await request(app.getHttpServer())
      .put('/api/exercise-guides/r1/like')
      .set('x-user-key', 'integration-user')
      .send({ liked: 'yes' })
      .expect(400);
  });

  it('좋아요 상태 변경은 최신 가이드를 반환한다', async () => {
    repository.listLikeStatsForGuideIds.mockResolvedValueOnce([
      { guideId: 'r1', likeCount: 1, likedByMe: true },
    ]);

    const response = await request(app.getHttpServer())
      .put('/api/exercise-guides/r1/like')
      .set('x-user-key', 'integration-user')
      .send({ liked: true })
      .expect(200);

    const body = 운동가이드응답스키마.parse(response.body);

    expect(repository.addLike).toHaveBeenCalledWith({
      guideId: 'r1',
      userKey: 'integration-user',
    });
    expect(body.likeCount).toBe(4);
    expect(body.likedByMe).toBe(true);
  });
});
