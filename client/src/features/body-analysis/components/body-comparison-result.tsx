import {
  ArrowRight,
  Check,
  CheckCircle2,
  Droplets,
  Dumbbell,
  Flag,
  RefreshCw,
  Sparkles,
  TriangleAlert,
} from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Colors, { iosShadow } from 'shared/constants/colors';
import type { BodyComparisonResult } from '../types/body-analysis';

function getGradeColor(grade?: string) {
  switch (grade) {
    case 'S':
      return '#7C3AED';
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

function getChangeColor(change?: string) {
  switch (change) {
    case '개선':
      return Colors.success;
    case '유지':
      return Colors.info;
    case '저하':
      return Colors.warning;
    default:
      return Colors.textMuted;
  }
}

export function BodyComparisonResultView({
  afterImageUri,
  beforeImageUri,
  onRetry,
  result,
}: {
  afterImageUri?: string;
  beforeImageUri?: string;
  onRetry?: () => void;
  result: BodyComparisonResult;
}) {
  const score = result.overallChange?.score ?? 0;
  const grade = result.overallChange?.grade;
  const summary = result.overallChange?.summary;

  return (
    <View style={styles.container}>
      <View style={[styles.summaryCard, iosShadow]}>
        <View style={styles.scoreRow}>
          <View
            style={[
              styles.gradeBadge,
              { backgroundColor: getGradeColor(grade) },
            ]}
          >
            <Text style={styles.gradeText}>{grade ?? '?'}</Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreValue}>{score}점</Text>
            <Text style={styles.scoreLabel}>변화 점수</Text>
          </View>
        </View>
        {summary ? <Text style={styles.summaryText}>{summary}</Text> : null}
      </View>

      {beforeImageUri || afterImageUri ? (
        <View style={styles.imageRow}>
          {beforeImageUri ? (
            <View style={styles.imageCol}>
              <View
                style={[styles.directionBadge, { backgroundColor: '#6366F1' }]}
              >
                <Text style={styles.directionBadgeText}>전</Text>
              </View>
              <Image
                resizeMode="cover"
                source={{ uri: beforeImageUri }}
                style={styles.resultImage}
              />
            </View>
          ) : null}
          {beforeImageUri && afterImageUri ? (
            <View style={styles.imageArrowWrap}>
              <ArrowRight color={Colors.textMuted} size={20} strokeWidth={2.1} />
            </View>
          ) : null}
          {afterImageUri ? (
            <View style={styles.imageCol}>
              <View
                style={[styles.directionBadge, { backgroundColor: '#10B981' }]}
              >
                <Text style={styles.directionBadgeText}>후</Text>
              </View>
              <Image
                resizeMode="cover"
                source={{ uri: afterImageUri }}
                style={styles.resultImage}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {result.bodyChanges ? (
        <View style={[styles.sectionCard, iosShadow]}>
          <Text style={styles.sectionTitle}>부위별 변화</Text>
          {[
            ['upperBody', '상체'],
            ['core', '코어/복부'],
            ['lowerBody', '하체'],
          ].map(([key, label]) => {
            const change =
              result.bodyChanges?.[key as keyof NonNullable<
                BodyComparisonResult['bodyChanges']
              >];

            if (!change) {
              return null;
            }

            const color = getChangeColor(change.change);

            return (
              <View key={key} style={styles.changeItem}>
                <View style={styles.changeHeader}>
                  <Text style={styles.changeLabel}>{label}</Text>
                  <View style={[styles.changeBadge, { backgroundColor: color }]}>
                    <Text style={styles.changeBadgeText}>{change.change}</Text>
                  </View>
                </View>
                {change.description ? (
                  <Text style={styles.changeDescription}>{change.description}</Text>
                ) : null}
                {change.details?.map((detail, index) => (
                  <View key={`${label}-${index}`} style={styles.detailRow}>
                    <Check color={color} size={14} strokeWidth={2.3} />
                    <Text style={styles.detailText}>{detail}</Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      ) : null}

      {result.postureChanges ? (
        <View style={[styles.sectionCard, iosShadow]}>
          <Text style={styles.sectionTitle}>자세 변화</Text>
          {result.postureChanges.overallPosture ? (
            <Text style={styles.changeDescription}>
              {result.postureChanges.overallPosture}
            </Text>
          ) : null}
          {result.postureChanges.improvements?.length ? (
            <View style={styles.subSectionWrap}>
              <Text style={styles.subSectionTitle}>개선된 점</Text>
              {result.postureChanges.improvements.map((item, index) => (
                <View key={`improvement-${index}`} style={styles.detailRow}>
                  <CheckCircle2
                    color={Colors.success}
                    size={14}
                    strokeWidth={2.1}
                  />
                  <Text style={styles.detailText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {result.postureChanges.remaining?.length ? (
            <View style={styles.subSectionWrap}>
              <Text style={styles.subSectionTitle}>개선 필요</Text>
              {result.postureChanges.remaining.map((item, index) => (
                <View key={`remaining-${index}`} style={styles.detailRow}>
                  <TriangleAlert
                    color={Colors.warning}
                    size={14}
                    strokeWidth={2.1}
                  />
                  <Text style={styles.detailText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {result.bodyComposition ? (
        <View style={[styles.sectionCard, iosShadow]}>
          <Text style={styles.sectionTitle}>체성분 변화 추정</Text>
          <View style={styles.compositionRow}>
            <View style={styles.compositionItem}>
              <Dumbbell color={Colors.success} size={18} strokeWidth={2.1} />
              <Text style={styles.compositionLabel}>근육량</Text>
              <Text style={styles.compositionValue}>
                {result.bodyComposition.muscleChange}
              </Text>
            </View>
            <View style={styles.compositionItem}>
              <Droplets color={Colors.info} size={18} strokeWidth={2.1} />
              <Text style={styles.compositionLabel}>체지방</Text>
              <Text style={styles.compositionValue}>
                {result.bodyComposition.fatChange}
              </Text>
            </View>
          </View>
          {result.bodyComposition.proportionChange ? (
            <Text style={styles.changeDescription}>
              {result.bodyComposition.proportionChange}
            </Text>
          ) : null}
        </View>
      ) : null}

      {result.recommendations ? (
        <View style={[styles.sectionCard, iosShadow]}>
          <Text style={styles.sectionTitle}>추천사항</Text>
          {result.recommendations.keepDoing?.length ? (
            <View style={styles.subSectionWrap}>
              <Text style={[styles.subSectionTitle, { color: Colors.success }]}>
                유지할 것
              </Text>
              {result.recommendations.keepDoing.map((item, index) => (
                <View key={`keep-${index}`} style={styles.detailRow}>
                  <CheckCircle2
                    color={Colors.success}
                    size={14}
                    strokeWidth={2.1}
                  />
                  <Text style={styles.detailText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {result.recommendations.improve?.length ? (
            <View style={styles.subSectionWrap}>
              <Text style={[styles.subSectionTitle, { color: Colors.accent }]}>
                개선할 것
              </Text>
              {result.recommendations.improve.map((item, index) => (
                <View key={`improve-${index}`} style={styles.detailRow}>
                  <ArrowRight
                    color={Colors.accent}
                    size={14}
                    strokeWidth={2.1}
                  />
                  <Text style={styles.detailText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {result.recommendations.nextGoal ? (
            <View style={styles.nextGoalRow}>
              <Flag color="#D4AF37" size={16} strokeWidth={2.1} />
              <Text style={styles.nextGoalText}>
                {result.recommendations.nextGoal}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {result.motivationalMessage ? (
        <View style={[styles.motivationCard, iosShadow]}>
          <Sparkles color="#D4AF37" size={18} strokeWidth={2.1} />
          <Text style={styles.motivationText}>
            {result.motivationalMessage}
          </Text>
        </View>
      ) : null}

      {onRetry ? (
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <RefreshCw color="#10B981" size={16} strokeWidth={2.1} />
          <Text style={styles.retryButtonText}>다시 비교하기</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  changeBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  changeBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
  },
  changeDescription: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  changeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  changeItem: {
    borderBottomColor: Colors.cardBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 6,
    paddingBottom: 12,
  },
  changeLabel: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  compositionItem: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 12,
    flex: 1,
    gap: 4,
    minHeight: 96,
    justifyContent: 'center',
    padding: 12,
  },
  compositionLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  compositionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  compositionValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  container: {
    gap: 12,
  },
  detailRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 6,
  },
  detailText: {
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  directionBadge: {
    alignSelf: 'center',
    borderRadius: 999,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  directionBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  gradeBadge: {
    alignItems: 'center',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  gradeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 22,
  },
  imageArrowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCol: {
    flex: 1,
  },
  imageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  motivationCard: {
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    padding: 16,
  },
  motivationText: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 22,
  },
  nextGoalRow: {
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  nextGoalText: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  resultImage: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 12,
    height: 160,
    width: '100%',
  },
  retryButton: {
    alignItems: 'center',
    borderColor: '#10B981',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  retryButtonText: {
    color: '#10B981',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  scoreInfo: {
    gap: 2,
  },
  scoreLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  scoreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  scoreValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 12,
    padding: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  subSectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  subSectionWrap: {
    gap: 6,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 12,
    padding: 16,
  },
  summaryText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 22,
  },
});
