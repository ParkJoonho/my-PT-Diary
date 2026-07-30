import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ConditionRecordDto } from 'shared/api/generated/models';
import {
  OriginalAppIcon,
  type OriginalAppIconName,
} from 'shared/components/icons/pt-diary-icons';
import Colors, { iosShadow } from 'shared/constants/colors';
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
          <MetricLabel icon="personOutline" label="컨디션" />
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>
              {averageConditionScore > 0
                ? averageConditionScore.toFixed(1)
                : '-'}
            </Text>
            {averageConditionScore > 0 ? (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: `${conditionBadge.color}22` },
                ]}
              >
                <Text
                  style={[styles.badgeText, { color: conditionBadge.color }]}
                >
                  {conditionBadge.label}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metric}>
          <MetricLabel icon="walkOutline" label="근육통" />
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
                <Text
                  style={[styles.badgeText, { color: sorenessBadge.color }]}
                >
                  {sorenessBadge.label}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metric}>
          <MetricLabel icon="armFlexOutline" label="근육통 부위" />
          <Text
            numberOfLines={1}
            style={[styles.metricValue, styles.metricValueText]}
          >
            {getSorePartsText(record.muscleSoreness)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function MetricLabel({
  icon,
  label,
}: {
  icon: OriginalAppIconName;
  label: string;
}) {
  return (
    <View style={styles.metricLabelRow}>
      <OriginalAppIcon color={Colors.textMuted} name={icon} size={13} />
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
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
    ...iosShadow,
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginBottom: 10,
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
  metricLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
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
    opacity: 0.85,
  },
});
