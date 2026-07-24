import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ConditionRecordDto } from 'shared/api/generated/models';
import Colors from 'shared/constants/colors';
import {
  calculateAverageScore,
  getConditionBadge,
  getSorePartsText,
  getSorenessBadge,
} from '../lib/condition-record-metadata';

export function ConditionRecordCard({
  onLongPress,
  onPress,
  record,
}: {
  onLongPress?: () => void;
  onPress?: () => void;
  record: ConditionRecordDto;
}) {
  const averageConditionScore = calculateAverageScore(record.conditions);
  const averageSorenessScore = calculateAverageScore(record.muscleSoreness);
  const conditionBadge = getConditionBadge(averageConditionScore);
  const sorenessBadge = getSorenessBadge(averageSorenessScore);

  return (
    <Pressable
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.cardRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>컨디션</Text>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>
              {averageConditionScore > 0 ? averageConditionScore.toFixed(1) : '-'}
            </Text>
            {averageConditionScore > 0 ? (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: `${conditionBadge.color}22` },
                ]}
              >
                <Text style={[styles.badgeText, { color: conditionBadge.color }]}>
                  {conditionBadge.label}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>근육통</Text>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>
              {averageSorenessScore > 0 ? averageSorenessScore.toFixed(1) : '-'}
            </Text>
            {averageSorenessScore > 0 ? (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: `${sorenessBadge.color}22` },
                ]}
              >
                <Text style={[styles.badgeText, { color: sorenessBadge.color }]}>
                  {sorenessBadge.label}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>근육통 부위</Text>
          <Text numberOfLines={1} style={[styles.metricValue, styles.metricValueText]}>
            {getSorePartsText(record.muscleSoreness)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  card: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  divider: {
    backgroundColor: Colors.divider,
    height: 36,
    marginHorizontal: 10,
    marginTop: 4,
    width: 1,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  metricValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  metricValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  metricValueText: {
    marginTop: 6,
  },
  pressed: {
    opacity: 0.78,
  },
});
