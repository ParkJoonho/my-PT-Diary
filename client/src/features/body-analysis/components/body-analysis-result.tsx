import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { UnimplementedBadge } from 'shared/components/unimplemented-badge';
import Colors, { iosShadow } from 'shared/constants/colors';
import type {
  BodyAnalysisResult,
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
  '내측마모': Colors.warning,
  '뒤꿈치마모': Colors.info,
  '불균형마모': Colors.danger,
  '앞꿈치마모': Colors.info,
  외측마모: Colors.warning,
  정상: Colors.success,
};

function getScoreColor(score: number) {
  if (score >= 4) {
    return Colors.success;
  }

  if (score >= 3) {
    return Colors.info;
  }

  if (score >= 2) {
    return Colors.warning;
  }

  return Colors.danger;
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
          <Text style={styles.shoeTypeBadgeText}>{item.type ?? '-'}</Text>
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
          {item.features.map((feature, index) => (
            <View key={`${feature}-${index}`} style={styles.featureBadge}>
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
  showFutureAsUnimplemented = false,
}: {
  result: BodyAnalysisResult;
  showFutureAsUnimplemented?: boolean;
}) {
  const bodyTypeColor = BODY_TYPE_COLORS[result.bodyType ?? ''] ?? Colors.info;
  const [shoeTab, setShoeTab] = useState<'after' | 'current'>('current');
  const [shoeCategory, setShoeCategory] = useState<'daily' | 'workout'>('daily');

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
      <View style={[styles.heroCard, iosShadow]}>
        <View style={[styles.bodyTypeBadge, { backgroundColor: bodyTypeColor }]}>
          <Text style={styles.bodyTypeLetter}>{result.bodyType ?? '?'}</Text>
        </View>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>BODY MBTI</Text>
          <Text style={styles.heroSubTitle}>
            {BODY_TYPE_NAMES[result.bodyType ?? ''] ?? (result.bodyType ?? '-')}
          </Text>
          {result.bodyTypeDescription ? (
            <Text style={styles.heroDescription}>
              {result.bodyTypeDescription}
            </Text>
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
            <View style={styles.multiViewGradeBadge}>
              <Text style={styles.multiViewGradeText}>
                {result.multiViewAnalysis.compositeGrade ?? '-'} ·{' '}
                {result.multiViewAnalysis.compositePostureScore ?? 0}점
              </Text>
            </View>
          </View>
          {result.multiViewAnalysis.priorityCorrections?.map((item, index) => (
            <View key={`${item.issue}-${index}`} style={styles.correctionItem}>
              <View style={styles.correctionHeader}>
                <View style={styles.correctionPriorityBadge}>
                  <Text style={styles.correctionPriorityText}>
                    {item.priority ?? '-'}
                  </Text>
                </View>
                <Text style={styles.correctionTitle}>{item.issue ?? '-'}</Text>
              </View>
              <Text style={styles.correctionExercise}>
                교정 운동: {item.exercise ?? '-'}
              </Text>
              {item.description ? (
                <Text style={styles.correctionDescription}>
                  {item.description}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {result.gaitAnalysis ? (
        <>
          <View style={[styles.headerCard, iosShadow]}>
            <Text style={styles.headerCardTitle}>걸음걸이 분석</Text>
            <Text style={styles.headerCardDescription}>
              신발 마모 패턴 기반 보행 분석
            </Text>
          </View>

          <View style={[styles.card, iosShadow]}>
            <Text style={styles.cardTitle}>신발 마모 패턴</Text>
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
                <View style={styles.sideBadge}>
                  <Text style={styles.sideBadgeText}>
                    {result.gaitAnalysis.wearPattern.leftRight}
                  </Text>
                </View>
              ) : null}
            </View>
            {result.gaitAnalysis.wearPattern?.description ? (
              <Text style={styles.sectionDescription}>
                {result.gaitAnalysis.wearPattern.description}
              </Text>
            ) : null}
          </View>

          <View style={[styles.card, iosShadow]}>
            <Text style={styles.cardTitle}>보행 유형</Text>
            {result.gaitAnalysis.gaitType?.type ? (
              <View style={styles.gaitTypeBadge}>
                <Text style={styles.gaitTypeBadgeText}>
                  {result.gaitAnalysis.gaitType.type}
                </Text>
              </View>
            ) : null}
            {result.gaitAnalysis.gaitType?.description ? (
              <Text style={styles.sectionDescription}>
                {result.gaitAnalysis.gaitType.description}
              </Text>
            ) : null}
          </View>

          <View style={[styles.card, iosShadow]}>
            <Text style={styles.cardTitle}>발 정렬 상태</Text>
            <DetailRow
              label="아치 유형"
              value={result.gaitAnalysis.footAlignment?.archType}
            />
            <ScoreBar
              label="발목 정렬"
              note={result.gaitAnalysis.footAlignment?.ankleAlignment?.note}
              score={result.gaitAnalysis.footAlignment?.ankleAlignment?.score}
            />
            <DetailRow
              label="발가락"
              note={result.gaitAnalysis.footAlignment?.toeAlignment?.note}
              value={result.gaitAnalysis.footAlignment?.toeAlignment?.value}
            />
          </View>

          <View style={[styles.card, iosShadow]}>
            <Text style={styles.cardTitle}>걸음걸이가 신체에 미치는 영향</Text>
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
              <Text style={styles.cardTitle}>걸음걸이 교정 추천</Text>
              {result.gaitAnalysis.gaitRecommendations.map((item, index) => (
                <RecommendationRow
                  index={index}
                  key={`${item}-${index}`}
                  text={item}
                  tone="info"
                />
              ))}
            </View>
          ) : null}

          {result.gaitAnalysis.shoeSizeEstimate ? (
            <View style={[styles.card, iosShadow]}>
              <Text style={styles.cardTitle}>신발 사이즈 측정</Text>
              <View style={styles.shoeSizeRow}>
                <View style={styles.shoeSizeBadge}>
                  <Text style={styles.shoeSizeNumber}>
                    {result.gaitAnalysis.shoeSizeEstimate.estimatedSize ?? '-'}
                  </Text>
                  <Text style={styles.shoeSizeUnit}>mm</Text>
                </View>
                <View style={styles.shoeSizeInfo}>
                  <View style={styles.shoeTagRow}>
                    {result.gaitAnalysis.shoeSizeEstimate.ageGroup ? (
                      <View style={styles.shoeTag}>
                        <Text style={styles.shoeTagText}>
                          {result.gaitAnalysis.shoeSizeEstimate.ageGroup}
                        </Text>
                      </View>
                    ) : null}
                    {result.gaitAnalysis.shoeSizeEstimate.gender &&
                    result.gaitAnalysis.shoeSizeEstimate.gender !== '판단불가' ? (
                      <View style={[styles.shoeTag, styles.shoeTagInfo]}>
                        <Text style={styles.shoeTagText}>
                          {result.gaitAnalysis.shoeSizeEstimate.gender}
                        </Text>
                      </View>
                    ) : null}
                    {result.gaitAnalysis.shoeSizeEstimate.width ? (
                      <View style={[styles.shoeTag, styles.shoeTagAccent]}>
                        <Text style={styles.shoeTagText}>
                          발볼 {result.gaitAnalysis.shoeSizeEstimate.width}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.shoeSizeMeta}>
                    범위: {result.gaitAnalysis.shoeSizeEstimate.sizeRange ?? '-'}
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
                <Text style={styles.sectionDescription}>
                  {result.gaitAnalysis.shoeSizeEstimate.widthDescription}
                </Text>
              ) : null}
              {result.gaitAnalysis.shoeSizeEstimate.genderReason &&
              result.gaitAnalysis.shoeSizeEstimate.gender !== '판단불가' ? (
                <Text style={styles.genderReasonText}>
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
                  {result.gaitAnalysis.shoeSizeEstimate?.ageGroup
                    ? `${result.gaitAnalysis.shoeSizeEstimate.ageGroup}${result.gaitAnalysis.shoeSizeEstimate.gender && result.gaitAnalysis.shoeSizeEstimate.gender !== '판단불가' ? ` · ${result.gaitAnalysis.shoeSizeEstimate.gender}` : ''}${result.gaitAnalysis.shoeSizeEstimate.sizeRange ? ` · ${result.gaitAnalysis.shoeSizeEstimate.sizeRange}mm` : ''}`
                    : '보행 패턴 기반 User-Item Matching'}
                </Text>
              </View>

              <View style={[styles.card, iosShadow]}>
                <Text style={styles.cardTitle}>매칭 분석</Text>
                <Text style={styles.sectionDescription}>
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
                <View style={[styles.infoInlineCard, iosShadow]}>
                  <Text style={styles.infoInlineText}>
                    예상 교정 기간: {shoeRecommendations.afterCorrection.timeline ?? '-'}
                  </Text>
                  <Text style={styles.infoInlineSubText}>
                    교정 후 보행: {shoeRecommendations.afterCorrection.correctedGaitType ?? '-'}
                  </Text>
                </View>
              ) : null}

              <View style={styles.segmentedRow}>
                <Pressable
                  onPress={() => setShoeCategory('daily')}
                  style={[
                    styles.segmentedButtonLight,
                    shoeCategory === 'daily' && styles.segmentedButtonLightActive,
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
                  <Text style={styles.sectionDescription}>
                    해당 카테고리의 추천 신발이 없어요.
                  </Text>
                </View>
              )}
            </>
          ) : null}
        </>
      ) : null}

      {result.prediction ? (
        <>
          <View style={[styles.headerCard, iosShadow]}>
            <Text style={styles.headerCardTitle}>미래 예측</Text>
            {showFutureAsUnimplemented ? <UnimplementedBadge compact /> : null}
            {result.prediction.photoDate && result.prediction.daysSincePhoto ? (
              <Text style={styles.headerCardDescription}>
                촬영일: {result.prediction.photoDate} ({result.prediction.daysSincePhoto}일 전)
              </Text>
            ) : null}
          </View>

          {result.prediction.daysSincePhoto ? (
            <View style={[styles.card, iosShadow]}>
              <Text style={styles.cardTitle}>현재 추정</Text>
              <Text style={styles.sectionDescription}>
                {result.prediction.currentEstimate ?? '-'}
              </Text>
            </View>
          ) : null}

          {result.prediction.exerciseImpact ? (
            <View style={[styles.card, iosShadow]}>
              <Text style={styles.cardTitle}>운동 효과 분석</Text>
              <Text style={styles.sectionDescription}>
                {result.prediction.exerciseImpact}
              </Text>
            </View>
          ) : null}

          <View style={[styles.card, iosShadow]}>
            <Text style={styles.cardTitle}>기간별 예측</Text>
            {[
              { label: '3개월 후', value: result.prediction.threeMonthPrediction },
              { label: '6개월 후', value: result.prediction.sixMonthPrediction },
              { label: '1년 후', value: result.prediction.oneYearPrediction },
            ].map((item, index) => (
              <View key={item.label} style={styles.timelineItem}>
                <View style={styles.timelineDot}>
                  <Text style={styles.timelineDotText}>
                    {index === 0 ? '3' : index === 1 ? '6' : '12'}
                  </Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>{item.label}</Text>
                  <Text style={styles.timelineText}>{item.value ?? '-'}</Text>
                </View>
              </View>
            ))}
          </View>

          {result.prediction.milestones?.length ? (
            <View style={[styles.card, iosShadow]}>
              <Text style={styles.cardTitle}>달성 가능 목표</Text>
              {result.prediction.milestones.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {result.prediction.riskFactors?.length ? (
            <View style={[styles.card, iosShadow]}>
              <Text style={styles.cardTitle}>주의 위험 요소</Text>
              {result.prediction.riskFactors.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      {result.medicalAnalysis ? (
        <View style={[styles.card, iosShadow]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>증상 참고 분석</Text>
            <UnimplementedBadge compact />
          </View>
          <Text style={styles.helperText}>
            원본보다 간결하게 렌더링하고 있어요. 상세 위험/재활 리스트는 후속으로
            더 풀어낼 수 있어요.
          </Text>
          <DetailRow
            label="증상 평가"
            note={result.medicalAnalysis.symptomAssessment}
          />
          <DetailRow
            label="체형 영향"
            note={result.medicalAnalysis.bodyStructureImpact}
          />
          {result.medicalAnalysis.exerciseWarnings?.length ? (
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>주의 운동</Text>
              {result.medicalAnalysis.exerciseWarnings.map((item, index) => (
                <View key={`${item.exercise}-${index}`} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    {item.exercise} — {item.reason}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          {result.medicalAnalysis.rehabExercises?.length ? (
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>재활 보조 운동</Text>
              {result.medicalAnalysis.rehabExercises.map((item, index) => (
                <View key={`${item.name}-${index}`} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    {item.name} ({item.frequency}) — {item.description}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          {result.medicalAnalysis.referralSuggestion ? (
            <Text style={styles.referralText}>
              {result.medicalAnalysis.referralSuggestion}
            </Text>
          ) : null}
          {result.medicalAnalysis.disclaimer ? (
            <Text style={styles.disclaimerText}>
              {result.medicalAnalysis.disclaimer}
            </Text>
          ) : null}
        </View>
      ) : null}

      {result.recommendations?.length ? (
        <View style={[styles.card, iosShadow]}>
          <Text style={styles.cardTitle}>체형 추천사항</Text>
          {result.recommendations.map((item, index) => (
            <RecommendationRow
              index={index}
              key={`${item}-${index}`}
              text={item}
            />
          ))}
        </View>
      ) : null}

      {result.summary ? (
        <View style={[styles.summaryCard, iosShadow]}>
          <Text style={styles.summaryTitle}>종합 요약</Text>
          <Text style={styles.summaryText}>{result.summary}</Text>
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
  bulletDot: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
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
    lineHeight: 18,
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
    marginHorizontal: 16,
    marginTop: 12,
  },
  correctionDescription: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  correctionExercise: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  correctionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  correctionItem: {
    gap: 8,
  },
  correctionPriorityBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  correctionPriorityText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  correctionTitle: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
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
    lineHeight: 17,
  },
  featureBadge: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  featureBadgeText: {
    color: Colors.text,
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
    backgroundColor: '#EAF0FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  gaitTypeBadgeText: {
    color: Colors.info,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  genderReasonText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  headerCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 4,
    padding: 16,
  },
  headerCardDescription: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  headerCardTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
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
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  heroSubTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  heroTextWrap: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  heroTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  infoInlineCard: {
    backgroundColor: '#EAF0FF',
    borderRadius: 14,
    gap: 4,
    marginTop: -2,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoInlineSubText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  infoInlineText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  multiViewGradeBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  multiViewGradeText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  ratioGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  ratioItem: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 12,
    flex: 1,
    gap: 6,
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
    fontSize: 11,
  },
  recommendationRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  recommendationText: {
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  referralText: {
    color: Colors.danger,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    lineHeight: 19,
  },
  scoreBarBackground: {
    backgroundColor: Colors.cardBorder,
    borderRadius: 999,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  scoreBarFill: {
    borderRadius: 999,
    height: '100%',
  },
  scoreBarWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
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
    fontSize: 12,
    minWidth: 32,
    textAlign: 'right',
  },
  sectionDescription: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  segmentedButton: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 12,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  segmentedButtonActive: {
    backgroundColor: Colors.accent,
  },
  segmentedButtonLight: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  segmentedButtonLightActive: {
    backgroundColor: Colors.accentLight,
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
    fontSize: 13,
  },
  segmentedButtonTextActive: {
    color: Colors.white,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 10,
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
    borderRadius: 16,
    gap: 12,
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
    fontSize: 15,
  },
  shoePriceText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  shoeReasonText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  shoeSizeBadge: {
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    borderRadius: 16,
    minWidth: 88,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  shoeSizeDetailGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  shoeSizeDetailItem: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 12,
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
    fontSize: 13,
  },
  shoeSizeInfo: {
    flex: 1,
    gap: 6,
  },
  shoeSizeMeta: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  shoeSizeNumber: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 28,
  },
  shoeSizeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shoeSizeUnit: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  shoeSpecItem: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 12,
    flex: 1,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 10,
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
    fontSize: 12,
  },
  shoeTag: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  shoeTagAccent: {
    backgroundColor: Colors.accent,
  },
  shoeTagInfo: {
    backgroundColor: Colors.info,
  },
  shoeTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  shoeTagText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  shoeTypeBadge: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  shoeTypeBadgeText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  sideBadge: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  sideBadgeText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  subSection: {
    gap: 8,
  },
  subSectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 8,
    padding: 16,
  },
  summaryText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  summaryTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
  },
  timelineContent: {
    flex: 1,
    gap: 4,
  },
  timelineDot: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  timelineDotText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  timelineItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  timelineLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  timelineText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  wearPatternBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  wearPatternBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
  },
  wearPatternRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
