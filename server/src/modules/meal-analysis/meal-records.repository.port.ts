import type { MealAnalysisOutput, MealType } from './meal-analysis.schemas';

export type MealRecordRow = {
  analysis_result: MealAnalysisOutput;
  carbs: number;
  created_at: string;
  fat: number;
  fiber: number;
  id: string;
  meal_date: string;
  meal_type: MealType;
  protein: number;
  sodium: number;
  total_calories: number;
  user_key: string;
};

export type DailyMealSummaryRow = {
  meal_count: number;
  total_calories: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  total_protein: number;
  total_sodium: number;
};

export abstract class MealRecordsRepositoryPort {
  abstract createMealRecord(params: {
    analysisResult: MealAnalysisOutput;
    id: string;
    mealDate: string;
    mealType: MealType;
    userKey: string;
  }): Promise<MealRecordRow>;

  abstract listMealRecords(params: {
    date?: string;
    userKey: string;
  }): Promise<MealRecordRow[]>;

  abstract getDailySummary(params: {
    date: string;
    userKey: string;
  }): Promise<DailyMealSummaryRow>;
}
