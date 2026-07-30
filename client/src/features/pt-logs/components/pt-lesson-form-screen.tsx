import { useNavigation } from '@granite-js/react-native';
import { type ReactNode, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SuspenseSection } from 'shared/components/async-state';
import { OriginalAppIcon } from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import {
  useCreatePtLesson,
  usePtLesson,
  useUpdatePtLesson,
} from '../api/pt-lessons';
import { PT_BODY_PARTS, PT_EQUIPMENT } from '../data/pt-log-options';
import {
  calculateExerciseStats,
  clonePtLesson,
  createEmptyExercise,
  createEmptyPtLesson,
  generatePtLessonId,
  getKoreanDayOfWeek,
} from '../lib/pt-lesson-form';
import {
  toCreatePtLessonPayload,
  toUpdatePtLessonPayload,
} from '../lib/pt-lesson-payload';
import { validatePtLessonForm } from '../lib/pt-lesson-validation';
import type { PtLesson } from '../types/pt-log';

export function PtLessonFormScreen({
  contentBottomInset,
  lessonId,
}: {
  contentBottomInset: number;
  lessonId?: string;
}) {
  if (lessonId) {
    return (
      <SuspenseSection errorMessage="수정할 PT 수업일지를 불러오지 못했어요.">
        <EditPtLessonForm
          contentBottomInset={contentBottomInset}
          lessonId={lessonId}
        />
      </SuspenseSection>
    );
  }

  return <PtLessonFormContent contentBottomInset={contentBottomInset} />;
}

function EditPtLessonForm({
  contentBottomInset,
  lessonId,
}: {
  contentBottomInset: number;
  lessonId: string;
}) {
  const { data } = usePtLesson(lessonId);

  return (
    <PtLessonFormContent
      contentBottomInset={contentBottomInset}
      initialLesson={data}
      lessonId={lessonId}
    />
  );
}

