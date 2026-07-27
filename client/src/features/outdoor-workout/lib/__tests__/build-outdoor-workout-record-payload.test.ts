import { describe, expect, it } from '@jest/globals';
import type { OutdoorWorkoutPlanDto } from 'shared/api/generated/models';
import { buildOutdoorWorkoutRecordPayload } from '../build-outdoor-workout-record-payload';

const 기본계획: OutdoorWorkoutPlanDto = {
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

describe('buildOutdoorWorkoutRecordPayload', () => {
  it('걷기 계획은 원본처럼 예상 시간 기반 steps와 duration을 만든다', () => {
    const payload = buildOutdoorWorkoutRecordPayload({
      now: new Date('2026-07-27T01:23:45.000Z'),
      plan: 기본계획,
      workoutMode: 'walking',
    });

    expect(payload.title).toBe('야외 걷기');
    expect(payload.activityLevel).toBe('야외 걷기');
    expect(payload.durationSeconds).toBe(22 * 60);
    expect(payload.cardio?.steps).toBe(2200);
    expect(payload.location).toBe('outdoor');
    expect(payload.dailyReport).toContain('1.4');
  });

  it('체형 운동이 있으면 strengthExercises로 변환한다', () => {
    const payload = buildOutdoorWorkoutRecordPayload({
      plan: {
        ...기본계획,
        bodyTypeExercises: [
          {
            benefit: '상체 말림을 줄이는 데 도움을 줘요.',
            description: '걷기 전후로 가슴과 어깨 앞쪽을 충분히 열어줘요.',
            duration: '10회',
            name: '어깨 열기 스트레칭',
            targetArea: '어깨',
          },
        ],
      },
      workoutMode: 'hiking',
    });

    expect(payload.title).toBe('야외 등산');
    expect(payload.cardio?.steps).toBe(22 * 80);
    expect(payload.strengthExercises).toEqual([
      expect.objectContaining({
        name: '어깨 열기 스트레칭',
        sets: [{ reps: 10, weightKg: 0 }],
      }),
    ]);
  });
});
