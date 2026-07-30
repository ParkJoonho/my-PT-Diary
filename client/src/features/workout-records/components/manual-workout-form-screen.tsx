import { useNavigation } from '@granite-js/react-native';
import { type ReactNode, useEffect } from 'react';
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
import type { WorkoutRecordDto } from 'shared/api/generated/models';
import { SuspenseSection } from 'shared/components/async-state';
import { OriginalAppIcon } from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import {
  useCreateManualWorkoutRecord,
  useUpdateManualWorkoutRecord,
  useWorkoutRecord,
} from '../api/workout-records';
import { validateManualWorkoutForm } from '../lib/manual-workout-form';
import { buildManualWorkoutPayload } from '../lib/manual-workout-form';
import { useManualWorkoutFormStore } from '../stores/use-manual-workout-form-store';

const MEAL_LABELS = ['MEAL 1', 'MEAL 2', 'MEAL 3', 'MEAL 4'] as const;

export function ManualWorkoutFormScreen({
  contentBottomInset,
  recordId,
}: {
  contentBottomInset: number;
  recordId?: string;
}) {
  if (recordId) {
    return (
      <SuspenseSection errorMessage="수정할 운동 기록을 불러오지 못했어요.">
        <EditManualWorkoutForm
          contentBottomInset={contentBottomInset}
          recordId={recordId}
        />
      </SuspenseSection>
    );
  }

  return <ManualWorkoutFormContent contentBottomInset={contentBottomInset} />;
}

function EditManualWorkoutForm({
  contentBottomInset,
  recordId,
}: {
  contentBottomInset: number;
  recordId: string;
}) {
  const { data } = useWorkoutRecord(recordId);

  return (
    <ManualWorkoutFormContent
      contentBottomInset={contentBottomInset}
      initialRecord={data}
      initialRecordId={recordId}
    />
  );
}

