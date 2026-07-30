import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { WorkoutRecordDto } from 'shared/api/generated/models';
import {
  OriginalAppIcon,
  type OriginalAppIconName,
} from 'shared/components/icons/pt-diary-icons';
import Colors, { iosShadow } from 'shared/constants/colors';
import { getExerciseNameSummary } from '../lib/manual-workout-form';
import {
  formatWorkoutDuration,
  formatWorkoutVolume,
} from '../lib/workout-record-format';

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
          icon="timeOutline"
          label="운동시간"
          value={formatWorkoutDuration(record)}
        />
        <View style={styles.metricDivider} />
        <Metric
          icon="run"
          label="운동종목"
          value={
            record.source === 'manual'
              ? getExerciseNameSummary(record)
              : (record.routineLabel ?? record.title ?? '-')
          }
        />
        <View style={styles.metricDivider} />
        <Metric
          icon="armFlexOutline"
          label="총 중량"
          value={formatWorkoutVolume(record)}
        />
      </View>
    </Pressable>
  );
}

function Metric({
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
      <View style={styles.metricTop}>
        <OriginalAppIcon color={Colors.textMuted} name={icon} size={13} />
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
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
  metricTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  metricValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  pressed: {
    opacity: 0.85,
  },
});
