import {
  getConditionBadge,
  getSorenessBadge,
} from 'features/condition-records/lib/condition-record-metadata';
import {
  formatWorkoutDuration,
  formatWorkoutVolume,
} from 'features/workout-records/lib/workout-record-format';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type {
  ConditionRecordDto,
  WorkoutRecordDto,
} from 'shared/api/generated/models';
import {
  OriginalAppIcon,
  type OriginalAppIconName,
} from 'shared/components/icons/pt-diary-icons';
import Colors, { iosShadow } from 'shared/constants/colors';

type DashboardWorkoutRecordCardProps = {
  onPress: () => void;
  record: WorkoutRecordDto;
};

export function DashboardWorkoutRecordCard({
  onPress,
  record,
}: DashboardWorkoutRecordCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.metricRow}>
        <DashboardMetric
          icon="timeOutline"
          label="운동시간"
          value={formatWorkoutDuration(record) || '-'}
        />
        <DashboardMetric
          icon="walkOutline"
          label="운동종목"
          value={getDashboardExerciseName(record)}
        />
        <DashboardMetric
          icon="barbellOutline"
          label="총 중량"
          value={formatWorkoutVolume(record)}
        />
      </View>
    </Pressable>
  );
}

export function DashboardConditionCard({
  record,
}: {
  record: ConditionRecordDto;
}) {
  const mainCondition = record.conditions[0];
  const mainSoreness = record.muscleSoreness[0];
  const soreParts = record.muscleSoreness.filter((item) => item.score > 0);

  return (
    <View style={styles.card}>
      <View style={styles.metricRow}>
        <ConditionMetric
          badge={
            mainCondition ? getConditionBadge(mainCondition.score) : undefined
          }
          icon="heartOutline"
          label="컨디션"
          value={mainCondition ? mainCondition.score.toFixed(1) : '-'}
        />
        <ConditionMetric
          badge={
            mainSoreness ? getSorenessBadge(mainSoreness.score) : undefined
          }
          icon="fitnessOutline"
          label="근육통"
          value={mainSoreness ? mainSoreness.score.toFixed(1) : '-'}
        />
        <DashboardMetric
          icon="bodyOutline"
          label="근육통 부위"
          value={formatSoreParts(soreParts)}
        />
      </View>
    </View>
  );
}

type DashboardReportSummaryCardProps = {
  conditionCount: string;
  totalVolume: string;
  workoutCount: string;
};

export function DashboardReportSummaryCard({
  conditionCount,
  totalVolume,
  workoutCount,
}: DashboardReportSummaryCardProps) {
  return (
    <View style={styles.reportCard}>
      <ReportMetric
        color={Colors.accent}
        icon="barbellOutline"
        label="총 운동 횟수"
        value={workoutCount}
      />
      <View style={styles.reportDivider} />
      <ReportMetric
        color={Colors.info}
        icon="fitnessOutline"
        label="총 볼륨 (kg)"
        value={totalVolume}
      />
      <View style={styles.reportDivider} />
      <ReportMetric
        color={Colors.success}
        icon="heartOutline"
        label="컨디션 체크"
        value={conditionCount}
      />
    </View>
  );
}

function DashboardMetric({
  icon,
  label,
  value,
}: {
  icon: OriginalAppIconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <OriginalAppIcon color={Colors.textMuted} name={icon} size={13} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.metricValue}>
        {value}
      </Text>
    </View>
  );
}

function ConditionMetric({
  badge,
  icon,
  label,
  value,
}: {
  badge?: { color: string; label: string };
  icon: OriginalAppIconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <OriginalAppIcon color={Colors.textMuted} name={icon} size={13} />
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.conditionValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        {badge && value !== '-' ? (
          <View
            style={[
              styles.conditionBadge,
              { backgroundColor: `${badge.color}20` },
            ]}
          >
            <Text style={[styles.conditionBadgeText, { color: badge.color }]}>
              {badge.label}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ReportMetric({
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
    <View style={styles.reportMetric}>
      <View style={[styles.reportIconWrap, { backgroundColor: `${color}18` }]}>
        <OriginalAppIcon color={color} name={icon} size={22} />
      </View>
      <Text style={styles.reportValue}>{value}</Text>
      <Text style={styles.reportLabel}>{label}</Text>
    </View>
  );
}

function getDashboardExerciseName(record: WorkoutRecordDto) {
  if (record.source !== 'manual') {
    return record.routineLabel ?? record.title ?? '-';
  }

  const exercises = record.manualDetail?.strengthExercises ?? [];
  if (!exercises.length) {
    return record.manualDetail?.cardio ? '유산소 운동' : '-';
  }

  return exercises.length === 1
    ? (exercises[0]?.name ?? '-')
    : `${exercises[0]?.name ?? '-'} 외 ${exercises.length - 1}개`;
}

function formatSoreParts(soreParts: ConditionRecordDto['muscleSoreness']) {
  if (!soreParts.length) {
    return '-';
  }

  return soreParts.length === 1
    ? (soreParts[0]?.label ?? '-')
    : `${soreParts[0]?.label ?? '-'} +${soreParts.length - 1}`;
}

const styles = StyleSheet.create({
  card: {
    ...iosShadow,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  conditionBadge: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  conditionBadgeText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 10,
  },
  conditionValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  metric: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 4,
    paddingHorizontal: 4,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 10,
  },
  metricRow: {
    flexDirection: 'row',
  },
  metricValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.85,
  },
  reportCard: {
    ...iosShadow,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 16,
  },
  reportDivider: {
    backgroundColor: Colors.cardBorder,
    height: 48,
    width: 1,
  },
  reportIconWrap: {
    alignItems: 'center',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  reportLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    textAlign: 'center',
  },
  reportMetric: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  reportValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
  },
});
