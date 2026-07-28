import { StyleSheet, Text, View } from 'react-native';
import { UnimplementedBadge } from 'shared/components/unimplemented-badge';
import Colors, { iosShadow } from 'shared/constants/colors';
import type { BodyAnalysisResult } from '../types/body-analysis';

const BODY_TYPE_COLORS: Record<string, string> = {
  A: '#F59E0B',
  H: '#22C55E',
  I: '#3B82F6',
  O: '#EC4899',
  V: '#8B5CF6',
  X: '#EF4444',
};

function ScoreBar({
  label,
  note,
  score,
}: {
  label: string;
  note?: string;
  score?: number;
}) {
  const normalizedScore = Math.max(0, Math.min(score ?? 0, 5));
  const fillColor =
    normalizedScore >= 4
      ? Colors.success
      : normalizedScore >= 3
        ? Colors.info
        : normalizedScore >= 2
          ? Colors.warning
          : Colors.danger;

  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.scoreBarWrap}>
        <View style={styles.scoreBarBg}>
          <View
            style={[
              styles.scoreBarFill,
              {
                backgroundColor: fillColor,
                width: `${(normalizedScore / 5) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.scoreValue, { color: fillColor }]}>
          {normalizedScore}/5
        </Text>
      </View>
      {note ? <Text style={styles.scoreNote}>{note}</Text> : null}
    </View>
  );
}

function DetailRow({
  label,
  note,
  value,
}: {
  label: string;
  note?: string;
  value?: string;
}) {
  if (!value && !note) {
    return null;
  }

  return (
    <View style={styles.detailRow}>
      <View style={styles.detailHeaderRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        {value ? <Text style={styles.detailValue}>{value}</Text> : null}
      </View>
      {note ? <Text style={styles.detailNote}>{note}</Text> : null}
    </View>
  );
}

export function BodyAnalysisResultView({
  result,
  showFutureAsUnimplemented = false,
}: {
  result: BodyAnalysisResult;
  showFutureAsUnimplemented?: boolean;
}) {
  const bodyTypeColor =
    BODY_TYPE_COLORS[result.bodyType ?? ''] ?? Colors.info;

  return (
    <View style={styles.container}>
      <View style={[styles.heroCard, iosShadow]}>
        <View
          style={[styles.bodyTypeBadge, { backgroundColor: bodyTypeColor }]}
        >
          <Text style={styles.bodyTypeLetter}>{result.bodyType ?? '?'}</Text>
        </View>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>AI 체형 분석 결과</Text>
          {result.bodyTypeDescription ? (
            <Text style={styles.heroDescription}>
              {result.bodyTypeDescription}
            </Text>
          ) : null}
          {result.summary ? (
            <Text style={styles.heroSummary}>{result.summary}</Text>
          ) : null}
        </View>
      </View>

      <View style={[styles.card, iosShadow]}>
        <Text style={styles.cardTitle}>체형 비율</Text>
        <View style={styles.ratioGrid}>
          <View style={styles.ratioItem}>
            <Text style={styles.ratioLabel}>팔/키 비율</Text>
            <Text style={styles.ratioValue}>
              {typeof result.ratios?.armToHeight === 'number'
                ? result.ratios.armToHeight.toFixed(2)
                : '-'}
            </Text>
          </View>
          <View style={styles.ratioItem}>
            <Text style={styles.ratioLabel}>상하체 비율</Text>
            <Text style={styles.ratioValue}>
              {typeof result.ratios?.upperToLower === 'number'
                ? result.ratios.upperToLower.toFixed(2)
                : '-'}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, iosShadow]}>
        <Text style={styles.cardTitle}>자세 평가</Text>
        <ScoreBar
          label="전체 정렬"
          note={result.posture?.overallAlignment?.note}
          score={result.posture?.overallAlignment?.score}
        />
        <ScoreBar
          label="어깨 균형"
          note={result.posture?.shoulderBalance?.note}
          score={result.posture?.shoulderBalance?.score}
        />
        <ScoreBar
          label="골반 균형"
          note={result.posture?.hipBalance?.note}
          score={result.posture?.hipBalance?.score}
        />
        <ScoreBar
          label="척추 곡률"
          note={result.posture?.spinalCurvature?.note}
          score={result.posture?.spinalCurvature?.score}
        />
      </View>

      <View style={[styles.card, iosShadow]}>
        <Text style={styles.cardTitle}>상체 특징</Text>
        <DetailRow
          label="어깨 너비"
          note={result.upperBody?.shoulderWidth?.note}
          value={result.upperBody?.shoulderWidth?.value}
        />
        <DetailRow
          label="팔 길이"
          note={result.upperBody?.armLength?.note}
          value={result.upperBody?.armLength?.value}
        />
        <DetailRow
          label="목 길이"
          note={result.upperBody?.neckLength?.note}
          value={result.upperBody?.neckLength?.value}
        />
        <DetailRow
          label="척추 정렬"
          note={result.upperBody?.spineAlignment?.note}
          value={result.upperBody?.spineAlignment?.value}
        />
      </View>

      <View style={[styles.card, iosShadow]}>
        <Text style={styles.cardTitle}>하체 특징</Text>
        <DetailRow
          label="골반 너비"
          note={result.lowerBody?.hipWidth?.note}
          value={result.lowerBody?.hipWidth?.value}
        />
        <DetailRow
          label="다리 길이"
          note={result.lowerBody?.legLength?.note}
          value={result.lowerBody?.legLength?.value}
        />
        <DetailRow
          label="무릎 정렬"
          note={result.lowerBody?.kneeAlignment?.note}
          value={result.lowerBody?.kneeAlignment?.value}
        />
      </View>

      {result.multiViewAnalysis ? (
        <View style={[styles.card, iosShadow]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>다각도 분석</Text>
            <View style={styles.multiViewBadge}>
              <Text style={styles.multiViewBadgeText}>
                {result.multiViewAnalysis.compositeGrade ?? '-'} ·{' '}
                {result.multiViewAnalysis.compositePostureScore ?? 0}점
              </Text>
            </View>
          </View>
          {result.multiViewAnalysis.priorityCorrections?.map((item, index) => (
            <View key={`${item.issue}-${index}`} style={styles.recommendationRow}>
              <Text style={styles.recommendationBullet}>•</Text>
              <View style={styles.recommendationTextWrap}>
                <Text style={styles.recommendationTitle}>
                  {item.issue} · {item.priority}
                </Text>
                <Text style={styles.recommendationText}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={[styles.card, iosShadow]}>
        <Text style={styles.cardTitle}>추천사항</Text>
        {result.recommendations?.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.recommendationRow}>
            <Text style={styles.recommendationBullet}>•</Text>
            <Text style={styles.recommendationText}>{item}</Text>
          </View>
        ))}
      </View>

      {result.prediction ? (
        <View style={[styles.card, iosShadow]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>미래 예측</Text>
            {showFutureAsUnimplemented ? <UnimplementedBadge compact /> : null}
          </View>
          {showFutureAsUnimplemented ? (
            <Text style={styles.helperText}>
              원본에는 예측 섹션이 있지만, 현재 앱에서는 결과 구조만 연결되어 있어요.
            </Text>
          ) : null}
          {result.prediction.currentEstimate ? (
            <DetailRow
              label="현재 추정"
              note={result.prediction.currentEstimate}
            />
          ) : null}
          {result.prediction.threeMonthPrediction ? (
            <DetailRow
              label="3개월 후"
              note={result.prediction.threeMonthPrediction}
            />
          ) : null}
          {result.prediction.sixMonthPrediction ? (
            <DetailRow
              label="6개월 후"
              note={result.prediction.sixMonthPrediction}
            />
          ) : null}
          {result.prediction.oneYearPrediction ? (
            <DetailRow
              label="1년 후"
              note={result.prediction.oneYearPrediction}
            />
          ) : null}
        </View>
      ) : null}

      {result.medicalAnalysis ? (
        <View style={[styles.card, iosShadow]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>증상 참고 분석</Text>
            <UnimplementedBadge compact />
          </View>
          <Text style={styles.helperText}>
            원본에는 이 섹션이 더 길게 이어지지만, 현재 앱에서는 핵심 문장만 보여줘요.
          </Text>
          <DetailRow
            label="증상 평가"
            note={result.medicalAnalysis.symptomAssessment}
          />
          <DetailRow
            label="체형 영향"
            note={result.medicalAnalysis.bodyStructureImpact}
          />
          <Text style={styles.disclaimerText}>
            {result.medicalAnalysis.disclaimer}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bodyTypeBadge: {
    alignItems: 'center',
    borderRadius: 20,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  bodyTypeLetter: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 28,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 12,
    padding: 16,
  },
  cardHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
  },
  container: {
    gap: 12,
  },
  detailHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  detailNote: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  detailRow: {
    gap: 6,
  },
  detailValue: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  disclaimerText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  helperText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  heroDescription: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  heroSummary: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  heroTextWrap: {
    flex: 1,
    gap: 6,
  },
  heroTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  multiViewBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  multiViewBadgeText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  ratioGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  ratioItem: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 12,
    flex: 1,
    gap: 8,
    padding: 14,
  },
  ratioLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  ratioValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 24,
  },
  recommendationBullet: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    lineHeight: 20,
    marginTop: -1,
  },
  recommendationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  recommendationText: {
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  recommendationTextWrap: {
    flex: 1,
    gap: 4,
  },
  recommendationTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  scoreBarBg: {
    backgroundColor: Colors.systemGray5,
    borderRadius: 999,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  scoreBarFill: {
    borderRadius: 999,
    height: 8,
  },
  scoreBarWrap: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  scoreLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    width: 72,
  },
  scoreNote: {
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  scoreRow: {
    alignItems: 'center',
    gap: 10,
  },
  scoreValue: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    width: 28,
  },
});
