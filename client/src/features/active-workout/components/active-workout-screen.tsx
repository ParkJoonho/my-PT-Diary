import { useCreateRoutineWorkoutCompletion } from 'features/workout-records/api/routine-workout-completions';
import type { HomeRoutine } from 'features/workout-routines/types/routine';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import Colors from 'shared/constants/colors';
import { createRoutineCompletionPayload } from '../lib/create-routine-completion-payload';
import { formatTimer } from '../lib/format-duration';
import type { CompletedStepMap } from '../types/active-workout';
import { ActiveCountdownOverlay } from './active-countdown-overlay';
import { ActiveTimerBar } from './active-timer-bar';
import { WorkoutStepList } from './workout-step-list';

type ActiveWorkoutScreenProps = {
  onCancel: () => void;
  onCompleted: () => void;
  routine: HomeRoutine;
};

const COUNTDOWN_START = 3;

export function ActiveWorkoutScreen({
  onCompleted,
  routine,
}: ActiveWorkoutScreenProps) {
  const createCompletion = useCreateRoutineWorkoutCompletion();
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const [countdownDone, setCountdownDone] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<CompletedStepMap>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (countdownDone) {
      return;
    }

    if (countdown <= 0) {
      setCountdownDone(true);
      return;
    }

    countdownTimerRef.current = setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [countdown, countdownDone]);

  useEffect(() => {
    if (!countdownDone || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownDone, isPaused]);

  const completedCount = useMemo(
    () => routine.steps.filter((_, index) => completedSteps[index]).length,
    [completedSteps, routine.steps],
  );

  const handleSkipCountdown = () => {
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
    }

    setCountdown(0);
    setCountdownDone(true);
  };

  const handleToggleStep = (stepIndex: number) => {
    setCompletedSteps((current) => ({
      ...current,
      [stepIndex]: !current[stepIndex],
    }));
  };

  const saveAndExit = async () => {
    if (createCompletion.isPending) {
      return;
    }

    setErrorMessage(null);

    try {
      await createCompletion.mutateAsync(
        createRoutineCompletionPayload({
          completedSteps,
          durationSeconds: Math.max(elapsedSeconds, 1),
          routine,
        }),
      );

      Alert.alert(
        '운동 기록 저장 완료',
        `${routine.label}이 운동 기록에 저장되었습니다.\n\n운동 시간: ${formatTimer(
          elapsedSeconds,
        )}\n완료 항목: ${completedCount}/${routine.steps.length}개`,
        [{ text: '확인', onPress: onCompleted }],
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '운동 완료 기록 저장에 실패했어요.',
      );
    }
  };

  const handleEndWorkout = () => {
    Alert.alert('운동 종료', '운동을 종료할까요?', [
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
          onPauseToggle={() => setIsPaused((current) => !current)}
        />
      ) : null}

      <WorkoutStepList
        completedSteps={completedSteps}
        errorMessage={errorMessage}
        onToggleStep={handleToggleStep}
        routine={routine}
      />

      {countdownDone ? null : (
        <ActiveCountdownOverlay
          countdown={countdown}
          onSkip={handleSkipCountdown}
          routineLabel={routine.label}
        />
      )}

      {createCompletion.isPending ? (
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
