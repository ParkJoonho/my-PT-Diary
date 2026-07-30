import { useVisibility } from '@granite-js/react-native';
import { useCreateRoutineWorkoutCompletion } from 'features/workout-records/api/routine-workout-completions';
import type { HomeRoutine } from 'features/workout-routines/types/routine';
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import Colors from 'shared/constants/colors';
import { createRoutineCompletionPayload } from '../lib/create-routine-completion-payload';
import { formatTimer } from '../lib/format-duration';
import { useActiveWorkoutStore } from '../stores/use-active-workout-store';
import { ActiveCountdownOverlay } from './active-countdown-overlay';
import { ActiveTimerBar } from './active-timer-bar';
import { WorkoutStepList } from './workout-step-list';

type ActiveWorkoutScreenProps = {
  contentBottomInset: number;
  onCancel: () => void;
  onCompleted: () => void;
  routine: HomeRoutine;
};

function createProgressSessionId() {
  return `active-workout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ActiveWorkoutScreen({
  contentBottomInset,
  onCancel,
  onCompleted,
  routine,
}: ActiveWorkoutScreenProps) {
  const isVisible = useVisibility();
  const createRoutineWorkoutCompletion = useCreateRoutineWorkoutCompletion();
  const progressSessionIdRef = useRef(createProgressSessionId());
  const clearErrorMessage = useActiveWorkoutStore(
    (state) => state.clearErrorMessage,
  );
  const completedSteps = useActiveWorkoutStore((state) => state.completedSteps);
  const countdown = useActiveWorkoutStore((state) => state.countdown);
  const countdownDone = useActiveWorkoutStore((state) => state.countdownDone);
  const decrementCountdown = useActiveWorkoutStore(
    (state) => state.decrementCountdown,
  );
  const elapsedSeconds = useActiveWorkoutStore((state) => state.elapsedSeconds);
  const errorMessage = useActiveWorkoutStore((state) => state.errorMessage);
  const initializeProgress = useActiveWorkoutStore(
    (state) => state.initializeProgress,
  );
  const isPaused = useActiveWorkoutStore((state) => state.isPaused);
  const resetProgress = useActiveWorkoutStore((state) => state.resetProgress);
  const setErrorMessage = useActiveWorkoutStore(
    (state) => state.setErrorMessage,
  );
  const skipCountdown = useActiveWorkoutStore((state) => state.skipCountdown);
  const syncElapsedSeconds = useActiveWorkoutStore(
    (state) => state.syncElapsedSeconds,
  );
  const togglePause = useActiveWorkoutStore((state) => state.togglePause);
  const toggleStep = useActiveWorkoutStore((state) => state.toggleStep);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressSessionId = progressSessionIdRef.current;

  useEffect(() => {
    initializeProgress(progressSessionId);

    return () => {
      resetProgress(progressSessionId);
    };
  }, [initializeProgress, progressSessionId, resetProgress]);

  useEffect(() => {
    if (!isVisible || countdownDone) {
      return;
    }

    if (countdown <= 0) {
      skipCountdown(progressSessionId);
      return;
    }

    countdownTimerRef.current = setTimeout(() => {
      decrementCountdown(progressSessionId);
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [
    countdown,
    countdownDone,
    decrementCountdown,
    isVisible,
    progressSessionId,
    skipCountdown,
  ]);

  useEffect(() => {
    if (!isVisible || !countdownDone || isPaused) {
      return;
    }

    syncElapsedSeconds(progressSessionId);

    const interval = setInterval(() => {
      syncElapsedSeconds(progressSessionId);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    countdownDone,
    isPaused,
    isVisible,
    progressSessionId,
    syncElapsedSeconds,
  ]);

  const completedCount = useMemo(
    () => routine.steps.filter((_, index) => completedSteps[index]).length,
    [completedSteps, routine.steps],
  );

  const handleSkipCountdown = () => {
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
    }

    skipCountdown(progressSessionId);
  };

  const saveAndExit = async () => {
    if (createRoutineWorkoutCompletion.isPending) {
      return;
    }

    clearErrorMessage(progressSessionId);
    const currentElapsedSeconds = syncElapsedSeconds(progressSessionId);

    try {
      await createRoutineWorkoutCompletion.mutateAsync(
        createRoutineCompletionPayload({
          completedSteps,
          durationSeconds: Math.max(currentElapsedSeconds, 1),
          routine,
        }),
      );

      Alert.alert(
        '운동 기록 저장 완료',
        `${routine.label} 완료 기록이 저장되었습니다.\n\n운동 시간: ${formatTimer(
          currentElapsedSeconds,
        )}\n완료 항목: ${completedCount}/${routine.steps.length}개`,
        [{ text: '확인', onPress: onCompleted }],
      );
    } catch (error) {
      setErrorMessage(
        progressSessionId,
        error instanceof Error ? error.message : '운동 기록 저장에 실패했어요.',
      );
    }
  };

  const handleEndWorkout = () => {
    if (completedCount === 0) {
      Alert.alert(
        '운동 종료',
        '완료한 항목이 없어요. 저장하지 않고 취소할까요, 아니면 기록만 저장할까요?',
        [
          { text: '계속하기', style: 'cancel' },
          { text: '취소하고 나가기', onPress: onCancel, style: 'destructive' },
          { text: '저장하고 종료', onPress: saveAndExit },
        ],
      );
      return;
    }

    Alert.alert('운동 종료', '운동을 종료하고 완료 기록을 저장할까요?', [
      { text: '닫기', style: 'cancel' },
      { text: '종료', style: 'destructive', onPress: saveAndExit },
    ]);
  };

  const showUnavailablePlatformAction = (actionName: string) => {
    Alert.alert(
      actionName,
      '현재 Apps in Toss 실행 환경에서는 이 기능을 지원하지 않아요.',
    );
  };

  return (
    <View style={styles.container}>
      {countdownDone ? (
        <ActiveTimerBar
          elapsedSeconds={elapsedSeconds}
          isPaused={isPaused}
          onEnd={handleEndWorkout}
          onPauseToggle={() => {
            togglePause(progressSessionId);
          }}
        />
      ) : null}

      <WorkoutStepList
        contentBottomInset={contentBottomInset}
        completedSteps={completedSteps}
        errorMessage={errorMessage}
        onRecordVideo={() => {
          showUnavailablePlatformAction('영상촬영');
        }}
        onToggleStep={(stepIndex) => {
          toggleStep(progressSessionId, stepIndex);
        }}
        onVoiceGuide={() => {
          showUnavailablePlatformAction('음성가이드');
        }}
        routine={routine}
      />

      {countdownDone ? null : (
        <ActiveCountdownOverlay
          countdown={countdown}
          onSkip={handleSkipCountdown}
          routineLabel={routine.label}
        />
      )}

      {createRoutineWorkoutCompletion.isPending ? (
        <View style={styles.savingOverlay}>
          <ActivityIndicator color={Colors.white} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.24)',
    justifyContent: 'center',
    zIndex: 20,
  },
});
