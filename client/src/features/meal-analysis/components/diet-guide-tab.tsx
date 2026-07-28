import {
  Apple,
  Bot,
  Lightbulb,
  PieChart,
  RefreshCw,
  Star,
  Utensils,
} from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { DietGuideResponseDto } from 'shared/api/generated/models';
import Colors, { iosShadow } from 'shared/constants/colors';

type DietGuideTabProps = {
  guide?: DietGuideResponseDto;
  isLoading: boolean;
  onGenerate: () => void;
  recordCount: number;
};

export function DietGuideTab({
  guide,
  isLoading,
  onGenerate,
  recordCount,
}: DietGuideTabProps) {
  if (isLoading) {
    return (
      <View style={[styles.ctaCard, iosShadow]}>
        <ActivityIndicator color={Colors.accent} size="large" />
        <Text style={styles.loadingText}>
          AI가 오늘 식단을 분석하고 있습니다...
        </Text>
      </View>
    );
  }

  if (!guide) {
    return (
      <View style={[styles.ctaCard, iosShadow]}>
        <Apple color={Colors.accent} size={52} strokeWidth={1.8} />
        <Text style={styles.ctaTitle}>AI 식단 가이드</Text>
        <Text style={styles.ctaDescription}>
          {recordCount > 0
            ? `오늘 ${recordCount}끼 식사를 분석하여 맞춤 가이드를 드립니다.`
            : '식사를 기록하면 AI가 맞춤 식단 가이드를 제공합니다.'}
        </Text>
        <Pressable onPress={onGenerate} style={styles.ctaButton}>
          <Bot color={Colors.white} size={20} strokeWidth={2.1} />
          <Text style={styles.ctaButtonText}>
            {recordCount > 0 ? 'AI 가이드 생성' : 'AI 가이드 미리 보기'}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GuideCard
        icon={<Star color={Colors.accent} size={24} strokeWidth={2} />}
        title="오늘 식단 평가"
      >
        <Text style={styles.overallText}>{guide.guide.overallAssessment}</Text>
      </GuideCard>

      <GuideCard
        icon={<PieChart color={Colors.info} size={22} strokeWidth={2} />}
        title="목표 영양소"
      >
        <View style={styles.macroRow}>
          <MacroPill
            color={Colors.accent}
            label="칼로리(kcal)"
            value={guide.guide.macroTargets.calories}
          />
          <MacroPill
            color={Colors.success}
            label="단백질"
            suffix="g"
            value={guide.guide.macroTargets.protein}
          />
          <MacroPill
            color={Colors.info}
            label="탄수화물"
            suffix="g"
            value={guide.guide.macroTargets.carbs}
          />
          <MacroPill
            color={Colors.warning}
            label="지방"
            suffix="g"
            value={guide.guide.macroTargets.fat}
          />
        </View>
      </GuideCard>

      <GuideCard
        icon={<Utensils color={Colors.accent} size={22} strokeWidth={2} />}
        title="추천 식사 구성"
      >
        {guide.guide.mealPlan.map((meal, index) => (
          <View
            key={`${meal.mealName}-${index}`}
            style={[
              styles.mealRow,
              index === guide.guide.mealPlan.length - 1
                ? styles.lastBorderlessItem
                : undefined,
            ]}
          >
            <Text style={styles.mealName}>{meal.mealName}</Text>
            <Text style={styles.mealFoods}>{meal.foods.join(', ')}</Text>
            {meal.calories > 0 ? (
              <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
            ) : null}
          </View>
        ))}
      </GuideCard>

      <GuideCard
        icon={<Lightbulb color={Colors.warning} size={22} strokeWidth={2} />}
        title="오늘의 식단 팁"
      >
        {guide.guide.tips.map((tip) => (
          <View key={tip} style={styles.tipRow}>
            <Text style={styles.tipCheck}>✓</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </GuideCard>

      <Pressable onPress={onGenerate} style={styles.regenerateButton}>
        <RefreshCw color={Colors.accent} size={18} strokeWidth={2.1} />
        <Text style={styles.regenerateText}>다시 생성</Text>
      </Pressable>
    </View>
  );
}

function GuideCard({
  children,
  icon,
  title,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <View style={[styles.guideCard, iosShadow]}>
      <View style={styles.guideCardHeader}>
        {icon}
        <Text style={styles.guideCardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function MacroPill({
  color,
  label,
  suffix = '',
  value,
}: {
  color: string;
  label: string;
  suffix?: string;
  value: number;
}) {
  return (
    <View style={styles.macroPill}>
      <Text style={[styles.macroValue, { color }]}>
        {value}
        {suffix}
      </Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  ctaButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
  ctaCard: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    gap: 12,
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 24,
  },
  ctaDescription: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  ctaTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
    textAlign: 'center',
  },
  guideCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    marginBottom: 12,
    padding: 20,
  },
  guideCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  guideCardTitle: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
  lastBorderlessItem: {
    borderBottomWidth: 0,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    marginTop: 8,
  },
  macroLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    marginTop: 2,
  },
  macroPill: {
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  macroValue: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
  },
  mealCalories: {
    color: Colors.accent,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    marginTop: 2,
  },
  mealFoods: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  mealName: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    marginBottom: 3,
  },
  mealRow: {
    borderBottomColor: Colors.cardBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  overallText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 24,
  },
  regenerateButton: {
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 4,
    paddingVertical: 12,
  },
  regenerateText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  tipCheck: {
    color: Colors.accent,
    fontSize: 14,
  },
  tipRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  tipText: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
});
