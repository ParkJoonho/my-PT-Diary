import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { z } from 'zod';
import { TrainerConnectRequestStatus } from '../dto/trainer-connect-request-response.dto';
import { TrainersController } from '../trainers.controller';
import {
  TrainerRow,
  TrainersRepositoryPort,
} from '../trainers.repository.port';
import { TrainersService } from '../trainers.service';

const trainerSchema = z.object({
  avatarColor: z.string(),
  bio: z.string(),
  career: z.string(),
  certifications: z.array(z.string()),
  connectRequestStatus: z.nativeEnum(TrainerConnectRequestStatus).nullable(),
  experienceYears: z.number(),
  focusBodyParts: z.array(z.string()),
  gymName: z.string(),
  id: z.string(),
  liked: z.boolean(),
  memberCount: z.number(),
  name: z.string(),
  onlineAvailable: z.boolean(),
  philosophy: z.string(),
  pricePerSession: z.string(),
  rating: z.number(),
  region: z.string(),
  specialties: z.array(z.string()),
});

const recommendedTrainerSchema = trainerSchema.extend({
  highlightTag: z.string(),
  matchReason: z.string(),
  matchScore: z.number(),
});

const connectRequestSchema = z.object({
  createdAt: z.string(),
  id: z.string(),
  message: z.string().nullable(),
  status: z.nativeEnum(TrainerConnectRequestStatus),
  trainerId: z.string(),
  trainerName: z.string(),
  updatedAt: z.string(),
});

describe('트레이너 컨트롤러 통합', () => {
  let app: INestApplication<App>;
  let repository: jest.Mocked<TrainersRepositoryPort>;
  const trainerRow: TrainerRow = {
    accepted_member_count: 2,
    avatar_color: '#1B2A4A',
    base_member_count: 18,
    beginner_friendly: false,
    bio: '근력 향상과 체형 교정을 함께 보는 정밀 코칭을 제공합니다.',
    career: '선수 출신, 웨이트 트레이닝 8년 지도',
    certifications: ['NSCA-CPT', '선수 출신'],
    connect_request_status: null,
    display_order: 1,
    experience_years: 8,
    focus_body_parts: ['등', '가슴', '어깨', '팔'],
    gym_name: '강남 피트니스 클럽',
    id: 'trainer-seed-kim-minjun',
    liked: false,
    match_tags: ['strength', 'posture', 'hypertrophy'],
    name: '김민준',
    online_available: true,
    philosophy: '기록과 자세를 같이 보면서 오래 갈 수 있는 강한 몸을 만듭니다.',
    posture_friendly: true,
    price_per_session: '70,000원',
    rating: 4.9,
    region: '강남',
    rehab_friendly: false,
    specialties: ['근력 향상', '체형 교정'],
  };

  beforeEach(async () => {
    repository = {
      createOrReturnConnectRequest: jest.fn(),
      findTrainerById: jest.fn(),
      getTrainerProfileData: jest.fn(),
      listApprovedTrainers: jest.fn(),
      listConnectRequests: jest.fn(),
      setTrainerLike: jest.fn(),
    };
    repository.listApprovedTrainers.mockResolvedValue([
      trainerRow,
    ]);
    repository.getTrainerProfileData.mockResolvedValue({
      conditionRecords: [],
      ptLessons: [],
      workoutActivityCount: 0,
    });
    repository.listConnectRequests.mockResolvedValue([
      {
        created_at: '2026-07-29T12:00:00.000Z',
        id: '6952028b-c6a4-4f50-97d9-9971c4e4574e',
        message: '등/어깨 위주 PT를 받고 싶어요.',
        status: TrainerConnectRequestStatus.Pending,
        trainer_id: 'trainer-seed-kim-minjun',
        trainer_name: '김민준',
        updated_at: '2026-07-29T12:00:00.000Z',
        user_key: 'user-a',
      },
    ]);
    repository.createOrReturnConnectRequest.mockResolvedValue(
      {
        created_at: '2026-07-29T12:00:00.000Z',
        id: '6952028b-c6a4-4f50-97d9-9971c4e4574e',
        message: '등/어깨 위주 PT를 받고 싶어요.',
        status: TrainerConnectRequestStatus.Pending,
        trainer_id: 'trainer-seed-kim-minjun',
        trainer_name: '김민준',
        updated_at: '2026-07-29T12:00:00.000Z',
        user_key: 'user-a',
      },
    );
    repository.setTrainerLike.mockResolvedValue({
      ...trainerRow,
      liked: true,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TrainersController],
      providers: [
        TrainersService,
        {
          provide: TrainersRepositoryPort,
          useValue: repository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('트레이너 목록을 반환한다', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/trainers')
      .set('x-user-key', 'integration-user')
      .expect(200);

    const body = z.array(trainerSchema).parse(response.body);
    expect(body[0]?.name).toBe('김민준');
    expect(repository.listApprovedTrainers.mock.calls[0]?.[0]).toBe(
      'integration-user',
    );
  });

  it('추천 목록을 반환한다', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/trainers/recommended')
      .set('x-user-key', 'integration-user')
      .expect(200);

    const body = z.array(recommendedTrainerSchema).parse(response.body);
    expect(body[0]?.matchScore).toBeGreaterThan(0);
  });

  it('연결 요청을 생성한다', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/trainers/trainer-seed-kim-minjun/connect-request')
      .set('x-user-key', 'integration-user')
      .send({
        message: '등/어깨 위주 PT를 받고 싶어요.',
      })
      .expect(201);

    const body = connectRequestSchema.parse(response.body);
    expect(body.trainerId).toBe('trainer-seed-kim-minjun');
    expect(
      repository.createOrReturnConnectRequest.mock.calls[0]?.[0],
    ).toEqual({
      message: '등/어깨 위주 PT를 받고 싶어요.',
      trainerId: 'trainer-seed-kim-minjun',
      userKey: 'integration-user',
    });
  });

  it('찜 상태를 저장한다', async () => {
    const response = await request(app.getHttpServer())
      .put('/api/trainers/trainer-seed-kim-minjun/like')
      .set('x-user-key', 'integration-user')
      .send({
        liked: true,
      })
      .expect(200);

    const body = trainerSchema.parse(response.body);
    expect(body.liked).toBe(true);
    expect(repository.setTrainerLike.mock.calls[0]?.[0]).toEqual({
      liked: true,
      trainerId: 'trainer-seed-kim-minjun',
      userKey: 'integration-user',
    });
  });
});
