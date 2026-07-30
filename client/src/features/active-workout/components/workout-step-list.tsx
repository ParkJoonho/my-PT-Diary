import type { HomeRoutine } from 'features/workout-routines/types/routine';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  OriginalAppIcon,
  type OriginalAppIconName,
} from 'shared/components/icons/pt-diary-icons';
import Colors, { iosShadow } from 'shared/constants/colors';
import { hasOriginalVoiceGuide } from '../lib/voice-guide-availability';
import type { CompletedStepMap } from '../types/active-workout';

type WorkoutStepListProps = {
  contentBottomInset: number;
  completedSteps: CompletedStepMap;
  errorMessage: string | null;
  onRecordVideo: (stepIndex: number) => void;
  onToggleStep: (stepIndex: number) => void;
  onVoiceGuide: (stepIndex: number) => void;
  routine: HomeRoutine;
};

export function WorkoutStepList({
  contentBottomInset,
  completedSteps,
  errorMessage,
  onRecordVideo,
  onToggleStep,
  onVoiceGuide,
  routine,
}: WorkoutStepListProps) {
  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: contentBottomInset },
      ]}
      showsVerticalScrollIndicator={false}
      style={styles.scrollView}
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          {routine.source === 'mock-ai' ? 'AI 추천: ' : ''}
          {routine.label}
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
          const typeIcon: OriginalAppIconName =
            step.type === 'cardio'
              ? 'walk'
              : step.type === 'stretch'
                ? 'body'
                : 'barbell';
          const hasVoiceGuide =
            step.type !== 'cardio' && hasOriginalVoiceGuide(step.name);
          const hasActions = hasVoiceGuide || step.type === 'strength';

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
                    <OriginalAppIcon
                      color={typeColor}
                      name={typeIcon}
                      size={11}
                    />
                    <Text
                      style={[styles.stepTypeTagText, { color: typeColor }]}
                    >
                      {typeLabel}
                    </Text>
                  </View>

                  {hasActions ? (
                    <View style={styles.stepActionRow}>
                      {hasVoiceGuide ? (
                        <ActionButton
                          icon="mic"
                          label="음성가이드"
                          onPress={() => onVoiceGuide(index)}
                          tone="voice"
                        />
                      ) : null}
                      {step.type === 'strength' ? (
                        <ActionButton
                          icon="videocam"
                          label="영상촬영"
                          onPress={() => onRecordVideo(index)}
                          tone="video"
                        />
                      ) : null}
                    </View>
                  ) : null}
                </View>
              </View>

              {step.restAfter ? (
                <View style={styles.restRow}>
                  <OriginalAppIcon
                    color="#F59E0B"
                    name="cafeOutline"
                    size={12}
                  />
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

function ActionButton({
  icon,
  label,
  onPress,
  tone,
}: {
  icon: OriginalAppIconName;
  label: string;
  onPress: () => void;
  tone: 'video' | 'voice';
}) {
  const color = tone === 'voice' ? '#D4AF37' : Colors.info;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        tone === 'voice' ? styles.voiceButton : styles.videoButton,
        pressed && styles.pressed,
      ]}
    >
      <OriginalAppIcon color={color} name={icon} size={14} />
      <Text style={[styles.actionButtonText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  actionButtonText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
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
  pressed: {
    opacity: 0.78,
  },
  restRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingLeft: 36,
    paddingVertical: 4,
  },
  restText: {
    color: Colors.warning,
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
  },
  scrollContent: {
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
    alignItems: 'center',
    flexDirection: 'row',
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
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
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
  videoButton: {
    backgroundColor: `${Colors.info}14`,
  },
  voiceButton: {
    backgroundColor: '#D4AF3718',
  },
});
