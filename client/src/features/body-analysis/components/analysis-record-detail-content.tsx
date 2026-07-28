import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from 'shared/constants/colors';
import {
  toBodyAnalysisResult,
  toBodyComparisonResult,
} from '../lib/object-access';
import type { AnalysisRecordDetail } from '../types/body-analysis';
import { BodyAnalysisResultView } from './body-analysis-result';
import { BodyComparisonResultView } from './body-comparison-result';

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

function DetailSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ScoreRow({
  label,
  note,
  score,
}: {
  label: string;
  note?: string;
  score?: number;
}) {
  const safeScore = score ?? 0;
  const fillColor = getScoreColor(safeScore);

  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.scoreBarWrap}>
        <View style={styles.scoreBarBackground}>
          <View
            style={[
              styles.scoreBarFill,
              {
                backgroundColor: fillColor,
                width: `${(safeScore / 5) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.scoreValue, { color: fillColor }]}>
          {safeScore}/5
        </Text>
      </View>
      {note ? <Text style={styles.scoreNote}>{note}</Text> : null}
    </View>
  );
}

function DetailInfoRow({
  label,
  note,
  value,
}: {
  label: string;
  note?: string;
  value?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {value ? <Text style={styles.infoValue}>{value}</Text> : null}
      {note ? <Text style={styles.infoNote}>{note}</Text> : null}
    </View>
  );
}

function BodyAnalysisDetail({ raw }: { raw: Record<string, unknown> }) {
  const data = toBodyAnalysisResult(raw);

  return (
    <>
      {data.bodyType ? (
        <DetailSection title={`${data.bodyType} 타입`}>
          <View style={styles.bodyTypeRow}>
            <View
              style={[
                styles.bodyTypeBadge,
                {
                  backgroundColor:
                    BODY_TYPE_COLORS[data.bodyType] ?? Colors.info,
                },
              ]}
            >
              <Text style={styles.bodyTypeText}>{data.bodyType}</Text>
            </View>
            <Text style={styles.bodyText}>{data.bodyTypeDescription}</Text>
          </View>
        </DetailSection>
      ) : null}

      {data.posture ? (
        <DetailSection title="자세 평가">
          <ScoreRow
            label="전체 정렬"
            note={data.posture.overallAlignment?.note}
            score={data.posture.overallAlignment?.score}
          />
          <ScoreRow
            label="어깨 균형"
            note={data.posture.shoulderBalance?.note}
            score={data.posture.shoulderBalance?.score}
          />
          <ScoreRow
            label="골반 균형"
            note={data.posture.hipBalance?.note}
            score={data.posture.hipBalance?.score}
          />
          <ScoreRow
            label="척추 곡률"
            note={data.posture.spinalCurvature?.note}
            score={data.posture.spinalCurvature?.score}
          />
        </DetailSection>
      ) : null}

      {data.upperBody ? (
        <DetailSection title="상체">
          <DetailInfoRow
            label="어깨 너비"
            note={data.upperBody.shoulderWidth?.note}
            value={data.upperBody.shoulderWidth?.value}
          />
          <DetailInfoRow
            label="팔 길이"
            note={data.upperBody.armLength?.note}
            value={data.upperBody.armLength?.value}
          />
          <DetailInfoRow
            label="목 길이"
            note={data.upperBody.neckLength?.note}
            value={data.upperBody.neckLength?.value}
          />
          <DetailInfoRow
            label="척추 정렬"
            note={data.upperBody.spineAlignment?.note}
            value={data.upperBody.spineAlignment?.value}
          />
        </DetailSection>
      ) : null}

      {data.lowerBody ? (
        <DetailSection title="하체">
          <DetailInfoRow
            label="엉덩이 너비"
            note={data.lowerBody.hipWidth?.note}
            value={data.lowerBody.hipWidth?.value}
          />
          <DetailInfoRow
            label="다리 길이"
            note={data.lowerBody.legLength?.note}
            value={data.lowerBody.legLength?.value}
          />
          <DetailInfoRow
            label="무릎 정렬"
            note={data.lowerBody.kneeAlignment?.note}
            value={data.lowerBody.kneeAlignment?.value}
          />
        </DetailSection>
      ) : null}

      {data.gaitAnalysis ? (
        <BodyAnalysisResultView
          result={{ gaitAnalysis: data.gaitAnalysis }}
          shoeOnly
        />
      ) : null}

      {data.prediction ? (
        <DetailSection title="미래 예측">
          {data.prediction.currentEstimate ? (
            <DetailInfoRow
              label="현재 추정"
              note={data.prediction.currentEstimate}
            />
          ) : null}
          {data.prediction.threeMonthPrediction ? (
            <DetailInfoRow
              label="3개월 후"
              note={data.prediction.threeMonthPrediction}
            />
          ) : null}
          {data.prediction.sixMonthPrediction ? (
            <DetailInfoRow
              label="6개월 후"
              note={data.prediction.sixMonthPrediction}
            />
          ) : null}
          {data.prediction.oneYearPrediction ? (
            <DetailInfoRow
              label="1년 후"
              note={data.prediction.oneYearPrediction}
            />
          ) : null}
        </DetailSection>
      ) : null}

      {Array.isArray(data.recommendations) &&
      data.recommendations.length > 0 ? (
        <DetailSection title="추천사항">
          {data.recommendations.map((item: string, index: number) => (
            <View key={item} style={styles.bulletRow}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </DetailSection>
      ) : null}

      {data.summary ? (
        <DetailSection title="요약">
          <Text style={styles.bodyText}>{data.summary}</Text>
        </DetailSection>
      ) : null}
    </>
  );
}

export function AnalysisRecordDetailContent({
  record,
}: {
  record: AnalysisRecordDetail;
}) {
  if (record.analysisType === 'body-comparison') {
    return (
      <BodyComparisonResultView
        result={toBodyComparisonResult(record.rawResult)}
      />
    );
  }

  if (record.analysisType === 'body') {
    return <BodyAnalysisDetail raw={record.rawResult} />;
  }

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        이 분석 타입의 상세 렌더링은 아직 준비 중이에요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bodyText: {
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  bodyTypeBadge: {
    alignItems: 'center',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  bodyTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bodyTypeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  bulletGroup: {
    gap: 8,
  },
  bulletRow: {
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  infoLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  infoNote: {
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  numberBadge: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 999,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  numberBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  scoreBarBackground: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  scoreBarFill: {
    borderRadius: 999,
    height: '100%',
  },
  scoreBarWrap: {
    gap: 6,
  },
  scoreLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  scoreNote: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  scoreRow: {
    gap: 8,
  },
  scoreValue: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 10,
    padding: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
});
