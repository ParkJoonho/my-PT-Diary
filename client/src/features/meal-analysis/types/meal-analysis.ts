import type { PickedImage } from 'features/body-analysis/lib/pick-image';

export type MealType = 'breakfast' | 'dinner' | 'lunch' | 'snack';
export type MealAnalysisTab = 'analysis' | 'guide';
export type MealPhotoTarget = 'after' | 'before';
export type MealPhoto = PickedImage;

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '아침',
  dinner: '저녁',
  lunch: '점심',
  snack: '간식',
};

export function getDefaultMealType(date = new Date()): MealType {
  const hour = date.getHours();

  if (hour >= 6 && hour < 10) {
    return 'breakfast';
  }

  if (hour >= 10 && hour < 14) {
    return 'lunch';
  }

  if (hour >= 14 && hour < 18) {
    return 'snack';
  }

  if (hour >= 18 && hour < 22) {
    return 'dinner';
  }

  return 'snack';
}
