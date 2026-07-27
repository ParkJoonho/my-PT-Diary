import { BadGatewayException, Injectable } from '@nestjs/common';
import {
  CreateOutdoorWorkoutPlanInput,
  OutdoorWorkoutPlanOutput,
  outdoorWorkoutPlanSchema,
} from './outdoor-workout.schemas';
import { OutdoorWorkoutPlanClientPort } from './outdoor-workout-plan-client.port';

type PromptBodyAnalysis = CreateOutdoorWorkoutPlanInput['bodyAnalysis'];

const OUTDOOR_WORKOUT_SYSTEM_PROMPT =
  "당신은 야외 운동 전문 코치입니다. JSON 형식으로만 응답하세요. 모든 한국어 텍스트는 반드시 '~해요' 체로 작성하고, summary·personalizedNote·generalTips·breathingTip·restRecommendation 등 설명 필드는 최대 2~3문장을 넘기지 말아요.";

@Injectable()
export class OutdoorWorkoutService {
  constructor(
    private readonly outdoorWorkoutPlanClient: OutdoorWorkoutPlanClientPort,
  ) {}

  async createOutdoorWorkoutPlan(
    input: CreateOutdoorWorkoutPlanInput,
  ): Promise<OutdoorWorkoutPlanOutput> {
    const content = await this.outdoorWorkoutPlanClient.generatePlan({
      prompt: this.buildPrompt(input),
      systemPrompt: OUTDOOR_WORKOUT_SYSTEM_PROMPT,
    });
    const parsed = this.safeParseJson(content);
    const validated = outdoorWorkoutPlanSchema.safeParse(parsed);

    if (!validated.success) {
      throw new BadGatewayException({
        issues: validated.error.issues.map((issue) => ({
          code: issue.code,
          message: issue.message,
          path: issue.path.join('.'),
        })),
        message: '야외운동 계획 응답 형식이 올바르지 않아요.',
      });
    }

    return validated.data;
  }

  private buildPrompt(input: CreateOutdoorWorkoutPlanInput) {
    const modeLabel = input.mode === 'hiking' ? '등산' : '걷기/러닝';
    const elevationInfo =
      input.elevationData && input.elevationData.length > 0
        ? `고도 데이터: ${input.elevationData
            .map((point) => `포인트${point.point}: ${point.elevation}m`)
            .join(', ')}`
        : '고도 데이터 없음 (일반 평지로 가정)';

    return `당신은 전문 야외 운동 코치입니다. 아래 경로 정보${
      input.bodyAnalysis ? '와 사용자의 체형 분석 결과' : ''
    }를 분석하여 맞춤형 ${modeLabel} 운동 계획을 JSON 형식으로 작성해 주세요.

경로 정보:
- 시작점: 위도 ${input.startLat}, 경도 ${input.startLng}
- 도착점: 위도 ${input.endLat}, 경도 ${input.endLng}
- 직선 거리: 약 ${input.distanceKm.toFixed(2)}km
- 탐색 반경: ${input.radiusKm}km
- 운동 모드: ${modeLabel}
- ${elevationInfo}
${this.buildBodyAnalysisSection(input.bodyAnalysis)}

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):

{
  "routeType": "${modeLabel} 코스",
  "totalDistance": "예상 실제 이동 거리 (km)",
  "estimatedTime": "예상 소요 시간",
  "estimatedCalories": "예상 소모 칼로리 (kcal)",
  "elevationGain": "총 고도 상승 (m)",
  "difficulty": "쉬움/보통/어려움 중 하나",
  "summary": "경로 전체 요약 설명",
  "courseWaypoints": [
    {
      "order": 1,
      "latitude": 위도숫자,
      "longitude": 경도숫자,
      "label": "웨이포인트 이름",
      "elevation": 고도숫자,
      "direction": "이동 방향 설명",
      "slope": "경사 정보"
    }
  ],
  "segments": [
    {
      "name": "구간 이름",
      "distance": "구간 거리",
      "elevationChange": "고도 변화",
      "difficulty": "쉬움/보통/어려움",
      "startWaypoint": 시작웨이포인트순서번호,
      "endWaypoint": 끝웨이포인트순서번호,
      "direction": "이 구간의 이동 방향 가이드",
      "terrainType": "지형 유형",
      "slopeInfo": "경사도 정보",
      "breathingTip": "이 구간의 호흡 관리 방법",
      "restRecommendation": "휴식 권장사항",
      "bodyTypeExercise": "이 구간에서 체형 교정을 위해 추천하는 동작"
    }
  ],
  "generalTips": [
    "운동 전/중/후 팁"
  ],
  "bodyTypeExercises": [
    {
      "name": "운동 이름",
      "description": "운동 설명",
      "targetArea": "타겟 부위",
      "duration": "권장 시간/횟수",
      "benefit": "도움이 되는 이유"
    }
  ],
  "personalizedNote": "개인 맞춤 조언"
}

주의사항:
- courseWaypoints는 시작점부터 도착점까지 6~10개 지점을 지정하세요.
- segments는 4~6개 구간으로 나누고, 각 구간에 startWaypoint/endWaypoint, direction, terrainType, slopeInfo를 포함하세요.
- ${input.mode === 'hiking' ? '등산의 경우 오르막/내리막 구간을 구분하고 정상 부근 휴식을 포함해 주세요.' : '걷기/러닝의 경우 워밍업-본운동-쿨다운 구조로 구성해 주세요.'}
- 고도 데이터를 반영하여 지형이 바뀌는 것처럼 설명해 주세요.
- generalTips는 5~7개 작성해 주세요.
- bodyTypeExercises는 3~5개 작성해 주세요.
- 모든 텍스트는 한국어로 작성해 주세요.

// TODO(outdoor-workout-migration): 원본 앱 구현 충실도를 유지하기 위해 현재는
// 실제 도로/보행로/등산로 경로가 아닌 "시작점-도착점 직선 + 샘플 고도"만 AI 입력으로 사용해요.
// 지도/길찾기/등산로 기반 라우팅 엔진이 준비되면 서버가 직접 실제 경로 geometry를 계산하고
// 현재 client-provided 직선 데이터 전달을 제거해야 해요.

// TODO(outdoor-workout-migration): GPS 기반 실측 거리/고도/페이스가 아직 없어서
// 계획 생성과 이후 저장 흐름 모두 추정값 중심으로 동작해요.
// 실운동 추적 기능이 마이그레이션되면 실측값과 계획값을 분리해 다뤄야 해요.`;
  }

