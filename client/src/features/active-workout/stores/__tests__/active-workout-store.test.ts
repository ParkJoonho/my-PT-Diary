import { beforeEach, describe, expect, it } from '@jest/globals';
import { MOCK_AI_GYM_ROUTINES } from 'features/workout-routines/data/mock-routines';
import { useActiveWorkoutStore } from '../use-active-workout-store';

describe('active workout store', () => {
  beforeEach(() => {
    useActiveWorkoutStore.getState().clearSelectedRoutine();
  });

  it('선택한 루틴 전체를 저장하고 비울 수 있다', () => {
    const routine = MOCK_AI_GYM_ROUTINES[0];

    if (!routine) {
      throw new Error('테스트용 루틴이 필요해요.');
    }

    useActiveWorkoutStore.getState().setSelectedRoutine(routine);

    expect(useActiveWorkoutStore.getState().selectedRoutine).toBe(routine);

    useActiveWorkoutStore.getState().clearSelectedRoutine();

    expect(useActiveWorkoutStore.getState().selectedRoutine).toBeNull();
  });
});
