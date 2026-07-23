import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ConditionRecordDto } from 'shared/api/generated/models';
import Colors from 'shared/constants/colors';
import {
  getConditionScoreLabel,
  getSorenessScoreLabel,
} from '../lib/condition-form';

export function ConditionRecordCard({
  onPress,
  record,
}: {
  onPress?: () => void;
  record: ConditionRecordDto;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{record.checkedOn}</Text>
          <Text style={styles.subtitle}>
            컨디션 {formatScore(record.summary.averageConditionScore)} · 근육통{' '}
            {formatScore(record.summary.averageSorenessScore)}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {getConditionScoreLabel(
              Math.round(record.summary.averageConditionScore ?? 0),
            )}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <Metric
          label="에너지"
          value={getConditionScoreLabel(record.conditionScores.energy)}
        />
        <Metric
          label="수면"
          value={getConditionScoreLabel(record.conditionScores.sleep)}
        />
        <Metric
          label="하체"
          value={getSorenessScoreLabel(record.muscleSoreness.legs)}
        />
      </View>
      {record.memo ? <Text style={styles.memo}>{record.memo}</Text> : null}
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

function formatScore(value: number | null | undefined) {
  return typeof value === 'number' ? value.toFixed(1) : '-';
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
  memo: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
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
  metricValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.78,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  subtitle: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
});
