import {
  BadGatewayException,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../config/env.schema';
import { BodyComparisonAiClientPort } from './body-comparison-ai-client.port';

const BODY_COMPARISON_MODEL = 'gpt-4o';

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
export class OpenAiBodyComparisonClient
  implements BodyComparisonAiClientPort, OnModuleInit
{
  private readonly logger = new Logger(OpenAiBodyComparisonClient.name);

  constructor(
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get('AI_INTEGRATIONS_OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'AI_INTEGRATIONS_OPENAI_API_KEY is missing. Body comparison AI is disabled until the server env is configured.',
      );
    }
  }

  async analyzeBodyComparison(params: {
    afterImageBase64: string;
    beforeImageBase64: string;
    height?: number;
    notes?: string;
  }): Promise<string> {
    const apiKey = this.configService.get('AI_INTEGRATIONS_OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.error(
        'Body comparison request failed because AI_INTEGRATIONS_OPENAI_API_KEY is not configured.',
      );
      throw new ServiceUnavailableException(
        '체형 비교 분석 AI 기능이 아직 설정되지 않았어요.',
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
          model: BODY_COMPARISON_MODEL,
          messages: [
            {
              role: 'system',
              content:
                "당신은 전문 피트니스 체형 변화 분석가예요. JSON 형식으로만 응답하고, 모든 한국어 설명은 반드시 '~해요' 체로 작성해요.",
            },
            {
              role: 'user',
              content: this.buildUserContent(params),
            },
          ],
          max_completion_tokens: 2800,
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown fetch error';

      this.logger.error(
        `Body comparison request could not reach AI upstream (${baseUrl}): ${message}`,
      );
      throw new BadGatewayException(
        '전·후 비교 분석 요청 중 네트워크 오류가 발생했어요.',
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Body comparison upstream request failed with status ${response.status}. Body: ${errorText.slice(0, 500)}`,
      );
      throw new BadGatewayException({
        details: errorText || undefined,
        message: '전·후 비교 분석 요청이 실패했어요.',
      });
    }

    const data = (await response.json()) as ChatCompletionsApiResponse;
    const content = this.extractMessageContent(data);

    if (!content) {
      this.logger.error(
        'Body comparison AI response did not include any message content.',
      );
      throw new BadGatewayException('전·후 비교 분석 응답 본문이 비어 있어요.');
    }

    return content;
  }

  private buildUserContent(params: {
    afterImageBase64: string;
    beforeImageBase64: string;
    height?: number;
    notes?: string;
  }) {
    return [
      {
        type: 'text',
        text: this.buildPrompt(params),
      },
      {
        type: 'image_url',
        image_url: {
          detail: 'high',
          url: `data:image/jpeg;base64,${params.beforeImageBase64}`,
        },
      },
      {
        type: 'image_url',
        image_url: {
          detail: 'high',
          url: `data:image/jpeg;base64,${params.afterImageBase64}`,
        },
      },
    ];
  }

  private buildPrompt(params: { height?: number; notes?: string }) {
    const heightContext = params.height
      ? `사용자가 입력한 키는 ${params.height}cm예요.`
      : '키 입력은 없어요.';
    const notesContext = params.notes
      ? `사용자가 남긴 추가 메모는 다음과 같아요: ${params.notes}`
      : '추가 메모는 없어요.';

    return `두 장의 전신 사진을 비교해서 체형 변화를 JSON으로만 반환해 주세요.

첫 번째 이미지는 Before 사진이고, 두 번째 이미지는 After 사진이에요.
${heightContext}
${notesContext}

반드시 아래 형식으로만 응답해 주세요.
{
  "overallChange": {
    "grade": "S|A|B|C|D|F",
    "score": 0,
    "summary": "전체 변화 요약"
  },
  "bodyChanges": {
    "upperBody": {
      "change": "개선|유지|저하",
      "description": "상체 변화 설명",
      "details": ["세부 포인트 1", "세부 포인트 2"]
    },
    "core": {
      "change": "개선|유지|저하",
      "description": "코어/복부 변화 설명",
      "details": ["세부 포인트 1", "세부 포인트 2"]
    },
    "lowerBody": {
      "change": "개선|유지|저하",
      "description": "하체 변화 설명",
      "details": ["세부 포인트 1", "세부 포인트 2"]
    }
  },
  "postureChanges": {
    "overallPosture": "전체 자세 변화 설명",
    "improvements": ["개선된 점 1", "개선된 점 2"],
    "remaining": ["남은 과제 1", "남은 과제 2"]
  },
  "bodyComposition": {
    "muscleChange": "근육량 변화 추정",
    "fatChange": "체지방 변화 추정",
    "proportionChange": "비율 변화 설명"
  },
  "recommendations": {
    "keepDoing": ["계속 유지할 것 1", "계속 유지할 것 2"],
    "improve": ["앞으로 개선할 것 1", "앞으로 개선할 것 2"],
    "nextGoal": "다음 목표 제안"
  },
  "motivationalMessage": "동기부여 메시지"
}

주의사항:
- 실제 사진에서 확인 가능한 변화만 설명해 주세요.
- 상체, 코어, 하체, 자세, 체성분 변화 추정을 빠뜨리지 말아 주세요.
- 수치 점수는 0~100 범위 정수 또는 소수로 작성해 주세요.
- JSON 외의 설명 문장은 절대 추가하지 말아 주세요.`;
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
