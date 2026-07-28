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
  BodyAnalysisAiClientPort,
  BodyAnalysisPromptWorkoutContext,
} from './body-analysis-ai-client.port';

const BODY_ANALYSIS_MODEL = 'gpt-4o';

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
export class OpenAiBodyAnalysisClient
  implements BodyAnalysisAiClientPort, OnModuleInit
{
  private readonly logger = new Logger(OpenAiBodyAnalysisClient.name);

  constructor(
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get('AI_INTEGRATIONS_OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'AI_INTEGRATIONS_OPENAI_API_KEY is missing. Body analysis AI is disabled until the server env is configured.',
      );
    }
  }

  async analyzeBody(params: {
    backImageBase64?: string;
    height?: number;
    imageBase64: string;
    medicalSymptoms?: string;
    photoDate?: string;
    recentWorkoutContext: BodyAnalysisPromptWorkoutContext[];
    sideImageBase64?: string;
    squatImageBase64?: string;
  }): Promise<string> {
    const apiKey = this.configService.get('AI_INTEGRATIONS_OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.error(
        'Body analysis request failed because AI_INTEGRATIONS_OPENAI_API_KEY is not configured.',
      );
      throw new ServiceUnavailableException(
        '체형 분석 AI 기능이 아직 설정되지 않았어요.',
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
          model: BODY_ANALYSIS_MODEL,
          messages: [
            {
              role: 'system',
              content:
                "당신은 전문 피트니스 체형 분석가예요. JSON 형식으로만 응답하고, 모든 한국어 설명은 반드시 '~해요' 체로 작성해요.",
            },
            {
              role: 'user',
              content: this.buildUserContent(params),
            },
          ],
          max_completion_tokens: 4200,
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown fetch error';

      this.logger.error(
        `Body analysis request could not reach AI upstream (${baseUrl}): ${message}`,
      );
      throw new BadGatewayException(
        '체형 분석 요청 중 네트워크 오류가 발생했어요.',
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Body analysis upstream request failed with status ${response.status}. Body: ${errorText.slice(0, 500)}`,
      );
      throw new BadGatewayException({
        details: errorText || undefined,
        message: '체형 분석 요청이 실패했어요.',
      });
    }

    const data = (await response.json()) as ChatCompletionsApiResponse;
    const content = this.extractMessageContent(data);

    if (!content) {
      this.logger.error(
        'Body analysis AI response did not include any message content.',
      );
      throw new BadGatewayException('체형 분석 응답 본문이 비어 있어요.');
    }

    return content;
  }

  private buildUserContent(params: {
    backImageBase64?: string;
    height?: number;
    imageBase64: string;
    medicalSymptoms?: string;
    photoDate?: string;
    recentWorkoutContext: BodyAnalysisPromptWorkoutContext[];
    sideImageBase64?: string;
    squatImageBase64?: string;
  }) {
    const images: Array<Record<string, unknown>> = [
      {
        type: 'text',
        text: this.buildPrompt(params),
      },
      {
        type: 'image_url',
        image_url: {
          detail: 'high',
          url: `data:image/jpeg;base64,${params.imageBase64}`,
        },
      },
    ];

    if (params.sideImageBase64) {
      images.push({
        type: 'image_url',
        image_url: {
          detail: 'high',
          url: `data:image/jpeg;base64,${params.sideImageBase64}`,
        },
      });
    }

    if (params.backImageBase64) {
      images.push({
        type: 'image_url',
        image_url: {
          detail: 'high',
          url: `data:image/jpeg;base64,${params.backImageBase64}`,
        },
      });
    }

    if (params.squatImageBase64) {
      images.push({
        type: 'image_url',
        image_url: {
          detail: 'high',
          url: `data:image/jpeg;base64,${params.squatImageBase64}`,
        },
      });
    }

    return images;
  }

  private buildPrompt(params: {
    backImageBase64?: string;
    height?: number;
    medicalSymptoms?: string;
    photoDate?: string;
    recentWorkoutContext: BodyAnalysisPromptWorkoutContext[];
    sideImageBase64?: string;
    squatImageBase64?: string;
  }) {
    const hasMultiView = Boolean(
      params.sideImageBase64 || params.backImageBase64 || params.squatImageBase64,
    );
    const dateContext = params.photoDate
      ? `사진 촬영일은 ${params.photoDate}예요. 현재 날짜는 2026-07-28이에요. 촬영 후 경과 기간을 참고해 현재 추정과 향후 예측을 작성해 주세요.`
      : '사진 촬영일은 알 수 없어요. 현재 날짜 2026-07-28 기준으로 분석해 주세요.';
    const heightContext = params.height
      ? `사용자가 입력한 키는 ${params.height}cm예요.`
      : '키 입력은 없어요.';
    const medicalContext = params.medicalSymptoms
      ? `사용자 증상/불편감: ${params.medicalSymptoms}
증상이 있을 때만 medicalAnalysis를 채우고, 반드시 참고용 고지 문구를 포함해 주세요.`
      : '사용자 증상 입력은 없어요. medicalAnalysis는 null로 반환해 주세요.';

    return `전신 사진을 바탕으로 체형 분석 결과를 JSON으로만 반환해 주세요.

${heightContext}
${dateContext}
${medicalContext}

최근 운동 기록 요약:
${this.buildWorkoutContext(params.recentWorkoutContext)}

반드시 아래 형식으로만 응답해 주세요.
{
  "bodyType": "I|V|A|H|X|O",
  "bodyTypeDescription": "체형 설명",
  "ratios": {
    "armToHeight": 0.49,
    "upperToLower": 1.02
  },
  "upperBody": {
    "shoulderWidth": { "value": "넓음/보통/좁음", "note": "설명" },
    "armLength": { "value": "긴편/보통/짧은편", "note": "설명" },
    "neckLength": { "value": "긴편/보통/짧은편", "note": "설명" },
    "spineAlignment": { "value": "양호/주의필요", "note": "설명" }
  },
  "lowerBody": {
    "hipWidth": { "value": "넓음/보통/좁음", "note": "설명" },
    "legLength": { "value": "긴편/보통/짧은편", "note": "설명" },
    "kneeAlignment": { "value": "양호/주의필요", "note": "설명" }
  },
  "posture": {
    "overallAlignment": { "score": 1-5, "note": "설명" },
    "shoulderBalance": { "score": 1-5, "note": "설명" },
    "hipBalance": { "score": 1-5, "note": "설명" },
    "spinalCurvature": { "score": 1-5, "note": "설명" }
  },
  "multiViewAnalysis": ${
    hasMultiView
      ? `{
    "viewsAnalyzed": ["front", "side", "back", "squat"],
    "sideView": {
      "forwardHeadPosture": { "detected": true, "severity": "경미", "note": "설명" },
      "roundedShoulders": { "detected": true, "severity": "경미", "note": "설명" },
      "anteriorPelvicTilt": { "detected": false, "severity": "정상", "note": "설명" },
      "spinalCurve": { "type": "정상", "note": "설명" },
      "kneeHyperextension": { "detected": false, "note": "설명" }
    },
    "backView": {
      "scoliosis": { "detected": false, "severity": "정상", "note": "설명" },
      "scapularWinging": { "detected": false, "severity": "정상", "note": "설명" },
      "shoulderAsymmetry": { "detected": true, "heightDiff": "약 5mm", "note": "설명" },
      "pelvicAsymmetry": { "detected": false, "note": "설명" },
      "muscleImbalance": { "detected": false, "areas": [], "note": "설명" }
    },
    "squatView": {
      "kneeValgus": { "detected": false, "severity": "정상", "note": "설명" },
      "hipMobility": { "score": 3, "note": "설명" },
      "ankleMobility": { "score": 3, "note": "설명" },
      "squatDepth": { "value": "하프", "note": "설명" },
      "trunkLean": { "detected": false, "note": "설명" },
      "balance": { "score": 3, "note": "설명" }
    },
    "compositePostureScore": 72,
    "compositeGrade": "B",
    "priorityCorrections": [
      {
        "issue": "교정 이슈",
        "priority": "높음",
        "exercise": "교정 운동",
        "description": "설명"
      }
    ]
  }`
      : 'null'
  },
  "prediction": {
    "photoDate": "${params.photoDate ?? '2026-07-28'}",
    "currentDate": "2026-07-28",
    "daysSincePhoto": ${params.photoDate ? 1 : 0},
    "currentEstimate": "현재 추정",
    "threeMonthPrediction": "3개월 후 예측",
    "sixMonthPrediction": "6개월 후 예측",
    "oneYearPrediction": "1년 후 예측",
    "exerciseImpact": ${params.recentWorkoutContext.length > 0 ? '"운동 영향 분석"' : 'null'},
    "riskFactors": ["위험 요소 1"],
    "milestones": ["목표 1", "목표 2"]
  },
  "medicalAnalysis": ${params.medicalSymptoms ? `{
    "symptomAssessment": "증상 평가",
    "bodyStructureImpact": "체형 영향",
    "musculoskeletalRisks": [
      {
        "area": "위험 부위",
        "riskLevel": "중간",
        "description": "설명",
        "preventionTip": "예방 팁"
      }
    ],
    "exerciseWarnings": [
      {
        "exercise": "주의 운동",
        "reason": "이유",
        "alternative": "대체 운동"
      }
    ],
    "rehabExercises": [
      {
        "name": "재활 운동",
        "targetArea": "부위",
        "frequency": "주 3회",
        "description": "설명",
        "precaution": "주의사항"
      }
    ],
    "lifestyleAdvice": ["생활 조언 1", "생활 조언 2"],
    "referralSuggestion": "필요 시 전문의 상담 권고",
    "disclaimer": "이 분석은 참고용 정보예요."
  }` : 'null'},
  "recommendations": ["추천 1", "추천 2", "추천 3"],
  "summary": "전체 요약"
}

주의사항:
- 실제 사진에서 확인 가능한 범위만 설명해 주세요.
- 다중 각도 사진이 없는 뷰는 null로 유지해 주세요.
- 신발/보행 추천은 이번 응답에 포함하지 말아 주세요.
- 최신 연구 소개 같은 부가 섹션은 넣지 말아 주세요.
- workout_records 기반 최근 운동 기록은 참고만 하고, 데이터가 부족하면 과도하게 단정하지 말아 주세요.

// TODO(body-analysis-migration): 원본 앱은 PT 수업 기록과 개인 운동을 함께 프롬프트에 넣었지만,
// 현재 ai-pt 서버는 workout_records만 마이그레이션된 상태예요. trainer/PT log가 넘어오면
// 이 컨텍스트도 함께 합쳐야 해요.`;
  }

  private buildWorkoutContext(records: BodyAnalysisPromptWorkoutContext[]) {
    if (records.length === 0) {
      return '- 최근 운동 기록이 없어요.';
    }

    return records
      .map((record) => {
        const summary = this.asRecord(record.summary);
        const bodyComposition = this.asRecord(record.bodyComposition);
        const volume = this.asString(summary.totalVolumeKg) ?? '0';
        const cardioSteps = this.asString(summary.cardioSteps);
        const weight = this.asString(bodyComposition.morningWeightKg);

        return `- ${record.completedOn}: ${record.title ?? record.routineLabel ?? '운동 기록'} (${record.source}), 시간 ${Math.round(record.durationSeconds / 60)}분, 볼륨 ${volume}kg${cardioSteps ? `, 걸음수 ${cardioSteps}` : ''}${weight ? `, 체중 ${weight}kg` : ''}`;
      })
      .join('\n');
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

  private asRecord(value: unknown) {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }

  private asString(value: unknown) {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number') {
      return String(value);
    }

    return undefined;
  }
}
