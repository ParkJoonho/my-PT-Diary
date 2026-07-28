import {
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../../config/env.schema';
import { OpenAiBodyAnalysisClient } from '../openai-body-analysis.client';

describe('OpenAI 체형 분석 클라이언트', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('API 키가 없으면 503을 던진다', async () => {
    const client = new OpenAiBodyAnalysisClient(
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
      client.analyzeBody({
        imageBase64: 'a'.repeat(200),
        recentWorkoutContext: [],
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('정상 응답이면 message content를 반환한다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: '{"bodyType":"V","summary":"ok"}',
            },
          },
        ],
      }),
      ok: true,
    }) as typeof fetch;

    const client = new OpenAiBodyAnalysisClient(
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

    const content = await client.analyzeBody({
      imageBase64: 'a'.repeat(200),
      recentWorkoutContext: [],
    });

    expect(content).toContain('"bodyType":"V"');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
      }),
    );

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0]!;
    const payload = JSON.parse((requestInit as RequestInit).body as string) as {
      messages: Array<{ content: Array<{ text?: string; type: string }> }>;
    };

    expect(payload.messages[1]?.content).toHaveLength(2);
    expect(payload.messages[1]?.content[0]?.text).toContain('"gaitAnalysis": null');
  });

  it('업스트림이 실패하면 502를 던진다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('upstream error'),
    }) as typeof fetch;

    const client = new OpenAiBodyAnalysisClient(
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
      client.analyzeBody({
        imageBase64: 'a'.repeat(200),
        recentWorkoutContext: [],
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('신발 사진이 있으면 gait prompt와 추가 이미지를 함께 보낸다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: '{"bodyType":"V","summary":"ok"}',
            },
          },
        ],
      }),
      ok: true,
    }) as typeof fetch;

    const client = new OpenAiBodyAnalysisClient(
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

    await client.analyzeBody({
      imageBase64: 'a'.repeat(200),
      recentWorkoutContext: [],
      shoeImageBase64: 'b'.repeat(200),
    });

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0]!;
    const payload = JSON.parse((requestInit as RequestInit).body as string) as {
      messages: Array<{
        content: Array<{
          image_url?: { url: string };
          text?: string;
          type: string;
        }>;
      }>;
    };
    const content = payload.messages[1]?.content ?? [];

    expect(content).toHaveLength(3);
    expect(content[0]?.text).toContain('"gaitAnalysis": {');
    expect(content[0]?.text).toContain('shoeRecommendations');
    expect(content[2]?.image_url?.url).toBe(
      `data:image/jpeg;base64,${'b'.repeat(200)}`,
    );
  });
});
