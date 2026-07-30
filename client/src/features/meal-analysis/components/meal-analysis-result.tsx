import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { MealAnalysisResultDto } from 'shared/api/generated/models';
import {
  OriginalAppIcon,
  type OriginalAppIconName,
} from 'shared/components/icons/pt-diary-icons';
import Colors, { iosShadow } from 'shared/constants/colors';
import {
  formatEatingDuration,
  formatExerciseDuration,
  formatNutrient,
  getMealGradeColor,
} from '../lib/meal-analysis-format';

type MealAnalysisResultProps = {
  isSaving: boolean;
  onReset: () => void;
  onSave: () => void;
  result: MealAnalysisResultDto;
};

function SectionCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[styles.sectionCard, iosShadow, style]}>{children}</View>;
}

function ResultSummary({ result }: { result: MealAnalysisResultDto }) {
  const gradeColor = getMealGradeColor(result.mealBalance.grade);

  return (
    <SectionCard>
      <View style={styles.resultHeader}>
        <OriginalAppIcon color={Colors.accent} name="foodVariant" size={24} />
        <Text style={styles.resultTitle}>분석 결과</Text>
      </View>

      <View style={styles.calorieRow}>
        <Text style={styles.calorieValue}>
          {formatNutrient(result.totalCalories)}
        </Text>
        <Text style={styles.calorieUnit}>kcal</Text>
      </View>

      <View style={styles.macroRow}>
        <MacroItem
          color={Colors.success}
          label="단백질"
          value={result.totalProtein}
        />
        <MacroItem
          color={Colors.info}
          label="탄수화물"
          value={result.totalCarbs}
        />
        <MacroItem
          color={Colors.warning}
          label="지방"
          value={result.totalFat}
        />
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceTitle}>영양 균형</Text>
          <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
            <Text style={styles.gradeText}>{result.mealBalance.grade}</Text>
          </View>
          <Text style={styles.balanceScore}>{result.mealBalance.score}점</Text>
        </View>
        <Text style={styles.balanceFeedback}>
          {result.mealBalance.feedback}
        </Text>
      </View>
    </SectionCard>
  );
}

function MacroItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <View style={[styles.macroItem, { borderLeftColor: color }]}>
      <Text style={styles.macroValue}>{formatNutrient(value)}g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

function RecognizedFoods({ result }: { result: MealAnalysisResultDto }) {
  if (!result.foods.length) {
    return null;
  }

  return (
    <SectionCard>
      <Text style={styles.sectionTitle}>인식된 음식</Text>
      {result.foods.map((food, index) => {
        const consumptionColor =
          food.consumptionRate >= 80
            ? Colors.success
            : food.consumptionRate >= 50
              ? Colors.warning
              : Colors.danger;

        return (
          <View
            key={`${food.name}-${food.estimatedWeight}-${index}`}
            style={styles.foodItem}
          >
            <View style={styles.foodHeader}>
              <Text style={styles.foodName}>{food.name}</Text>
              <View style={styles.foodHeaderValues}>
                <View
                  style={[
                    styles.consumptionBadge,
                    { backgroundColor: consumptionColor },
                  ]}
                >
                  <Text style={styles.consumptionText}>
                    {food.consumptionRate}%
                  </Text>
                </View>
                <Text style={styles.foodCalories}>
                  {formatNutrient(food.calories)} kcal
                </Text>
              </View>
            </View>
            <View style={styles.foodNutrients}>
              <Text style={styles.foodNutrient}>
                단 {formatNutrient(food.protein)}g
              </Text>
              <Text style={styles.foodNutrient}>
                탄 {formatNutrient(food.carbs)}g
              </Text>
              <Text style={styles.foodNutrient}>
                지 {formatNutrient(food.fat)}g
              </Text>
              <Text style={styles.foodWeight}>{food.estimatedWeight}</Text>
            </View>
          </View>
        );
      })}
    </SectionCard>
  );
}

