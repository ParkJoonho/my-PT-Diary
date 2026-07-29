import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import { ServiceRoleKeyGuard } from '../../../common/guards/service-role-key.guard';
import {
  BODY_PART_EXERCISE_GUIDES,
  EQUIPMENT_EXERCISE_GUIDES,
} from '../exercise-guides.catalog';
import { ExerciseGuidesAdminController } from '../exercise-guides.admin.controller';
import {
  ExerciseGuideCatalogRecord,
  ExerciseGuidesRepositoryPort,
} from '../exercise-guides.repository.port';
import { ExerciseGuidesService } from '../exercise-guides.service';

const 관리자운동가이드응답스키마 = z.object({
  bodyPart: z.string(),
  catalogType: z.enum(['body_part', 'equipment']),
  createdAt: z.string(),
  description: z.string(),
  displayOrder: z.number(),
  duration: z.string(),
  equipment: z.string(),
  equipmentTypes: z.array(z.string()),
  id: z.string(),
  initialLikeCount: z.number(),
  targetMuscles: z.string().nullable(),
  title: z.string(),
  updatedAt: z.string(),
  videoUrl: z.string(),
});

describe('운동 배우기 관리자 컨트롤러 통합', () => {
  let app: INestApplication<App>;
  let repository: jest.Mocked<ExerciseGuidesRepositoryPort>;
  let allGuides: ExerciseGuideCatalogRecord[];

  beforeEach(async () => {
    repository = {
      addLike: jest.fn(),
      createGuide: jest.fn(),
      deleteGuide: jest.fn(),
      getGuideById: jest.fn(),
      listGuides: jest.fn(),
      listLikeStatsForGuideIds: jest.fn(),
      removeLike: jest.fn(),
      updateGuide: jest.fn(),
    };

    allGuides = [
      ...BODY_PART_EXERCISE_GUIDES,
      ...EQUIPMENT_EXERCISE_GUIDES,
    ].map((guide) => ({
      ...guide,
      createdAt: '2026-07-27T09:00:00.000Z',
      updatedAt: '2026-07-27T09:00:00.000Z',
    }));

    repository.listGuides.mockImplementation(async (params) =>
      params?.catalogType
        ? allGuides.filter((guide) => guide.catalogType === params.catalogType)
        : allGuides,
    );
    repository.getGuideById.mockImplementation(
      async (guideId: string) =>
        allGuides.find((guide) => guide.id === guideId) ?? null,
    );
    repository.createGuide.mockImplementation(async ({ guideId, guide }) => ({
      ...guide,
      createdAt: '2026-07-27T10:00:00.000Z',
      id: guideId,
      updatedAt: '2026-07-27T10:00:00.000Z',
    }));
    repository.updateGuide.mockImplementation(async ({ guideId, guide }) => {
      const existingGuide = allGuides.find((item) => item.id === guideId);

      if (!existingGuide) {
        return null;
      }

      return {
        ...guide,
        createdAt: existingGuide.createdAt,
        id: guideId,
        updatedAt: '2026-07-27T11:00:00.000Z',
      };
    });
    repository.deleteGuide.mockResolvedValue(true);
    repository.listLikeStatsForGuideIds.mockResolvedValue([]);
    repository.addLike.mockResolvedValue(undefined);
    repository.removeLike.mockResolvedValue(undefined);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseGuidesAdminController],
      providers: [
        ExerciseGuidesService,
        ServiceRoleKeyGuard,
        {
          provide: ExerciseGuidesRepositoryPort,
          useValue: repository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'SERVICE_ROLE_KEY'
                ? 'integration-service-key'
                : undefined,
          },
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

  it('서비스 롤 키가 없으면 403을 반환한다', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/exercise-guides')
      .expect(403);
  });

  it('서비스 롤 키가 맞으면 관리자 목록을 반환한다', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/admin/exercise-guides')
      .set('x-service-role-key', 'integration-service-key')
      .expect(200);

    const body = z.array(관리자운동가이드응답스키마).parse(response.body);

    expect(body).toHaveLength(20);
    expect(body[0]?.id).toBe('r1');
  });

  it('관리자 생성은 새 가이드를 반환한다', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/admin/exercise-guides')
      .set('x-service-role-key', 'integration-service-key')
      .send({
        bodyPart: '가슴',
        catalogType: 'body_part',
        description: '새 설명',
        displayOrder: 21,
        duration: '10:00',
        equipment: '덤벨',
        equipmentTypes: ['덤벨'],
        initialLikeCount: 0,
        targetMuscles: '가슴',
        title: '새 가이드',
        videoUrl: 'https://www.youtube.com/embed/test',
      })
      .expect(201);

    const body = 관리자운동가이드응답스키마.parse(response.body);

    expect(body.id).toMatch(/^guide_/);
    expect(body.title).toBe('새 가이드');
  });

  it('관리자 수정은 변경된 가이드를 반환한다', async () => {
    const response = await request(app.getHttpServer())
      .put('/api/admin/exercise-guides/r1')
      .set('x-service-role-key', 'integration-service-key')
      .send({
        bodyPart: '가슴',
        catalogType: 'body_part',
        description: '수정 설명',
        displayOrder: 1,
        duration: '12:00',
        equipment: '바벨',
        equipmentTypes: ['바벨'],
        initialLikeCount: 3,
        targetMuscles: '가슴 상부',
        title: '수정 가이드',
        videoUrl: 'https://www.youtube.com/embed/updated',
      })
      .expect(200);

    const body = 관리자운동가이드응답스키마.parse(response.body);

    expect(body.id).toBe('r1');
    expect(body.title).toBe('수정 가이드');
  });

  it('관리자 삭제는 204를 반환한다', async () => {
    await request(app.getHttpServer())
      .delete('/api/admin/exercise-guides/r1')
      .set('x-service-role-key', 'integration-service-key')
      .expect(204);
  });
});
