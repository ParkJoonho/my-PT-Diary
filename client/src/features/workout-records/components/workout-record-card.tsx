import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { WorkoutRecordDto } from 'shared/api/generated/models';
import Colors, { iosShadow } from 'shared/constants/colors';
import {
  formatWorkoutDuration,
  formatWorkoutVolume,
  getWorkoutRecordSummaryLine,
} from '../lib/workout-record-format';
import { getExerciseNameSummary } from '../lib/manual-workout-form';

type WorkoutRecordCardProps = {
  onLongPress?: () => void;
  onPress?: () => void;
  record: WorkoutRecordDto;
};

export function WorkoutRecordCard({
  onLongPress,
  onPress,
  record,
}: WorkoutRecordCardProps) {
  return (
    <Pressable
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.metricRow}>
        <Metric
          label="운동시간"
          value={formatWorkoutDuration(record)}
        />
        <View style={styles.metricDivider} />
        <Metric
          label="운동종목"
          value={
            record.source === 'manual'
              ? getExerciseNameSummary(record)
              : record.routineLabel ?? record.title ?? '-'
          }
        />
        <View style={styles.metricDivider} />
        <Metric label="총 중량" value={formatWorkoutVolume(record)} />
      </View>
      {record.source === 'manual' ? (
        <Text style={styles.summary} numberOfLines={2}>
          {getWorkoutRecordSummaryLine(record)}
        </Text>
      ) : null}
    </Pressable>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.metricValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...iosShadow,
    backgroundColor: Colors.card,
    borderRadius: 14,
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  metric: {
    flex: 1,
    gap: 6,
  },
  metricDivider: {
    backgroundColor: Colors.divider,
    height: 36,
    marginHorizontal: 12,
    width: 1,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  metricRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  metricValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  pressed: {
    opacity: 0.85,
  },
  summary: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
});
