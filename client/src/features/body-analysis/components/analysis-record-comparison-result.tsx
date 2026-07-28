import {
  ArrowDown,
  ArrowUp,
  Heart,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Colors, { iosShadow } from 'shared/constants/colors';
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
      Icon: ArrowUp,
    };
  }

  if (change === '악화') {
    return {
      accessibilityLabel: '악화',
      color: Colors.danger,
      Icon: ArrowDown,
    };
  }

  return {
    accessibilityLabel: '유지',
    color: Colors.textMuted,
    Icon: Minus,
  };
}

export function AnalysisRecordComparisonResult({
  result,
}: {
  result: AnalysisRecordComparison;
}) {
  return (
    <View style={styles.container}>
      <View style={[styles.card, iosShadow]}>
        <Text style={styles.cardTitle}>전체 변화</Text>
        <Text style={styles.cardText}>{result.overallChange ?? '-'}</Text>
      </View>

      {result.bodyTypeChange ? (
        <View style={[styles.card, iosShadow]}>
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
            <Text style={styles.bodyTypeArrow}>→</Text>
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
        <View style={[styles.card, iosShadow]}>
          <Text style={styles.cardTitle}>개선된 점</Text>
          {result.improvements.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <TrendingUp color={Colors.success} size={16} strokeWidth={2.1} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {result.declines?.length ? (
        <View style={[styles.card, iosShadow]}>
          <Text style={styles.cardTitle}>주의 필요</Text>
          {result.declines.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <TrendingDown color={Colors.danger} size={16} strokeWidth={2.1} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {result.postureChanges?.length ? (
        <View style={[styles.card, iosShadow]}>
          <Text style={styles.cardTitle}>자세 점수 변화</Text>
          {result.postureChanges.map((item, index) => {
            const {
              accessibilityLabel,
              color,
              Icon: ChangeIcon,
            } = getPostureChangeVisual(item.change);

            return (
              <View key={`${item.area}-${index}`} style={styles.postureRow}>
                <View style={styles.postureHeader}>
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
                    <ChangeIcon
                      accessibilityLabel={accessibilityLabel}
                      color={color}
                      size={14}
                      strokeWidth={2.1}
                    />
                    <Text
                      style={[
                        styles.scoreText,
                        { color: getScoreColor(item.after) },
                      ]}
                    >
                      {item.after ?? '-'}
                    </Text>
                  </View>
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
        <View style={[styles.card, iosShadow]}>
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
        <View style={[styles.card, iosShadow]}>
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
        <View style={[styles.card, styles.motivationCard, iosShadow]}>
          <Heart color={Colors.accent} size={20} strokeWidth={2.1} />
          <Text style={styles.motivationText}>{result.motivationalNote}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bodyTypeArrow: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  bodyTypeBadge: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  bodyTypeBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  bodyTypeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  bulletText: {
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 10,
    padding: 16,
  },
  cardText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  cardTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  container: {
    gap: 12,
  },
  motivationCard: {
    backgroundColor: '#FFF7E0',
  },
  motivationText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  postureArea: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  postureHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postureRow: {
    gap: 6,
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
    flexDirection: 'row',
    gap: 8,
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
