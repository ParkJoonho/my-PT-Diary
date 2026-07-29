import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import { BodyComparisonController } from '../body-comparison.controller';
import { BodyComparisonService } from '../body-comparison.service';

const 전후비교응답스키마 = z.object({
  analyzedAt: z.string(),
  comparison: z.object({
    overallChange: z.object({
      grade: z.string(),
      score: z.number(),
      summary: z.string(),
    }),
  }),
  recordSave: z.object({
    status: z.enum(['saved', 'failed']),
    recordId: z.string().optional(),
    message: z.string().optional(),
  }),
});

describe('전·후 비교 분석 컨트롤러 통합', () => {
  let app: INestApplication<App>;
  let service: jest.Mocked<BodyComparisonService>;

  beforeEach(async () => {
    service = {
      analyzeBodyComparison: jest.fn(),
    } as unknown as jest.Mocked<BodyComparisonService>;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BodyComparisonController],
      providers: [
        {
          provide: BodyComparisonService,
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

  it('x-user-key가 없으면 400을 반환한다', async () => {
    await request(app.getHttpServer())
      .post('/api/body-comparison/analyze')
      .send({
        afterImageBase64: 'b'.repeat(200),
        beforeImageBase64: 'a'.repeat(200),
      })
      .expect(400);
  });

  it('before/after 이미지가 없으면 400을 반환한다', async () => {
    await request(app.getHttpServer())
      .post('/api/body-comparison/analyze')
      .set('x-user-key', 'integration-user')
      .send({})
      .expect(400);
  });

  it('정상 요청이면 201과 비교 결과를 반환한다', async () => {
    service.analyzeBodyComparison.mockResolvedValue({
      analyzedAt: '2026-07-28T01:23:45.000Z',
      comparison: {
        overallChange: {
          grade: 'A',
          score: 84,
          summary: '상체와 코어 안정성이 전반적으로 좋아졌어요.',
        },
      },
      recordSave: {
        recordId: 'record_saved',
        status: 'saved',
      },
    } as never);

    const response = await request(app.getHttpServer())
      .post('/api/body-comparison/analyze')
      .set('x-user-key', 'integration-user')
      .send({
        afterImageBase64: 'b'.repeat(200),
        beforeImageBase64: 'a'.repeat(200),
      })
      .expect(200);

    const body = 전후비교응답스키마.parse(response.body);

    expect(service.analyzeBodyComparison).toHaveBeenCalledWith(
      'integration-user',
      {
        afterImageBase64: 'b'.repeat(200),
        beforeImageBase64: 'a'.repeat(200),
      },
    );
    expect(body.recordSave.status).toBe('saved');
  });
});
