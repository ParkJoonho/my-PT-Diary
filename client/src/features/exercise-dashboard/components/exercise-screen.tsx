import { useNavigation } from '@granite-js/react-native';
import { useConditionRecords } from 'features/condition-records/api/condition-records';
import { ConditionRecordCard } from 'features/condition-records/components/condition-record-card';
import { HomeTabBar } from 'features/home/components/home-tab-bar';
import { useWorkoutRecords } from 'features/workout-records/api/workout-records';
import { WorkoutRecordCard } from 'features/workout-records/components/workout-record-card';
import { useWorkoutReportSummary } from 'features/workout-reports/api/workout-report-summary';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SuspenseSection } from 'shared/components/async-state';
import Colors from 'shared/constants/colors';
import { getClientTodayDate } from 'shared/lib/date';

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
          <Pressable
            onPress={() =>
              navigation.navigate({ name: '/exercise-form', params: {} })
            }
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>운동 작성</Text>
          </Pressable>
        </View>

        <SuspenseSection errorMessage="리포트 요약을 불러오지 못했어요.">
          <ReportSummarySection />
        </SuspenseSection>

        <View style={styles.quickGrid}>
          <QuickButton
            label="전체 운동"
            onPress={() =>
              navigation.navigate({ name: '/exercise-list', params: {} })
            }
          />
          <QuickButton
            label="컨디션"
            onPress={() =>
              navigation.navigate({ name: '/condition-list', params: {} })
            }
          />
          <QuickButton
            label="리포트"
            onPress={() =>
              navigation.navigate({ name: '/progress-chart', params: {} })
            }
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘 운동</Text>
          <Text
            onPress={() =>
              navigation.navigate({ name: '/exercise-list', params: {} })
            }
            style={styles.linkText}
          >
            전체
          </Text>
        </View>
        <SuspenseSection errorMessage="오늘 운동을 불러오지 못했어요.">
          <TodayWorkoutSection />
        </SuspenseSection>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘 컨디션</Text>
          <Text
            onPress={() =>
              navigation.navigate({ name: '/condition-form', params: {} })
            }
            style={styles.linkText}
          >
            체크
          </Text>
        </View>
        <SuspenseSection errorMessage="오늘 컨디션을 불러오지 못했어요.">
          <TodayConditionSection />
        </SuspenseSection>
      </ScrollView>
      <HomeTabBar activeKey="exercise" />
    </View>
  );
}

function ReportSummarySection() {
  const { data } = useWorkoutReportSummary();

  return (
    <View style={styles.reportCard}>
      <Metric label="총 운동" value={`${data.totals.workoutRecordCount}회`} />
      <Metric label="이번 주" value={`${data.currentWeek.workoutDayCount}일`} />
      <Metric label="컨디션" value={`${data.totals.conditionRecordCount}회`} />
    </View>
  );
}

function TodayWorkoutSection() {
  const today = getClientTodayDate();
  const navigation = useNavigation();
  const { data } = useWorkoutRecords({ from: today, to: today });

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
          <Text style={styles.secondaryButtonText}>운동 기록하기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      {data.slice(0, 2).map((record) => (
        <WorkoutRecordCard
          key={record.id}
          onPress={() =>
            navigation.navigate({
              name: '/exercise-record-detail',
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
          <Text style={styles.secondaryButtonText}>컨디션 체크</Text>
        </Pressable>
      </View>
    );
  }

  const record = data[0];

  if (!record) {
    return null;
  }

  return (
    <ConditionRecordCard
      onPress={() =>
        navigation.navigate({
          name: '/condition-form',
          params: {
            conditionId: record.id,
          },
        })
      }
      record={record}
    />
  );
}

function QuickButton({
  label,
  onPress,
}: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.quickButton}>
      <Text style={styles.quickButtonText}>{label}</Text>
    </Pressable>
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
  },
  content: {
    gap: 12,
    paddingBottom: 104,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  emptyCard: {
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  metric: {
    flex: 1,
    gap: 4,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  metricValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-Bold',
    fontSize: 20,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  quickButton: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    paddingVertical: 13,
  },
  quickButtonText: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  reportCard: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  secondaryButton: {
    backgroundColor: Colors.accentLight,
    borderRadius: 9,
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
    marginTop: 4,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Bold',
    fontSize: 17,
  },
  stack: {
    gap: 10,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Pretendard-Bold',
    fontSize: 24,
  },
});
