import type { HomeRoutine } from 'features/workout-routines/types/routine';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { UnimplementedBadge } from 'shared/components/unimplemented-badge';
import Colors, { iosShadow } from 'shared/constants/colors';
import type { CompletedStepMap } from '../types/active-workout';

type WorkoutStepListProps = {
  completedSteps: CompletedStepMap;
  errorMessage: string | null;
  onToggleStep: (stepIndex: number) => void;
  routine: HomeRoutine;
};

export function WorkoutStepList({
  completedSteps,
  errorMessage,
  onToggleStep,
  routine,
}: WorkoutStepListProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      style={styles.scrollView}
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          {routine.source === 'mock-ai' ? 'AI 추천: ' : ''}
          {routine.label}
        </Text>
        <Text style={styles.meta}>
          {routine.duration} · {routine.location === 'home' ? '홈트' : '헬스장'}
        </Text>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {routine.steps.map((step, index) => {
          const completed = completedSteps[index] ?? false;
          const isLast = index === routine.steps.length - 1;
          const typeLabel =
            step.type === 'cardio'
              ? '유산소'
              : step.type === 'stretch'
                ? '스트레칭'
                : '근력';
          const typeColor =
            step.type === 'cardio'
              ? Colors.info
              : step.type === 'stretch'
                ? Colors.success
                : Colors.accent;

          return (
            <View key={`${routine.id}-${step.name}-${index}`}>
              <View style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: completed }}
                    onPress={() => onToggleStep(index)}
                    style={({ pressed }) => [
                      styles.checkbox,
                      completed && styles.checkboxChecked,
                      pressed && styles.pressed,
                    ]}
                    testID={`step-checkbox-${index}`}
                  >
                    {completed ? (
                      <Text style={styles.checkboxCheckText}>✓</Text>
                    ) : null}
                  </Pressable>
                  {!isLast ? <View style={styles.stepLine} /> : null}
                </View>

                <View
                  style={[styles.stepContent, isLast && styles.stepContentLast]}
                >
                  <View style={styles.stepTopRow}>
                    <Text
                      style={[
                        styles.stepName,
                        completed && styles.stepNameCompleted,
                      ]}
                    >
                      {step.name}
                    </Text>
                    <Text
                      style={[
                        styles.stepDetail,
                        completed && styles.stepDetailCompleted,
                      ]}
                    >
                      {step.detail}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.stepTypeTag,
                      { backgroundColor: `${typeColor}18` },
                    ]}
                  >
                    <Text
                      style={[styles.stepTypeTagText, { color: typeColor }]}
                    >
                      {typeLabel}
                    </Text>
                  </View>

                  {step.type !== 'cardio' ? (
                    <View style={styles.stepActionRow}>
                      <ActionChip label="음성가이드" />
                      {step.type === 'strength' ? (
                        <ActionChip label="영상촬영" />
                      ) : null}
                    </View>
                  ) : null}
                </View>
              </View>

              {step.restAfter ? (
                <View style={styles.restRow}>
                  <Text style={styles.restText}>
                    {step.sets
                      ? `세트 간 휴식 ${step.restAfter} × ${step.sets}회`
                      : `휴식 ${step.restAfter}`}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function ActionChip({ label }: { label: string }) {
  return (
    <Pressable accessibilityRole="button" style={styles.actionChip}>
      <Text style={styles.actionChipText}>{label}</Text>
      <UnimplementedBadge compact />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionChip: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.cardBorder,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionChipText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  card: {
    ...iosShadow,
    backgroundColor: Colors.white,
    borderRadius: 16,
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.inputBorder,
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkboxCheckText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    lineHeight: 16,
  },
  errorText: {
    color: Colors.danger,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  meta: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    marginTop: -8,
  },
  pressed: {
    opacity: 0.78,
  },
  restRow: {
    paddingBottom: 8,
    paddingLeft: 36,
    paddingTop: 2,
  },
  restText: {
    color: Colors.warning,
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 24,
  },
  stepContentLast: {
    paddingBottom: 0,
  },
  stepActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  stepDetail: {
    color: Colors.accent,
    flexShrink: 0,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  stepDetailCompleted: {
    color: Colors.textMuted,
  },
  stepLeft: {
    alignItems: 'center',
    alignSelf: 'stretch',
    width: 24,
  },
  stepLine: {
    backgroundColor: '#E8EAF0',
    flex: 1,
    marginVertical: 4,
    minHeight: 14,
    width: 2,
  },
  stepName: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  stepNameCompleted: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  stepRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  stepTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  stepTypeTag: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stepTypeTagText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 17,
  },
});
