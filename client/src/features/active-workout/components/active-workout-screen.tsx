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
  onCancel: () => void;
  onCompleted: () => void;
  routine: HomeRoutine;
};

export function ActiveWorkoutScreen({
  onCancel,
  onCompleted,
  routine,
}: ActiveWorkoutScreenProps) {
  const createRoutineWorkoutCompletion = useCreateRoutineWorkoutCompletion();
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
  const incrementElapsedSeconds = useActiveWorkoutStore(
    (state) => state.incrementElapsedSeconds,
  );
  const initializeProgress = useActiveWorkoutStore(
    (state) => state.initializeProgress,
  );
  const isPaused = useActiveWorkoutStore((state) => state.isPaused);
  const resetProgress = useActiveWorkoutStore((state) => state.resetProgress);
  const setErrorMessage = useActiveWorkoutStore(
    (state) => state.setErrorMessage,
  );
  const skipCountdown = useActiveWorkoutStore((state) => state.skipCountdown);
  const togglePause = useActiveWorkoutStore((state) => state.togglePause);
  const toggleStep = useActiveWorkoutStore((state) => state.toggleStep);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    initializeProgress();

    return () => {
      resetProgress();
    };
  }, [initializeProgress, resetProgress]);

  useEffect(() => {
    if (countdownDone) {
      return;
    }

    if (countdown <= 0) {
      skipCountdown();
      return;
    }

    countdownTimerRef.current = setTimeout(() => {
      decrementCountdown();
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [countdown, countdownDone, decrementCountdown, skipCountdown]);

  useEffect(() => {
    if (!countdownDone || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      incrementElapsedSeconds();
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownDone, incrementElapsedSeconds, isPaused]);

  const completedCount = useMemo(
    () => routine.steps.filter((_, index) => completedSteps[index]).length,
    [completedSteps, routine.steps],
  );

  const handleSkipCountdown = () => {
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
    }

    skipCountdown();
  };

  const saveAndExit = async () => {
    if (createRoutineWorkoutCompletion.isPending) {
      return;
    }

    clearErrorMessage();

    try {
      await createRoutineWorkoutCompletion.mutateAsync(
        createRoutineCompletionPayload({
          completedSteps,
          durationSeconds: Math.max(elapsedSeconds, 1),
          routine,
        }),
      );

      Alert.alert(
        '운동 기록 저장 완료',
        `${routine.label} 완료 기록이 저장되었습니다.\n\n운동 시간: ${formatTimer(
          elapsedSeconds,
        )}\n완료 항목: ${completedCount}/${routine.steps.length}개`,
        [{ text: '확인', onPress: onCompleted }],
      );
    } catch (error) {
      setErrorMessage(
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

  return (
    <View style={styles.container}>
      {countdownDone ? (
        <ActiveTimerBar
          elapsedSeconds={elapsedSeconds}
          isPaused={isPaused}
          onEnd={handleEndWorkout}
          onPauseToggle={togglePause}
        />
      ) : null}

      <WorkoutStepList
        completedSteps={completedSteps}
        errorMessage={errorMessage}
        onToggleStep={toggleStep}
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
