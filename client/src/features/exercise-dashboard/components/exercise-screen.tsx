import { useNavigation } from '@granite-js/react-native';
import { useQueryClient } from '@tanstack/react-query';
import {
  getConditionRecordsQueryKeyPrefix,
  useConditionRecords,
} from 'features/condition-records/api/condition-records';
import {
  getConditionScoreColor,
  getConditionScoreLabel,
  getSorenessScoreColor,
  getSorenessScoreLabel,
} from 'features/condition-records/lib/condition-record-metadata';
import { HomeTabBar } from 'features/home/components/home-tab-bar';
import {
  getWorkoutRecordsQueryKeyPrefix,
  useWorkoutRecords,
} from 'features/workout-records/api/workout-records';
import { WorkoutRecordCard } from 'features/workout-records/components/workout-record-card';
import {
  getWorkoutReportSummaryQueryKeyPrefix,
  useWorkoutReportSummary,
} from 'features/workout-reports/api/workout-report-summary';
import { formatReportNumber } from 'features/workout-reports/components/report-format';
import { WorkoutReportChartSection } from 'features/workout-reports/components/workout-report-chart-section';
import { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ConditionRecordDto } from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';
import { SuspenseSection } from 'shared/components/async-state';
import Colors, { iosShadow } from 'shared/constants/colors';
import { getClientTodayDate } from 'shared/lib/date';

export function ExerciseScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getWorkoutRecordsQueryKeyPrefix(userKey),
        }),
        queryClient.invalidateQueries({
          queryKey: getConditionRecordsQueryKeyPrefix(userKey),
        }),
        queryClient.invalidateQueries({
          queryKey: getWorkoutReportSummaryQueryKeyPrefix(userKey),
        }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl onRefresh={handleRefresh} refreshing={refreshing} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>기록</Text>
            <Text style={styles.title}>운동 기록</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘의 운동</Text>
          <Pressable
            onPress={() =>
              navigation.navigate({ name: '/exercise-list', params: {} })
            }
          >
            <Text style={styles.linkText}>전체 기록보기</Text>
          </Pressable>
        </View>
        <SuspenseSection errorMessage="오늘 운동을 불러오지 못했어요.">
          <TodayWorkoutSection />
        </SuspenseSection>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘의 컨디션</Text>
          <Pressable
            onPress={() =>
              navigation.navigate({ name: '/condition-list', params: {} })
            }
          >
            <Text style={styles.linkText}>전체 기록보기</Text>
          </Pressable>
        </View>
        <SuspenseSection errorMessage="오늘 컨디션을 불러오지 못했어요.">
          <TodayConditionSection />
        </SuspenseSection>

        <SuspenseSection errorMessage="리포트를 불러오지 못했어요.">
          <InlineReportSection />
        </SuspenseSection>
      </ScrollView>

      <Pressable
        onPress={() =>
          navigation.navigate({ name: '/exercise-form', params: {} })
        }
        style={styles.fab}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
      <HomeTabBar activeKey="exercise" />
    </View>
  );
}

function TodayWorkoutSection() {
  const today = getClientTodayDate();
  const navigation = useNavigation();
  const { data } = useWorkoutRecords({
    from: today,
    source: 'manual',
    to: today,
  });

  if (!data.length) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>오늘의 운동을 기록해보세요.</Text>
        <Pressable
          onPress={() =>
            navigation.navigate({ name: '/exercise-form', params: {} })
          }
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>+운동 기록하기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      {data.map((record) => (
        <WorkoutRecordCard
          key={record.id}
          onPress={() =>
            navigation.navigate({
              name: '/exercise-form',
              params: {
                recordId: record.id,
              },
            })
          }
          record={record}
        />
      ))}
    </View>
  );
}

function TodayConditionSection() {
  const today = getClientTodayDate();
  const navigation = useNavigation();
  const { data } = useConditionRecords({ from: today, to: today });

  if (!data.length) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>오늘 컨디션을 체크해보세요.</Text>
        <Pressable
          onPress={() =>
            navigation.navigate({ name: '/condition-form', params: {} })
          }
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>+컨디션 체크</Text>
        </Pressable>
      </View>
    );
  }

  return <TodayConditionCard record={data[0]!} />;
}