function ExerciseOffset({ result }: { result: MealAnalysisResultDto }) {
  const exercises = [
    {
      color: Colors.info,
      icon: 'walk' as OriginalAppIconName,
      label: '걷기',
      value: result.exerciseToOffset.walking,
    },
    {
      color: Colors.accent,
      icon: 'run' as OriginalAppIconName,
      label: '달리기',
      value: result.exerciseToOffset.running,
    },
    {
      color: '#8B5CF6',
      icon: 'bike' as OriginalAppIconName,
      label: '자전거',
      value: result.exerciseToOffset.cycling,
    },
  ];

  return (
    <SectionCard>
      <Text style={styles.sectionTitle}>칼로리 소모 시간</Text>
      <View style={styles.exerciseRow}>
        {exercises.map((exercise) => (
          <View key={exercise.label} style={styles.exerciseItem}>
            <OriginalAppIcon
              color={exercise.color}
              name={exercise.icon}
              size={24}
            />
            <Text style={styles.exerciseTime}>
              {formatExerciseDuration(exercise.value)}
            </Text>
            <Text style={styles.exerciseLabel}>{exercise.label}</Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

function DietaryAdvice({ result }: { result: MealAnalysisResultDto }) {
  if (!result.dietaryAdvice.length) {
    return null;
  }

  return (
    <SectionCard>
      <Text style={styles.sectionTitle}>식단 개선 조언</Text>
      {result.dietaryAdvice.map((advice) => (
        <View key={advice} style={styles.adviceItem}>
          <OriginalAppIcon
            color={Colors.accent}
            name="lightbulbOutline"
            size={16}
          />
          <Text style={styles.adviceText}>{advice}</Text>
        </View>
      ))}
    </SectionCard>
  );
}

function EatingSpeed({ result }: { result: MealAnalysisResultDto }) {
  const speed = result.eatingSpeedAnalysis;

  if (!speed) {
    return null;
  }

  const color =
    speed.grade === 'fast'
      ? Colors.danger
      : speed.grade === 'moderate'
        ? Colors.warning
        : Colors.success;
  const label =
    speed.grade === 'fast'
      ? '빠름'
      : speed.grade === 'moderate'
        ? '보통'
        : '적정';

  return (
    <SectionCard>
      <View style={styles.speedHeader}>
        <OriginalAppIcon color={color} name="speedometerOutline" size={20} />
        <Text style={styles.speedTitle}>식사 속도 분석</Text>
        <View style={[styles.speedBadge, { backgroundColor: color }]}>
          <Text style={styles.speedBadgeText}>{label}</Text>
        </View>
      </View>
      <Text style={styles.speedDuration}>
        식사 시간: {formatEatingDuration(speed.durationMinutes)}
      </Text>
      <Text style={styles.speedAdvice}>{speed.advice}</Text>

      {speed.healthRisks.map((risk) => (
        <View key={risk} style={styles.speedListItem}>
          <OriginalAppIcon
            color={Colors.danger}
            name="warningOutline"
            size={14}
          />
          <Text style={[styles.speedListText, { color: Colors.danger }]}>
            {risk}
          </Text>
        </View>
      ))}
      {speed.tips.map((tip) => (
        <View key={tip} style={styles.speedListItem}>
          <OriginalAppIcon
            color={Colors.success}
            name="checkmarkCircle"
            size={14}
          />
          <Text style={[styles.speedListText, { color: Colors.success }]}>
            {tip}
          </Text>
        </View>
      ))}
    </SectionCard>
  );
}

export function MealAnalysisResult({
  isSaving,
  onReset,
  onSave,
  result,
}: MealAnalysisResultProps) {
  return (
    <>
      <ResultSummary result={result} />
      <RecognizedFoods result={result} />
      <ExerciseOffset result={result} />
      <DietaryAdvice result={result} />
      <EatingSpeed result={result} />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>{result.summary}</Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          disabled={isSaving}
          onPress={onSave}
          style={[styles.saveButton, isSaving && styles.disabledButton]}
        >
          {isSaving ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <OriginalAppIcon
              color={Colors.white}
              name="saveOutline"
              size={20}
            />
          )}
          <Text style={styles.saveButtonText}>기록 저장</Text>
        </Pressable>
        <Pressable onPress={onReset} style={styles.retryButton}>
          <OriginalAppIcon color={Colors.accent} name="refresh" size={20} />
          <Text style={styles.retryButtonText}>다시 분석</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  adviceItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  adviceText: {
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  balanceCard: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: 12,
  },
  balanceFeedback: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  balanceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  balanceScore: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  balanceTitle: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  calorieRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginBottom: 16,
  },
  calorieUnit: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  calorieValue: {
    color: Colors.accent,
    fontFamily: 'Pretendard-Medium',
    fontSize: 48,
  },
  consumptionBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  consumptionText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
  },
  disabledButton: {
    opacity: 0.5,
  },
  exerciseItem: {
    alignItems: 'center',
    gap: 4,
  },
  exerciseLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  exerciseTime: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
  },
  foodCalories: {
    color: Colors.accent,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  foodHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  foodHeaderValues: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  foodItem: {
    borderBottomColor: Colors.cardBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  foodName: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  foodNutrient: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  foodNutrients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  foodWeight: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  gradeBadge: {
    alignItems: 'center',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  gradeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  macroItem: {
    backgroundColor: Colors.inputBg,
    borderLeftWidth: 3,
    borderRadius: 12,
    flex: 1,
    padding: 12,
  },
  macroLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    marginTop: 2,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  macroValue: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
  },
  resultHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  resultTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
  },
  retryButton: {
    alignItems: 'center',
    borderColor: Colors.accent,
    borderRadius: 14,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  retryButtonText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flex: 2,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  saveButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    marginBottom: 12,
  },
  speedAdvice: {
    color: Colors.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  speedBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  speedBadgeText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  speedDuration: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
    marginBottom: 8,
  },
  speedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  speedListItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  speedListText: {
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  speedTitle: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,106,51,0.06)',
    borderColor: 'rgba(255,106,51,0.15)',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 16,
  },
  summaryText: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 22,
  },
});
