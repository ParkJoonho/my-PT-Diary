import { Coffee, Moon, Sun, Utensils } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import type {
  DailyMealSummaryDto,
  MealRecordDto,
} from 'shared/api/generated/models';
import Colors, { iosShadow } from 'shared/constants/colors';
import { MEAL_LABELS, type MealType } from '../types/meal-analysis';

const MEAL_ICONS = {
  breakfast: Sun,
  dinner: Moon,
  lunch: Utensils,
  snack: Coffee,
} as const;

export function DailyMealSummary({
  summary,
}: {
  summary: DailyMealSummaryDto;
}) {
  if (summary.mealCount < 1) {
    return null;
  }

  const items = [
    {
      color: Colors.text,
      label: 'kcal',
      value: String(summary.totalCalories),
    },
    {
      color: Colors.success,
      label: '단백질',
      value: `${summary.totalProtein}g`,
    },
    {
      color: Colors.info,
      label: '탄수화물',
      value: `${summary.totalCarbs}g`,
    },
    {
      color: Colors.warning,
      label: '지방',
      value: `${summary.totalFat}g`,
    },
  ];

  return (
    <View style={[styles.summaryCard, iosShadow]}>
      <Text style={styles.summaryTitle}>오늘의 영양 섭취</Text>
      <View style={styles.summaryRow}>
        {items.map((item, index) => (
          <View key={item.label} style={styles.summaryGroup}>
            {index > 0 ? <View style={styles.summaryDivider} /> : null}
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: item.color }]}>
                {item.value}
              </Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.summaryMealCount}>{summary.mealCount}끼 기록됨</Text>
    </View>
  );
}

export function TodayMealRecords({ records }: { records: MealRecordDto[] }) {
  if (!records.length) {
    return null;
  }

  return (
    <View style={[styles.historyCard, iosShadow]}>
      <Text style={styles.historyTitle}>오늘의 식단 기록</Text>
      {records.map((record, index) => {
        const mealType = record.mealType as MealType;
        const Icon = MEAL_ICONS[mealType] ?? Utensils;

        return (
          <View
            key={record.id}
            style={[
              styles.historyItem,
              index === records.length - 1
                ? styles.lastBorderlessItem
                : undefined,
            ]}
          >
            <View style={styles.historyHeader}>
              <Icon color={Colors.accent} size={18} strokeWidth={2.1} />
              <Text style={styles.historyMealType}>
                {MEAL_LABELS[mealType] ?? record.mealType}
              </Text>
              <Text style={styles.historyCalories}>
                {record.totalCalories} kcal
              </Text>
            </View>
            <View style={styles.historyNutrients}>
              <Text style={styles.historyNutrient}>단 {record.protein}g</Text>
              <Text style={styles.historyNutrient}>탄 {record.carbs}g</Text>
              <Text style={styles.historyNutrient}>지 {record.fat}g</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  historyCalories: {
    color: Colors.accent,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 16,
  },
  historyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  historyItem: {
    borderBottomColor: Colors.cardBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  historyMealType: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  historyNutrient: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  historyNutrients: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    paddingLeft: 26,
  },
  historyTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    marginBottom: 12,
  },
  lastBorderlessItem: {
    borderBottomWidth: 0,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 16,
  },
  summaryDivider: {
    backgroundColor: Colors.cardBorder,
    height: 32,
    width: 1,
  },
  summaryGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    marginTop: 2,
  },
  summaryMealCount: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  summaryTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    marginBottom: 12,
  },
  summaryValue: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
  },
});