function InlineReportSection() {
  const { data } = useWorkoutReportSummary();

  return (
    <View style={styles.reportSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>운동 리포트</Text>
      </View>
      <Text style={styles.reportSubtitle}>
        누적된 데이터로 변화를 확인해보세요.
      </Text>

      <View style={styles.reportMetricRow}>
        <SummaryMetricCard
          accentColor={Colors.accent}
          label="총 운동 횟수"
          value={formatReportNumber(data.manualTotals.workoutRecordCount)}
        />
        <SummaryMetricCard
          accentColor={Colors.info}
          label="총 볼륨 (kg)"
          value={formatReportNumber(data.manualTotals.totalVolumeKg)}
        />
        <SummaryMetricCard
          accentColor={Colors.success}
          label="컨디션 체크"
          value={formatReportNumber(data.totals.conditionRecordCount)}
        />
      </View>

      <WorkoutReportChartSection summary={data} />
    </View>
  );
}

function SummaryMetricCard({
  accentColor,
  label,
  value,
}: {
  accentColor: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.reportMetricCard}>
      <View
        style={[
          styles.reportMetricAccent,
          { backgroundColor: `${accentColor}18` },
        ]}
      >
        <View
          style={[styles.reportMetricDot, { backgroundColor: accentColor }]}
        />
      </View>
      <Text style={styles.reportMetricValue}>{value}</Text>
      <Text style={styles.reportMetricLabel}>{label}</Text>
    </View>
  );
}

function TodayConditionCard({ record }: { record: ConditionRecordDto }) {
  const mainCondition = record.conditions[0] ?? null;
  const mainSoreness = record.muscleSoreness[0] ?? null;
  const soreParts = record.muscleSoreness.filter((item) => item.score > 0);

  return (
    <View style={styles.todayConditionCard}>
      <View style={styles.todayConditionMetric}>
        <Text style={styles.todayConditionLabel}>컨디션</Text>
        {mainCondition ? (
          <View style={styles.todayConditionValueRow}>
            <Text style={styles.todayConditionValue}>
              {mainCondition.score.toFixed(1)}
            </Text>
            <Badge
              color={getConditionScoreColor(mainCondition.score)}
              label={getConditionScoreLabel(mainCondition.score)}
            />
          </View>
        ) : (
          <Text style={styles.todayConditionValue}>-</Text>
        )}
      </View>

      <View style={styles.todayConditionDivider} />

      <View style={styles.todayConditionMetric}>
        <Text style={styles.todayConditionLabel}>근육통</Text>
        {mainSoreness ? (
          <View style={styles.todayConditionValueRow}>
            <Text style={styles.todayConditionValue}>
              {mainSoreness.score.toFixed(1)}
            </Text>
            <Badge
              color={getSorenessScoreColor(mainSoreness.score)}
              label={getSorenessScoreLabel(mainSoreness.score)}
            />
          </View>
        ) : (
          <Text style={styles.todayConditionValue}>-</Text>
        )}
      </View>

      <View style={styles.todayConditionDivider} />

      <View style={styles.todayConditionMetric}>
        <Text style={styles.todayConditionLabel}>근육통 부위</Text>
        <Text numberOfLines={1} style={styles.todayConditionValue}>
          {soreParts.length > 0
            ? soreParts.length === 1
              ? soreParts[0]?.label
              : `${soreParts[0]?.label ?? ''} +${soreParts.length - 1}`
            : '-'}
        </Text>
      </View>
    </View>
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <View
      style={[styles.todayConditionBadge, { backgroundColor: `${color}20` }]}
    >
      <Text style={[styles.todayConditionBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    gap: 18,
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  emptyCard: {
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    padding: 18,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
  },
  eyebrow: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 26,
    bottom: 96,
    height: 52,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    width: 52,
  },
  fabText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Bold',
    fontSize: 28,
    lineHeight: 30,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  reportMetricAccent: {
    alignItems: 'center',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  reportMetricCard: {
    ...iosShadow,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    flex: 1,
    gap: 8,
    minHeight: 132,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  reportMetricDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  reportMetricLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    textAlign: 'center',
  },
  reportMetricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  reportMetricValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 19,
    textAlign: 'center',
  },
  reportSection: {
    gap: 12,
    marginTop: 6,
  },
  reportSubtitle: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: Colors.accentLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  secondaryButtonText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
  },
  stack: {
    gap: 0,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Pretendard-Bold',
    fontSize: 28,
    lineHeight: 34,
  },
  todayConditionBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  todayConditionBadgeText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  todayConditionCard: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  todayConditionDivider: {
    backgroundColor: Colors.divider,
    marginHorizontal: 10,
    width: 1,
  },
  todayConditionLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  todayConditionMetric: {
    flex: 1,
  },
  todayConditionValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    marginTop: 6,
  },
  todayConditionValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
});
