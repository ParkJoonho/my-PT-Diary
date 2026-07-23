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
  useConditionRecord,
  useCreateConditionRecord,
  useDeleteConditionRecord,
  useUpdateConditionRecord,
} from '../api/condition-records';
import {
  CONDITION_QUESTIONS,
  type ConditionFormState,
  MUSCLE_QUESTIONS,
  buildConditionPayload,
  createConditionFormState,
  createConditionFormStateFromRecord,
  getConditionScoreLabel,
  getSorenessScoreLabel,
  validateConditionForm,
} from '../lib/condition-form';

export function ConditionFormScreen({ conditionId }: { conditionId?: string }) {
  if (conditionId) {
    return (
      <SuspenseSection errorMessage="수정할 컨디션 기록을 불러오지 못했어요.">
        <EditConditionForm conditionId={conditionId} />
      </SuspenseSection>
    );
  }

  return <ConditionFormContent />;
}

function EditConditionForm({ conditionId }: { conditionId: string }) {
  const { data } = useConditionRecord(conditionId);

  return (
    <ConditionFormContent
      initialConditionId={conditionId}
      initialRecord={data}
    />
  );
}

function ConditionFormContent({
  initialConditionId,
  initialRecord,
}: {
  initialConditionId?: string;
  initialRecord?: Parameters<typeof createConditionFormStateFromRecord>[0];
}) {
  const navigation = useNavigation();
  const createMutation = useCreateConditionRecord();
  const deleteMutation = useDeleteConditionRecord();
  const updateMutation = useUpdateConditionRecord();
  const [form, setForm] = useState<ConditionFormState>(() =>
    initialRecord
      ? createConditionFormStateFromRecord(initialRecord)
      : createConditionFormState(),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialRecord) {
      setForm(createConditionFormStateFromRecord(initialRecord));
    }
  }, [initialRecord]);

  const handleSave = async () => {
    const error = validateConditionForm(form);

    if (error) {
      setErrorMessage(error);
      return;
    }

    setErrorMessage(null);

    const payload = buildConditionPayload(form);

    if (initialConditionId) {
      await updateMutation.mutateAsync({
        conditionId: initialConditionId,
        payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }

    navigation.navigate({ name: '/condition-list', params: {} });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const handleDelete = async () => {
    if (!initialConditionId) {
      return;
    }

    await deleteMutation.mutateAsync(initialConditionId);
    navigation.navigate({ name: '/condition-list', params: {} });
  };

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
          {initialConditionId ? '컨디션 수정' : '컨디션 체크'}
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
          <Text style={styles.label}>체크일</Text>
          <TextInput
            onChangeText={(value) =>
              setForm((current) => ({ ...current, checkedOn: value }))
            }
            style={styles.input}
            value={form.checkedOn}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>컨디션</Text>
          {CONDITION_QUESTIONS.map((question) => (
            <ScoreRow
              key={question.key}
              label={question.label}
              maxScore={5}
              onSelect={(score) =>
                setForm((current) => ({
                  ...current,
                  conditionScores: {
                    ...current.conditionScores,
                    [question.key]:
                      current.conditionScores[question.key] === score
                        ? 0
                        : score,
                  },
                }))
              }
              score={form.conditionScores[question.key]}
              scoreLabel={getConditionScoreLabel(
                form.conditionScores[question.key],
              )}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>근육통</Text>
          {MUSCLE_QUESTIONS.map((question) => (
            <ScoreRow
              key={question.key}
              label={question.label}
              maxScore={4}
              onSelect={(score) =>
                setForm((current) => ({
                  ...current,
                  muscleSoreness: {
                    ...current.muscleSoreness,
                    [question.key]:
                      current.muscleSoreness[question.key] === score
                        ? 0
                        : score,
                  },
                }))
              }
              score={form.muscleSoreness[question.key]}
              scoreLabel={getSorenessScoreLabel(
                form.muscleSoreness[question.key],
              )}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메모</Text>
          <TextInput
            multiline
            onChangeText={(value) =>
              setForm((current) => ({ ...current, memo: value }))
            }
            placeholder="오늘 몸 상태"
            placeholderTextColor={Colors.textMuted}
            style={[styles.input, styles.memoInput]}
            value={form.memo}
          />
        </View>

        {initialConditionId ? (
          <Pressable
            disabled={deleteMutation.isPending}
            onPress={handleDelete}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>
              {deleteMutation.isPending ? '삭제 중' : '삭제'}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ScoreRow({
  label,
  maxScore,
  onSelect,
  score,
  scoreLabel,
}: {
  label: string;
  maxScore: number;
  onSelect: (score: number) => void;
  score: number;
  scoreLabel: string;
}) {
  return (
    <View style={styles.scoreRow}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreValue}>{scoreLabel}</Text>
      </View>
      <View style={styles.scoreButtons}>
        {Array.from({ length: maxScore }, (_, index) => index + 1).map(
          (value) => (
            <Pressable
              key={value}
              onPress={() => onSelect(value)}
              style={[
                styles.scoreButton,
                score === value && styles.scoreButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.scoreButtonText,
                  score === value && styles.scoreButtonTextActive,
                ]}
              >
                {value}
              </Text>
            </Pressable>
          ),
        )}
      </View>
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
  deleteButton: {
    alignItems: 'center',
    borderColor: Colors.danger,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
  },
  deleteText: {
    color: Colors.danger,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
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
  scoreButton: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10,
  },
  scoreButtonActive: {
    backgroundColor: Colors.accent,
  },
  scoreButtonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  scoreButtonTextActive: {
    color: Colors.white,
  },
  scoreButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  scoreHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  scoreRow: {
    gap: 8,
  },
  scoreValue: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
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
});
