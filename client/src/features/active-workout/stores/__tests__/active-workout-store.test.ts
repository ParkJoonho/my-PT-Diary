import { beforeEach, describe, expect, it } from '@jest/globals';
import { MOCK_AI_GYM_ROUTINES } from 'features/workout-routines/data/mock-routines';
import { useActiveWorkoutStore } from '../use-active-workout-store';

describe('active workout store', () => {
  beforeEach(() => {
    useActiveWorkoutStore.getState().clearSelectedRoutine();
    useActiveWorkoutStore.getState().initializeProgress('test-session');
    useActiveWorkoutStore.getState().resetProgress('test-session');
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
    const sessionId = 'session-a';
    const store = useActiveWorkoutStore.getState();

    store.initializeProgress(sessionId);
    store.decrementCountdown(sessionId);
    store.skipCountdown(sessionId, 1_000);
    store.syncElapsedSeconds(sessionId, 2_100);
    store.togglePause(sessionId, 3_400);
    store.toggleStep(sessionId, 1);
    store.setErrorMessage(sessionId, '저장 실패');

    expect(useActiveWorkoutStore.getState()).toMatchObject({
      completedSteps: { 1: true },
      countdown: 0,
      countdownDone: true,
      elapsedMilliseconds: 2_400,
      elapsedSeconds: 2,
      errorMessage: '저장 실패',
      isPaused: true,
      lastResumedAtMs: null,
      progressSessionId: sessionId,
    });

    store.togglePause(sessionId, 4_000);
    store.syncElapsedSeconds(sessionId, 5_700);

    expect(useActiveWorkoutStore.getState()).toMatchObject({
      elapsedMilliseconds: 2_400,
      elapsedSeconds: 4,
      isPaused: false,
      lastResumedAtMs: 4_000,
    });

    useActiveWorkoutStore.getState().resetProgress(sessionId);

    expect(useActiveWorkoutStore.getState()).toMatchObject({
      completedSteps: {},
      countdown: 3,
      countdownDone: false,
      elapsedMilliseconds: 0,
      elapsedSeconds: 0,
      errorMessage: null,
      isPaused: false,
      lastResumedAtMs: null,
      progressSessionId: null,
    });
  });

  it('이전 화면 세션은 현재 운동 진행 상태를 변경하지 못한다', () => {
    const currentSessionId = 'current-session';
    const staleSessionId = 'stale-session';
    const store = useActiveWorkoutStore.getState();

    store.initializeProgress(currentSessionId);
    store.skipCountdown(currentSessionId, 2_000);
    store.syncElapsedSeconds(currentSessionId, 4_500);

    store.decrementCountdown(staleSessionId);
    store.skipCountdown(staleSessionId, 5_000);
    store.togglePause(staleSessionId, 5_500);
    store.toggleStep(staleSessionId, 0);
    store.setErrorMessage(staleSessionId, 'stale');
    store.resetProgress(staleSessionId);

    expect(useActiveWorkoutStore.getState()).toMatchObject({
      completedSteps: {},
      countdown: 0,
      countdownDone: true,
      elapsedSeconds: 2,
      errorMessage: null,
      isPaused: false,
      progressSessionId: currentSessionId,
    });
  });
});
