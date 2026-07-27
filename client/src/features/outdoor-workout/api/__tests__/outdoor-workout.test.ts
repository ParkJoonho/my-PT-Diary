import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { useMutation } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import {
  outdoorWorkoutControllerCreateOutdoorWorkoutPlan,
  type outdoorWorkoutControllerCreateOutdoorWorkoutPlanResponse,
} from 'shared/api/generated/endpoints/outdoor-workout/outdoor-workout';
import type { OutdoorWorkoutPlanDto } from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';
import {
  selectOutdoorWorkoutPlan,
  useCreateOutdoorWorkoutPlan,
} from '../outdoor-workout';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn((options) => options),
}));

jest.mock(
  'shared/api/generated/endpoints/outdoor-workout/outdoor-workout',
  () => ({
    outdoorWorkoutControllerCreateOutdoorWorkoutPlan: jest.fn(),
  }),
);

jest.mock('shared/api/user-key', () => ({
  useTrackerUserKey: jest.fn(),
}));

const 야외운동계획: OutdoorWorkoutPlanDto = {
  difficulty: '보통',
  elevationGain: '약 24m',
  estimatedCalories: '약 110kcal',
  estimatedTime: '약 22분',
  generalTips: ['운동 전 물을 충분히 마셔요.'],
  routeType: '걷기/러닝 코스',
  segments: [
    {
      breathingTip: '코로 3초 들이쉬고 입으로 5초 내쉬어요.',
      difficulty: '쉬움',
      distance: '0.4',
      elevationChange: '+4m',
      name: '워밍업 구간',
      restRecommendation: '호흡이 가빠지면 잠깐 속도를 낮춰요.',
    },
  ],
  summary: '평탄한 구간과 완만한 오르막이 섞여 있어요.',
  totalDistance: '1.4',
};

describe('야외운동 API wrapper', () => {
  const mockedUseMutation = jest.mocked(useMutation);
  const mockedUseTrackerUserKey = jest.mocked(useTrackerUserKey);
  const mockedCreatePlan = jest.mocked(
    outdoorWorkoutControllerCreateOutdoorWorkoutPlan,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTrackerUserKey.mockReturnValue('테스트-사용자');
    mockedCreatePlan.mockResolvedValue({
      data: 야외운동계획,
      headers: new Headers(),
      status: 200,
    });
  });

  it('mutation은 x-user-key 헤더와 함께 계획 생성 API를 호출한다', async () => {
    renderHook(() => useCreateOutdoorWorkoutPlan());

    const options = mockedUseMutation.mock.calls[0]?.[0];
    const result = await options?.mutationFn?.(
      {
        distanceKm: 1.24,
        endLat: 37.5712,
        endLng: 126.9831,
        mode: 'walking',
        radiusKm: 1,
        startLat: 37.5665,
        startLng: 126.978,
      },
      {} as never,
    );

    expect(result).toEqual(야외운동계획);
    expect(mockedCreatePlan).toHaveBeenCalledWith(
      {
        distanceKm: 1.24,
        endLat: 37.5712,
        endLng: 126.9831,
        mode: 'walking',
        radiusKm: 1,
        startLat: 37.5665,
        startLng: 126.978,
      },
      {
        headers: {
          'x-user-key': '테스트-사용자',
        },
      },
    );
  });

  it('503 응답은 설정 부족 메시지로 변환한다', () => {
    expect(() =>
      selectOutdoorWorkoutPlan({
        data: undefined,
        headers: new Headers(),
        status: 503,
      } satisfies outdoorWorkoutControllerCreateOutdoorWorkoutPlanResponse),
    ).toThrow('야외운동 AI 기능이 아직 설정되지 않았어요.');
  });

  it('200이 아니면 일반 실패 메시지를 던진다', () => {
    expect(() =>
      selectOutdoorWorkoutPlan({
        data: undefined,
        headers: new Headers(),
        status: 400,
      } satisfies outdoorWorkoutControllerCreateOutdoorWorkoutPlanResponse),
    ).toThrow('야외운동 계획 생성에 실패했어요.');
  });
});
