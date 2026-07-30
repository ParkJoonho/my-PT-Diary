import { StyleSheet, Text, View } from 'react-native';
import {
  OriginalAppIcon,
  type OriginalAppIconName,
} from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import type { AnalysisRecordComparison } from '../types/body-analysis';

const BODY_TYPE_COLORS: Record<string, string> = {
  A: '#F59E0B',
  H: '#22C55E',
  I: '#3B82F6',
  O: '#EC4899',
  V: '#8B5CF6',
  X: '#EF4444',
};

function getScoreColor(score?: number) {
  const value = score ?? 0;

  if (value >= 4) {
    return Colors.success;
  }

  if (value >= 3) {
    return Colors.info;
  }

  if (value >= 2) {
    return Colors.warning;
  }

  return Colors.danger;
}

function getPostureChangeVisual(change?: string) {
  if (change === '개선') {
    return {
      accessibilityLabel: '개선',
      color: Colors.success,
      icon: 'arrowUp' as OriginalAppIconName,
    };
  }

  if (change === '악화') {
    return {
      accessibilityLabel: '악화',
      color: Colors.danger,
      icon: 'arrowDown' as OriginalAppIconName,
    };
  }

  return {
    accessibilityLabel: '유지',
    color: Colors.textMuted,
    icon: 'remove' as OriginalAppIconName,
  };
}

export function AnalysisRecordComparisonResult({
  result,
}: {
  result: AnalysisRecordComparison;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>전체 변화</Text>
        <Text style={styles.cardText}>{result.overallChange ?? '-'}</Text>
      </View>

      {result.bodyTypeChange ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>체형 변화</Text>
          <View style={styles.bodyTypeRow}>
            <View
              style={[
                styles.bodyTypeBadge,
                {
                  backgroundColor:
                    BODY_TYPE_COLORS[result.bodyTypeChange.from ?? ''] ??
                    Colors.info,
                },
              ]}
            >
              <Text style={styles.bodyTypeBadgeText}>
                {result.bodyTypeChange.from ?? '-'}
              </Text>
            </View>
            <OriginalAppIcon
              color={Colors.textMuted}
              name="arrowForward"
              size={20}
            />
            <View
              style={[
                styles.bodyTypeBadge,
                {
                  backgroundColor:
                    BODY_TYPE_COLORS[result.bodyTypeChange.to ?? ''] ??
                    Colors.info,
                },
              ]}
            >
              <Text style={styles.bodyTypeBadgeText}>
                {result.bodyTypeChange.to ?? '-'}
              </Text>
            </View>
          </View>
          {result.bodyTypeChange.note ? (
            <Text style={styles.cardText}>{result.bodyTypeChange.note}</Text>
          ) : null}
        </View>
      ) : null}

      {result.improvements?.length ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>개선된 점</Text>
          {result.improvements.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <OriginalAppIcon
                color={Colors.success}
                name="trendingUpOutline"
                size={16}
              />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {result.declines?.length ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>주의 필요</Text>
          {result.declines.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <OriginalAppIcon
                color={Colors.danger}
                name="trendingDownOutline"
                size={16}
              />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {result.postureChanges?.length ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>자세 점수 변화</Text>
          {result.postureChanges.map((item, index) => {
            const { accessibilityLabel, color, icon } = getPostureChangeVisual(
              item.change,
            );

            return (
              <View key={`${item.area}-${index}`} style={styles.postureRow}>
                <Text style={styles.postureArea}>{item.area ?? '-'}</Text>
                <View style={styles.scoreChangeRow}>
                  <Text
                    style={[
                      styles.scoreText,
                      { color: getScoreColor(item.before) },
                    ]}
                  >
                    {item.before ?? '-'}
                  </Text>
                  <View accessibilityLabel={accessibilityLabel}>
                    <OriginalAppIcon color={color} name={icon} size={14} />
                  </View>
                  <Text
                    style={[
                      styles.scoreText,
                      { color: getScoreColor(item.after) },
                    ]}
                  >
                    {item.after ?? '-'}
                  </Text>
                </View>
                {item.note ? (
                  <Text style={styles.cardText}>{item.note}</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {result.quantitativeChanges?.length ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>정량 변화</Text>
          {result.quantitativeChanges.map((item, index) => (
            <View key={`${item.metric}-${index}`} style={styles.quantRow}>
              <View style={styles.quantHeader}>
                <Text style={styles.quantMetric}>{item.metric ?? '-'}</Text>
                <Text style={styles.quantPercent}>
                  {item.changePercent ?? '-'}
                </Text>
              </View>
              <Text style={styles.cardText}>
                {item.before ?? '-'} → {item.after ?? '-'}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {result.recommendations?.length ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>추천사항</Text>
          {result.recommendations.map((item, index) => (
            <View key={item} style={styles.recommendationRow}>
              <View style={styles.recommendationNumber}>
                <Text style={styles.recommendationNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {result.motivationalNote ? (
        <View style={[styles.card, styles.motivationCard]}>
          <OriginalAppIcon color={Colors.accent} name="heart" size={20} />
          <Text style={styles.motivationText}>{result.motivationalNote}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bodyTypeBadge: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  bodyTypeBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
  },
  bodyTypeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  bulletText: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    marginHorizontal: 16,
    padding: 16,
  },
  cardText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  cardTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    marginBottom: 10,
  },
  container: {},
  motivationCard: {
    alignItems: 'center',
    borderColor: Colors.accent,
    flexDirection: 'row',
    gap: 12,
  },
  motivationText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 22,
  },
  postureArea: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  postureRow: {
    borderBottomColor: Colors.divider,
    borderBottomWidth: 1,
    marginBottom: 12,
    paddingBottom: 12,
  },
  quantHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantMetric: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  quantPercent: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  quantRow: {
    gap: 4,
  },
  recommendationNumber: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 999,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  recommendationNumberText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  recommendationRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  scoreChangeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  scoreText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
});
