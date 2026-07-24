import { useNavigation } from '@granite-js/react-native';
import { type ReactNode, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { WorkoutRecordDto } from 'shared/api/generated/models';
import { SuspenseSection } from 'shared/components/async-state';
import Colors from 'shared/constants/colors';
import {
  useCreateManualWorkoutRecord,
  useUpdateManualWorkoutRecord,
  useWorkoutRecord,
} from '../api/workout-records';
import {
  calculateManualWorkoutVolume,
  validateManualWorkoutForm,
} from '../lib/manual-workout-form';
import { useManualWorkoutFormStore } from '../stores/use-manual-workout-form-store';
import { buildManualWorkoutPayload } from '../lib/manual-workout-form';

export function ManualWorkoutFormScreen({ recordId }: { recordId?: string }) {
  if (recordId) {
    return (
      <SuspenseSection errorMessage="수정할 운동 기록을 불러오지 못했어요.">
        <EditManualWorkoutForm recordId={recordId} />
      </SuspenseSection>
    );
  }

  return <ManualWorkoutFormContent />;
}

function EditManualWorkoutForm({ recordId }: { recordId: string }) {
  const { data } = useWorkoutRecord(recordId);

  return (
    <ManualWorkoutFormContent initialRecord={data} initialRecordId={recordId} />
  );
}

function ManualWorkoutFormContent({
  initialRecord,
  initialRecordId,
}: {
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
  const resetForCreate = useManualWorkoutFormStore((state) => state.resetForCreate);
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
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>닫기</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {initialRecordId ? '운동기록 수정' : '새 운동기록'}
        </Text>
        <Pressable
          disabled={isPending}
          onPress={handleSave}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>
            {isPending ? '저장 중' : '저장'}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Section title="기본 정보">
          <View style={styles.row}>
            <InputField
              label="날짜"
              onChangeText={setPerformedOn}
              placeholder="2026-07-24"
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
              onChangeText={(value) => setCardioField('treadmillMinutes', value)}
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
              onChangeText={(value) => setBodyCompositionField('bodyFatKg', value)}
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
          {form.meals.map((meal, index) => (
            <InputField
              key={`meal-${index}`}
              label={`MEAL ${index + 1}`}
              onChangeText={(value) => setMeal(index, value)}
              placeholder="식사 내용"
              value={meal}
            />
          ))}
        </Section>

        <Section
          action={
            <Pressable onPress={addStrengthExercise}>
              <Text style={styles.actionText}>운동 추가</Text>
            </Pressable>
          }
          title="운동 종목"
        >
          {form.strengthExercises.map((exercise, exerciseIndex) => (
            <View key={`exercise-${exerciseIndex}`} style={styles.exerciseCard}>
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
                  <Pressable onPress={() => removeStrengthExercise(exerciseIndex)}>
                    <Text style={styles.removeText}>삭제</Text>
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
                <Text style={[styles.setHeaderText, styles.setActionHeader]}>
                  삭제
                </Text>
              </View>

              {exercise.sets.map((set, setIndex) => (
                <View key={`set-${exerciseIndex}-${setIndex}`} style={styles.setRow}>
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
                  <Pressable onPress={() => removeSet(exerciseIndex, setIndex)}>
                    <Text style={styles.setDeleteText}>삭제</Text>
                  </Pressable>
                </View>
              ))}

              <Pressable
                onPress={() => addSet(exerciseIndex)}
                style={styles.addSetButton}
              >
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
                />
                <MiniStat
                  label="LB"
                  value={exercise.lbWeight > 0 ? `${exercise.lbWeight}lb` : '-'}
                />
              </View>

              <View style={styles.exerciseFooter}>
                <MiniStat
                  label="볼륨"
                  value={exercise.volume > 0 ? `${exercise.volume.toLocaleString()}kg` : '-'}
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
                  value={exercise.maxWeight > 0 ? `${exercise.maxWeight}kg` : '-'}
                />
              </View>
            </View>
          ))}
          <Text style={styles.helperText}>
            총 볼륨 {calculateManualWorkoutVolume(form.strengthExercises).toLocaleString()}kg
          </Text>
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
  label,
  onChangeText,
  placeholder,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.miniField}>
      <Text style={styles.miniLabel}>{label}</Text>
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={styles.miniInput}
        value={value}
      />
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniField}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniStat}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  addSetButton: {
    alignItems: 'center',
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
    paddingBottom: 36,
  },
  exerciseCard: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  exerciseFooter: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 6,
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
  headerButton: {
    minWidth: 52,
  },
  headerButtonText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
  },
  helperText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
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
    gap: 4,
  },
  miniInput: {
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    borderWidth: 1,
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  miniLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
  },
  miniStat: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
    paddingTop: 8,
  },
  removeText: {
    color: Colors.danger,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
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
    width: 36,
  },
  setDeleteText: {
    color: Colors.danger,
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
    width: 36,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
