import { TrainerConnectRequestStatus } from '../dto/trainer-connect-request-response.dto';
import { TrainersService } from '../trainers.service';
import {
  TrainerConnectRequestRow,
  TrainersRepositoryPort,
  TrainerRow,
} from '../trainers.repository.port';

function createTrainerRow(
  overrides: Partial<TrainerRow> = {},
): TrainerRow {
  return {
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
    ...overrides,
  };
}

function createConnectRequestRow(
  overrides: Partial<TrainerConnectRequestRow> = {},
): TrainerConnectRequestRow {
  return {
    created_at: '2026-07-29T12:00:00.000Z',
    id: '6952028b-c6a4-4f50-97d9-9971c4e4574e',
    message: '등/어깨 위주 PT를 받고 싶어요.',
    status: TrainerConnectRequestStatus.Pending,
    trainer_id: 'trainer-seed-kim-minjun',
    trainer_name: '김민준',
    updated_at: '2026-07-29T12:00:00.000Z',
    user_key: 'user-a',
    ...overrides,
  };
}

describe('트레이너 추천 서비스', () => {
  let repository: jest.Mocked<TrainersRepositoryPort>;
  let service: TrainersService;

  beforeEach(() => {
    repository = {
      createOrReturnConnectRequest: jest.fn(),
      findTrainerById: jest.fn(),
      getTrainerProfileData: jest.fn(),
      listApprovedTrainers: jest.fn(),
      listConnectRequests: jest.fn(),
      setTrainerLike: jest.fn(),
    };
    service = new TrainersService(repository);
  });

  it('추천 목록을 점수순으로 반환한다', async () => {
    repository.listApprovedTrainers.mockResolvedValue([
      createTrainerRow(),
      createTrainerRow({
        avatar_color: '#34C759',
        base_member_count: 14,
        certifications: ['물리치료사', '부상 전문'],
        focus_body_parts: ['코어', '복근', '등', '힙'],
        gym_name: '용산 스포츠 센터',
        id: 'trainer-seed-park-jihun',
        match_tags: ['rehab', 'posture', 'core'],
        name: '박지훈',
        posture_friendly: true,
        rehab_friendly: true,
        specialties: ['재활 운동', '코어 강화'],
      }),
    ]);
    repository.getTrainerProfileData.mockResolvedValue({
      conditionRecords: [
        {
          muscle_soreness: [
            { label: '허리', score: 3 },
            { label: '가슴', score: 0 },
          ],
          summary: {
            averageSorenessScore: 3,
            severeSorenessCount: 1,
          },
        },
      ],
      ptLessons: [
        {
          body_parts: ['코어', '등'],
          summary: {
            totalVolumeKg: 820,
          },
        },
      ],
      workoutActivityCount: 2,
    });

    const result = await service.listRecommendedTrainers('user-a');

    expect(result[0]?.name).toBe('박지훈');
    expect(result[0]?.matchScore).toBeGreaterThan(result[1]?.matchScore ?? 0);
    expect(result[0]?.highlightTag).toBe('재활/회복 적합');
  });

  it('rating 문자열도 숫자로 정규화해 반환한다', async () => {
    repository.listApprovedTrainers.mockResolvedValue([
      createTrainerRow({
        rating: '4.90' as unknown as number,
      }),
    ]);

    const result = await service.listTrainers('user-a');

    expect(result[0]?.rating).toBe(4.9);
  });

  it('연결 요청을 응답 DTO로 반환한다', async () => {
    repository.createOrReturnConnectRequest.mockResolvedValue(
      createConnectRequestRow(),
    );

    const result = await service.createConnectRequest(
      'user-a',
      'trainer-seed-kim-minjun',
      {
        message: '등/어깨 위주 PT를 받고 싶어요.',
      },
    );

    expect(repository.createOrReturnConnectRequest.mock.calls[0]?.[0]).toEqual({
      message: '등/어깨 위주 PT를 받고 싶어요.',
      trainerId: 'trainer-seed-kim-minjun',
      userKey: 'user-a',
    });
    expect(result.status).toBe(TrainerConnectRequestStatus.Pending);
  });

  it('트레이너 찜 상태를 갱신한다', async () => {
    repository.setTrainerLike.mockResolvedValue(
      createTrainerRow({
        liked: true,
      }),
    );

    const result = await service.setTrainerLike(
      'user-a',
      'trainer-seed-kim-minjun',
      true,
    );

    expect(repository.setTrainerLike.mock.calls[0]?.[0]).toEqual({
      liked: true,
      trainerId: 'trainer-seed-kim-minjun',
      userKey: 'user-a',
    });
    expect(result.liked).toBe(true);
  });
});
