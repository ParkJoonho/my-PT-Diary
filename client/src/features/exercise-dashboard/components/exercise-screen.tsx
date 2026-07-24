import { useNavigation } from '@granite-js/react-native';
import { useConditionRecords } from 'features/condition-records/api/condition-records';
import { HomeTabBar } from 'features/home/components/home-tab-bar';
import { useWorkoutRecords } from 'features/workout-records/api/workout-records';
import { WorkoutRecordCard } from 'features/workout-records/components/workout-record-card';
import { useWorkoutReportSummary } from 'features/workout-reports/api/workout-report-summary';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConditionRecordDto } from 'shared/api/generated/models';
import { SuspenseSection } from 'shared/components/async-state';
import Colors from 'shared/constants/colors';
import { getClientTodayDate } from 'shared/lib/date';
import {
  getConditionScoreColor,
  getConditionScoreLabel,
  getSorenessScoreColor,
  getSorenessScoreLabel,
} from 'features/condition-records/lib/condition-record-metadata';

export function ExerciseScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
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
          <Text
            onPress={() => navigation.navigate({ name: '/exercise-list', params: {} })}
            style={styles.linkText}
          >
            전체 기록보기
          </Text>
        </View>
        <SuspenseSection errorMessage="오늘 운동을 불러오지 못했어요.">
          <TodayWorkoutSection />
        </SuspenseSection>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘의 컨디션</Text>
          <Text
            onPress={() => navigation.navigate({ name: '/condition-list', params: {} })}
            style={styles.linkText}
          >
            전체 기록보기
          </Text>
        </View>
        <SuspenseSection errorMessage="오늘 컨디션을 불러오지 못했어요.">
          <TodayConditionSection />
        </SuspenseSection>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>운동 리포트</Text>
          <Text
            onPress={() => navigation.navigate({ name: '/progress-chart', params: {} })}
            style={styles.linkText}
          >
            전체 보기
          </Text>
        </View>
        <SuspenseSection errorMessage="리포트 요약을 불러오지 못했어요.">
          <ReportSummarySection />
        </SuspenseSection>
      </ScrollView>

      <Pressable
        onPress={() => navigation.navigate({ name: '/exercise-form', params: {} })}
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
  const { data } = useWorkoutRecords({ from: today, source: 'manual', to: today });

  if (!data.length) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>오늘의 운동을 기록해보세요.</Text>
        <Pressable
          onPress={() => navigation.navigate({ name: '/exercise-form', params: {} })}
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
          onPress={() => navigation.navigate({ name: '/condition-form', params: {} })}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>+컨디션 체크</Text>
        </Pressable>
      </View>
    );
  }

  return <TodayConditionCard record={data[0]!} />;
}

function ReportSummarySection() {
  const { data } = useWorkoutReportSummary();

  return (
    <View style={styles.reportCard}>
      <Metric label="총 운동 횟수" value={`${data.totals.workoutRecordCount}`} />
      <View style={styles.reportDivider} />
      <Metric label="총 볼륨 (kg)" value={`${data.totals.totalVolumeKg.toLocaleString()}`} />
      <View style={styles.reportDivider} />
      <Metric label="컨디션 체크" value={`${data.totals.conditionRecordCount}`} />
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
            <Text style={styles.todayConditionValue}>{mainCondition.score.toFixed(1)}</Text>
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
            <Text style={styles.todayConditionValue}>{mainSoreness.score.toFixed(1)}</Text>
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
    <View style={[styles.todayConditionBadge, { backgroundColor: `${color}20` }]}>
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
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    padding: 16,
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
  metric: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    textAlign: 'center',
  },
  metricValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-Bold',
    fontSize: 18,
  },
  reportCard: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  reportDivider: {
    backgroundColor: Colors.divider,
    marginHorizontal: 12,
    width: 1,
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
    borderWidth: 1,
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
  title: {
    color: Colors.text,
    fontFamily: 'Pretendard-Bold',
    fontSize: 24,
  },
});
