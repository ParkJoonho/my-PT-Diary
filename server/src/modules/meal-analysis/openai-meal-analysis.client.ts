import {
  BadGatewayException,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../config/env.schema';
import {
  DietGuideMealContext,
  MealAnalysisAiClientPort,
} from './meal-analysis-ai-client.port';
import type { MealType } from './meal-analysis.schemas';

const MEAL_ANALYSIS_MODEL = 'gpt-4o';
const DIET_GUIDE_MODEL = 'gpt-4o-mini';

type ChatCompletionsApiResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: '아침',
  dinner: '저녁',
  lunch: '점심',
  snack: '간식',
};

@Injectable()
export class OpenAiMealAnalysisClient
  implements MealAnalysisAiClientPort, OnModuleInit
{
  private readonly logger = new Logger(OpenAiMealAnalysisClient.name);

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {}

  onModuleInit() {
    if (
      !this.configService.get<string | undefined>(
        'AI_INTEGRATIONS_OPENAI_API_KEY',
      )
    ) {
      this.logger.warn(
        'AI_INTEGRATIONS_OPENAI_API_KEY is missing. Meal analysis AI is disabled until the server env is configured.',
      );
    }
  }

  async analyzeMeal(params: {
    afterImageBase64?: string;
    eatingDurationMinutes?: number;
    imageBase64: string;
    mealType: MealType;
    previousResponse?: string;
    retryFeedback?: string;
  }) {
    const logContext = {
      afterImageProvided: Boolean(params.afterImageBase64),
      afterImageSize: params.afterImageBase64?.length ?? 0,
      eatingDurationMinutes: params.eatingDurationMinutes ?? null,
      imageSize: params.imageBase64.length,
      mealType: params.mealType,
    };
    const content: Array<
      | { text: string; type: 'text' }
      | {
          image_url: { detail: 'high'; url: string };
          type: 'image_url';
        }
    > = [
      {
        text: this.buildMealAnalysisPrompt(params),
        type: 'text',
      },
      {
        image_url: {
          detail: 'high',
          url: this.toImageDataUrl(params.imageBase64),
        },
        type: 'image_url',
      },
    ];

    if (params.afterImageBase64) {
      content.push({
        image_url: {
          detail: 'high',
          url: this.toImageDataUrl(params.afterImageBase64),
        },
        type: 'image_url',
      });
    }

    return this.requestJson({
      content,
      logContext,
      maxCompletionTokens: params.afterImageBase64 ? 4000 : 3000,
      model: MEAL_ANALYSIS_MODEL,
      temperature: 0.3,
    });
  }

  async generateDietGuide(params: {
    date: string;
    meals: DietGuideMealContext[];
  }) {
    return this.requestJson({
      content: this.buildDietGuidePrompt(params),
      logContext: {
        date: params.date,
        mealCount: params.meals.length,
      },
      maxCompletionTokens: 3000,
      model: DIET_GUIDE_MODEL,
      temperature: 0.4,
    });
  }

  private async requestJson(params: {
    content:
      | string
      | Array<
          | { text: string; type: 'text' }
          | {
              image_url: { detail: 'high'; url: string };
              type: 'image_url';
            }
        >;
    logContext: Record<string, unknown>;
    maxCompletionTokens: number;
    model: string;
    temperature: number;
  }) {
    const apiKey = this.configService.get<string | undefined>(
      'AI_INTEGRATIONS_OPENAI_API_KEY',
    );

    if (!apiKey) {
      throw new ServiceUnavailableException(
        '식단 분석 AI 기능이 아직 설정되지 않았어요.',
      );
    }

    const baseUrl =
      this.configService.get<string>('AI_INTEGRATIONS_OPENAI_BASE_URL') ??
      'https://api.openai.com/v1';
    let response: Response;

    try {
      response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        body: JSON.stringify({
          max_completion_tokens: params.maxCompletionTokens,
          messages: [
            {
              content: params.content,
              role: 'user',
            },
          ],
          model: params.model,
          response_format: { type: 'json_object' },
          temperature: params.temperature,
        }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown fetch error';

      this.logger.error(
        `Meal AI request could not reach upstream (${baseUrl}): ${message}. Context: ${JSON.stringify(params.logContext)}`,
      );
      throw new BadGatewayException(
        '식단 AI 요청 중 네트워크 오류가 발생했어요.',
      );
    }

    if (!response.ok) {
      const errorText = await response.text();

      this.logger.error(
        `Meal AI upstream request failed with status ${response.status}. Context: ${JSON.stringify(params.logContext)}. Body: ${errorText.slice(0, 500)}`,
      );
      throw new BadGatewayException({
        details: errorText || undefined,
        message: '식단 AI 요청이 실패했어요.',
      });
    }

    const data = (await response.json()) as ChatCompletionsApiResponse;
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      this.logger.error(
        `Meal AI response content was empty. Context: ${JSON.stringify(params.logContext)}`,
      );
      throw new BadGatewayException('식단 AI 응답 본문이 비어 있어요.');
    }

    return content;
  }

  private buildMealAnalysisPrompt(params: {
    afterImageBase64?: string;
    eatingDurationMinutes?: number;
    mealType: MealType;
    previousResponse?: string;
    retryFeedback?: string;
  }) {
    const comparisonInstruction = params.afterImageBase64
      ? `
두 장의 사진이 제공돼요. 첫 번째는 식사 전, 두 번째는 식사 후 사진이에요.
두 사진을 비교해 남긴 양을 제외한 실제 섭취량을 추정하고 각 음식의 consumptionRate에 반영해요.
summary에는 남긴 음식과 실제 섭취량에 대한 설명을 포함해요.`
      : `
한 장의 식사 전 사진만 제공돼요. 각 음식의 consumptionRate는 100으로 작성해요.`;
    const speedInstruction = params.eatingDurationMinutes
      ? `
측정된 식사 시간은 ${params.eatingDurationMinutes}분이에요.
eatingSpeedAnalysis를 포함하고 grade는 15분 미만 fast, 15~20분 moderate, 20분 이상 good으로 작성해요.`
      : `
식사 시간이 제공되지 않았으므로 eatingSpeedAnalysis 필드는 작성하지 않아요.`;

    // 선택 데이터가 없는 필드는 JSON 예시에서도 빼 모델이 임의의 기본값을 만들지 않게 해요.
    const eatingSpeedJsonExample = params.eatingDurationMinutes
      ? `,
  "eatingSpeedAnalysis": {
    "durationMinutes": ${params.eatingDurationMinutes},
    "grade": "fast/moderate/good 중 하나",
    "advice": "식사 속도 조언",
    "healthRisks": ["주의점"],
    "tips": ["실천 방법"]
  }`
      : '';

    // 직전 결과와 오류를 나란히 보여줘 모델이 고칠 위치와 이유를 함께 이해하게 해요.
    const retryInstruction =
      params.retryFeedback && params.previousResponse
        ? `

이전에 작성한 JSON 응답은 다음과 같아요.
<previous_response>
${params.previousResponse}
</previous_response>

이전 응답은 아래 오류로 검증에 실패했어요.
<validation_error>
${params.retryFeedback}
</validation_error>

이전 응답과 오류를 함께 검토해 잘못된 필드를 바로잡아요.
수정한 일부 필드만 반환하지 말고, 아래 계약을 만족하는 완전한 JSON 객체 전체를 처음부터 다시 작성해요.`
        : '';

    return `당신은 전문 영양사이자 식품 분석 전문가예요. 제공된 음식 사진을 분석해 음식 종류, 칼로리와 영양소를 추정해요.
식사 유형은 ${MEAL_TYPE_LABELS[params.mealType]}이에요.
상품 데이터베이스나 외부 검증 결과를 가장하지 말고 사진과 일반적인 1인분 기준으로 원본 앱과 같은 추정 결과를 작성해요.
${comparisonInstruction}
${speedInstruction}
${retryInstruction}

반드시 아래 구조의 JSON 객체만 응답해요.
{
  "foods": [{
    "name": "음식명",
    "category": "음식 분류",
    "estimatedWeight": "추정 무게(g)",
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0,
    "sodium": 0,
    "consumptionRate": 100
  }],
  "totalCalories": 0,
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFat": 0,
  "totalFiber": 0,
  "totalSodium": 0,
  "mealBalance": {
    "score": 0,
    "grade": "S/A/B/C/D/F 중 하나",
    "proteinRatio": 0,
    "carbRatio": 0,
    "fatRatio": 0,
    "feedback": "영양 균형 피드백"
  },
  "dietaryAdvice": ["식단 개선 조언"],
  "exerciseToOffset": {
    "walking": 0,
    "running": 0,
    "cycling": 0
  },
  "summary": "전체 식단 분석 요약"${eatingSpeedJsonExample}
}

한국 음식을 우선 인식하고 사진에 보이는 음식을 개별 항목으로 작성해요.
칼로리는 kcal, 영양소는 g, 나트륨은 mg 단위로 작성해요.
mealBalance.score는 0~100, 비율 필드는 0~100, consumptionRate는 0~100 범위로 작성해요.
음식이 아니면 foods는 빈 배열로 두고 totals는 0으로, summary에는 음식이 인식되지 않았다고 작성해요.
모든 한국어 설명은 '~해요' 체로 작성해요.`;
  }

  private buildDietGuidePrompt(params: {
    date: string;
    meals: DietGuideMealContext[];
  }) {
    const mealContext =
      params.meals.length === 0
        ? '저장된 식단 기록이 없어요. 일반적인 하루 식단 가이드를 제공해요.'
        : params.meals
            .map(
              (meal) =>
                `${MEAL_TYPE_LABELS[meal.mealType]}: ${meal.totalCalories}kcal, 단백질 ${meal.protein}g, 탄수화물 ${meal.carbs}g, 지방 ${meal.fat}g`,
            )
            .join('\n');

    return `당신은 스포츠 영양 전문가이자 퍼스널 트레이너예요.
${params.date}의 식단 기록을 바탕으로 원본 앱의 AI 식단 가이드를 작성해요.

${mealContext}

외부 상품이나 칼로리 데이터베이스로 검증했다고 표현하지 않아요.
반드시 아래 구조의 JSON 객체만 응답해요.
{
  "overallAssessment": "오늘 식단 평가",
  "macroTargets": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0
  },
  "mealPlan": [
    {
      "mealName": "아침",
      "foods": ["구체적인 한국 음식"],
      "calories": 0
    }
  ],
  "tips": ["오늘의 식단 팁"]
}

mealPlan에는 아침, 점심, 저녁, 간식 구성을 포함해요.
모든 한국어 설명은 '~해요' 체로 작성해요.`;
  }

  private toImageDataUrl(value: string) {
    return value.startsWith('data:')
      ? value
      : `data:image/jpeg;base64,${value}`;
  }
}
