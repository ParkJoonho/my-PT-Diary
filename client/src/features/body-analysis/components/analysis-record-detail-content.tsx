import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OriginalAppIcon } from 'shared/components/icons/pt-diary-icons';
import Colors from 'shared/constants/colors';
import {
  asNumber,
  asRecord,
  asString,
  asStringArray,
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

function getGradeColor(grade?: string) {
  if (grade?.startsWith('A')) {
    return Colors.success;
  }

  if (grade?.startsWith('B')) {
    return Colors.info;
  }

  return Colors.warning;
}

function getPercentScoreColor(score: number) {
  if (score >= 70) {
    return Colors.success;
  }

  if (score >= 40) {
    return Colors.warning;
  }

  return Colors.danger;
}

function toDisplayText(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
}

function PercentScoreRow({ label, score }: { label: string; score: number }) {
  const color = getPercentScoreColor(score);

  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.scoreBarWrap}>
        <View style={styles.scoreBarBackground}>
          <View
            style={[
              styles.scoreBarFill,
              { backgroundColor: color, width: `${score}%` },
            ]}
          />
        </View>
        <Text style={[styles.scoreValue, { color }]}>{score}</Text>
      </View>
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

function PostureAnalysisDetail({ raw }: { raw: Record<string, unknown> }) {
  const exerciseName = asString(raw.exerciseName);
  const accuracy = asRecord(raw.accuracy);
  const accuracyGrade = asString(accuracy.grade);
  const accuracySummary = asString(accuracy.summary);
  const formCheck = asRecord(raw.formCheck);
  const injuryRisk = asRecord(raw.injuryRisk);
  const injuryRiskScore = asNumber(injuryRisk.score);
  const corrections = Array.isArray(raw.corrections)
    ? raw.corrections.map(asRecord)
    : [];
  const goodPoints = asStringArray(raw.goodPoints) ?? [];
  const recommendations = asStringArray(raw.recommendations) ?? [];
  const summary = asString(raw.summary);

  return (
    <>
      {exerciseName ? (
        <View style={styles.section}>
          <View style={styles.bodyTypeRow}>
            {accuracyGrade ? (
              <View
                style={[
                  styles.gradeBadge,
                  { backgroundColor: getGradeColor(accuracyGrade) },
                ]}
              >
                <Text style={styles.gradeBadgeText}>{accuracyGrade}</Text>
              </View>
            ) : null}
            <View style={styles.flexContent}>
              <Text style={styles.sectionTitle}>{exerciseName}</Text>
              {accuracySummary ? (
                <Text style={styles.bodyText}>{accuracySummary}</Text>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      {Object.keys(formCheck).length > 0 ? (
        <DetailSection title="폼 체크">
          {[
            { key: 'headPosition', label: '머리/목' },
            { key: 'spineAlignment', label: '척추 정렬' },
            { key: 'shoulderPosition', label: '어깨' },
            { key: 'hipAlignment', label: '골반' },
            { key: 'kneePosition', label: '무릎' },
            { key: 'footPlacement', label: '발' },
          ].map((item) => {
            const value = asRecord(formCheck[item.key]);
            const score = asNumber(value.score);

            if (score === undefined) {
              return null;
            }

            return (
              <ScoreRow
                key={item.key}
                label={item.label}
                note={asString(value.note)}
                score={score}
              />
            );
          })}
        </DetailSection>
      ) : null}

      {Object.keys(injuryRisk).length > 0 ? (
        <DetailSection title="부상 위험도">
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>위험 수준</Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color:
                    injuryRiskScore !== undefined && injuryRiskScore <= 3
                      ? Colors.success
                      : injuryRiskScore !== undefined && injuryRiskScore <= 6
                        ? Colors.warning
                        : Colors.danger,
                },
              ]}
            >
              {asString(injuryRisk.level) ?? '-'}
              {injuryRiskScore !== undefined ? ` (${injuryRiskScore}/10)` : ''}
            </Text>
          </View>
          {(asStringArray(injuryRisk.vulnerableAreas) ?? []).length > 0 ? (
            <DetailInfoRow
              label="취약 부위"
              note={(asStringArray(injuryRisk.vulnerableAreas) ?? []).join(
                ', ',
              )}
            />
          ) : null}
          {asString(injuryRisk.details) ? (
            <Text style={styles.bodyText}>{asString(injuryRisk.details)}</Text>
          ) : null}
        </DetailSection>
      ) : null}

      {corrections.length > 0 ? (
        <DetailSection title="교정 사항">
          {corrections.map((correction, index) => {
            const priority = asString(correction.priority);

            return (
              <View
                key={`${asString(correction.area) ?? 'correction'}-${index}`}
                style={styles.correctionCard}
              >
                <View style={styles.correctionHeader}>
                  <Text style={styles.correctionArea}>
                    {asString(correction.area) ?? '-'}
                  </Text>
                  {priority ? (
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor:
                            priority === '높음'
                              ? Colors.danger
                              : priority === '보통'
                                ? Colors.warning
                                : Colors.info,
                        },
                      ]}
                    >
                      <Text style={styles.priorityText}>{priority}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.correctionIssue}>
                  {asString(correction.issue) ?? '-'}
                </Text>
                <Text style={styles.correctionFix}>
                  {asString(correction.fix) ?? '-'}
                </Text>
              </View>
            );
          })}
        </DetailSection>
      ) : null}

      {goodPoints.length > 0 ? (
        <DetailSection title="잘하고 있는 점">
          {goodPoints.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <OriginalAppIcon
                color={Colors.success}
                name="checkmarkCircle"
                size={18}
              />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </DetailSection>
      ) : null}

      {recommendations.length > 0 ? (
        <DetailSection title="추천사항">
          {recommendations.map((item, index) => (
            <View key={item} style={styles.bulletRow}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </DetailSection>
      ) : null}

      {summary ? (
        <DetailSection title="요약">
          <Text style={styles.bodyText}>{summary}</Text>
        </DetailSection>
      ) : null}
    </>
  );
}

function StateVectorAnalysisDetail({ raw }: { raw: Record<string, unknown> }) {
  const compositeScore = asNumber(raw.compositeScore);
  const compositeGrade = asString(raw.compositeGrade);
  const dimensionScores = asRecord(raw.dimensionScores);
  const weeklyPlan = Array.isArray(raw.weeklyPlan) ? raw.weeklyPlan : [];
  const correctionProgram = raw.correctionProgram;
  const nutritionPlan = raw.nutritionPlan;
  const predictions = asRecord(raw.predictions);
  const summary = asString(raw.summary);
  const dimensionLabels: Record<string, string> = {
    bodyShape: '체형',
    condition: '컨디션',
    gait: '보행',
    nutrition: '영양',
    posture: '자세',
    workout: '운동',
  };

  return (
    <>
      {compositeScore !== undefined ? (
        <View style={styles.section}>
          <View style={styles.bodyTypeRow}>
            <View
              style={[
                styles.gradeBadge,
                { backgroundColor: getPercentScoreColor(compositeScore) },
              ]}
            >
              <Text style={styles.gradeBadgeText}>
                {compositeGrade ?? compositeScore}
              </Text>
            </View>
            <View style={styles.flexContent}>
              <Text style={styles.sectionTitle}>종합 피트니스 점수</Text>
              <Text style={styles.bodyText}>점수: {compositeScore}/100</Text>
            </View>
          </View>
        </View>
      ) : null}

      {Object.keys(dimensionScores).length > 0 ? (
        <DetailSection title="항목별 점수">
          {Object.entries(dimensionScores).map(([key, value]) => {
            const score = asNumber(value) ?? asNumber(asRecord(value).score);

            return score === undefined ? null : (
              <PercentScoreRow
                key={key}
                label={dimensionLabels[key] ?? key}
                score={score}
              />
            );
          })}
        </DetailSection>
      ) : null}

      {weeklyPlan.length > 0 ? (
        <DetailSection title="주간 운동 계획">
          {weeklyPlan.map((item, index) => {
            const day = asRecord(item);
            const description =
              typeof item === 'string'
                ? item
                : (asString(day.exercises) ??
                  asString(day.description) ??
                  toDisplayText(item));

            return (
              <DetailInfoRow
                key={`${asString(day.day) ?? 'day'}-${index}`}
                label={asString(day.day) ?? `Day ${index + 1}`}
                note={description}
              />
            );
          })}
        </DetailSection>
      ) : null}

      {correctionProgram ? (
        <DetailSection title="교정 프로그램">
          {Array.isArray(correctionProgram) ? (
            correctionProgram.map((item, index) => {
              const itemRecord = asRecord(item);

              return (
                <View key={toDisplayText(item)} style={styles.bulletRow}>
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberBadgeText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.bulletText}>
                    {typeof item === 'string'
                      ? item
                      : (asString(itemRecord.description) ??
                        asString(itemRecord.exercise) ??
                        toDisplayText(item))}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.bodyText}>
              {toDisplayText(correctionProgram)}
            </Text>
          )}
        </DetailSection>
      ) : null}

      {nutritionPlan ? (
        <DetailSection title="영양 계획">
          {Array.isArray(nutritionPlan) ? (
            nutritionPlan.map((item) => {
              const itemRecord = asRecord(item);

              return (
                <View key={toDisplayText(item)} style={styles.bulletRow}>
                  <OriginalAppIcon
                    color={Colors.success}
                    name="restaurantOutline"
                    size={16}
                  />
                  <Text style={styles.bulletText}>
                    {typeof item === 'string'
                      ? item
                      : (asString(itemRecord.description) ??
                        toDisplayText(item))}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.bodyText}>{toDisplayText(nutritionPlan)}</Text>
          )}
        </DetailSection>
      ) : null}

      {raw.injuryRiskAssessment ? (
        <DetailSection title="부상 위험 평가">
          <Text style={styles.bodyText}>
            {toDisplayText(raw.injuryRiskAssessment)}
          </Text>
        </DetailSection>
      ) : null}

      {Object.keys(predictions).length > 0 ? (
        <DetailSection title="체형 변화 예측">
          {Object.entries(predictions).map(([key, value]) => (
            <DetailInfoRow key={key} label={key} note={toDisplayText(value)} />
          ))}
        </DetailSection>
      ) : null}

      {summary ? (
        <DetailSection title="요약">
          <Text style={styles.bodyText}>{summary}</Text>
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

  if (record.analysisType === 'posture') {
    return <PostureAnalysisDetail raw={record.rawResult} />;
  }

  if (record.analysisType === 'state-vector') {
    return <StateVectorAnalysisDetail raw={record.rawResult} />;
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
    fontSize: 14,
    lineHeight: 22,
  },
  bodyTypeBadge: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  bodyTypeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  bodyTypeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 22,
  },
  bulletGroup: {
    gap: 8,
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  bulletText: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  correctionArea: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  correctionCard: {
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  correctionFix: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  correctionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  correctionIssue: {
    color: Colors.danger,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    marginBottom: 4,
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
    color: Colors.textMuted,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    marginBottom: 2,
  },
  infoNote: {
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
  infoRow: {
    borderBottomColor: Colors.divider,
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingBottom: 10,
  },
  infoValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
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
  flexContent: {
    flex: 1,
  },
  gradeBadge: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  gradeBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
  },
  priorityBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  priorityText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  scoreBarBackground: {
    backgroundColor: Colors.divider,
    borderRadius: 4,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  scoreBarFill: {
    borderRadius: 4,
    height: 8,
  },
  scoreBarWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  scoreLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
    marginBottom: 4,
  },
  scoreNote: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  scoreRow: {
    marginBottom: 12,
  },
  scoreValue: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    minWidth: 36,
  },
  section: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    marginBottom: 10,
  },
});
