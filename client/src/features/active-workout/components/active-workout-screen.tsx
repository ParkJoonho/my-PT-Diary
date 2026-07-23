import { useCreateRoutineWorkoutCompletion } from 'features/workout-records/api/routine-workout-completions';
import type { HomeRoutine } from 'features/workout-routines/types/routine';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Colors, { iosShadow } from 'shared/constants/colors';
import { createRoutineCompletionPayload } from '../lib/create-routine-completion-payload';
import { formatDurationLabel, formatTimer } from '../lib/format-duration';
import type { CompletedStepMap } from '../types/active-workout';

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
  const createCompletion = useCreateRoutineWorkoutCompletion();
  const [countdown, setCountdown] = useState(3);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<CompletedStepMap>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isStarted = countdown <= 0;

  useEffect(() => {
    if (isStarted) {
      return;
    }

    const timeout = setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isStarted]);

  useEffect(() => {
    if (!isStarted || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isStarted]);

  const completedCount = useMemo(
    () => routine.steps.filter((_, index) => completedSteps[index]).length,
    [completedSteps, routine.steps],
  );

  const progressLabel = `${completedCount}/${routine.steps.length}`;
  const canSubmit = !createCompletion.isPending;

  const handleToggleStep = (stepIndex: number) => {
    setCompletedSteps((current) => ({
      ...current,
      [stepIndex]: !current[stepIndex],
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setErrorMessage(null);

    try {
      await createCompletion.mutateAsync(
        createRoutineCompletionPayload({
          completedSteps,
          durationSeconds: elapsedSeconds,
          routine,
        }),
      );
      onCompleted();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '운동 완료 기록 저장에 실패했어요.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={onCancel}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.iconButtonText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{routine.label}</Text>
          <Text style={styles.headerMeta}>
            {routine.duration} ·{' '}
            {routine.location === 'gym' ? '헬스장' : '홈트'}
          </Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressBadgeText}>{progressLabel}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timerPanel}>
          <Text style={styles.timerLabel}>
            {isStarted ? '진행 시간' : '곧 시작해요'}
          </Text>
          <Text style={styles.timerText}>
            {isStarted ? formatTimer(elapsedSeconds) : countdown}
          </Text>
          <Text style={styles.durationText}>
            {isStarted
              ? formatDurationLabel(elapsedSeconds)
              : '준비 자세를 잡아주세요'}
          </Text>
        </View>

        <View style={styles.controls}>
          <Pressable
            accessibilityRole="button"
            disabled={!isStarted}
            onPress={() => setIsPaused((current) => !current)}
            style={({ pressed }) => [
              styles.controlButton,
              !isStarted && styles.controlButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.controlButtonText}>
              {isPaused ? '재개' : '일시정지'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!canSubmit}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.finishButton,
              !canSubmit && styles.finishButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            {createCompletion.isPending ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.finishButtonText}>완료 저장</Text>
            )}
          </Pressable>
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <View style={styles.stepList}>
          {routine.steps.map((step, index) => {
            const completed = completedSteps[index] ?? false;

            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: completed }}
                key={`${routine.id}-${step.name}-${index}`}
                onPress={() => handleToggleStep(index)}
                style={({ pressed }) => [
                  styles.stepRow,
                  completed && styles.stepRowCompleted,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.stepCheck,
                    completed && styles.stepCheckCompleted,
                  ]}
                >
                  {completed ? (
                    <Text style={styles.stepCheckText}>✓</Text>
                  ) : null}
                </View>
                <View style={styles.stepBody}>
                  <View style={styles.stepTopRow}>
                    <Text style={styles.stepName}>{step.name}</Text>
                    <Text style={styles.stepDetail}>{step.detail}</Text>
                  </View>
                  <Text style={styles.stepSubText}>
                    {step.tag ?? step.type}
                    {step.restAfter ? ` · 휴식 ${step.restAfter}` : ''}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    gap: 14,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.divider,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 52,
    justifyContent: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.45,
  },
  controlButtonText: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
  },
  durationText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  errorText: {
    color: Colors.danger,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  finishButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 8,
    flex: 1,
    height: 52,
    justifyContent: 'center',
  },
  finishButtonDisabled: {
    opacity: 0.65,
  },
  finishButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerCenter: {
    flex: 1,
    gap: 3,
  },
  headerMeta: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.divider,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  iconButtonText: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 28,
    lineHeight: 30,
  },
  pressed: {
    opacity: 0.78,
  },
  progressBadge: {
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    justifyContent: 'center',
    minWidth: 46,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  progressBadgeText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  stepBody: {
    flex: 1,
    gap: 6,
  },
  stepCheck: {
    alignItems: 'center',
    borderColor: Colors.systemGray3,
    borderRadius: 12,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    marginTop: 1,
    width: 24,
  },
  stepCheckCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepCheckText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    lineHeight: 16,
  },
  stepDetail: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  stepList: {
    gap: 10,
  },
  stepName: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
  },
  stepRow: {
    ...iosShadow,
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 78,
    padding: 14,
  },
  stepRowCompleted: {
    backgroundColor: '#F7FFF9',
    borderColor: '#BAEBC6',
  },
  stepSubText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  stepTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  timerLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  timerPanel: {
    ...iosShadow,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    gap: 6,
    justifyContent: 'center',
    minHeight: 172,
    padding: 20,
  },
  timerText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Bold',
    fontSize: 54,
    lineHeight: 64,
  },
});
