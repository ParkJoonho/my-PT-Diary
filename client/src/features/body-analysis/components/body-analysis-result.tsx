import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Colors, { iosShadow } from 'shared/constants/colors';
import type {
  BodyAnalysisResult,
  MobilityDetail,
  SeverityDetail,
  ShoeRecommendationItem,
} from '../types/body-analysis';

const BODY_TYPE_COLORS: Record<string, string> = {
  A: '#F59E0B',
  H: '#22C55E',
  I: '#3B82F6',
  O: '#EC4899',
  V: '#8B5CF6',
  X: '#EF4444',
};

const BODY_TYPE_NAMES: Record<string, string> = {
  A: 'A 타입 (삼각형)',
  H: 'H 타입 (일자형)',
  I: 'I 타입 (균형 슬림)',
  O: 'O 타입 (원형)',
  V: 'V 타입 (역삼각형)',
  X: 'X 타입 (모래시계)',
};

const WEAR_PATTERN_COLORS: Record<string, string> = {
  내측마모: Colors.warning,
  뒤꿈치마모: Colors.info,
  불균형마모: Colors.danger,
  앞꿈치마모: Colors.info,
  외측마모: Colors.warning,
  정상: Colors.success,
};

function getScoreColor(score?: number) {
  const normalizedScore = score ?? 0;

  if (normalizedScore >= 4) {
    return Colors.success;
  }

  if (normalizedScore >= 3) {
    return Colors.info;
  }

  if (normalizedScore >= 2) {
    return Colors.warning;
  }

  return Colors.danger;
}

function getGradeColor(grade?: string) {
  switch (grade) {
    case 'S':
      return '#AF52DE';
    case 'A':
      return Colors.success;
    case 'B':
      return Colors.info;
    case 'C':
      return Colors.warning;
    case 'D':
    case 'F':
      return Colors.danger;
    default:
      return Colors.textMuted;
  }
}

function getSeverityColor(severity?: string, detected?: boolean) {
  if (detected === false) {
    return Colors.success;
  }

  switch (severity) {
    case '정상':
      return Colors.success;
    case '경미':
      return Colors.info;
    case '중등':
      return Colors.warning;
    case '심각':
      return Colors.danger;
    default:
      return Colors.textMuted;
  }
}

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
  const fillColor = getScoreColor(normalizedScore);

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

function RatioItem({
  labels,
  markerMultiplier = 100,
  markerTestId,
  title,
  value,
}: {
  labels: [string, string, string];
  markerMultiplier?: number;
  markerTestId?: string;
  title: string;
  value?: number;
}) {
  const safeValue = typeof value === 'number' ? value : 0;

  return (
    <View style={styles.ratioItem}>
      <Text style={styles.ratioLabel}>{title}</Text>
      <Text style={styles.ratioValue}>
        {typeof value === 'number' ? value.toFixed(2) : '-'}
      </Text>
      <View style={styles.ratioBar}>
        <View style={styles.ratioBarBackground}>
          <View
            style={[
              styles.ratioMarker,
              {
                left: `${Math.max(
                  0,
                  Math.min(safeValue * markerMultiplier, 100),
                )}%`,
              },
            ]}
            testID={markerTestId}
          />
        </View>
        <View style={styles.ratioLabelsRow}>
          <Text style={styles.ratioHint}>{labels[0]}</Text>
          <Text style={styles.ratioHint}>{labels[1]}</Text>
          <Text style={styles.ratioHint}>{labels[2]}</Text>
        </View>
      </View>
    </View>
  );
}

function MeasureRow({
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
    <View style={styles.measureRow}>
      <Text style={styles.measureLabel}>{label}</Text>
      {value ? (
        <View style={styles.measureValueBadge}>
          <Text style={styles.measureValue}>{value}</Text>
        </View>
      ) : null}
      {note ? <Text style={styles.measureNote}>{note}</Text> : null}
    </View>
  );
}

function RecommendationRow({
  index,
  text,
  tone = 'accent',
}: {
  index: number;
  text: string;
  tone?: 'accent' | 'info';
}) {
  const backgroundColor = tone === 'info' ? Colors.info : Colors.accent;

  return (
    <View style={styles.recommendationRow}>
      <View style={[styles.recommendationBadge, { backgroundColor }]}>
        <Text style={styles.recommendationBadgeText}>{index + 1}</Text>
      </View>
      <Text style={styles.recommendationText}>{text}</Text>
    </View>
  );
}

function SeverityRow({
  fallbackWhenFalse = '정상',
  label,
  value,
}: {
  fallbackWhenFalse?: string;
  label: string;
  value?: SeverityDetail;
}) {
  if (!value) {
    return null;
  }

  const badgeText =
    value.detected === false ? fallbackWhenFalse : (value.severity ?? '감지');

  return (
    <View style={styles.viewDetailRow}>
      <View
        style={[
          styles.severityBadge,
          {
            backgroundColor: getSeverityColor(value.severity, value.detected),
          },
        ]}
      >
        <Text style={styles.severityBadgeText}>{badgeText}</Text>
      </View>
      <Text style={styles.viewDetailLabel}>{label}</Text>
      {value.note ? (
        <Text style={styles.viewDetailNote}>{value.note}</Text>
      ) : null}
    </View>
  );
}

