import { BadGatewayException } from '@nestjs/common';
import { OutdoorWorkoutPlanClientPort } from '../outdoor-workout-plan-client.port';
import { OutdoorWorkoutService } from '../outdoor-workout.service';

const 계획생성요청 = {
  startLat: 37.5665,
  startLng: 126.978,
  endLat: 37.5712,
  endLng: 126.9831,
  distanceKm: 1.24,
  mode: 'walking' as const,
  radiusKm: 1 as const,
  elevationData: [
    { point: 0, lat: 37.5665, lng: 126.978, elevation: 38 },
    { point: 1, lat: 37.5689, lng: 126.9802, elevation: 42 },
  ],
};

const 계획응답 = {
  routeType: '걷기/러닝 코스',
  totalDistance: '1.4',
  estimatedTime: '약 22분',
  estimatedCalories: '약 110kcal',
  elevationGain: '약 24m',
  difficulty: '보통',
  summary:
    '평탄한 구간과 완만한 오르막이 섞여 있어 가볍게 페이스를 조절하며 진행하기 좋아요.',
  courseWaypoints: [
    {
      order: 1,
      latitude: 37.5665,
      longitude: 126.978,
      label: '출발지',
      elevation: 38,
      direction: '북동쪽으로 직진해요.',
      slope: '평지예요.',
    },
    {
      order: 2,
      latitude: 37.5712,
      longitude: 126.9831,
      label: '도착지',
      elevation: 42,
      direction: '공원 입구 쪽으로 이동해요.',
      slope: '완만한 오르막 3%예요.',
    },
  ],
  segments: [
    {
      name: '워밍업 구간',
      distance: '0.4',
      elevationChange: '+4m',
      difficulty: '쉬움',
      startWaypoint: 1,
      endWaypoint: 2,
      direction: '출발지에서 공원 방향으로 직진해요.',
      terrainType: '산책로',
      slopeInfo: '평균 경사 2%',
      breathingTip: '코로 3초 들이쉬고 입으로 5초 내쉬어요.',
      restRecommendation: '호흡이 가빠지면 잠깐 속도를 낮춰요.',
      bodyTypeExercise: '어깨를 펴고 팔을 자연스럽게 흔들어요.',
    },
  ],
  generalTips: ['운동 전 물을 충분히 마셔요.'],
  bodyTypeExercises: [
    {
      name: '어깨 열기 스트레칭',
      description: '걷기 전후로 가슴과 어깨 앞쪽을 충분히 열어줘요.',
      targetArea: '어깨',
      duration: '10회',
      benefit: '상체 말림을 줄이는 데 도움을 줘요.',
    },
  ],
  personalizedNote:
    '어깨가 앞으로 말리는 경향이 있으면 팔을 뒤로 여는 의식을 유지해요.',
};

describe('야외운동 서비스', () => {
  let client: jest.Mocked<OutdoorWorkoutPlanClientPort>;
  let service: OutdoorWorkoutService;

  beforeEach(() => {
    client = {
      generatePlan: jest.fn(),
    };
    service = new OutdoorWorkoutService(client);
  });

  it('AI 응답 JSON이 유효하면 계획 객체를 반환한다', async () => {
    client.generatePlan.mockResolvedValue(JSON.stringify(계획응답));

    const result = await service.createOutdoorWorkoutPlan(계획생성요청);

    expect(result).toEqual(계획응답);
    expect(client.generatePlan).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('직선 거리: 약 1.24km'),
        systemPrompt: expect.stringContaining('JSON 형식으로만 응답'),
      }),
    );
  });

  it('코드펜스가 있는 JSON도 파싱한다', async () => {
    client.generatePlan.mockResolvedValue(
      `\`\`\`json\n${JSON.stringify(계획응답, null, 2)}\n\`\`\``,
    );

    const result = await service.createOutdoorWorkoutPlan(계획생성요청);

    expect(result.routeType).toBe('걷기/러닝 코스');
  });

  it('AI 응답 구조가 잘못되면 502를 던진다', async () => {
    client.generatePlan.mockResolvedValue(
      JSON.stringify({
        routeType: '걷기/러닝 코스',
        summary: '필드가 부족해요.',
      }),
    );

    await expect(
      service.createOutdoorWorkoutPlan(계획생성요청),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
