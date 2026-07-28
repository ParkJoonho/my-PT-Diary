import {
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../../config/env.schema';
import { OpenAiAnalysisRecordComparisonClient } from '../openai-analysis-record-comparison.client';

describe('OpenAI 분석 기록 비교 클라이언트', () => {
  const originalFetch = global.fetch;

  const olderRecord = {
    analyzed_at: '2026-07-27T09:00:00.000Z',
    analysis_type: 'body' as const,
    created_at: '2026-07-27T09:00:00.000Z',
    id: 'record_old',
    qualitative_data: {},
    quantitative_data: {},
    raw_result: { bodyType: 'V' },
    user_key: 'user-a',
  };

  const newerRecord = {
    analyzed_at: '2026-07-28T09:00:00.000Z',
    analysis_type: 'body' as const,
    created_at: '2026-07-28T09:00:00.000Z',
    id: 'record_new',
    qualitative_data: {},
    quantitative_data: {},
    raw_result: { bodyType: 'V' },
    user_key: 'user-a',
  };

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('API 키가 없으면 503을 던진다', async () => {
    const client = new OpenAiAnalysisRecordComparisonClient(
      {
        get: jest
          .fn()
          .mockImplementation((key: keyof EnvConfig) =>
            key === 'AI_INTEGRATIONS_OPENAI_BASE_URL'
              ? 'https://api.openai.com/v1'
              : undefined,
          ),
      } as unknown as ConfigService<EnvConfig, true>,
    );

    await expect(
      client.compareRecords({ newerRecord, olderRecord }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('정상 응답이면 비교 결과를 반환한다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                bodyTypeChange: { from: 'V', note: '유지돼요.', to: 'V' },
                declines: [],
                improvements: ['정렬이 좋아졌어요.'],
                motivationalNote: '좋아요.',
                overallChange: '좋아졌어요.',
                postureChanges: [],
                quantitativeChanges: [],
                recommendations: ['유지해요.'],
              }),
            },
          },
        ],
      }),
      ok: true,
    }) as typeof fetch;

    const client = new OpenAiAnalysisRecordComparisonClient(
      {
        get: jest
          .fn()
          .mockImplementation((key: keyof EnvConfig) =>
            key === 'AI_INTEGRATIONS_OPENAI_API_KEY'
              ? 'test-key'
              : 'https://api.openai.com/v1',
          ),
      } as unknown as ConfigService<EnvConfig, true>,
    );

    const result = await client.compareRecords({ newerRecord, olderRecord });

    expect(result.overallChange).toBe('좋아졌어요.');
  });

  it('업스트림이 실패하면 502를 던진다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('upstream error'),
    }) as typeof fetch;

    const client = new OpenAiAnalysisRecordComparisonClient(
      {
        get: jest
          .fn()
          .mockImplementation((key: keyof EnvConfig) =>
            key === 'AI_INTEGRATIONS_OPENAI_API_KEY'
              ? 'test-key'
              : 'https://api.openai.com/v1',
          ),
      } as unknown as ConfigService<EnvConfig, true>,
    );

    await expect(
      client.compareRecords({ newerRecord, olderRecord }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
