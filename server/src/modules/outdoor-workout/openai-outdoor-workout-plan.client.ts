import {
  BadGatewayException,
  Injectable,
  Logger,
  OnModuleInit,
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
  implements OutdoorWorkoutPlanClientPort, OnModuleInit
{
  private readonly logger = new Logger(OpenAiOutdoorWorkoutPlanClient.name);

  constructor(
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get('AI_INTEGRATIONS_OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'AI_INTEGRATIONS_OPENAI_API_KEY is missing. Outdoor workout AI plan generation is disabled until the server env is configured.',
      );
    }
  }

  async generatePlan(params: {
    prompt: string;
    systemPrompt: string;
  }): Promise<string> {
    const apiKey = this.configService.get('AI_INTEGRATIONS_OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.error(
        'Outdoor workout plan generation failed because AI_INTEGRATIONS_OPENAI_API_KEY is not configured.',
      );
      throw new ServiceUnavailableException(
        '야외운동 AI 기능이 아직 설정되지 않았어요.',
      );
    }

    const baseUrl = this.configService.get('AI_INTEGRATIONS_OPENAI_BASE_URL');
    let response: Response;

    try {
      response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown fetch error';

      this.logger.error(
        `Outdoor workout plan request could not reach AI upstream (${baseUrl}): ${message}`,
      );
      throw new BadGatewayException(
        '야외운동 계획 생성 요청 중 네트워크 오류가 발생했어요.',
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      const status =
        typeof response.status === 'number' ? response.status : 'unknown';
      this.logger.error(
        `Outdoor workout plan upstream request failed with status ${status}. Body: ${errorText.slice(0, 500)}`,
      );
      throw new BadGatewayException({
        details: errorText || undefined,
        message: '야외운동 계획 생성 요청이 실패했어요.',
      });
    }

    const data = (await response.json()) as ChatCompletionsApiResponse;
    const content = this.extractMessageContent(data);

    if (!content) {
      this.logger.error(
        'Outdoor workout AI response did not include any message content.',
      );
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
