import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import { AnalysisRecordsController } from '../analysis-records.controller';
import { AnalysisRecordsService } from '../analysis-records.service';

const 분석기록응답스키마 = z.object({
  analysisType: z.string(),
  analyzedAt: z.string(),
  createdAt: z.string(),
  id: z.string(),
  qualitativeData: z.record(z.string(), z.unknown()),
  quantitativeData: z.record(z.string(), z.unknown()),
});

describe('분석 이력 컨트롤러 통합', () => {
  let app: INestApplication<App>;
  let service: jest.Mocked<AnalysisRecordsService>;

  beforeEach(async () => {
    service = {
      compareAnalysisRecords: jest.fn(),
      createAnalysisRecord: jest.fn(),
      getAnalysisRecord: jest.fn(),
      listAnalysisRecords: jest.fn(),
    } as unknown as jest.Mocked<AnalysisRecordsService>;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AnalysisRecordsController],
      providers: [
        {
          provide: AnalysisRecordsService,
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

  it('목록 조회는 x-user-key가 없으면 400을 반환한다', async () => {
    await request(app.getHttpServer()).get('/api/analysis-records').expect(400);
  });

  it('목록 조회는 올바른 응답을 반환한다', async () => {
    service.listAnalysisRecords.mockResolvedValue([
      {
        analysisType: 'body' as never,
        analyzedAt: '2026-07-28T01:23:45.000Z',
        createdAt: '2026-07-28T01:23:45.000Z',
        id: 'record_a',
        qualitativeData: { bodyType: 'V' },
        quantitativeData: { overallAlignment: 3 },
      },
    ]);

    const response = await request(app.getHttpServer())
      .get('/api/analysis-records')
      .set('x-user-key', 'integration-user')
      .query({ type: 'body' })
      .expect(200);

    const body = z.array(분석기록응답스키마).parse(response.body);

    expect(service.listAnalysisRecords.mock.calls[0]).toEqual([
      'integration-user',
      { type: 'body' },
    ]);
    expect(body[0]?.id).toBe('record_a');
  });

  it('생성 요청은 올바른 응답을 반환한다', async () => {
    service.createAnalysisRecord.mockResolvedValue({
      analysisType: 'body' as never,
      analyzedAt: '2026-07-28T01:23:45.000Z',
      createdAt: '2026-07-28T01:23:45.000Z',
      id: 'record_created',
      qualitativeData: { bodyType: 'V' },
      quantitativeData: { overallAlignment: 3 },
      rawResult: { summary: 'saved' },
    });

    const response = await request(app.getHttpServer())
      .post('/api/analysis-records')
      .set('x-user-key', 'integration-user')
      .send({
        analysisType: 'body',
        analyzedAt: '2026-07-28T01:23:45.000Z',
        idempotencyKey: 'body-analysis:2026-07-28T01:23:45.000Z',
        qualitativeData: { bodyType: 'V' },
        quantitativeData: { overallAlignment: 3 },
        rawResult: { summary: 'saved' },
      })
      .expect(201);

    expect(service.createAnalysisRecord.mock.calls[0]).toEqual([
      'integration-user',
      expect.objectContaining({
        analysisType: 'body',
        analyzedAt: '2026-07-28T01:23:45.000Z',
        idempotencyKey: 'body-analysis:2026-07-28T01:23:45.000Z',
      }),
    ]);
    const responseBody = z.object({ id: z.string() }).parse(response.body);
    expect(responseBody.id).toBe('record_created');
  });

  it('비교 요청 본문이 잘못되면 400을 반환한다', async () => {
    await request(app.getHttpServer())
      .post('/api/analysis-records/compare')
      .set('x-user-key', 'integration-user')
      .send({ recordId1: '' })
      .expect(400);
  });
});
