import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ChatIcon,
  FireIcon,
  SemanticIcon,
  TimeIcon,
} from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import { resolveStepTag } from '../lib/resolve-step-tag';
import type { HomeRoutine } from '../types/routine';

type RoutineAccordionProps = {
  expanded: boolean;
  onStart?: () => void;
  onToggle: () => void;
  routine: HomeRoutine;
};

export function RoutineAccordion({
  expanded,
  onStart,
  onToggle,
  routine,
}: RoutineAccordionProps) {
  const restStep = routine.steps.find(
    (step) => step.type !== 'stretch' && step.restAfter,
  );

  return (
    <View style={[styles.item, expanded && styles.itemExpanded]}>
      <Pressable
        accessibilityRole="button"
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <View style={styles.headerLeft}>
          <TimeIcon active={expanded} />
          <Text style={styles.label}>{routine.label}</Text>
        </View>
        <SemanticIcon
          color={Colors.iconMuted}
          name={expanded ? 'chevronUp' : 'chevronDown'}
          size={20}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          {restStep?.restAfter ? (
            <View style={styles.restNoteRow}>
              <ChatIcon />
              <Text style={styles.restNoteText}>
                각 세트당 휴식 {restStep.restAfter}
              </Text>
            </View>
          ) : null}

          <View style={styles.steps}>
            {routine.steps.map((step, index) => {
              const stepTag = resolveStepTag(step.name, step.tag);
              const isLast = index === routine.steps.length - 1;

              return (
                <View
                  key={`${routine.id}-${step.name}-${index}`}
                  style={styles.stepRow}
                >
                  <View style={styles.stepLeft}>
                    <FireIcon />
                    {!isLast ? <View style={styles.stepLine} /> : null}
                  </View>
                  <View
                    style={[
                      styles.stepContent,
                      isLast && styles.stepContentLast,
                    ]}
                  >
                    <View style={styles.stepTopRow}>
                      <Text style={styles.stepName}>{step.name}</Text>
                      <Text style={styles.stepDetail}>{step.detail}</Text>
                    </View>
                    {stepTag ? (
                      <View style={styles.stepTag}>
                        <Text style={styles.stepTagText}>{stepTag}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onStart}
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.startButtonPressed,
            ]}
          >
            <SemanticIcon color={Colors.white} name="play" size={16} />
            <Text style={styles.startButtonText}>운동 시작</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: 'rgba(240, 242, 245, 0.45)',
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  header: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  item: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemExpanded: {
    backgroundColor: Colors.surfaceMuted,
  },
  label: {
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
  },
  pressed: {
    opacity: 0.78,
  },
  restNoteRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  restNoteText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  startButtonPressed: {
    opacity: 0.85,
  },
  startButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 32,
  },
  stepContentLast: {
    paddingBottom: 0,
  },
  stepDetail: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    flexShrink: 0,
    fontSize: 13,
  },
  stepLeft: {
    alignItems: 'center',
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
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stepTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F7',
    borderRadius: 100,
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stepTagText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  stepTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  steps: {
    gap: 0,
  },
});
