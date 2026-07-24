import { beforeEach, describe, expect, it } from '@jest/globals';
import { MOCK_AI_GYM_ROUTINES } from 'features/workout-routines/data/mock-routines';
import { useActiveWorkoutStore } from '../use-active-workout-store';

describe('active workout store', () => {
  beforeEach(() => {
    useActiveWorkoutStore.getState().clearSelectedRoutine();
    useActiveWorkoutStore.getState().resetProgress();
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

  it('운동 진행 상태를 초기화하고 단계 체크와 타이머를 갱신할 수 있다', () => {
    const store = useActiveWorkoutStore.getState();

    store.initializeProgress();
    store.decrementCountdown();
    store.skipCountdown();
    store.incrementElapsedSeconds();
    store.togglePause();
    store.toggleStep(1);
    store.setErrorMessage('저장 실패');

    expect(useActiveWorkoutStore.getState()).toMatchObject({
      completedSteps: { 1: true },
      countdown: 0,
      countdownDone: true,
      elapsedSeconds: 1,
      errorMessage: '저장 실패',
      isPaused: true,
    });

    useActiveWorkoutStore.getState().resetProgress();

    expect(useActiveWorkoutStore.getState()).toMatchObject({
      completedSteps: {},
      countdown: 3,
      countdownDone: false,
      elapsedSeconds: 0,
      errorMessage: null,
      isPaused: false,
    });
  });
});
