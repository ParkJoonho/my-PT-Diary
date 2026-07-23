import { describe, expect, it, jest } from '@jest/globals';
import {
  buildManualWorkoutPayload,
  calculateManualWorkoutVolume,
  createManualWorkoutFormState,
  validateManualWorkoutForm,
} from '../manual-workout-form';

jest.mock('shared/lib/date', () => ({
  getClientTimeZone: () => 'Asia/Seoul',
  getClientTodayDate: () => '2026-07-23',
  getUtcISOString: () => '2026-07-23T12:34:56.000Z',
}));

describe('수동 운동 폼 로직', () => {
  it('근력·유산소·체성분 입력을 서버 payload로 변환한다', () => {
    const form = createManualWorkoutFormState();
    form.title = '상체 개인 운동';
    form.durationMinutes = '60';
    form.cardioDurationMinutes = '15';
    form.cardioDistanceKm = '3';
    form.cardioSteps = '4200';
    form.weightKg = '72.4';
    form.strengthExercises = [
      {
        name: '벤치프레스',
        sets: [
          { reps: '10', restSeconds: '90', rir: '2', weightKg: '60' },
          { reps: '8', restSeconds: '', rir: '', weightKg: '70' },
        ],
      },
    ];

    expect(buildManualWorkoutPayload(form)).toEqual({
      bodyComposition: {
        bodyFatPercentage: undefined,
        skeletalMuscleMassKg: undefined,
        weightKg: 72.4,
      },
      cardio: {
        distanceMeters: 3000,
        durationSeconds: 900,
        steps: 4200,
      },
      durationSeconds: 3600,
      location: 'gym',
      memo: undefined,
      performedAt: '2026-07-23T12:34:56.000Z',
      performedOn: '2026-07-23',
      strengthExercises: [
        {
          name: '벤치프레스',
          sets: [
            { reps: 10, restSeconds: 90, rir: 2, weightKg: 60 },
            {
              reps: 8,
              restSeconds: undefined,
              rir: undefined,
              weightKg: 70,
            },
          ],
        },
      ],
      timeZone: 'Asia/Seoul',
      title: '상체 개인 운동',
    });
  });

  it('총 볼륨을 계산한다', () => {
    expect(
      calculateManualWorkoutVolume([
        {
          name: '스쿼트',
          sets: [
            { reps: '10', restSeconds: '', rir: '', weightKg: '100' },
            { reps: '8', restSeconds: '', rir: '', weightKg: '120' },
          ],
        },
      ]),
    ).toBe(1960);
  });

  it('필수 입력이 없으면 오류를 반환한다', () => {
    const form = createManualWorkoutFormState();
    form.title = '';
    form.durationMinutes = '0';
    form.strengthExercises = [];

    expect(validateManualWorkoutForm(form).map((error) => error.field)).toEqual(
      expect.arrayContaining(['title', 'durationMinutes', 'strengthExercises']),
    );
  });
});
