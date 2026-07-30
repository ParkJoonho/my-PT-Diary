import { useNavigation } from '@granite-js/react-native';
import { useQueryClient } from '@tanstack/react-query';
import {
  getConditionRecordsQueryKeyPrefix,
  useConditionRecords,
} from 'features/condition-records/api/condition-records';
import {
  getWorkoutRecordsQueryKeyPrefix,
  useWorkoutRecords,
} from 'features/workout-records/api/workout-records';
import { getWorkoutRecordRoute } from 'features/workout-records/lib/get-workout-record-route';
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
import { useTrackerUserKey } from 'shared/api/user-key';
import { SuspenseSection } from 'shared/components/async-state';
import {
  OriginalAppIcon,
  SemanticIcon,
} from 'shared/components/icons/pt-diary-icons';
import { TabPageLayout } from 'shared/components/tab-page-layout';
import Colors, { iosShadow } from 'shared/constants/colors';
import { ptTypography } from 'shared/constants/typography';
import { getClientTodayDate } from 'shared/lib/date';
import {
  DashboardConditionCard,
  DashboardReportSummaryCard,
  DashboardWorkoutRecordCard,
} from './dashboard-cards';

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
    <TabPageLayout activeKey="exercise">
      {({ contentBottomInset, floatingActionBottomInset }) => (
        <>
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingBottom: contentBottomInset },
            ]}
            refreshControl={
              <RefreshControl
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>오늘의 운동</Text>
                <SeeAllLink
                  onPress={() =>
                    navigation.navigate({ name: '/exercise-list', params: {} })
                  }
                />
              </View>
              <SuspenseSection errorMessage="오늘 운동을 불러오지 못했어요.">
                <TodayWorkoutSection />
              </SuspenseSection>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>오늘의 컨디션</Text>
                <SeeAllLink
                  onPress={() =>
                    navigation.navigate({
                      name: '/condition-list',
                      params: {},
                    })
                  }
                />
              </View>
              <SuspenseSection errorMessage="오늘 컨디션을 불러오지 못했어요.">
                <TodayConditionSection />
              </SuspenseSection>
            </View>

            <SuspenseSection errorMessage="리포트를 불러오지 못했어요.">
              <InlineReportSection />
            </SuspenseSection>
          </ScrollView>

          <Pressable
            onPress={() =>
              navigation.navigate({ name: '/exercise-form', params: {} })
            }
            style={[styles.fab, { bottom: floatingActionBottomInset }]}
          >
            <OriginalAppIcon color={Colors.white} name="add" size={28} />
          </Pressable>
        </>
      )}
    </TabPageLayout>
  );
}

function SeeAllLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.seeAllButton}>
      <Text style={styles.linkText}>전체 기록보기</Text>
      <SemanticIcon color={Colors.textMuted} name="chevronRight" size={13} />
    </Pressable>
  );
}

function TodayWorkoutSection() {
  const today = getClientTodayDate();
  const navigation = useNavigation();
  const { data } = useWorkoutRecords({
    from: today,
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
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>+운동 기록하기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.cardList}>
      {data.map((record) => (
        <DashboardWorkoutRecordCard
          key={record.id}
          onPress={() => navigation.navigate(getWorkoutRecordRoute(record))}
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
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>+컨디션 체크</Text>
        </Pressable>
      </View>
    );
  }

  const latestRecord = data[0];

  if (!latestRecord) {
    return null;
  }

  return <DashboardConditionCard record={latestRecord} />;
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

      <DashboardReportSummaryCard
        conditionCount={formatReportNumber(data.totals.conditionRecordCount)}
        totalVolume={formatReportNumber(data.totals.totalVolumeKg)}
        workoutCount={formatReportNumber(data.totals.workoutRecordCount)}
      />

      <WorkoutReportChartSection summary={data} variant="embedded" />
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  actionButtonText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
    lineHeight: 16,
  },
  cardList: {
    gap: 10,
  },
  content: {
    gap: 0,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  emptyCard: {
    ...iosShadow,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  fab: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 26,
    elevation: 8,
    height: 52,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    shadowColor: Colors.accent,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    width: 52,
  },
  linkText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  reportSection: {
    marginBottom: 20,
    marginTop: 10,
  },
  reportSubtitle: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    marginBottom: 14,
  },
  seeAllButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: Colors.text,
    ...ptTypography.sectionTitle,
  },
});
