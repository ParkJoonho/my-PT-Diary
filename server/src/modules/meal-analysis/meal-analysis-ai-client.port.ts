import type { DietGuideOutput, MealType } from './meal-analysis.schemas';

export type DietGuideMealContext = {
  carbs: number;
  fat: number;
  mealType: MealType;
  protein: number;
  totalCalories: number;
};

export abstract class MealAnalysisAiClientPort {
  abstract analyzeMeal(params: {
    afterImageBase64?: string;
    eatingDurationMinutes?: number;
    imageBase64: string;
    mealType: MealType;
  }): Promise<string>;

  abstract generateDietGuide(params: {
    date: string;
    meals: DietGuideMealContext[];
  }): Promise<string>;
}

export type ParsedDietGuide = DietGuideOutput;
