import { useNavigation } from '@granite-js/react-native';
import { Suspense } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AsyncErrorBoundary } from 'shared/components/async-state';
import {
  OriginalAppIcon,
  type OriginalAppIconName,
  SemanticIcon,
} from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import { useWorkoutReportSummary } from '../api/workout-report-summary';
import { formatReportCompactNumber, formatReportNumber } from './report-format';
import { WorkoutReportChartSection } from './workout-report-chart-section';

export function WorkoutReportScreen({
  contentBottomInset,
}: {
  contentBottomInset: number;
}) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.headerSide}
        >
          <SemanticIcon color={Colors.text} name="chevronLeft" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>피트니스 프로그레스</Text>
        <View style={styles.headerSide} />
      </View>

      <View style={styles.contentArea}>
        <AsyncErrorBoundary message="운동 리포트를 불러오지 못했어요.">
          <Suspense fallback={<WorkoutReportLoading />}>
            <WorkoutReportContent contentBottomInset={contentBottomInset} />
          </Suspense>
        </AsyncErrorBoundary>
      </View>
    </View>
  );
}

function WorkoutReportContent({
  contentBottomInset,
}: {
  contentBottomInset: number;
}) {
  const { data } = useWorkoutReportSummary();

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: contentBottomInset }}
      showsVerticalScrollIndicator={false}
      style={styles.scrollView}
    >
      <View style={styles.summaryRow}>
        <SummaryCard
          color={Colors.accent}
          icon="fitness"
          label="총 운동 횟수"
          value={formatReportNumber(data.totals.workoutRecordCount)}
        />
        <SummaryCard
          color={Colors.info}
          icon="weightLifter"
          label="총 볼륨 (kg)"
          value={formatReportCompactNumber(data.totals.totalVolumeKg)}
        />
        <SummaryCard
          color={Colors.success}
          icon="calendar"
          label="컨디션 체크"
          value={formatReportNumber(data.totals.conditionRecordCount)}
        />
      </View>

      <WorkoutReportChartSection summary={data} />
    </ScrollView>
  );
}

function WorkoutReportLoading() {
  return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator color={Colors.accent} size="large" />
      <Text style={styles.loadingText}>데이터 로딩 중...</Text>
    </View>
  );
}

function SummaryCard({
  color,
  icon,
  label,
  value,
}: {
  color: string;
  icon: OriginalAppIconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <OriginalAppIcon color={color} name={icon} size={20} />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSide: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loadingWrap: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    padding: 14,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
});
