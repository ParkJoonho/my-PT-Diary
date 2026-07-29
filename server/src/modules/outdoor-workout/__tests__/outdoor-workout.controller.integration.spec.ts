import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import { OutdoorWorkoutPlanClientPort } from '../outdoor-workout-plan-client.port';
import { OutdoorWorkoutController } from '../outdoor-workout.controller';
import { OutdoorWorkoutService } from '../outdoor-workout.service';

const 야외운동계획응답스키마 = z.object({
  routeType: z.string(),
  totalDistance: z.string(),
  estimatedTime: z.string(),
  estimatedCalories: z.string(),
  elevationGain: z.string(),
  difficulty: z.string(),
  summary: z.string(),
  segments: z.array(
    z.object({
      name: z.string(),
      distance: z.string(),
      elevationChange: z.string(),
      difficulty: z.string(),
      breathingTip: z.string(),
      restRecommendation: z.string(),
    }),
  ),
  generalTips: z.array(z.string()),
});

const 응답본문 = {
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

describe('야외운동 컨트롤러 통합', () => {
  let app: INestApplication<App>;
  let client: jest.Mocked<OutdoorWorkoutPlanClientPort>;

  beforeEach(async () => {
    client = {
      generatePlan: jest.fn(),
    };
    client.generatePlan.mockResolvedValue(JSON.stringify(응답본문));

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OutdoorWorkoutController],
      providers: [
        OutdoorWorkoutService,
        {
          provide: OutdoorWorkoutPlanClientPort,
          useValue: client,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('유효한 요청은 200과 계획 객체를 반환한다', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/outdoor-workout/plan')
      .set('x-user-key', 'integration-user')
      .send({
        startLat: 37.5665,
        startLng: 126.978,
        endLat: 37.5712,
        endLng: 126.9831,
        distanceKm: 1.24,
        mode: 'walking',
        radiusKm: 1,
        elevationData: [
          { point: 0, lat: 37.5665, lng: 126.978, elevation: 38 },
          { point: 1, lat: 37.5689, lng: 126.9802, elevation: 42 },
        ],
      })
      .expect(200);

    const body = 야외운동계획응답스키마.parse(response.body);

    expect(body.routeType).toBe('걷기/러닝 코스');
    expect(client.generatePlan).toHaveBeenCalledTimes(1);
  });

  it('x-user-key가 없으면 400을 반환한다', async () => {
    await request(app.getHttpServer())
      .post('/api/outdoor-workout/plan')
      .send({
        startLat: 37.5665,
        startLng: 126.978,
        endLat: 37.5712,
        endLng: 126.9831,
        distanceKm: 1.24,
        mode: 'walking',
        radiusKm: 1,
      })
      .expect(400);
  });

  it('mode가 잘못되면 400을 반환한다', async () => {
    await request(app.getHttpServer())
      .post('/api/outdoor-workout/plan')
      .set('x-user-key', 'integration-user')
      .send({
        startLat: 37.5665,
        startLng: 126.978,
        endLat: 37.5712,
        endLng: 126.9831,
        distanceKm: 1.24,
        mode: 'running',
        radiusKm: 1,
      })
      .expect(400);
  });
});
