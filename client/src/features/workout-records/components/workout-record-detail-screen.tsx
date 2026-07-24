import { useNavigation } from '@granite-js/react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SuspenseSection } from 'shared/components/async-state';
import Colors from 'shared/constants/colors';
import {
  useDeleteWorkoutRecord,
  useWorkoutRecord,
} from '../api/workout-records';
import {
  formatDurationSeconds,
  formatWorkoutVolume,
  getWorkoutRecordKindLabel,
  getWorkoutRecordTitle,
} from '../lib/workout-record-format';

export function WorkoutRecordDetailScreen({ recordId }: { recordId: string }) {
  return (
    <SuspenseSection errorMessage="운동 기록 상세를 불러오지 못했어요.">
      <WorkoutRecordDetailContent recordId={recordId} />
    </SuspenseSection>
  );
}

function WorkoutRecordDetailContent({ recordId }: { recordId: string }) {
  const navigation = useNavigation();
  const { data: record } = useWorkoutRecord(recordId);
  const deleteMutation = useDeleteWorkoutRecord();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(record.id);
    navigation.navigate({ name: '/exercise-list', params: {} });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>닫기</Text>
        </Pressable>
        <Text style={styles.headerTitle}>기록 상세</Text>
        <Pressable
          disabled={record.source !== 'manual'}
          onPress={() =>
            navigation.navigate({
              name: '/exercise-form',
              params: {
                recordId: record.id,
              },
            })
          }
          style={styles.headerButton}
        >
          <Text
            style={[
              styles.headerButtonText,
              record.source !== 'manual' && styles.disabledText,
            ]}
          >
            수정
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.kind}>{getWorkoutRecordKindLabel(record)}</Text>
          <Text style={styles.title}>{getWorkoutRecordTitle(record)}</Text>
          <Text style={styles.date}>{record.performedOn}</Text>
        </View>

        <View style={styles.metricGrid}>
          <Metric
            label="운동 시간"
            value={formatDurationSeconds(record.durationSeconds)}
          />
          <Metric label="총 볼륨" value={formatWorkoutVolume(record)} />
          <Metric
            label="유산소"
            value={formatDurationSeconds(
              record.summary.cardioDurationSeconds ?? 0,
            )}
          />
          <Metric
            label="근력 세트"
            value={`${record.summary.strengthSetCount ?? 0}세트`}
          />
        </View>

        {record.manualDetail?.strengthExercises?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>근력 운동</Text>
            {record.manualDetail.strengthExercises.map((exercise) => (
              <View key={exercise.name} style={styles.exerciseBox}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                {exercise.sets.map((set, index) => (
                  <Text
                    key={`${exercise.name}-${index}`}
                    style={styles.setLine}
                  >
                    {index + 1}세트 · {set.weightKg ?? 0}kg · {set.reps ?? 0}회
                    {set.rir !== undefined ? ` · RIR ${set.rir}` : ''}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {record.steps.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>루틴 항목</Text>
            {record.steps.map((step) => (
              <View key={step.name} style={styles.exerciseBox}>
                <Text style={styles.exerciseName}>{step.name}</Text>
                <Text style={styles.setLine}>
                  {step.detail} · {step.completed ? '완료' : '미완료'}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {record.bodyComposition ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>체성분</Text>
            <View style={styles.metricGrid}>
              <Metric
                label="아침 체중"
                value={
                  record.bodyComposition.morningWeightKg ??
                  record.bodyComposition.weightKg
                    ? `${record.bodyComposition.morningWeightKg ?? record.bodyComposition.weightKg}kg`
                    : '-'
                }
              />
              <Metric
                label="저녁 체중"
                value={
                  record.bodyComposition.eveningWeightKg
                    ? `${record.bodyComposition.eveningWeightKg}kg`
                    : '-'
                }
              />
              <Metric
                label="골격근"
                value={
                  record.bodyComposition.skeletalMuscleMassKg
                    ? `${record.bodyComposition.skeletalMuscleMassKg}kg`
                    : '-'
                }
              />
              <Metric
                label="체지방"
                value={
                  record.bodyComposition.bodyFatKg
                    ? `${record.bodyComposition.bodyFatKg}kg`
                    : '-'
                }
              />
              <Metric
                label="체지방률"
                value={
                  record.bodyComposition.bodyFatPercentage
                    ? `${record.bodyComposition.bodyFatPercentage}%`
                    : '-'
                }
              />
            </View>
          </View>
        ) : null}

        {record.manualDetail?.sleep ||
        record.manualDetail?.condition ||
        record.manualDetail?.activityLevel ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>컨디션 체크</Text>
            <View style={styles.metricGrid}>
              <Metric
                label="수면"
                value={record.manualDetail?.sleep || '-'}
              />
              <Metric
                label="컨디션"
                value={record.manualDetail?.condition || '-'}
              />
              <Metric
                label="활동 강도"
                value={record.manualDetail?.activityLevel || '-'}
              />
            </View>
          </View>
        ) : null}

        {record.manualDetail?.meals?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>식단 체크</Text>
            {record.manualDetail.meals.map((meal, index) => (
              <Text key={`meal-${index}`} style={styles.memo}>
                MEAL {index + 1} · {meal}
              </Text>
            ))}
          </View>
        ) : null}

        {record.manualDetail?.dailyReport || record.manualDetail?.memo ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>하루 일과 보고</Text>
            <Text style={styles.memo}>
              {record.manualDetail?.dailyReport ?? record.manualDetail?.memo}
            </Text>
          </View>
        ) : null}

        <Pressable
          disabled={deleteMutation.isPending}
          onPress={handleDelete}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteText}>
            {deleteMutation.isPending ? '삭제 중' : '삭제'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
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
  date: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
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
  disabledText: {
    color: Colors.textMuted,
  },
  exerciseBox: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 10,
    gap: 6,
    padding: 12,
  },
  exerciseName: {
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
    minWidth: 44,
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
  hero: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    padding: 16,
  },
  kind: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  memo: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  metric: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    gap: 4,
    minWidth: '30%',
    padding: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  metricValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  section: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
    padding: 14,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  setLine: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Pretendard-Bold',
    fontSize: 22,
  },
});
