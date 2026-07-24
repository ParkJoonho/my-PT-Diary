import { useNavigation } from '@granite-js/react-native';
import { useEffect } from 'react';
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
import { SuspenseSection } from 'shared/components/async-state';
import Colors from 'shared/constants/colors';
import { getClientTodayDate } from 'shared/lib/date';
import {
  useConditionRecord,
  useCreateConditionRecord,
  useUpdateConditionRecord,
} from '../api/condition-records';
import type { ConditionRecordDto } from 'shared/api/generated/models';
import {
  buildConditionPayload,
  validateConditionForm,
} from '../lib/condition-form';
import {
  getConditionScoreColor,
  getSorenessScoreColor,
} from '../lib/condition-record-metadata';
import { MUSCLE_INFO_MAP } from '../lib/condition-muscle-info';
import { useConditionFormStore } from '../stores/use-condition-form-store';
import { ConditionMuscleInfoModal } from './condition-muscle-info-modal';
import {
  ConditionScoreRow,
  MuscleSorenessScoreRow,
} from './condition-score-row';

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
  initialRecord?: ConditionRecordDto;
}) {
  const navigation = useNavigation();
  const createMutation = useCreateConditionRecord();
  const updateMutation = useUpdateConditionRecord();
  const form = useConditionFormStore((state) => state.form);
  const closeMuscleTooltip = useConditionFormStore(
    (state) => state.closeMuscleTooltip,
  );
  const hydrateFromRecord = useConditionFormStore(
    (state) => state.hydrateFromRecord,
  );
  const muscleTooltipLabel = useConditionFormStore(
    (state) => state.muscleTooltipLabel,
  );
  const openMuscleTooltip = useConditionFormStore(
    (state) => state.openMuscleTooltip,
  );
  const resetForCreate = useConditionFormStore((state) => state.resetForCreate);
  const setDate = useConditionFormStore((state) => state.setDate);
  const setWeekNumberInput = useConditionFormStore(
    (state) => state.setWeekNumberInput,
  );
  const toggleConditionScore = useConditionFormStore(
    (state) => state.toggleConditionScore,
  );
  const toggleMuscleSorenessScore = useConditionFormStore(
    (state) => state.toggleMuscleSorenessScore,
  );

  useEffect(() => {
    if (initialRecord) {
      hydrateFromRecord(initialRecord);
      return;
    }

    resetForCreate(getClientTodayDate());
  }, [hydrateFromRecord, initialRecord, resetForCreate]);

  useEffect(
    () => () => {
      closeMuscleTooltip();
    },
    [closeMuscleTooltip],
  );

  const handleSave = async () => {
    const error = validateConditionForm(form);

    if (error) {
      Alert.alert('알림', error);
      return;
    }

    const payload = buildConditionPayload(form);

    try {
      if (initialConditionId) {
        await updateMutation.mutateAsync({
          conditionId: initialConditionId,
          payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      navigation.navigate({ name: '/condition-list', params: {} });
    } catch {
      Alert.alert('오류', '컨디션 기록을 저장하지 못했어요.');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const muscleInfo = muscleTooltipLabel
    ? MUSCLE_INFO_MAP[muscleTooltipLabel] ?? null
    : null;

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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본 정보</Text>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>날짜</Text>
              <TextInput
                onChangeText={setDate}
                placeholder="2026-07-24"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                value={form.date}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>주차</Text>
              <TextInput
                keyboardType="number-pad"
                onChangeText={setWeekNumberInput}
                placeholder="1"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                value={form.weekNumberInput}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>컨디션 체크</Text>
            <Text style={styles.sectionSubtitle}>1=매우 나쁨 ~ 5=매우 좋음</Text>
          </View>
          {form.conditions.map((item, index) => (
            <ConditionScoreRow
              colorForScore={getConditionScoreColor}
              key={item.label}
              label={item.label}
              maxScore={5}
              onSelect={(score) => toggleConditionScore(index, score)}
              score={item.score}
            />
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleWithHint}>
              <Text style={styles.sectionTitle}>근육통 체크</Text>
              <View style={styles.hintBadge}>
                <Text style={styles.hintBadgeText}>부위를 누르면 위치 안내</Text>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>1=없음 ~ 4=심함</Text>
          </View>
          {form.muscleSoreness.map((item, index) => (
            <MuscleSorenessScoreRow
              colorForScore={getSorenessScoreColor}
              key={item.label}
              label={item.label}
              maxScore={4}
              onInfoPress={() => openMuscleTooltip(item.label)}
              onSelect={(score) => toggleMuscleSorenessScore(index, score)}
              score={item.score}
            />
          ))}
        </View>
      </ScrollView>

      <ConditionMuscleInfoModal info={muscleInfo} onClose={closeMuscleTooltip} />
    </KeyboardAvoidingView>
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
    gap: 24,
    paddingBottom: 32,
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
  hintBadge: {
    backgroundColor: `${Colors.info}14`,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  hintBadgeText: {
    color: Colors.info,
    fontFamily: 'Pretendard-Medium',
    fontSize: 10,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  section: {
    gap: 10,
  },
  sectionSubtitle: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  sectionTitleRow: {
    gap: 2,
  },
  sectionTitleWithHint: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
