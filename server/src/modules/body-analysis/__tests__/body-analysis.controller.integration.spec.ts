import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import { BodyAnalysisController } from '../body-analysis.controller';
import { BodyAnalysisService } from '../body-analysis.service';

const 체형분석응답스키마 = z.object({
  analyzedAt: z.string(),
  analysis: z.object({
    bodyType: z.string(),
    summary: z.string(),
  }),
  recordSave: z.object({
    status: z.enum(['saved', 'failed']),
    recordId: z.string().optional(),
    message: z.string().optional(),
  }),
});

describe('체형 분석 컨트롤러 통합', () => {
  let app: INestApplication<App>;
  let service: jest.Mocked<BodyAnalysisService>;

  beforeEach(async () => {
    service = {
      analyzeBody: jest.fn(),
    } as unknown as jest.Mocked<BodyAnalysisService>;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BodyAnalysisController],
      providers: [
        {
          provide: BodyAnalysisService,
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
      .post('/api/body-analysis/analyze')
      .send({ imageBase64: 'a'.repeat(200) })
      .expect(400);
  });

  it('필수 이미지가 없으면 400을 반환한다', async () => {
    await request(app.getHttpServer())
      .post('/api/body-analysis/analyze')
      .set('x-user-key', 'integration-user')
      .send({})
      .expect(400);
  });

  it('정상 요청이면 200과 분석 결과를 반환한다', async () => {
    service.analyzeBody.mockResolvedValue({
      analysis: {
        bodyType: 'V',
        summary: '상체 안정화가 중요해 보여요.',
      },
      analyzedAt: '2026-07-28T01:23:45.000Z',
      recordSave: {
        recordId: 'record_saved',
        status: 'saved',
      },
    } as never);

    const response = await request(app.getHttpServer())
      .post('/api/body-analysis/analyze')
      .set('x-user-key', 'integration-user')
      .send({
        imageBase64: 'a'.repeat(200),
        shoeImageBase64: 'b'.repeat(200),
      })
      .expect(200);

    const body = 체형분석응답스키마.parse(response.body);

    expect(service.analyzeBody).toHaveBeenCalledWith('integration-user', {
      imageBase64: 'a'.repeat(200),
      shoeImageBase64: 'b'.repeat(200),
    });
    expect(body.recordSave.status).toBe('saved');
  });
});
