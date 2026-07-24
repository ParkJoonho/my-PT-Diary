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
    form.activityLevel = '헬스장';
    form.exerciseTime = '60분';
    form.steps = '4200';
    form.treadmillMinutes = '15';
    form.morningWeightKg = '72.4';
    form.strengthExercises = [
      {
        estimated1RM: 0,
        id: 'exercise-1',
        lbWeight: 0,
        maxWeight: 0,
        name: '벤치프레스',
        restTime: '90초',
        rir: '2',
        sets: [
          { id: 'set-1', reps: '10', weightKg: '60' },
          { id: 'set-2', reps: '8', weightKg: '70' },
        ],
        volume: 0,
      },
    ];

    expect(buildManualWorkoutPayload(form)).toEqual({
      activityLevel: '헬스장',
      bodyComposition: {
        bodyFatKg: undefined,
        bodyFatPercentage: undefined,
        eveningWeightKg: undefined,
        morningWeightKg: 72.4,
        skeletalMuscleMassKg: undefined,
        weightKg: 72.4,
      },
      cardio: {
        cycleMinutes: undefined,
        durationSeconds: 900,
        stairClimberMinutes: undefined,
        steps: 4200,
        treadmillMinutes: 15,
      },
      condition: undefined,
      dailyReport: undefined,
      durationSeconds: 3600,
      location: 'gym',
      meals: undefined,
      memo: undefined,
      performedAt: '2026-07-23T12:34:56.000Z',
      performedOn: '2026-07-23',
      sleep: undefined,
      strengthExercises: [
        {
          estimated1RM: 88.7,
          lbWeight: 154.3,
          maxWeight: 70,
          name: '벤치프레스',
          restTime: '90초',
          rir: '2',
          sets: [
            { reps: 10, weightKg: 60 },
            { reps: 8, weightKg: 70 },
          ],
          volume: 1160,
        },
      ],
      timeZone: 'Asia/Seoul',
      exerciseTime: '60분',
      title: undefined,
    });
  });

  it('총 볼륨을 계산한다', () => {
    expect(
      calculateManualWorkoutVolume([
        {
          estimated1RM: 0,
          id: 'exercise-1',
          lbWeight: 0,
          maxWeight: 120,
          name: '스쿼트',
          restTime: '',
          rir: '',
          sets: [
            { id: 'set-1', reps: '10', weightKg: '100' },
            { id: 'set-2', reps: '8', weightKg: '120' },
          ],
          volume: 1960,
        },
      ]),
    ).toBe(1960);
  });

  it('필수 입력이 없으면 오류를 반환한다', () => {
    const form = createManualWorkoutFormState();
    form.strengthExercises = [];

    expect(validateManualWorkoutForm(form).map((error) => error.field)).toEqual(
      ['strengthExercises'],
    );
  });
});