  private buildBodyAnalysisSection(bodyAnalysis?: PromptBodyAnalysis) {
    if (!bodyAnalysis) {
      return '';
    }

    const qualitativeData = this.asRecord(bodyAnalysis.qualitativeData);
    const quantitativeData = this.asRecord(bodyAnalysis.quantitativeData);
    const rawResult = this.asRecord(bodyAnalysis.rawResult);
    const upperBody = this.asRecord(rawResult.upperBody);
    const lowerBody = this.asRecord(rawResult.lowerBody);
    const gaitAnalysis = this.asRecord(rawResult.gaitAnalysis);
    const gaitType = this.asRecord(gaitAnalysis.gaitType);
    const footAlignment = this.asRecord(gaitAnalysis.footAlignment);

    return `

사용자 체형 분석 결과 (맞춤 코스 설계에 반영):
- 체형 유형: ${this.asString(qualitativeData.bodyType) ?? '미확인'} (${this.asString(qualitativeData.bodyTypeDescription) ?? ''})
- 자세 점수: 전체정렬 ${this.asString(quantitativeData.overallAlignment) ?? '?'}/5, 어깨균형 ${this.asString(quantitativeData.shoulderBalance) ?? '?'}/5, 골반균형 ${this.asString(quantitativeData.hipBalance) ?? '?'}/5, 척추곡선 ${this.asString(quantitativeData.spinalCurvature) ?? '?'}/5
- 신체 비율: 팔/키 비율 ${this.asString(quantitativeData.armToHeight) ?? '?'}, 상하체 비율 ${this.asString(quantitativeData.upperToLower) ?? '?'}
${upperBody ? `- 상체: 어깨 ${this.readNestedValue(upperBody, 'shoulderWidth', 'value') ?? ''}, 척추정렬 ${this.readNestedValue(upperBody, 'spineAlignment', 'value') ?? ''}` : ''}
${lowerBody ? `- 하체: 무릎정렬 ${this.readNestedValue(lowerBody, 'kneeAlignment', 'value') ?? ''}` : ''}
${gaitAnalysis ? `- 보행 분석: ${this.asString(gaitType.type) ?? ''} (${this.asString(gaitType.description) ?? ''}), 아치 유형 ${this.asString(footAlignment.archType) ?? ''}` : ''}
${this.asString(qualitativeData.summary) ? `- 종합: ${this.asString(qualitativeData.summary)}` : ''}

위 체형 정보를 기반으로:
1. 사용자의 약한 부위를 보완하는 운동 동작을 각 구간에 포함시키세요.
2. 자세 문제가 있다면 걷기/등산 중 교정 팁을 제공하세요.
3. 보행 패턴 문제가 있다면 올바른 보행법을 안내하세요.
4. 체형에 맞는 난이도와 페이스를 조절하세요.
5. bodyTypeExercises에 체형별 맞춤 야외 운동 동작 3~5개를 추천하세요.

// TODO(outdoor-workout-migration): 원본 구현을 따라 현재는 클라이언트가 전달한 체형분석 스냅샷을
// 그대로 프롬프트에 사용해요. analysis-records 모듈이 마이그레이션되면 userKey 기준 최신 분석을
// 서버에서 직접 조회하도록 바꿔야 해요.`;
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
        throw new BadGatewayException('야외운동 계획 응답에서 JSON을 찾지 못했어요.');
      }

      cleaned = jsonMatch[0].replace(/,\s*([}\]])/g, '$1');

      try {
        return JSON.parse(cleaned);
      } catch {
        throw new BadGatewayException('야외운동 계획 응답 JSON 파싱에 실패했어요.');
      }
    }
  }

  private asRecord(value: unknown): Record<string, unknown> {
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

  private readNestedValue(
    record: Record<string, unknown>,
    firstKey: string,
    secondKey: string,
  ) {
    const nested = this.asRecord(record[firstKey]);
    return this.asString(nested[secondKey]);
  }
}
