import { useNavigation } from '@granite-js/react-native';
import { useConditionRecords } from 'features/condition-records/api/condition-records';
import { useWorkoutRecords } from 'features/workout-records/api/workout-records';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SuspenseSection } from 'shared/components/async-state';
import Colors from 'shared/constants/colors';
import { useWorkoutReportSummary } from '../api/workout-report-summary';
import {
  buildBodyCompositionTrend,
  buildConditionTrend,
  buildVolumeTrend,
  formatNullableScore,
  formatReportDuration,
  formatReportNumber,
  formatReportVolume,
} from './report-format';

export function WorkoutReportScreen() {
  return (
    <SuspenseSection errorMessage="운동 리포트를 불러오지 못했어요.">
      <WorkoutReportContent />
    </SuspenseSection>
  );
}

function WorkoutReportContent() {
  const navigation = useNavigation();
  const { data } = useWorkoutReportSummary();
  const { data: workoutRecords } = useWorkoutRecords();
  const { data: conditionRecords } = useConditionRecords();
  const volumeTrend = buildVolumeTrend(workoutRecords);
  const conditionTrend = buildConditionTrend(conditionRecords);
  const bodyCompositionTrend = buildBodyCompositionTrend(workoutRecords);
  const maxWeeklyCount = Math.max(
    1,
    ...data.weeklyFrequency.map((week) => week.workoutRecordCount),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>닫기</Text>
        </Pressable>
        <Text style={styles.headerTitle}>운동 리포트</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>누적 요약</Text>
          <View style={styles.metricGrid}>
            <Metric
              label="운동 기록"
              value={formatReportNumber(data.totals.workoutRecordCount)}
            />
            <Metric
              label="운동일"
              value={formatReportNumber(data.totals.workoutDayCount)}
            />
            <Metric
              label="총 볼륨"
              value={formatReportVolume(data.totals.totalVolumeKg)}
            />
            <Metric
              label="유산소"
              value={formatReportDuration(data.totals.cardioDurationSeconds)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이번 주</Text>
          <Text style={styles.period}>
            {data.currentWeek.weekStartDate} ~ {data.currentWeek.weekEndDate}
          </Text>
          <View style={styles.metricGrid}>
            <Metric
              label="기록"
              value={`${data.currentWeek.workoutRecordCount}회`}
            />
            <Metric
              label="운동일"
              value={`${data.currentWeek.workoutDayCount}일`}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>컨디션</Text>
          <View style={styles.metricGrid}>
            <Metric
              label="평균 컨디션"
              value={formatNullableScore(data.condition.averageConditionScore)}
            />
            <Metric
              label="평균 근육통"
              value={formatNullableScore(data.condition.averageSorenessScore)}
            />
            <Metric
              label="체크 수"
              value={`${data.totals.conditionRecordCount}회`}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주간 빈도</Text>
          <View style={styles.chart}>
            {data.weeklyFrequency.map((week) => {
              const height = Math.max(
                8,
                Math.round((week.workoutRecordCount / maxWeeklyCount) * 72),
              );

              return (
                <View key={week.weekStartDate} style={styles.barGroup}>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height }]} />
                  </View>
                  <Text style={styles.barLabel}>{week.workoutRecordCount}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <TrendSection
          emptyLabel="볼륨 기록이 아직 없어요."
          maxValue={Math.max(1, ...volumeTrend.map((item) => item.value))}
          title="볼륨 추이"
          unit="kg"
          values={volumeTrend}
        />

        <TrendSection
          emptyLabel="컨디션 점수 기록이 아직 없어요."
          maxValue={5}
          title="컨디션 추이"
          values={conditionTrend}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>체성분 추이</Text>
          {bodyCompositionTrend.length ? (
            <View style={styles.bodyRows}>
              {bodyCompositionTrend.map((item) => (
                <View key={item.date} style={styles.bodyRow}>
                  <Text style={styles.bodyDate}>{item.date}</Text>
                  <Text style={styles.bodyValue}>{item.weightKg}kg</Text>
                  <Text style={styles.bodyMeta}>
                    골격근 {item.skeletalMuscleMassKg ?? '-'}kg · 체지방{' '}
                    {item.bodyFatPercentage ?? '-'}%
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>체성분 기록이 아직 없어요.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function TrendSection({
  emptyLabel,
  maxValue,
  title,
  unit = '',
  values,
}: {
  emptyLabel: string;
  maxValue: number;
  title: string;
  unit?: string;
  values: { date: string; value: number }[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {values.length ? (
        <View style={styles.chart}>
          {values.map((item) => {
            const height = Math.max(
              8,
              Math.round((item.value / maxValue) * 72),
            );

            return (
              <View key={item.date} style={styles.barGroup}>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, { height }]} />
                </View>
                <Text style={styles.barLabel}>
                  {item.value}
                  {unit}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      )}
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
  bar: {
    backgroundColor: Colors.accent,
    borderRadius: 999,
    width: 12,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  barLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 10,
  },
  barTrack: {
    alignItems: 'center',
    height: 76,
    justifyContent: 'flex-end',
  },
  bodyDate: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  bodyMeta: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  bodyRow: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 10,
    gap: 4,
    padding: 10,
  },
  bodyRows: {
    gap: 8,
  },
  bodyValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-Bold',
    fontSize: 17,
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 4,
  },
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
  emptyText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  metric: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 10,
    flex: 1,
    gap: 4,
    minWidth: '46%',
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
    fontSize: 17,
  },
  period: {
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