function MobilityCard({
  label,
  value,
}: {
  label: string;
  value?: MobilityDetail;
}) {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.mobilityItem}>
      <Text style={styles.mobilityLabel}>{label}</Text>
      <Text
        style={[styles.mobilityScore, { color: getScoreColor(value.score) }]}
      >
        {value.score ?? 0}/5
      </Text>
    </View>
  );
}

function ShoeRecommendationCard({ item }: { item: ShoeRecommendationItem }) {
  return (
    <View style={[styles.shoeCard, iosShadow]}>
      <View style={styles.shoeCardHeader}>
        <View style={styles.shoeBrandBadge}>
          <Text style={styles.shoeBrandText}>{item.brand ?? '-'}</Text>
        </View>
        <Text style={styles.shoeModelText}>{item.model ?? '-'}</Text>
      </View>
      <View style={styles.shoeMetaRow}>
        <View style={styles.shoeTypeBadge}>
          <Text style={styles.shoeTypeText}>{item.type ?? '-'}</Text>
        </View>
        <Text style={styles.shoePriceText}>{item.priceRange ?? '-'}</Text>
      </View>
      {item.reason ? (
        <Text style={styles.shoeReasonText}>{item.reason}</Text>
      ) : null}
      <View style={styles.shoeSpecRow}>
        {[
          { label: '아치 지지', value: item.archSupport },
          { label: '쿠셔닝', value: item.cushioning },
          { label: '안정성', value: item.stability },
        ].map((spec) => (
          <View key={spec.label} style={styles.shoeSpecItem}>
            <Text style={styles.shoeSpecLabel}>{spec.label}</Text>
            <Text style={styles.shoeSpecValue}>{spec.value ?? '-'}</Text>
          </View>
        ))}
      </View>
      {item.features?.length ? (
        <View style={styles.featureWrap}>
          {item.features.map((feature) => (
            <View key={feature} style={styles.featureBadge}>
              <Text style={styles.featureBadgeText}>{feature}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function BodyAnalysisResultView({
  result,
  shoeOnly = false,
}: {
  result: BodyAnalysisResult;
  shoeOnly?: boolean;
  showFutureAsUnimplemented?: boolean;
}) {
  const bodyTypeColor = BODY_TYPE_COLORS[result.bodyType ?? ''] ?? Colors.info;
  const [shoeTab, setShoeTab] = useState<'after' | 'current'>('current');
  const [shoeCategory, setShoeCategory] = useState<'daily' | 'workout'>(
    'daily',
  );

  const shoeRecommendations = result.gaitAnalysis?.shoeRecommendations;
  const visibleShoes =
    shoeTab === 'current'
      ? shoeCategory === 'daily'
        ? shoeRecommendations?.current?.daily
        : shoeRecommendations?.current?.workout
      : shoeCategory === 'daily'
        ? shoeRecommendations?.afterCorrection?.daily
        : shoeRecommendations?.afterCorrection?.workout;

  return (
    <View style={styles.container}>
      {shoeOnly ? null : (
        <>
          <View style={[styles.bodyTypeCard, iosShadow]}>
            <View
              style={[styles.bodyTypeBadge, { backgroundColor: bodyTypeColor }]}
            >
              <Text style={styles.bodyTypeLetter}>
                {result.bodyType ?? '?'}
              </Text>
            </View>
            <Text style={styles.bodyTypeTitle}>BODY MBTI</Text>
            <Text style={styles.bodyTypeName}>
              {BODY_TYPE_NAMES[result.bodyType ?? ''] ?? result.bodyType ?? '-'}
            </Text>
            {result.bodyTypeDescription ? (
              <Text style={styles.bodyTypeDescription}>
                {result.bodyTypeDescription}
              </Text>
            ) : null}
          </View>

          <View style={[styles.card, iosShadow]}>
            <Text style={styles.sectionTitle}>신체 비율</Text>
            <RatioItem
              labels={['짧은편', '평균 1.00', '긴편']}
              title="팔 / 키"
              value={result.ratios?.armToHeight}
            />
            <RatioItem
              labels={['하체↑', '평균 1.0', '상체↑']}
              markerMultiplier={50}
              markerTestId="upper-to-lower-ratio-marker"
              title="상하체"
              value={result.ratios?.upperToLower}
            />
          </View>

          <View style={[styles.card, iosShadow]}>
            <Text style={styles.sectionTitle}>상체</Text>
            <MeasureRow
              label="어깨너비"
              note={result.upperBody?.shoulderWidth?.note}
              value={result.upperBody?.shoulderWidth?.value}
            />
            <MeasureRow
              label="팔길이"
              note={result.upperBody?.armLength?.note}
              value={result.upperBody?.armLength?.value}
            />
            <MeasureRow
              label="목길이"
              note={result.upperBody?.neckLength?.note}
              value={result.upperBody?.neckLength?.value}
            />
            <MeasureRow
              label="척추정렬"
              note={result.upperBody?.spineAlignment?.note}
              value={result.upperBody?.spineAlignment?.value}
            />
          </View>

          <View style={[styles.card, iosShadow]}>
            <Text style={styles.sectionTitle}>하체</Text>
            <MeasureRow
              label="허리너비"
              note={result.lowerBody?.hipWidth?.note}
              value={result.lowerBody?.hipWidth?.value}
            />
            <MeasureRow
              label="다리길이"
              note={result.lowerBody?.legLength?.note}
              value={result.lowerBody?.legLength?.value}
            />
            <MeasureRow
              label="무릎정렬"
              note={result.lowerBody?.kneeAlignment?.note}
              value={result.lowerBody?.kneeAlignment?.value}
            />
          </View>

          <View style={[styles.card, iosShadow]}>
            <Text style={styles.sectionTitle}>자세 분석</Text>
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
              label="척추 곡선"
              note={result.posture?.spinalCurvature?.note}
              score={result.posture?.spinalCurvature?.score}
            />
          </View>

          {result.multiViewAnalysis ? (
            <View style={[styles.card, iosShadow]}>
              <View style={styles.multiViewHeader}>
                <Text style={styles.sectionTitle}>다중 각도 종합 분석</Text>
                <View
                  style={[
                    styles.gradeBadge,
                    {
                      backgroundColor: getGradeColor(
                        result.multiViewAnalysis.compositeGrade,
                      ),
                    },
                  ]}
                >
                  <Text style={styles.gradeBadgeText}>
                    {result.multiViewAnalysis.compositeGrade ?? '-'}
                  </Text>
                </View>
              </View>
              <View style={styles.compositeScoreCard}>
                <Text style={styles.compositeScoreValue}>
                  {result.multiViewAnalysis.compositePostureScore ?? 0}점
                </Text>
                <Text style={styles.compositeScoreLabel}>
                  종합 자세 점수 (100점 만점)
                </Text>
                <View style={styles.compositeScoreBar}>
                  <View
                    style={[
                      styles.compositeScoreFill,
                      {
                        backgroundColor: getGradeColor(
                          result.multiViewAnalysis.compositeGrade,
                        ),
                        width: `${result.multiViewAnalysis.compositePostureScore ?? 0}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {result.multiViewAnalysis.sideView ? (
                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>측면 분석</Text>
                  <SeverityRow
                    label="거북목"
                    value={result.multiViewAnalysis.sideView.forwardHeadPosture}
                  />
                  <SeverityRow
                    label="라운드숄더"
                    value={result.multiViewAnalysis.sideView.roundedShoulders}
                  />
                  <SeverityRow
                    label="골반 전방경사"
                    value={result.multiViewAnalysis.sideView.anteriorPelvicTilt}
                  />
                  {result.multiViewAnalysis.sideView.spinalCurve ? (
                    <View style={styles.viewDetailRow}>
                      <View
                        style={[
                          styles.severityBadge,
                          { backgroundColor: Colors.info },
                        ]}
                      >
                        <Text style={styles.severityBadgeText}>
                          {result.multiViewAnalysis.sideView.spinalCurve.type ??
                            '-'}
                        </Text>
                      </View>
                      <Text style={styles.viewDetailLabel}>척추 곡선</Text>
                      <Text style={styles.viewDetailNote}>
                        {result.multiViewAnalysis.sideView.spinalCurve.note}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {result.multiViewAnalysis.backView ? (
                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>후면 분석</Text>
                  <SeverityRow
                    fallbackWhenFalse="정상"
                    label="척추 측만"
                    value={result.multiViewAnalysis.backView.scoliosis}
                  />
                  <SeverityRow
                    fallbackWhenFalse="정상"
                    label="견갑골 날개"
                    value={result.multiViewAnalysis.backView.scapularWinging}
                  />
                  <SeverityRow
                    fallbackWhenFalse="정상"
                    label="어깨 비대칭"
                    value={result.multiViewAnalysis.backView.shoulderAsymmetry}
                  />
                  <SeverityRow
                    fallbackWhenFalse="정상"
                    label="골반 비대칭"
                    value={result.multiViewAnalysis.backView.pelvicAsymmetry}
                  />
                  <SeverityRow
                    fallbackWhenFalse="정상"
                    label="근육 불균형"
                    value={result.multiViewAnalysis.backView.muscleImbalance}
                  />
                </View>
              ) : null}

              {result.multiViewAnalysis.squatView ? (
                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>스쿼트 분석</Text>
                  <SeverityRow
                    label="무릎 내전"
                    value={result.multiViewAnalysis.squatView.kneeValgus}
                  />
                  {result.multiViewAnalysis.squatView.squatDepth ? (
                    <View style={styles.viewDetailRow}>
                      <View
                        style={[
                          styles.severityBadge,
                          { backgroundColor: Colors.info },
                        ]}
                      >
                        <Text style={styles.severityBadgeText}>
                          {result.multiViewAnalysis.squatView.squatDepth
                            .value ?? '-'}
                        </Text>
                      </View>
                      <Text style={styles.viewDetailLabel}>스쿼트 깊이</Text>
                      <Text style={styles.viewDetailNote}>
                        {result.multiViewAnalysis.squatView.squatDepth.note}
                      </Text>
                    </View>
                  ) : null}
                  <SeverityRow
                    label="상체 기울기"
                    value={result.multiViewAnalysis.squatView.trunkLean}
                  />
                  <View style={styles.mobilityRow}>
                    <MobilityCard
                      label="고관절"
                      value={result.multiViewAnalysis.squatView.hipMobility}
                    />
                    <MobilityCard
                      label="발목"
                      value={result.multiViewAnalysis.squatView.ankleMobility}
                    />
                    <MobilityCard
                      label="균형"
                      value={result.multiViewAnalysis.squatView.balance}
                    />
                  </View>
                </View>
              ) : null}

              {result.multiViewAnalysis.priorityCorrections?.length ? (
                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>우선 교정 사항</Text>
                  {result.multiViewAnalysis.priorityCorrections.map(
                    (item, index) => (
                      <View
                        key={`${item.issue}-${index}`}
                        style={styles.priorityCard}
                      >
                        <View style={styles.priorityHeader}>
                          <View
                            style={[
                              styles.priorityBadge,
                              {
                                backgroundColor:
                                  item.priority === '높음'
                                    ? Colors.danger
                                    : item.priority === '중간'
                                      ? Colors.warning
                                      : Colors.info,
                              },
                            ]}
                          >
                            <Text style={styles.priorityBadgeText}>
                              {item.priority ?? '-'}
                            </Text>
                          </View>
                          <Text style={styles.priorityTitle}>
                            {item.issue ?? '-'}
                          </Text>
                        </View>
                        <Text style={styles.priorityExercise}>
                          교정 운동: {item.exercise ?? '-'}
                        </Text>
                        {item.description ? (
                          <Text style={styles.priorityDescription}>
                            {item.description}
                          </Text>
                        ) : null}
                      </View>
                    ),
                  )}
                </View>
              ) : null}
            </View>
          ) : null}
        </>
      )}

      {result.gaitAnalysis ? (
        <>
          <View style={[styles.headerCard, iosShadow]}>
            <Text style={styles.headerCardTitle}>걸음걸이 분석</Text>
            <Text style={styles.headerCardDescription}>
              신발 마모 패턴 기반 보행 분석
            </Text>
          </View>

          <View style={[styles.card, iosShadow]}>
            <Text style={styles.sectionTitle}>신발 마모 패턴</Text>
            <View style={styles.wearPatternRow}>
              <View
                style={[
                  styles.wearPatternBadge,
                  {
                    backgroundColor:
                      WEAR_PATTERN_COLORS[
                        result.gaitAnalysis.wearPattern?.type ?? ''
                      ] ?? Colors.info,
                  },
                ]}
              >
                <Text style={styles.wearPatternBadgeText}>
                  {result.gaitAnalysis.wearPattern?.type ?? '-'}
                </Text>
              </View>
              {result.gaitAnalysis.wearPattern?.leftRight ? (
                <View style={styles.leftRightBadge}>
                  <Text style={styles.leftRightBadgeText}>
                    {result.gaitAnalysis.wearPattern.leftRight}
                  </Text>
                </View>
              ) : null}
            </View>
            {result.gaitAnalysis.wearPattern?.description ? (
              <Text style={styles.bodyText}>
                {result.gaitAnalysis.wearPattern.description}
              </Text>
            ) : null}
          </View>

          <View style={[styles.card, iosShadow]}>
            <Text style={styles.sectionTitle}>보행 유형</Text>
            {result.gaitAnalysis.gaitType?.type ? (
              <View style={styles.gaitTypeBadge}>
                <Text style={styles.gaitTypeBadgeText}>
                  {result.gaitAnalysis.gaitType.type}
                </Text>
              </View>
            ) : null}
            {result.gaitAnalysis.gaitType?.description ? (
              <Text style={styles.bodyText}>
                {result.gaitAnalysis.gaitType.description}
              </Text>
            ) : null}
          </View>

          <View style={[styles.card, iosShadow]}>
            <Text style={styles.sectionTitle}>발 정렬 상태</Text>
            <MeasureRow
              label="아치 유형"
              value={result.gaitAnalysis.footAlignment?.archType}
            />
            <ScoreBar
              label="발목 정렬"
              note={result.gaitAnalysis.footAlignment?.ankleAlignment?.note}
              score={result.gaitAnalysis.footAlignment?.ankleAlignment?.score}
            />
            <MeasureRow
              label="발가락"
              note={result.gaitAnalysis.footAlignment?.toeAlignment?.note}
              value={result.gaitAnalysis.footAlignment?.toeAlignment?.value}
            />
          </View>

          <View style={[styles.card, iosShadow]}>
            <Text style={styles.sectionTitle}>
              걸음걸이가 신체에 미치는 영향
            </Text>
            <ScoreBar
              label="무릎 영향"
              note={result.gaitAnalysis.bodyImpact?.kneeImpact?.note}
              score={result.gaitAnalysis.bodyImpact?.kneeImpact?.score}
            />
            <ScoreBar
              label="골반 영향"
              note={result.gaitAnalysis.bodyImpact?.hipImpact?.note}
              score={result.gaitAnalysis.bodyImpact?.hipImpact?.score}
            />
            <ScoreBar
              label="척추 영향"
              note={result.gaitAnalysis.bodyImpact?.spineImpact?.note}
              score={result.gaitAnalysis.bodyImpact?.spineImpact?.score}
            />
          </View>

          {result.gaitAnalysis.gaitRecommendations?.length ? (
            <View style={[styles.card, iosShadow]}>
              <Text style={styles.sectionTitle}>걸음걸이 교정 추천</Text>
              {result.gaitAnalysis.gaitRecommendations.map((item, index) => (
                <RecommendationRow
                  index={index}
                  key={item}
                  text={item}
                  tone="info"
                />
              ))}
            </View>
          ) : null}

          {result.gaitAnalysis.shoeSizeEstimate ? (
            <View style={[styles.card, iosShadow]}>
              <Text style={styles.sectionTitle}>신발 사이즈 측정</Text>
              <View style={styles.shoeSizeMainRow}>
                <View style={styles.shoeSizeBigBadge}>
                  <Text style={styles.shoeSizeBigValue}>
                    {result.gaitAnalysis.shoeSizeEstimate.estimatedSize ?? '-'}
                  </Text>
                  <Text style={styles.shoeSizeBigUnit}>mm</Text>
                </View>
                <View style={styles.shoeSizeInfoColumn}>
                  <View style={styles.shoeSizeTagRow}>
                    {result.gaitAnalysis.shoeSizeEstimate.ageGroup ? (
                      <View style={styles.shoeSizeTag}>
                        <Text style={styles.shoeSizeTagText}>
                          {result.gaitAnalysis.shoeSizeEstimate.ageGroup}
                        </Text>
                      </View>
                    ) : null}
                    {result.gaitAnalysis.shoeSizeEstimate.gender &&
                    result.gaitAnalysis.shoeSizeEstimate.gender !==
                      '판단불가' ? (
                      <View style={styles.shoeSizeTag}>
                        <Text style={styles.shoeSizeTagText}>
                          {result.gaitAnalysis.shoeSizeEstimate.gender}
                        </Text>
                      </View>
                    ) : null}
                    {result.gaitAnalysis.shoeSizeEstimate.width ? (
                      <View style={styles.shoeSizeTag}>
                        <Text style={styles.shoeSizeTagText}>
                          발볼 {result.gaitAnalysis.shoeSizeEstimate.width}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.shoeSizeMeta}>
                    범위:{' '}
                    {result.gaitAnalysis.shoeSizeEstimate.sizeRange ?? '-'}
                  </Text>
                  <Text style={styles.shoeSizeMeta}>
                    {result.gaitAnalysis.shoeSizeEstimate.sizeSystem ?? '-'}
                  </Text>
                </View>
              </View>
              <View style={styles.shoeSizeDetailGrid}>
                <View style={styles.shoeSizeDetailItem}>
                  <Text style={styles.shoeSizeDetailLabel}>발 길이</Text>
                  <Text style={styles.shoeSizeDetailValue}>
                    {result.gaitAnalysis.shoeSizeEstimate.footLength ?? '-'}
                  </Text>
                </View>
                <View style={styles.shoeSizeDetailItem}>
                  <Text style={styles.shoeSizeDetailLabel}>발 너비</Text>
                  <Text style={styles.shoeSizeDetailValue}>
                    {result.gaitAnalysis.shoeSizeEstimate.footWidthCm ?? '-'}
                  </Text>
                </View>
              </View>
              {result.gaitAnalysis.shoeSizeEstimate.widthDescription ? (
                <Text style={styles.bodyText}>
                  {result.gaitAnalysis.shoeSizeEstimate.widthDescription}
                </Text>
              ) : null}
              {result.gaitAnalysis.shoeSizeEstimate.genderReason &&
              result.gaitAnalysis.shoeSizeEstimate.gender !== '판단불가' ? (
                <Text style={styles.inlineInfoText}>
                  {result.gaitAnalysis.shoeSizeEstimate.genderReason}
                </Text>
              ) : null}
            </View>
          ) : null}

          {shoeRecommendations ? (
            <>
              <View style={[styles.headerCard, iosShadow]}>
                <Text style={styles.headerCardTitle}>맞춤 신발 추천</Text>
                <Text style={styles.headerCardDescription}>
                  {result.gaitAnalysis?.shoeSizeEstimate
                    ? `${result.gaitAnalysis.shoeSizeEstimate.ageGroup ?? ''}${result.gaitAnalysis.shoeSizeEstimate.gender && result.gaitAnalysis.shoeSizeEstimate.gender !== '판단불가' ? ` · ${result.gaitAnalysis.shoeSizeEstimate.gender}` : ''}${result.gaitAnalysis.shoeSizeEstimate.sizeRange ? ` · ${result.gaitAnalysis.shoeSizeEstimate.sizeRange}mm` : ''}`
                    : '보행 패턴 기반 User-Item Matching'}
                </Text>
              </View>

              <View style={[styles.card, iosShadow]}>
                <Text style={styles.sectionTitle}>매칭 분석</Text>
                <Text style={styles.bodyText}>
                  {shoeRecommendations.matchingLogic ?? '-'}
                </Text>
              </View>

              <View style={styles.segmentedRow}>
                <Pressable
                  onPress={() => setShoeTab('current')}
                  style={[
                    styles.segmentedButton,
                    shoeTab === 'current' && styles.segmentedButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentedButtonText,
                      shoeTab === 'current' && styles.segmentedButtonTextActive,
                    ]}
                  >
                    현재 보행
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setShoeTab('after')}
                  style={[
                    styles.segmentedButton,
                    shoeTab === 'after' && styles.segmentedButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentedButtonText,
                      shoeTab === 'after' && styles.segmentedButtonTextActive,
                    ]}
                  >
                    교정 후
                  </Text>
                </Pressable>
              </View>

              {shoeTab === 'after' && shoeRecommendations.afterCorrection ? (
                <View style={[styles.inlineInfoCard, iosShadow]}>
                  <Text style={styles.inlineInfoStrong}>
                    예상 교정 기간:{' '}
                    {shoeRecommendations.afterCorrection.timeline ?? '-'}
                  </Text>
                  <Text style={styles.inlineInfoText}>
                    교정 후 보행:{' '}
                    {shoeRecommendations.afterCorrection.correctedGaitType ??
                      '-'}
                  </Text>
                </View>
              ) : null}

              <View style={styles.segmentedRow}>
                <Pressable
                  onPress={() => setShoeCategory('daily')}
                  style={[
                    styles.segmentedButtonLight,
                    shoeCategory === 'daily' &&
                      styles.segmentedButtonLightActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentedButtonLightText,
                      shoeCategory === 'daily' &&
                        styles.segmentedButtonLightTextActive,
                    ]}
                  >
                    일상 신발
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setShoeCategory('workout')}
                  style={[
                    styles.segmentedButtonLight,
                    shoeCategory === 'workout' &&
                      styles.segmentedButtonLightActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentedButtonLightText,
                      shoeCategory === 'workout' &&
                        styles.segmentedButtonLightTextActive,
                    ]}
                  >
                    운동화
                  </Text>
                </Pressable>
              </View>

              {visibleShoes?.length ? (
                visibleShoes.map((item, index) => (
                  <ShoeRecommendationCard
                    item={item}
                    key={`${item.brand}-${item.model}-${index}`}
                  />
                ))
              ) : (
                <View style={[styles.card, iosShadow]}>
                  <Text style={styles.bodyText}>
                    해당 카테고리의 추천 신발이 없어요.
                  </Text>
                </View>
              )}
            </>
          ) : null}
        </>
      ) : null}

      {shoeOnly ? null : (
        <>
          {result.prediction ? (
            <>
              <View style={[styles.headerCard, iosShadow]}>
                <Text style={styles.headerCardTitle}>미래 예측</Text>
                {result.prediction.daysSincePhoto ? (
                  <Text style={styles.headerCardDescription}>
                    촬영일: {result.prediction.photoDate} (
                    {result.prediction.daysSincePhoto}일 전)
                  </Text>
                ) : null}
              </View>

              {result.prediction.daysSincePhoto ? (
                <View style={[styles.card, iosShadow]}>
                  <Text style={styles.sectionTitle}>현재 추정</Text>
                  <Text style={styles.bodyText}>
                    {result.prediction.currentEstimate ?? '-'}
                  </Text>
                </View>
              ) : null}

              {result.prediction.exerciseImpact ? (
                <View style={[styles.card, iosShadow]}>
                  <Text style={styles.sectionTitle}>운동 효과 분석</Text>
                  <Text style={styles.bodyText}>
                    {result.prediction.exerciseImpact}
                  </Text>
                </View>
              ) : null}

              <View style={[styles.card, iosShadow]}>
                <Text style={styles.sectionTitle}>기간별 예측</Text>
                {[
                  {
                    label: '3개월 후',
                    marker: '3',
                    value: result.prediction.threeMonthPrediction,
                  },
                  {
                    label: '6개월 후',
                    marker: '6',
                    value: result.prediction.sixMonthPrediction,
                  },
                  {
                    label: '1년 후',
                    marker: '12',
                    value: result.prediction.oneYearPrediction,
                  },
                ].map((item, index) => (
                  <View key={item.label} style={styles.timelineItem}>
                    <View style={styles.timelineMarker}>
                      <Text style={styles.timelineMarkerText}>
                        {item.marker}
                      </Text>
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineLabel}>{item.label}</Text>
                      <Text style={styles.timelineText}>
                        {item.value ?? '-'}
                      </Text>
                    </View>
                    {index < 2 ? <View style={styles.timelineDivider} /> : null}
                  </View>
                ))}
              </View>

              {result.prediction.milestones?.length ? (
                <View style={[styles.card, iosShadow]}>
                  <Text style={styles.sectionTitle}>달성 가능 목표</Text>
                  {result.prediction.milestones.map((item) => (
                    <View key={item} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {result.prediction.riskFactors?.length ? (
                <View style={[styles.card, iosShadow]}>
                  <Text style={styles.sectionTitle}>주의 위험 요소</Text>
                  {result.prediction.riskFactors.map((item) => (
                    <View key={item} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          ) : null}

          {result.medicalAnalysis ? (
            <View style={[styles.medicalSection, iosShadow]}>
              <Text style={styles.medicalTitle}>의료 증상 분석</Text>
              {result.medicalAnalysis.disclaimer ? (
                <View style={styles.medicalDisclaimer}>
                  <Text style={styles.medicalDisclaimerText}>
                    {result.medicalAnalysis.disclaimer}
                  </Text>
                </View>
              ) : null}

              <View style={styles.medicalBlock}>
                <Text style={styles.medicalBlockTitle}>증상 평가</Text>
                <Text style={styles.bodyText}>
                  {result.medicalAnalysis.symptomAssessment ?? '-'}
                </Text>
              </View>

              <View style={styles.medicalBlock}>
                <Text style={styles.medicalBlockTitle}>체형 구조 영향</Text>
                <Text style={styles.bodyText}>
                  {result.medicalAnalysis.bodyStructureImpact ?? '-'}
                </Text>
              </View>

              {result.medicalAnalysis.musculoskeletalRisks?.length ? (
                <View style={styles.medicalBlock}>
                  <Text style={styles.medicalBlockTitle}>
                    근골격계 위험 요소
                  </Text>
                  {result.medicalAnalysis.musculoskeletalRisks.map(
                    (item, index) => (
                      <View
                        key={`${item.area}-${index}`}
                        style={styles.medicalRiskCard}
                      >
                        <View style={styles.medicalRiskHeader}>
                          <Text style={styles.medicalRiskArea}>
                            {item.area ?? '-'}
                          </Text>
                          <View
                            style={[
                              styles.medicalRiskBadge,
                              {
                                backgroundColor:
                                  item.riskLevel === '높음'
                                    ? 'rgba(239,68,68,0.15)'
                                    : item.riskLevel === '중간'
                                      ? 'rgba(245,158,11,0.15)'
                                      : 'rgba(34,197,94,0.15)',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.medicalRiskBadgeText,
                                {
                                  color:
                                    item.riskLevel === '높음'
                                      ? Colors.danger
                                      : item.riskLevel === '중간'
                                        ? Colors.warning
                                        : Colors.success,
                                },
                              ]}
                            >
                              {item.riskLevel ?? '-'}
                            </Text>
                          </View>
                        </View>
                        {item.description ? (
                          <Text style={styles.bodyText}>
                            {item.description}
                          </Text>
                        ) : null}
                        {item.preventionTip ? (
                          <Text style={styles.inlineInfoText}>
                            {item.preventionTip}
                          </Text>
                        ) : null}
                      </View>
                    ),
                  )}
                </View>
              ) : null}

              {result.medicalAnalysis.exerciseWarnings?.length ? (
                <View style={styles.medicalBlock}>
                  <Text style={styles.medicalBlockTitle}>운동 주의사항</Text>
                  {result.medicalAnalysis.exerciseWarnings.map(
                    (item, index) => (
                      <View
                        key={`${item.exercise}-${index}`}
                        style={styles.medicalWarnCard}
                      >
                        <Text style={styles.medicalWarnTitle}>
                          {item.exercise ?? '-'}
                        </Text>
                        {item.reason ? (
                          <Text style={styles.bodyText}>{item.reason}</Text>
                        ) : null}
                        {item.alternative ? (
                          <Text style={styles.inlineInfoText}>
                            대안: {item.alternative}
                          </Text>
                        ) : null}
                      </View>
                    ),
                  )}
                </View>
              ) : null}

              {result.medicalAnalysis.rehabExercises?.length ? (
                <View style={styles.medicalBlock}>
                  <Text style={styles.medicalBlockTitle}>재활/교정 운동</Text>
                  {result.medicalAnalysis.rehabExercises.map((item, index) => (
                    <View
                      key={`${item.name}-${index}`}
                      style={styles.medicalRehabCard}
                    >
                      <View style={styles.medicalRehabHeader}>
                        <View style={styles.medicalRehabIndex}>
                          <Text style={styles.medicalRehabIndexText}>
                            {index + 1}
                          </Text>
                        </View>
                        <View style={styles.medicalRehabTextWrap}>
                          <Text style={styles.medicalRehabName}>
                            {item.name ?? '-'}
                          </Text>
                          <Text style={styles.inlineInfoText}>
                            {item.targetArea ?? '-'} · {item.frequency ?? '-'}
                          </Text>
                        </View>
                      </View>
                      {item.description ? (
                        <Text style={styles.bodyText}>{item.description}</Text>
                      ) : null}
                      {item.precaution ? (
                        <Text style={styles.inlineInfoText}>
                          {item.precaution}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}

              {result.medicalAnalysis.lifestyleAdvice?.length ? (
                <View style={styles.medicalBlock}>
                  <Text style={styles.medicalBlockTitle}>생활습관 조언</Text>
                  {result.medicalAnalysis.lifestyleAdvice.map((item) => (
                    <View key={item} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {result.medicalAnalysis.referralSuggestion ? (
                <View style={styles.medicalReferralCard}>
                  <Text style={styles.medicalReferralText}>
                    {result.medicalAnalysis.referralSuggestion}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {result.recommendations?.length ? (
            <View style={[styles.card, iosShadow]}>
              <Text style={styles.sectionTitle}>체형 추천사항</Text>
              {result.recommendations.map((item, index) => (
                <RecommendationRow index={index} key={item} text={item} />
              ))}
            </View>
          ) : null}

          {result.summary ? (
            <View style={[styles.summaryCard, iosShadow]}>
              <Text style={styles.summaryTitle}>종합 요약</Text>
              <Text style={styles.summaryText}>{result.summary}</Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bodyText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  bodyTypeBadge: {
    alignItems: 'center',
    borderRadius: 28,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  bodyTypeCard: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  bodyTypeDescription: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  bodyTypeLetter: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 30,
  },
  bodyTypeName: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    marginTop: 4,
  },
  bodyTypeTitle: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    marginTop: 12,
  },
  bulletDot: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
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
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
  },
  compositeScoreBar: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 999,
    height: 10,
    marginTop: 12,
    overflow: 'hidden',
  },
  compositeScoreCard: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 16,
    padding: 16,
  },
  compositeScoreFill: {
    borderRadius: 999,
    height: '100%',
  },
  compositeScoreLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    marginTop: 4,
  },
  compositeScoreValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 24,
  },
  container: {
    paddingBottom: 12,
  },
  featureBadge: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  featureBadgeText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  featureWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gaitTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  gaitTypeBadgeText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  gradeBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  gradeBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  headerCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  headerCardDescription: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  headerCardTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  inlineInfoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
  },
  inlineInfoStrong: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  inlineInfoText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  leftRightBadge: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  leftRightBadgeText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  measureLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  measureNote: {
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  measureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  measureValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  measureValueBadge: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  medicalBlock: {
    gap: 10,
  },
  medicalBlockTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  medicalDisclaimer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  medicalDisclaimerText: {
    color: Colors.warning,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  medicalRehabCard: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    gap: 8,
    padding: 12,
  },
  medicalRehabHeader: {
    flexDirection: 'row',
    gap: 10,
  },
  medicalRehabIndex: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 999,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  medicalRehabIndexText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  medicalRehabName: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  medicalRehabTextWrap: {
    flex: 1,
  },
  medicalReferralCard: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: 14,
    padding: 12,
  },
  medicalReferralText: {
    color: Colors.danger,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    lineHeight: 19,
  },
  medicalRiskArea: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  medicalRiskBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  medicalRiskBadgeText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  medicalRiskCard: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    gap: 8,
    padding: 12,
  },
  medicalRiskHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medicalSection: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    gap: 14,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  medicalTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  medicalWarnCard: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    gap: 8,
    padding: 12,
  },
  medicalWarnTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  mobilityItem: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  mobilityLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  mobilityRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  mobilityScore: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    marginTop: 4,
  },
  multiViewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  priorityBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  priorityCard: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    gap: 8,
    padding: 12,
  },
  priorityDescription: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  priorityExercise: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  priorityHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  priorityTitle: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  ratioBar: {
    marginTop: 10,
  },
  ratioBarBackground: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 999,
    height: 10,
    position: 'relative',
  },
  ratioHint: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  ratioItem: {
    gap: 4,
  },
  ratioLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  ratioLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  ratioMarker: {
    backgroundColor: Colors.accent,
    borderRadius: 999,
    height: 16,
    marginLeft: -6,
    position: 'absolute',
    top: -3,
    width: 12,
  },
  ratioValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 22,
  },
  recommendationBadge: {
    alignItems: 'center',
    borderRadius: 999,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  recommendationBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
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
    lineHeight: 19,
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
    fontSize: 14,
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
    fontSize: 13,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  segmentedButton: {
    alignItems: 'center',
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  segmentedButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  segmentedButtonLight: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  segmentedButtonLightActive: {
    borderColor: Colors.accent,
  },
  segmentedButtonLightText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  segmentedButtonLightTextActive: {
    color: Colors.accent,
  },
  segmentedButtonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  segmentedButtonTextActive: {
    color: Colors.white,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
  },
  severityBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  severityBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  shoeBrandBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  shoeBrandText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  shoeCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
  },
  shoeCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  shoeMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shoeModelText: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  shoePriceText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  shoeReasonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  shoeSizeBigBadge: {
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 96,
    minWidth: 96,
    paddingHorizontal: 12,
  },
  shoeSizeBigUnit: {
    color: Colors.accent,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  shoeSizeBigValue: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 28,
  },
  shoeSizeDetailGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  shoeSizeDetailItem: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    flex: 1,
    gap: 4,
    padding: 12,
  },
  shoeSizeDetailLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  shoeSizeDetailValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  shoeSizeInfoColumn: {
    flex: 1,
    gap: 6,
  },
  shoeSizeMainRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shoeSizeMeta: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  shoeSizeTag: {
    backgroundColor: Colors.accent,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  shoeSizeTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shoeSizeTagText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  shoeSpecItem: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    flex: 1,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  shoeSpecLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
  },
  shoeSpecRow: {
    flexDirection: 'row',
    gap: 8,
  },
  shoeSpecValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  shoeTypeBadge: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  shoeTypeText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
  },
  summaryText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  summaryTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDivider: {
    backgroundColor: Colors.cardBorder,
    height: 16,
    left: 16,
    position: 'absolute',
    top: 34,
    width: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
    position: 'relative',
  },
  timelineLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  timelineMarker: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  timelineMarkerText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  timelineText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  viewDetailLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  viewDetailNote: {
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  viewDetailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  viewSection: {
    gap: 10,
  },
  viewSectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  wearPatternBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  wearPatternBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  wearPatternRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
