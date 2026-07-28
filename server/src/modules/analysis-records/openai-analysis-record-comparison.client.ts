import {
  BadGatewayException,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../config/env.schema';
import { AnalysisRecordComparisonClientPort } from './analysis-record-comparison.client.port';
import { AnalysisRecordRow } from './analysis-records.repository.port';
import {
  AnalysisRecordComparisonOutput,
  analysisRecordComparisonSchema,
} from './analysis-records.schemas';

const ANALYSIS_RECORD_COMPARISON_MODEL = 'gpt-4o-mini';

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
export class OpenAiAnalysisRecordComparisonClient
  implements AnalysisRecordComparisonClientPort, OnModuleInit
{
  private readonly logger = new Logger(
    OpenAiAnalysisRecordComparisonClient.name,
  );

  constructor(
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get('AI_INTEGRATIONS_OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'AI_INTEGRATIONS_OPENAI_API_KEY is missing. Analysis record comparison is disabled until the server env is configured.',
      );
    }
  }

  async compareRecords(params: {
    newerRecord: AnalysisRecordRow;
    olderRecord: AnalysisRecordRow;
  }): Promise<AnalysisRecordComparisonOutput> {
    const apiKey = this.configService.get('AI_INTEGRATIONS_OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.error(
        'Analysis record comparison failed because AI_INTEGRATIONS_OPENAI_API_KEY is not configured.',
      );
      throw new ServiceUnavailableException(
        '체형 분석 비교 AI 기능이 아직 설정되지 않았어요.',
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
          model: ANALYSIS_RECORD_COMPARISON_MODEL,
          messages: [
            {
              role: 'system',
              content:
                "당신은 체형 변화 분석 전문가예요. JSON 형식으로만 응답하고, 모든 한국어 설명은 반드시 '~해요' 체로 작성해요.",
            },
            {
              role: 'user',
              content: this.buildPrompt(params.olderRecord, params.newerRecord),
            },
          ],
          max_completion_tokens: 2200,
          response_format: { type: 'json_object' },
          temperature: 0.4,
        }),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown fetch error';

      this.logger.error(
        `Analysis comparison request could not reach AI upstream (${baseUrl}): ${message}`,
      );
      throw new BadGatewayException(
        '체형 분석 비교 요청 중 네트워크 오류가 발생했어요.',
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Analysis comparison upstream request failed with status ${response.status}. Body: ${errorText.slice(0, 500)}`,
      );
      throw new BadGatewayException({
        details: errorText || undefined,
        message: '체형 분석 비교 요청이 실패했어요.',
      });
    }

    const data = (await response.json()) as ChatCompletionsApiResponse;
    const content = this.extractMessageContent(data);

    if (!content) {
      this.logger.error(
        'Analysis comparison AI response did not include any message content.',
      );
      throw new BadGatewayException('체형 분석 비교 응답 본문이 비어 있어요.');
    }

    const parsed = this.safeParseJson(content);
    const validated = analysisRecordComparisonSchema.safeParse(parsed);

    if (!validated.success) {
      throw new BadGatewayException({
        issues: validated.error.issues.map((issue) => ({
          code: issue.code,
          message: issue.message,
          path: issue.path.join('.'),
        })),
        message: '체형 분석 비교 응답 형식이 올바르지 않아요.',
      });
    }

    return validated.data;
  }

  private buildPrompt(olderRecord: AnalysisRecordRow, newerRecord: AnalysisRecordRow) {
    return `당신은 전문 피트니스 체형 변화 분석가예요. 아래 두 시점의 체형 분석 결과를 비교해 변화만 요약해 주세요.

이전 분석 (${olderRecord.analyzed_at.split('T')[0]}):
${JSON.stringify(olderRecord.raw_result, null, 2)}

최근 분석 (${newerRecord.analyzed_at.split('T')[0]}):
${JSON.stringify(newerRecord.raw_result, null, 2)}

반드시 아래 JSON 형식으로만 응답해 주세요.
{
  "overallChange": "전체 변화 요약",
  "improvements": ["개선점 1", "개선점 2"],
  "declines": ["악화점 1"],
  "bodyTypeChange": {
    "from": "이전 체형",
    "to": "현재 체형",
    "note": "체형 변화 설명"
  },
  "postureChanges": [
    {
      "area": "부위명",
      "before": 3,
      "after": 4,
      "change": "개선",
      "note": "설명"
    }
  ],
  "quantitativeChanges": [
    {
      "metric": "지표명",
      "before": "0.49",
      "after": "0.52",
      "changePercent": "+6.1%"
    }
  ],
  "recommendations": ["향후 추천사항 1", "향후 추천사항 2", "향후 추천사항 3"],
  "motivationalNote": "격려 메시지"
}

주의사항:
- bodyType, ratios, posture, multiViewAnalysis에서 실제로 확인 가능한 변화만 써 주세요.
- 수치가 없는 내용은 억지로 정량화하지 말고 빈 배열로 둬도 돼요.
- declines는 없으면 빈 배열로 반환해 주세요.`;
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

  private safeParseJson(content: string): unknown {
    let cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new BadGatewayException('체형 분석 비교 응답에서 JSON을 찾지 못했어요.');
      }

      cleaned = jsonMatch[0].replace(/,\s*([}\]])/g, '$1');

      try {
        return JSON.parse(cleaned);
      } catch {
        throw new BadGatewayException('체형 분석 비교 응답 JSON 파싱에 실패했어요.');
      }
    }
  }
}
