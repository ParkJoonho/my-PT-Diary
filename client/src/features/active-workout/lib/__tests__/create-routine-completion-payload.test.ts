import { describe, expect, it } from '@jest/globals';
import type { HomeRoutine } from 'features/workout-routines/types/routine';
import { createRoutineCompletionPayload } from '../create-routine-completion-payload';

const 기본루틴: HomeRoutine = {
  duration: '30분',
  id: 'gym_30',
  label: '기본 루틴',
  location: 'gym',
  source: 'static',
  steps: [
    {
      detail: '10분',
      name: '러닝머신',
      restAfter: '1분',
      tag: '유산소 운동',
      type: 'cardio',
    },
    {
      detail: '12회 x 3세트',
      name: '스쿼트',
      sets: 3,
      tag: '하체 근력 강화',
      type: 'strength',
    },
  ],
};

describe('루틴 운동 완료 payload 생성', () => {
  it('서버 계약에 맞춰 완료 시각과 단계 완료 상태를 만든다', () => {
    const payload = createRoutineCompletionPayload({
      completedSteps: { 0: true },
      durationSeconds: 754,
      now: new Date('2026-07-23T12:34:56.000Z'),
      routine: 기본루틴,
    });

    expect(payload).toMatchObject({
      completedAt: '2026-07-23T12:34:56.000Z',
      completedOn: '2026-07-23',
      durationSeconds: 754,
      routineId: 'gym_30',
      routineLabel: '기본 루틴',
      routineSource: 'static',
      steps: [
        {
          completed: true,
          detail: '10분',
          name: '러닝머신',
          restAfter: '1분',
          tag: '유산소 운동',
          type: 'cardio',
        },
        {
          completed: false,
          detail: '12회 x 3세트',
          name: '스쿼트',
          sets: 3,
          tag: '하체 근력 강화',
          type: 'strength',
        },
      ],
    });
    expect(payload.timeZone).toEqual(expect.any(String));
  });
});
