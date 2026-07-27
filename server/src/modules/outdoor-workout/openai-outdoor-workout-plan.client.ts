import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../config/env.schema';
import { OutdoorWorkoutPlanClientPort } from './outdoor-workout-plan-client.port';

const OUTDOOR_WORKOUT_MODEL = 'gpt-4o-mini';

type ChatCompletionsApiResponse = {
  choices?: Array<{
    message?: {
      content?:
        | string
        | Array<{
            text?: string;
            type?: string;
          }>;
    };
  }>;
};

@Injectable()
export class OpenAiOutdoorWorkoutPlanClient
  implements OutdoorWorkoutPlanClientPort
{
  constructor(
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  async generatePlan(params: {
    prompt: string;
    systemPrompt: string;
  }): Promise<string> {
    const apiKey = this.configService.get('AI_INTEGRATIONS_OPENAI_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException(
        '야외운동 AI 기능이 아직 설정되지 않았어요.',
      );
    }

    const baseUrl = this.configService.get('AI_INTEGRATIONS_OPENAI_BASE_URL');
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OUTDOOR_WORKOUT_MODEL,
        messages: [
          {
            role: 'system',
            content: params.systemPrompt,
          },
          {
            role: 'user',
            content: params.prompt,
          },
        ],
        max_completion_tokens: 3500,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new BadGatewayException({
        details: errorText || undefined,
        message: '야외운동 계획 생성 요청이 실패했어요.',
      });
    }

    const data = (await response.json()) as ChatCompletionsApiResponse;
    const content = this.extractMessageContent(data);

    if (!content) {
      throw new BadGatewayException(
        '야외운동 계획 응답 본문이 비어 있어요.',
      );
    }

    return content;
  }

  private extractMessageContent(data: ChatCompletionsApiResponse) {
    const content = data.choices?.[0]?.message?.content;

    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((item) => item.text?.trim())
        .filter((item): item is string => Boolean(item))
        .join('\n')
        .trim();
    }

    return '';
  }
}
