import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { WorkoutRecordDto } from 'shared/api/generated/models';
import Colors from 'shared/constants/colors';
import {
  formatDurationSeconds,
  formatWorkoutCardio,
  formatWorkoutVolume,
  getWorkoutRecordKindLabel,
  getWorkoutRecordSummaryLine,
  getWorkoutRecordTitle,
} from '../lib/workout-record-format';

type WorkoutRecordCardProps = {
  record: WorkoutRecordDto;
  onPress?: () => void;
};

export function WorkoutRecordCard({ onPress, record }: WorkoutRecordCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{getWorkoutRecordTitle(record)}</Text>
          <Text style={styles.subtitle}>
            {record.performedOn} · {getWorkoutRecordKindLabel(record)}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {formatDurationSeconds(record.durationSeconds)}
          </Text>
        </View>
      </View>
      <Text style={styles.summary}>{getWorkoutRecordSummaryLine(record)}</Text>
      <View style={styles.metricRow}>
        <Metric label="볼륨" value={formatWorkoutVolume(record)} />
        <Metric label="유산소" value={formatWorkoutCardio(record)} />
        <Metric
          label="항목"
          value={
            record.source === 'routine'
              ? `${record.steps.length}개`
              : `${record.summary.strengthSetCount ?? 0}세트`
          }
        />
      </View>
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
  badge: {
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  card: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    padding: 14,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  metric: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 8,
    flex: 1,
    gap: 4,
    padding: 10,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.78,
  },
  subtitle: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  summary: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  titleGroup: {
    flex: 1,
    gap: 4,
  },
});
