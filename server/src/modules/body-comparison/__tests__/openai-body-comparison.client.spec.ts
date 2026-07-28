import {
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../../config/env.schema';
import { OpenAiBodyComparisonClient } from '../openai-body-comparison.client';

describe('OpenAI 전·후 비교 분석 클라이언트', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('API 키가 없으면 503을 던진다', async () => {
    const client = new OpenAiBodyComparisonClient(
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
      client.analyzeBodyComparison({
        afterImageBase64: 'b'.repeat(200),
        beforeImageBase64: 'a'.repeat(200),
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('정상 응답이면 message content를 반환하고 before/after 이미지를 함께 보낸다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content:
                '{"overallChange":{"grade":"A","score":84,"summary":"ok"},"bodyChanges":{"upperBody":{"change":"개선","description":"ok","details":["1"]},"core":{"change":"유지","description":"ok","details":["1"]},"lowerBody":{"change":"개선","description":"ok","details":["1"]}},"postureChanges":{"overallPosture":"ok","improvements":["1"],"remaining":["1"]},"bodyComposition":{"muscleChange":"ok","fatChange":"ok","proportionChange":"ok"},"recommendations":{"keepDoing":["1"],"improve":["1"],"nextGoal":"ok"},"motivationalMessage":"ok"}',
            },
          },
        ],
      }),
      ok: true,
    }) as typeof fetch;

    const client = new OpenAiBodyComparisonClient(
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

    const content = await client.analyzeBodyComparison({
      afterImageBase64: 'b'.repeat(200),
      beforeImageBase64: 'a'.repeat(200),
      height: 175,
      notes: '같은 장소에서 촬영했어요.',
    });

    expect(content).toContain('"grade":"A"');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        body: expect.any(String),
        method: 'POST',
      }),
    );

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0]!;
    const requestBody = JSON.parse(fetchCall[1].body as string) as {
      messages: Array<{ content: Array<Record<string, unknown>> }>;
    };
    const userContent = requestBody.messages[1]!.content;

    expect(userContent).toHaveLength(3);
    expect(userContent[1]).toEqual(
      expect.objectContaining({
        image_url: expect.objectContaining({
          url: `data:image/jpeg;base64,${'a'.repeat(200)}`,
        }),
      }),
    );
    expect(userContent[2]).toEqual(
      expect.objectContaining({
        image_url: expect.objectContaining({
          url: `data:image/jpeg;base64,${'b'.repeat(200)}`,
        }),
      }),
    );
    expect(userContent[0]).toEqual(
      expect.objectContaining({
        text: expect.stringContaining('같은 장소에서 촬영했어요.'),
      }),
    );
  });

  it('업스트림이 실패하면 502를 던진다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('upstream error'),
    }) as typeof fetch;

    const client = new OpenAiBodyComparisonClient(
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
      client.analyzeBodyComparison({
        afterImageBase64: 'b'.repeat(200),
        beforeImageBase64: 'a'.repeat(200),
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
