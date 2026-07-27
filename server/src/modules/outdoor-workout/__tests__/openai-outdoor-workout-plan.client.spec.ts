import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../../config/env.schema';
import { OpenAiOutdoorWorkoutPlanClient } from '../openai-outdoor-workout-plan.client';

describe('OpenAI 야외운동 계획 클라이언트', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('API 키가 없으면 503을 던진다', async () => {
    const client = new OpenAiOutdoorWorkoutPlanClient(
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
      client.generatePlan({
        prompt: 'prompt',
        systemPrompt: 'system',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('정상 응답이면 첫 번째 message content를 반환한다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: '{"routeType":"걷기/러닝 코스","segments":[],"generalTips":["a"]}',
            },
          },
        ],
      }),
    }) as typeof fetch;

    const client = new OpenAiOutdoorWorkoutPlanClient(
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

    const content = await client.generatePlan({
      prompt: 'prompt',
      systemPrompt: 'system',
    });

    expect(content).toContain('"routeType":"걷기/러닝 코스"');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('업스트림이 실패하면 502를 던진다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: jest.fn().mockResolvedValue('upstream error'),
    }) as typeof fetch;

    const client = new OpenAiOutdoorWorkoutPlanClient(
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
      client.generatePlan({
        prompt: 'prompt',
        systemPrompt: 'system',
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
