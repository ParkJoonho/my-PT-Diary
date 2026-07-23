import { useNavigation } from '@granite-js/react-native';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SuspenseSection } from 'shared/components/async-state';
import Colors from 'shared/constants/colors';
import {
  useCreateManualWorkoutRecord,
  useUpdateManualWorkoutRecord,
  useWorkoutRecord,
} from '../api/workout-records';
import {
  type ManualStrengthExerciseForm,
  type ManualWorkoutFormState,
  buildManualWorkoutPayload,
  calculateManualWorkoutVolume,
  createEmptyManualStrengthExercise,
  createEmptyManualWorkoutSet,
  createManualWorkoutFormState,
  createManualWorkoutFormStateFromRecord,
  validateManualWorkoutForm,
} from '../lib/manual-workout-form';

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
    <ManualWorkoutFormContent initialRecordId={recordId} initialRecord={data} />
  );
}

function ManualWorkoutFormContent({
  initialRecord,
  initialRecordId,
}: {
  initialRecord?: Parameters<typeof createManualWorkoutFormStateFromRecord>[0];
  initialRecordId?: string;
}) {
  const navigation = useNavigation();
  const createMutation = useCreateManualWorkoutRecord();
  const updateMutation = useUpdateManualWorkoutRecord();
  const [form, setForm] = useState<ManualWorkoutFormState>(() =>
    initialRecord
      ? createManualWorkoutFormStateFromRecord(initialRecord)
      : createManualWorkoutFormState(),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialRecord) {
      setForm(createManualWorkoutFormStateFromRecord(initialRecord));
    }
  }, [initialRecord]);

  const updateField = (key: keyof ManualWorkoutFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    const errors = validateManualWorkoutForm(form);

    if (errors.length) {
      setErrorMessage(errors[0]?.message ?? '입력값을 확인해 주세요.');
      return;
    }

    setErrorMessage(null);

    const payload = buildManualWorkoutPayload(form);

    if (initialRecordId) {
      await updateMutation.mutateAsync({ payload, recordId: initialRecordId });
    } else {
      await createMutation.mutateAsync(payload);
    }

    navigation.navigate({ name: '/exercise-list', params: {} });
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
          {initialRecordId ? '운동 수정' : '운동 작성'}
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
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본 정보</Text>
          <Input
            label="제목"
            onChangeText={(value) => updateField('title', value)}
            value={form.title}
          />
          <View style={styles.row}>
            <Input
              label="운동일"
              onChangeText={(value) => updateField('performedOn', value)}
              value={form.performedOn}
            />
            <Input
              label="시간(분)"
              keyboardType="number-pad"
              onChangeText={(value) => updateField('durationMinutes', value)}
              value={form.durationMinutes}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>근력 운동</Text>
          {form.strengthExercises.map((exercise, exerciseIndex) => (
            <StrengthExerciseEditor
              exercise={exercise}
              exerciseIndex={exerciseIndex}
              key={`${exerciseIndex}-${exercise.name}`}
              onChange={(nextExercise) =>
                setForm((current) => ({
                  ...current,
                  strengthExercises: current.strengthExercises.map(
                    (item, index) =>
                      index === exerciseIndex ? nextExercise : item,
                  ),
                }))
              }
              onRemove={() =>
                setForm((current) => ({
                  ...current,
                  strengthExercises: current.strengthExercises.filter(
                    (_, index) => index !== exerciseIndex,
                  ),
                }))
              }
            />
          ))}
          <Pressable
            onPress={() =>
              setForm((current) => ({
                ...current,
                strengthExercises: [
                  ...current.strengthExercises,
                  createEmptyManualStrengthExercise(),
                ],
              }))
            }
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>운동 추가</Text>
          </Pressable>
          <Text style={styles.helperText}>
            총 볼륨{' '}
            {calculateManualWorkoutVolume(
              form.strengthExercises,
            ).toLocaleString()}
            kg
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>유산소</Text>
          <View style={styles.row}>
            <Input
              label="시간(분)"
              keyboardType="number-pad"
              onChangeText={(value) =>
                updateField('cardioDurationMinutes', value)
              }
              value={form.cardioDurationMinutes}
            />
            <Input
              label="거리(km)"
              keyboardType="decimal-pad"
              onChangeText={(value) => updateField('cardioDistanceKm', value)}
              value={form.cardioDistanceKm}
            />
            <Input
              label="걸음"
              keyboardType="number-pad"
              onChangeText={(value) => updateField('cardioSteps', value)}
              value={form.cardioSteps}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>체성분</Text>
          <View style={styles.row}>
            <Input
              label="체중"
              keyboardType="decimal-pad"
              onChangeText={(value) => updateField('weightKg', value)}
              value={form.weightKg}
            />
            <Input
              label="골격근"
              keyboardType="decimal-pad"
              onChangeText={(value) =>
                updateField('skeletalMuscleMassKg', value)
              }
              value={form.skeletalMuscleMassKg}
            />
            <Input
              label="체지방률"
              keyboardType="decimal-pad"
              onChangeText={(value) => updateField('bodyFatPercentage', value)}
              value={form.bodyFatPercentage}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메모</Text>
          <TextInput
            multiline
            onChangeText={(value) => updateField('memo', value)}
            placeholder="운동 중 느낀 점"
            placeholderTextColor={Colors.textMuted}
            style={[styles.input, styles.memoInput]}
            value={form.memo}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StrengthExerciseEditor({
  exercise,
  exerciseIndex,
  onChange,
  onRemove,
}: {
  exercise: ManualStrengthExerciseForm;
  exerciseIndex: number;
  onChange: (exercise: ManualStrengthExerciseForm) => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.exerciseBox}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseTitle}>운동 {exerciseIndex + 1}</Text>
        <Pressable onPress={onRemove}>
          <Text style={styles.removeText}>삭제</Text>
        </Pressable>
      </View>
      <Input
        label="운동명"
        onChangeText={(value) => onChange({ ...exercise, name: value })}
        value={exercise.name}
      />
      {exercise.sets.map((set, setIndex) => (
        <View
          key={`${set.weightKg}-${set.reps}-${set.rir}-${set.restSeconds}`}
          style={styles.setRow}
        >
          <Input
            label={`${setIndex + 1}세트 kg`}
            keyboardType="decimal-pad"
            onChangeText={(value) =>
              onChange({
                ...exercise,
                sets: exercise.sets.map((item, index) =>
                  index === setIndex ? { ...item, weightKg: value } : item,
                ),
              })
            }
            value={set.weightKg}
          />
          <Input
            label="횟수"
            keyboardType="number-pad"
            onChangeText={(value) =>
              onChange({
                ...exercise,
                sets: exercise.sets.map((item, index) =>
                  index === setIndex ? { ...item, reps: value } : item,
                ),
              })
            }
            value={set.reps}
          />
          <Input
            label="RIR"
            keyboardType="number-pad"
            onChangeText={(value) =>
              onChange({
                ...exercise,
                sets: exercise.sets.map((item, index) =>
                  index === setIndex ? { ...item, rir: value } : item,
                ),
              })
            }
            value={set.rir}
          />
        </View>
      ))}
      <Pressable
        onPress={() =>
          onChange({
            ...exercise,
            sets: [...exercise.sets, createEmptyManualWorkoutSet()],
          })
        }
        style={styles.smallButton}
      >
        <Text style={styles.smallButtonText}>세트 추가</Text>
      </Pressable>
    </View>
  );
}

function Input({
  keyboardType,
  label,
  onChangeText,
  value,
}: {
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    gap: 12,
    paddingBottom: 32,
  },
  errorText: {
    backgroundColor: '#FFECEC',
    borderRadius: 8,
    color: Colors.danger,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
    padding: 12,
  },
  exerciseBox: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 10,
    gap: 10,
    padding: 12,
  },
  exerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerButton: {
    minWidth: 52,
    paddingVertical: 8,
  },
  headerButtonText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Bold',
    fontSize: 18,
  },
  helperText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    minHeight: 42,
    paddingHorizontal: 10,
  },
  inputGroup: {
    flex: 1,
    gap: 6,
  },
  label: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  memoInput: {
    minHeight: 92,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  removeText: {
    color: Colors.danger,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: Colors.accent,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 11,
  },
  secondaryButtonText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  section: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    padding: 14,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  setRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: 9,
  },
  smallButtonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
});
