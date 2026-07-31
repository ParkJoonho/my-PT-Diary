import {
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { EnvConfig } from '../../../config/env.schema';
import { OpenAiMealAnalysisClient } from '../openai-meal-analysis.client';

describe('OpenAI 식단 분석 클라이언트', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('API 키가 없으면 503을 던진다', async () => {
    const client = new OpenAiMealAnalysisClient({
      get: jest
        .fn()
        .mockImplementation((key: keyof EnvConfig) =>
          key === 'AI_INTEGRATIONS_OPENAI_BASE_URL'
            ? 'https://api.openai.com/v1'
            : undefined,
        ),
    } as unknown as ConfigService<EnvConfig, true>);

    await expect(
      client.analyzeMeal({
        imageBase64: 'a'.repeat(200),
        mealType: 'lunch',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('전후 사진과 식사 시간 원본 프롬프트를 gpt-4o에 전달한다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: '{"foods":[]}' } }],
      }),
      ok: true,
    }) as typeof fetch;
    const client = thisClient();

    await client.analyzeMeal({
      afterImageBase64: 'b'.repeat(200),
      eatingDurationMinutes: 20,
      imageBase64: 'a'.repeat(200),
      mealType: 'dinner',
    });

    const requestInit = (global.fetch as jest.MockedFunction<typeof fetch>).mock
      .calls[0]?.[1];

    if (typeof requestInit?.body !== 'string') {
      throw new Error('Expected a JSON request body.');
    }

    const payload = z
      .object({
        messages: z.array(
          z.object({
            content: z.array(
              z.object({
                image_url: z.object({ url: z.string() }).optional(),
                text: z.string().optional(),
                type: z.string(),
              }),
            ),
          }),
        ),
        model: z.string(),
      })
      .parse(JSON.parse(requestInit.body));
    const content = payload.messages[0]?.content ?? [];

    expect(payload.model).toBe('gpt-4o');
    expect(content).toHaveLength(3);
    expect(content[0]?.text).toContain('식사 유형은 저녁');
    expect(content[0]?.text).toContain('측정된 식사 시간은 20분');
    expect(content[2]?.image_url?.url).toBe(
      `data:image/jpeg;base64,${'b'.repeat(200)}`,
    );
  });

  it('식사 시간이 없으면 속도 분석 예시를 프롬프트에서 제외한다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: '{"foods":[]}' } }],
      }),
      ok: true,
    }) as typeof fetch;

    await thisClient().analyzeMeal({
      afterImageBase64: 'b'.repeat(200),
      imageBase64: 'a'.repeat(200),
      mealType: 'snack',
    });

    const requestInit = (global.fetch as jest.MockedFunction<typeof fetch>).mock
      .calls[0]?.[1];

    if (typeof requestInit?.body !== 'string') {
      throw new Error('Expected a JSON request body.');
    }

    const payload = z
      .object({
        messages: z.array(
          z.object({
            content: z.array(z.object({ text: z.string().optional() })),
          }),
        ),
      })
      .parse(JSON.parse(requestInit.body));
    const prompt = payload.messages[0]?.content[0]?.text ?? '';

    expect(prompt).toContain(
      '식사 시간이 제공되지 않았으므로 eatingSpeedAnalysis 필드는 작성하지 않아요.',
    );
    expect(prompt).not.toContain('"eatingSpeedAnalysis"');
    expect(prompt).not.toContain('"durationMinutes": 0');
  });

  it('재시도 오류 메시지를 교정 프롬프트에 포함한다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: '{"foods":[]}' } }],
      }),
      ok: true,
    }) as typeof fetch;

    await thisClient().analyzeMeal({
      imageBase64: 'a'.repeat(200),
      mealType: 'lunch',
      previousResponse: '{"eatingSpeedAnalysis":{"durationMinutes":0}}',
      retryFeedback:
        'eatingSpeedAnalysis.durationMinutes: expected number to be >0',
    });

    const requestInit = (global.fetch as jest.MockedFunction<typeof fetch>).mock
      .calls[0]?.[1];

    if (typeof requestInit?.body !== 'string') {
      throw new Error('Expected a JSON request body.');
    }

    const payload = z
      .object({
        messages: z.array(
          z.object({
            content: z.array(z.object({ text: z.string().optional() })),
          }),
        ),
      })
      .parse(JSON.parse(requestInit.body));
    const prompt = payload.messages[0]?.content[0]?.text ?? '';

    expect(prompt).toContain('{"eatingSpeedAnalysis":{"durationMinutes":0}}');
    expect(prompt).toContain(
      'eatingSpeedAnalysis.durationMinutes: expected number to be >0',
    );
    expect(prompt).toContain('완전한 JSON 객체 전체를 처음부터 다시 작성해요.');
  });

  it('식단 가이드는 화면이 소비하는 필드 계약을 요청한다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: '{"overallAssessment":"ok"}' } }],
      }),
      ok: true,
    }) as typeof fetch;
    const client = thisClient();

    await client.generateDietGuide({
      date: '2026-07-28',
      meals: [],
    });

    const requestInit = (global.fetch as jest.MockedFunction<typeof fetch>).mock
      .calls[0]?.[1];

    if (typeof requestInit?.body !== 'string') {
      throw new Error('Expected a JSON request body.');
    }

    const payload = z
      .object({
        messages: z.array(z.object({ content: z.string() })),
        model: z.string(),
      })
      .parse(JSON.parse(requestInit.body));
    const prompt = payload.messages[0]?.content ?? '';

    expect(payload.model).toBe('gpt-4o-mini');
    expect(prompt).toContain('"overallAssessment"');
    expect(prompt).toContain('"mealPlan"');
    expect(prompt).toContain('"tips"');
    expect(prompt).toContain('저장된 식단 기록이 없어요');
  });

  it('업스트림 실패는 502로 변환한다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('upstream error'),
    }) as typeof fetch;

    await expect(
      thisClient().analyzeMeal({
        imageBase64: 'a'.repeat(200),
        mealType: 'snack',
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});

function thisClient() {
  return new OpenAiMealAnalysisClient({
    get: jest
      .fn()
      .mockImplementation((key: keyof EnvConfig) =>
        key === 'AI_INTEGRATIONS_OPENAI_API_KEY'
          ? 'test-key'
          : 'https://api.openai.com/v1',
      ),
  } as unknown as ConfigService<EnvConfig, true>);
}