function ManualWorkoutFormContent({
  contentBottomInset,
  initialRecord,
  initialRecordId,
}: {
  contentBottomInset: number;
  initialRecord?: WorkoutRecordDto;
  initialRecordId?: string;
}) {
  const navigation = useNavigation();
  const createMutation = useCreateManualWorkoutRecord();
  const updateMutation = useUpdateManualWorkoutRecord();
  const form = useManualWorkoutFormStore((state) => state.form);
  const addSet = useManualWorkoutFormStore((state) => state.addSet);
  const addStrengthExercise = useManualWorkoutFormStore(
    (state) => state.addStrengthExercise,
  );
  const hydrateFromRecord = useManualWorkoutFormStore(
    (state) => state.hydrateFromRecord,
  );
  const removeSet = useManualWorkoutFormStore((state) => state.removeSet);
  const removeStrengthExercise = useManualWorkoutFormStore(
    (state) => state.removeStrengthExercise,
  );
  const resetForCreate = useManualWorkoutFormStore(
    (state) => state.resetForCreate,
  );
  const setBodyCompositionField = useManualWorkoutFormStore(
    (state) => state.setBodyCompositionField,
  );
  const setCardioField = useManualWorkoutFormStore(
    (state) => state.setCardioField,
  );
  const setMeal = useManualWorkoutFormStore((state) => state.setMeal);
  const setPerformedOn = useManualWorkoutFormStore(
    (state) => state.setPerformedOn,
  );
  const setStrengthExerciseName = useManualWorkoutFormStore(
    (state) => state.setStrengthExerciseName,
  );
  const setStrengthExerciseRestTime = useManualWorkoutFormStore(
    (state) => state.setStrengthExerciseRestTime,
  );
  const setStrengthExerciseRir = useManualWorkoutFormStore(
    (state) => state.setStrengthExerciseRir,
  );
  const setTextField = useManualWorkoutFormStore((state) => state.setTextField);
  const updateSetField = useManualWorkoutFormStore(
    (state) => state.updateSetField,
  );

  useEffect(() => {
    if (initialRecord) {
      hydrateFromRecord(initialRecord);
      return;
    }

    resetForCreate();
  }, [hydrateFromRecord, initialRecord, resetForCreate]);

  const handleSave = async () => {
    const errors = validateManualWorkoutForm(form);

    if (errors.length > 0) {
      Alert.alert('알림', errors[0]?.message ?? '입력값을 확인해 주세요.');
      return;
    }

    const payload = buildManualWorkoutPayload(form);

    try {
      if (initialRecordId) {
        await updateMutation.mutateAsync({
          payload,
          recordId: initialRecordId,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      navigation.goBack();
    } catch {
      Alert.alert('오류', '운동 기록을 저장하지 못했어요.');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

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
          {initialRecordId ? '운동기록 수정' : '새 운동기록'}
        </Text>
        <Pressable
          accessibilityLabel={isPending ? '저장 중' : '저장'}
          disabled={isPending}
          onPress={handleSave}
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
      >
        <Section title="기본 정보">
          <View style={styles.row}>
            <InputField
              label="날짜"
              onChangeText={setPerformedOn}
              placeholder="2025-01-01"
              value={form.performedOn}
            />
            <InputField
              label="운동시간"
              onChangeText={(value) => setTextField('exerciseTime', value)}
              placeholder="60분"
              value={form.exerciseTime}
            />
          </View>
        </Section>

        <Section title="유산소 (CARDIO)">
          <View style={styles.row}>
            <InputField
              keyboardType="number-pad"
              label="걸음수"
              onChangeText={(value) => setCardioField('steps', value)}
              placeholder="0"
              value={form.steps}
            />
            <InputField
              keyboardType="number-pad"
              label="러닝머신(분)"
              onChangeText={(value) =>
                setCardioField('treadmillMinutes', value)
              }
              placeholder="0"
              value={form.treadmillMinutes}
            />
          </View>
          <View style={styles.row}>
            <InputField
              keyboardType="number-pad"
              label="사이클(분)"
              onChangeText={(value) => setCardioField('cycleMinutes', value)}
              placeholder="0"
              value={form.cycleMinutes}
            />
            <InputField
              keyboardType="number-pad"
              label="천국의 계단(분)"
              onChangeText={(value) =>
                setCardioField('stairClimberMinutes', value)
              }
              placeholder="0"
              value={form.stairClimberMinutes}
            />
          </View>
        </Section>

        <Section title="컨디션 체크">
          <View style={styles.row}>
            <InputField
              label="수면"
              onChangeText={(value) => setTextField('sleep', value)}
              placeholder="7시간"
              value={form.sleep}
            />
            <InputField
              label="컨디션"
              onChangeText={(value) => setTextField('condition', value)}
              placeholder="좋음"
              value={form.condition}
            />
          </View>
          <InputField
            label="활동 강도"
            onChangeText={(value) => setTextField('activityLevel', value)}
            placeholder="보통"
            value={form.activityLevel}
          />
        </Section>

        <Section title="체성분">
          <View style={styles.row}>
            <InputField
              keyboardType="decimal-pad"
              label="아침 체중(kg)"
              onChangeText={(value) =>
                setBodyCompositionField('morningWeightKg', value)
              }
              placeholder="0"
              value={form.morningWeightKg}
            />
            <InputField
              keyboardType="decimal-pad"
              label="저녁 체중(kg)"
              onChangeText={(value) =>
                setBodyCompositionField('eveningWeightKg', value)
              }
              placeholder="0"
              value={form.eveningWeightKg}
            />
          </View>
          <View style={styles.row}>
            <InputField
              keyboardType="decimal-pad"
              label="골격근(kg)"
              onChangeText={(value) =>
                setBodyCompositionField('skeletalMuscleMassKg', value)
              }
              placeholder="0"
              value={form.skeletalMuscleMassKg}
            />
            <InputField
              keyboardType="decimal-pad"
              label="체지방(kg)"
              onChangeText={(value) =>
                setBodyCompositionField('bodyFatKg', value)
              }
              placeholder="0"
              value={form.bodyFatKg}
            />
          </View>
          <InputField
            keyboardType="decimal-pad"
            label="체지방률(%)"
            onChangeText={(value) =>
              setBodyCompositionField('bodyFatPercentage', value)
            }
            placeholder="0"
            value={form.bodyFatPercentage}
          />
        </Section>

        <Section title="식단 체크">
          {MEAL_LABELS.map((label, index) => (
            <InputField
              key={label}
              label={label}
              onChangeText={(value) => setMeal(index, value)}
              placeholder="식사 내용"
              value={form.meals[index] ?? ''}
            />
          ))}
        </Section>

        <Section
          action={
            <Pressable
              accessibilityLabel="운동 추가"
              onPress={addStrengthExercise}
              style={styles.addExerciseButton}
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
          {form.strengthExercises.map((exercise, exerciseIndex) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <TextInput
                  onChangeText={(value) =>
                    setStrengthExerciseName(exerciseIndex, value)
                  }
                  placeholder={`운동종목 ${exerciseIndex + 1}`}
                  placeholderTextColor={Colors.textMuted}
                  style={styles.exerciseNameInput}
                  value={exercise.name}
                />
                {form.strengthExercises.length > 1 ? (
                  <Pressable
                    accessibilityLabel={`운동종목 ${exerciseIndex + 1} 삭제`}
                    onPress={() => removeStrengthExercise(exerciseIndex)}
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
                <Text style={[styles.setHeaderText, styles.setNumberHeader]}>
                  SET
                </Text>
                <Text style={[styles.setHeaderText, styles.setFieldHeader]}>
                  무게(kg)
                </Text>
                <Text style={[styles.setHeaderText, styles.setFieldHeader]}>
                  횟수
                </Text>
                <View style={styles.setActionHeader} />
              </View>

              {exercise.sets.map((set, setIndex) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={styles.setNumber}>{setIndex + 1}</Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    onChangeText={(value) =>
                      updateSetField(exerciseIndex, setIndex, 'weightKg', value)
                    }
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                    style={styles.setInput}
                    value={set.weightKg}
                  />
                  <TextInput
                    keyboardType="number-pad"
                    onChangeText={(value) =>
                      updateSetField(exerciseIndex, setIndex, 'reps', value)
                    }
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                    style={styles.setInput}
                    value={set.reps}
                  />
                  <Pressable
                    accessibilityLabel={`${setIndex + 1}세트 삭제`}
                    onPress={() => removeSet(exerciseIndex, setIndex)}
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
                <Text style={styles.addSetText}>세트 추가</Text>
              </Pressable>

              <View style={styles.exerciseFooter}>
                <MiniField
                  label="휴식"
                  onChangeText={(value) =>
                    setStrengthExerciseRestTime(exerciseIndex, value)
                  }
                  placeholder="60초"
                  value={exercise.restTime}
                />
                <MiniField
                  label="RIR"
                  onChangeText={(value) =>
                    setStrengthExerciseRir(exerciseIndex, value)
                  }
                  placeholder="0"
                  value={exercise.rir}
                  keyboardType="number-pad"
                />
                <MiniStat
                  label="LB"
                  value={exercise.lbWeight > 0 ? `${exercise.lbWeight}lb` : '-'}
                />
              </View>

              <View style={styles.exerciseFooter2}>
                <MiniStat
                  accent
                  label="볼륨"
                  value={
                    exercise.volume > 0
                      ? `${exercise.volume.toLocaleString()}kg`
                      : '-'
                  }
                />
                <MiniStat
                  label="1RM 추정값"
                  value={
                    exercise.estimated1RM > 0
                      ? `${exercise.estimated1RM}kg`
                      : '-'
                  }
                />
                <MiniStat
                  label="MAX"
                  value={
                    exercise.maxWeight > 0 ? `${exercise.maxWeight}kg` : '-'
                  }
                />
              </View>
            </View>
          ))}
        </Section>

        <Section title="하루 일과 보고">
          <TextInput
            multiline
            onChangeText={(value) => setTextField('dailyReport', value)}
            placeholder="오늘의 일과를 기록하세요"
            placeholderTextColor={Colors.textMuted}
            style={[styles.input, styles.textArea]}
            value={form.dailyReport}
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
  keyboardType?: 'decimal-pad' | 'default' | 'number-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
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
      <Text style={styles.miniLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={styles.miniInput}
        value={value}
      />
    </View>
  );
}

function MiniStat({
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
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={accent ? styles.miniStatAccent : styles.miniStat}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  addExerciseButton: {
    padding: 4,
  },
  addSetButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  addSetText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
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
  exerciseFooter: {
    borderTopColor: Colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingTop: 6,
  },
  exerciseFooter2: {
    flexDirection: 'row',
    gap: 6,
  },
  exerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  exerciseNameInput: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    padding: 0,
  },
  header: {
    alignItems: 'center',
    backgroundColor: Colors.card,
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
  label: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  miniField: {
    flex: 1,
    gap: 2,
  },
  miniInput: {
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
  miniLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 10,
  },
  miniStat: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
    paddingVertical: 5,
    textAlign: 'center',
  },
  miniStatAccent: {
    color: Colors.accent,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    paddingVertical: 5,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  section: {
    gap: 10,
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
  setActionHeader: {
    width: 22,
  },
  setFieldHeader: {
    flex: 1,
  },
  setHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  setHeaderText: {
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
    flex: 1,
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
    width: 20,
  },
  setNumberHeader: {
    width: 20,
  },
  setRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
