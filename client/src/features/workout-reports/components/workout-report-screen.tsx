import { useNavigation } from '@granite-js/react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SuspenseSection } from 'shared/components/async-state';
import Colors, { iosShadow } from 'shared/constants/colors';
import { useWorkoutReportSummary } from '../api/workout-report-summary';
import { formatReportCompactNumber, formatReportNumber } from './report-format';
import { WorkoutReportChartSection } from './workout-report-chart-section';

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>닫기</Text>
        </Pressable>
        <Text style={styles.headerTitle}>피트니스 프로그레스</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryRow}>
          <SummaryCard
            accentColor={Colors.accent}
            label="총 운동 횟수"
            value={formatReportNumber(data.totals.workoutRecordCount)}
          />
          <SummaryCard
            accentColor={Colors.info}
            label="총 볼륨 (kg)"
            value={formatReportCompactNumber(data.totals.totalVolumeKg)}
          />
          <SummaryCard
            accentColor={Colors.success}
            label="컨디션 체크"
            value={formatReportNumber(data.totals.conditionRecordCount)}
          />
        </View>

        <WorkoutReportChartSection summary={data} />
      </ScrollView>
    </View>
  );
}

function SummaryCard({
  accentColor,
  label,
  value,
}: {
  accentColor: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View
        style={[styles.summaryAccent, { backgroundColor: `${accentColor}18` }]}
      >
        <View
          style={[styles.summaryAccentDot, { backgroundColor: accentColor }]}
        />
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
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
    gap: 16,
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
  summaryAccent: {
    alignItems: 'center',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  summaryAccentDot: {
    borderRadius: 7,
    height: 14,
    width: 14,
  },
  summaryCard: {
    ...iosShadow,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    flex: 1,
    gap: 8,
    minHeight: 132,
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  summaryLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
  },
});