function PtLessonFormContent({
  contentBottomInset,
  initialLesson,
  lessonId,
}: {
  contentBottomInset: number;
  initialLesson?: PtLesson;
  lessonId?: string;
}) {
  const navigation = useNavigation();
  const createPtLessonMutation = useCreatePtLesson();
  const updatePtLessonMutation = useUpdatePtLesson();
  const [lesson, setLesson] = useState<PtLesson>(createEmptyPtLesson);

  useEffect(() => {
    if (initialLesson) {
      setLesson(clonePtLesson(initialLesson));
      return;
    }

    setLesson(createEmptyPtLesson());
  }, [initialLesson]);

  const toggleArrayValue = (
    field: 'bodyParts' | 'equipment',
    value: string,
  ) => {
    setLesson((currentLesson) => ({
      ...currentLesson,
      [field]: currentLesson[field].includes(value)
        ? currentLesson[field].filter((currentValue) => currentValue !== value)
        : [...currentLesson[field], value],
    }));
  };

  const updateExercise = (
    exerciseIndex: number,
    field: 'name' | 'restTime' | 'rir',
    value: string,
  ) => {
    setLesson((currentLesson) => {
      const nextExercises = currentLesson.exercises.slice();
      const targetExercise = nextExercises[exerciseIndex];

      if (!targetExercise) {
        return currentLesson;
      }

      nextExercises[exerciseIndex] = {
        ...targetExercise,
        [field]: value,
      };

      return {
        ...currentLesson,
        exercises: nextExercises,
      };
    });
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weightKg',
    value: string,
  ) => {
    setLesson((currentLesson) => {
      const nextExercises = currentLesson.exercises.slice();
      const targetExercise = nextExercises[exerciseIndex];

      if (!targetExercise) {
        return currentLesson;
      }

      const nextSets = targetExercise.sets.map((set, index) =>
        index === setIndex
          ? {
              ...set,
              [field]: Number.parseFloat(value) || 0,
            }
          : set,
      );

      nextExercises[exerciseIndex] = {
        ...targetExercise,
        ...calculateExerciseStats(nextSets),
        sets: nextSets,
      };

      return {
        ...currentLesson,
        exercises: nextExercises,
      };
    });
  };

  const addExercise = () => {
    setLesson((currentLesson) => ({
      ...currentLesson,
      exercises: [...currentLesson.exercises, createEmptyExercise()],
    }));
  };

  const removeExercise = (exerciseIndex: number) => {
    if (lesson.exercises.length <= 1) {
      return;
    }

    setLesson((currentLesson) => ({
      ...currentLesson,
      exercises: currentLesson.exercises.filter(
        (_, index) => index !== exerciseIndex,
      ),
    }));
  };

  const addSet = (exerciseIndex: number) => {
    setLesson((currentLesson) => {
      const nextExercises = currentLesson.exercises.slice();
      const targetExercise = nextExercises[exerciseIndex];

      if (!targetExercise) {
        return currentLesson;
      }

      const nextSets = [
        ...targetExercise.sets,
        { id: generatePtLessonId(), reps: 0, weightKg: 0 },
      ];

      nextExercises[exerciseIndex] = {
        ...targetExercise,
        ...calculateExerciseStats(nextSets),
        sets: nextSets,
      };

      return {
        ...currentLesson,
        exercises: nextExercises,
      };
    });
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    if (lesson.exercises[exerciseIndex]?.sets.length === 1) {
      return;
    }

    setLesson((currentLesson) => {
      const nextExercises = currentLesson.exercises.slice();
      const targetExercise = nextExercises[exerciseIndex];

      if (!targetExercise) {
        return currentLesson;
      }

      const nextSets = targetExercise.sets.filter(
        (_, index) => index !== setIndex,
      );

      nextExercises[exerciseIndex] = {
        ...targetExercise,
        ...calculateExerciseStats(nextSets),
        sets: nextSets,
      };

      return {
        ...currentLesson,
        exercises: nextExercises,
      };
    });
  };

  const handleSave = async () => {
    const validationError = validatePtLessonForm(lesson);

    if (validationError) {
      Alert.alert('알림', validationError);
      return;
    }

    const nextLesson = {
      ...lesson,
      dayOfWeek: getKoreanDayOfWeek(lesson.date),
      summary: {
        exerciseCount: lesson.exercises.length,
        setCount: lesson.exercises.reduce(
          (total, exercise) => total + exercise.sets.length,
          0,
        ),
        totalVolumeKg: lesson.exercises.reduce(
          (total, exercise) => total + exercise.volumeKg,
          0,
        ),
      },
    };

    try {
      if (lessonId) {
        await updatePtLessonMutation.mutateAsync({
          lessonId,
          payload: toUpdatePtLessonPayload(nextLesson),
        });
      } else {
        await createPtLessonMutation.mutateAsync(
          toCreatePtLessonPayload(nextLesson),
        );
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        '오류',
        error instanceof Error && error.message
          ? error.message
          : 'PT 수업일지를 저장하지 못했어요.',
      );
    }
  };

  const isPending =
    createPtLessonMutation.isPending || updatePtLessonMutation.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="닫기"
          onPress={() => navigation.goBack()}
        >
          <OriginalAppIcon color={Colors.text} name="close" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {lessonId ? '수업일지 수정' : '새 수업일지'}
        </Text>
        <Pressable
          accessibilityLabel={isPending ? '저장 중' : '저장'}
          disabled={isPending}
          onPress={() => void handleSave()}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
          ]}
        >
          {isPending ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <OriginalAppIcon color={Colors.white} name="checkmark" size={24} />
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: contentBottomInset },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <Section title="기본 정보">
          <View style={styles.row}>
            <InputField
              label="수업 날짜"
              onChangeText={(value) =>
                setLesson((currentLesson) => ({
                  ...currentLesson,
                  date: value,
                }))
              }
              placeholder="2025-01-01"
              value={lesson.date}
            />
            <InputField
              keyboardType="number-pad"
              label="세션"
              onChangeText={(value) =>
                setLesson((currentLesson) => ({
                  ...currentLesson,
                  sessionNumber: Number.parseInt(value, 10) || 0,
                }))
              }
              placeholder="1"
              value={String(lesson.sessionNumber)}
            />
          </View>
        </Section>

        <Section title="운동 부위">
          <View style={styles.chipWrap}>
            {PT_BODY_PARTS.map((bodyPart) => (
              <FilterChip
                active={lesson.bodyParts.includes(bodyPart)}
                key={bodyPart}
                label={bodyPart}
                onPress={() => toggleArrayValue('bodyParts', bodyPart)}
              />
            ))}
          </View>
        </Section>

        <Section title="사용 도구">
          <View style={styles.chipWrap}>
            {PT_EQUIPMENT.map((equipment) => (
              <FilterChip
                active={lesson.equipment.includes(equipment)}
                key={equipment}
                label={equipment}
                onPress={() => toggleArrayValue('equipment', equipment)}
              />
            ))}
          </View>
        </Section>

        <Section title="웜업">
          <TextInput
            multiline
            onChangeText={(value) =>
              setLesson((currentLesson) => ({
                ...currentLesson,
                warmUp: value,
              }))
            }
            placeholder="웜업 내용을 입력하세요"
            placeholderTextColor={Colors.textMuted}
            style={[styles.input, styles.textArea]}
            value={lesson.warmUp}
          />
        </Section>

        <Section
          action={
            <Pressable
              accessibilityLabel="운동 추가"
              onPress={addExercise}
              style={styles.sectionActionButton}
            >
              <OriginalAppIcon
                color={Colors.accent}
                name="addCircle"
                size={24}
              />
            </Pressable>
          }
          title="운동 종목"
        >
          <View style={styles.exerciseStack}>
            {lesson.exercises.map((exercise, exerciseIndex) => (
              <View
                key={`${lesson.id}-${exerciseIndex}`}
                style={styles.exerciseCard}
              >
                <View style={styles.exerciseHeader}>
                  <TextInput
                    onChangeText={(value) =>
                      updateExercise(exerciseIndex, 'name', value)
                    }
                    placeholder={`운동종목 ${exerciseIndex + 1}`}
                    placeholderTextColor={Colors.textMuted}
                    style={styles.exerciseNameInput}
                    value={exercise.name}
                  />
                  {lesson.exercises.length > 1 ? (
                    <Pressable
                      accessibilityLabel={`운동종목 ${exerciseIndex + 1} 삭제`}
                      onPress={() => removeExercise(exerciseIndex)}
                    >
                      <OriginalAppIcon
                        color={Colors.danger}
                        name="trashOutline"
                        size={18}
                      />
                    </Pressable>
                  ) : null}
                </View>

                <View style={styles.setHeader}>
                  <Text style={[styles.setHeaderLabel, styles.setNumberCell]}>
                    SET
                  </Text>
                  <Text style={[styles.setHeaderLabel, styles.setValueCell]}>
                    무게(kg)
                  </Text>
                  <Text style={[styles.setHeaderLabel, styles.setValueCell]}>
                    횟수
                  </Text>
                  <View style={styles.setActionCell} />
                </View>

                {exercise.sets.map((set, setIndex) => (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={[styles.setNumber, styles.setNumberCell]}>
                      {setIndex + 1}
                    </Text>
                    <TextInput
                      keyboardType="decimal-pad"
                      onChangeText={(value) =>
                        updateSet(exerciseIndex, setIndex, 'weightKg', value)
                      }
                      placeholder="0"
                      placeholderTextColor={Colors.textMuted}
                      style={[styles.setInput, styles.setValueCell]}
                      value={set.weightKg > 0 ? String(set.weightKg) : ''}
                    />
                    <TextInput
                      keyboardType="number-pad"
                      onChangeText={(value) =>
                        updateSet(exerciseIndex, setIndex, 'reps', value)
                      }
                      placeholder="0"
                      placeholderTextColor={Colors.textMuted}
                      style={[styles.setInput, styles.setValueCell]}
                      value={set.reps > 0 ? String(set.reps) : ''}
                    />
                    <Pressable
                      accessibilityLabel={`${setIndex + 1}세트 삭제`}
                      onPress={() => removeSet(exerciseIndex, setIndex)}
                      style={styles.setActionCell}
                    >
                      <OriginalAppIcon
                        color={
                          exercise.sets.length > 1
                            ? Colors.danger
                            : Colors.textMuted
                        }
                        name="removeCircleOutline"
                        size={20}
                      />
                    </Pressable>
                  </View>
                ))}

                <Pressable
                  onPress={() => addSet(exerciseIndex)}
                  style={styles.addSetButton}
                >
                  <OriginalAppIcon color={Colors.accent} name="add" size={16} />
                  <Text style={styles.addSetLabel}>세트 추가</Text>
                </Pressable>

                <View style={styles.exerciseMetricsRow}>
                  <MiniField
                    label="휴식"
                    onChangeText={(value) =>
                      updateExercise(exerciseIndex, 'restTime', value)
                    }
                    placeholder="60초"
                    value={exercise.restTime}
                  />
                  <MiniField
                    keyboardType="number-pad"
                    label="RIR"
                    onChangeText={(value) =>
                      updateExercise(exerciseIndex, 'rir', value)
                    }
                    placeholder="0"
                    value={exercise.rir}
                  />
                  <MetricLabel
                    label="LB"
                    value={
                      exercise.lbWeight > 0 ? `${exercise.lbWeight}lb` : '-'
                    }
                  />
                </View>

                <View style={styles.exerciseMetricsRowSecondary}>
                  <MetricLabel
                    accent
                    label="볼륨"
                    value={
                      exercise.volumeKg > 0
                        ? `${exercise.volumeKg.toLocaleString()}kg`
                        : '-'
                    }
                  />
                  <MetricLabel
                    label="1RM 추정값"
                    value={
                      exercise.estimatedOneRepMaxKg > 0
                        ? `${exercise.estimatedOneRepMaxKg}kg`
                        : '-'
                    }
                  />
                  <MetricLabel
                    label="MAX"
                    value={
                      exercise.maxWeightKg > 0
                        ? `${exercise.maxWeightKg}kg`
                        : '-'
                    }
                  />
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section title="오늘의 한마디">
          <TextInput
            multiline
            onChangeText={(value) =>
              setLesson((currentLesson) => ({
                ...currentLesson,
                comment: value,
              }))
            }
            placeholder="오늘 수업에 대한 메모를 남겨보세요"
            placeholderTextColor={Colors.textMuted}
            style={[styles.input, styles.textArea]}
            value={lesson.comment}
          />
        </Section>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({
  action,
  children,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

function InputField({
  keyboardType,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function FilterChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function MiniField({
  keyboardType,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  keyboardType?: 'number-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.miniField}>
      <Text style={styles.miniFieldLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={styles.miniFieldInput}
        value={value}
      />
    </View>
  );
}

function MetricLabel({
  accent = false,
  label,
  value,
}: {
  accent?: boolean;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.miniField}>
      <Text style={styles.miniFieldLabel}>{label}</Text>
      <Text style={[styles.metricValue, accent && styles.metricValueAccent]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  addSetButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  addSetLabel: {
    color: Colors.accent,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  chip: {
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  chipLabelActive: {
    color: Colors.white,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    gap: 20,
    padding: 14,
  },
  exerciseCard: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    padding: 10,
  },
  exerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  exerciseMetricsRow: {
    borderTopColor: Colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingTop: 6,
  },
  exerciseMetricsRowSecondary: {
    flexDirection: 'row',
    gap: 6,
  },
  exerciseNameInput: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    padding: 0,
  },
  exerciseStack: {
    gap: 10,
  },
  header: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomColor: Colors.cardBorder,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    padding: 12,
  },
  inputGroup: {
    flex: 1,
    gap: 4,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  metricValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
    paddingVertical: 5,
    textAlign: 'center',
  },
  metricValueAccent: {
    color: Colors.accent,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  miniField: {
    flex: 1,
    gap: 2,
  },
  miniFieldInput: {
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderRadius: 6,
    borderWidth: 1,
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    paddingHorizontal: 4,
    paddingVertical: 5,
    textAlign: 'center',
  },
  miniFieldLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  saveButtonPressed: {
    opacity: 0.7,
  },
  scroll: {
    flex: 1,
  },
  section: {
    gap: 10,
  },
  sectionActionButton: {
    padding: 4,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  setActionCell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
  },
  setHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  setHeaderLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 10,
    textAlign: 'center',
  },
  setInput: {
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    borderWidth: 1,
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    minWidth: 0,
    paddingHorizontal: 2,
    paddingVertical: 7,
    textAlign: 'center',
  },
  setNumber: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    textAlign: 'center',
  },
  setNumberCell: {
    width: 20,
  },
  setRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  setValueCell: {
    flex: 1,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
