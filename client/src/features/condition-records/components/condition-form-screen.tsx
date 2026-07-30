import { useNavigation } from '@granite-js/react-native';
import { useEffect } from 'react';
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
import type { ConditionRecordDto } from 'shared/api/generated/models';
import { SuspenseSection } from 'shared/components/async-state';
import { OriginalAppIcon } from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import { getClientTodayDate } from 'shared/lib/date';
import {
  useConditionRecord,
  useCreateConditionRecord,
  useUpdateConditionRecord,
} from '../api/condition-records';
import {
  buildConditionPayload,
  validateConditionForm,
} from '../lib/condition-form';
import { MUSCLE_INFO_MAP } from '../lib/condition-muscle-info';
import {
  getConditionScoreColor,
  getSorenessScoreColor,
} from '../lib/condition-record-metadata';
import { useConditionFormStore } from '../stores/use-condition-form-store';
import { ConditionMuscleInfoModal } from './condition-muscle-info-modal';
import {
  ConditionScoreRow,
  MuscleSorenessScoreRow,
} from './condition-score-row';

export function ConditionFormScreen({
  conditionId,
  contentBottomInset,
}: {
  conditionId?: string;
  contentBottomInset: number;
}) {
  if (conditionId) {
    return (
      <SuspenseSection errorMessage="수정할 컨디션 기록을 불러오지 못했어요.">
        <EditConditionForm
          conditionId={conditionId}
          contentBottomInset={contentBottomInset}
        />
      </SuspenseSection>
    );
  }

  return <ConditionFormContent contentBottomInset={contentBottomInset} />;
}

function EditConditionForm({
  conditionId,
  contentBottomInset,
}: {
  conditionId: string;
  contentBottomInset: number;
}) {
  const { data } = useConditionRecord(conditionId);

  return (
    <ConditionFormContent
      contentBottomInset={contentBottomInset}
      initialConditionId={conditionId}
      initialRecord={data}
    />
  );
}

function ConditionFormContent({
  contentBottomInset,
  initialConditionId,
  initialRecord,
}: {
  contentBottomInset: number;
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

      navigation.goBack();
    } catch {
      Alert.alert('오류', '컨디션 기록을 저장하지 못했어요.');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const muscleInfo = muscleTooltipLabel
    ? (MUSCLE_INFO_MAP[muscleTooltipLabel] ?? null)
    : null;

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
          {initialConditionId ? '컨디션 수정' : '컨디션 체크'}
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
        style={styles.scroll}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본 정보</Text>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>날짜</Text>
              <TextInput
                onChangeText={setDate}
                placeholder="2025-01-01"
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
            <Text style={styles.sectionSubtitle}>
              1=매우 나쁨 ~ 5=매우 좋음
            </Text>
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
                <OriginalAppIcon
                  color={Colors.info}
                  name="informationCircle"
                  size={12}
                />
                <Text style={styles.hintBadgeText}>
                  부위를 누르면 위치 안내
                </Text>
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

      <ConditionMuscleInfoModal
        info={muscleInfo}
        onClose={closeMuscleTooltip}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    gap: 24,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomColor: Colors.cardBorder,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
  },
  hintBadge: {
    alignItems: 'center',
    backgroundColor: `${Colors.info}14`,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 3,
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
});
