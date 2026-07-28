import { z } from 'zod';

const base64ImageSchema = z
  .string()
  .trim()
  .min(100, 'Image base64 payload must be at least 100 characters long.')
  .max(30_000_000, 'Image base64 payload is too large.');

export const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

export const isoMealDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format.');

const nonNegativeNutrientSchema = z.number().min(0).max(1_000_000);

const mealFoodSchema = z.object({
  calories: nonNegativeNutrientSchema,
  carbs: nonNegativeNutrientSchema,
  category: z.string().trim().min(1).max(100),
  consumptionRate: z.number().min(0).max(100),
  estimatedWeight: z.string().trim().min(1).max(100),
  fat: nonNegativeNutrientSchema,
  fiber: nonNegativeNutrientSchema,
  name: z.string().trim().min(1).max(200),
  protein: nonNegativeNutrientSchema,
  sodium: nonNegativeNutrientSchema,
});

const mealBalanceSchema = z.object({
  carbRatio: z.number().min(0).max(100),
  fatRatio: z.number().min(0).max(100),
  feedback: z.string().trim().min(1).max(2000),
  grade: z.enum(['S', 'A', 'B', 'C', 'D', 'F']),
  proteinRatio: z.number().min(0).max(100),
  score: z.number().min(0).max(100),
});

const eatingSpeedAnalysisSchema = z.object({
  advice: z.string().trim().min(1).max(2000),
  durationMinutes: z.number().positive().max(300),
  grade: z.enum(['fast', 'moderate', 'good']),
  healthRisks: z.array(z.string().trim().min(1).max(500)).max(10),
  tips: z.array(z.string().trim().min(1).max(500)).max(10),
});

export const mealAnalysisResultSchema = z.object({
  dietaryAdvice: z.array(z.string().trim().min(1).max(500)).min(1).max(10),
  eatingSpeedAnalysis: eatingSpeedAnalysisSchema.optional(),
  exerciseToOffset: z.object({
    cycling: z.union([z.string().trim().min(1).max(100), z.number().min(0)]),
    running: z.union([z.string().trim().min(1).max(100), z.number().min(0)]),
    walking: z.union([z.string().trim().min(1).max(100), z.number().min(0)]),
  }),
  foods: z.array(mealFoodSchema).max(50),
  mealBalance: mealBalanceSchema,
  summary: z.string().trim().min(1).max(3000),
  totalCalories: nonNegativeNutrientSchema,
  totalCarbs: nonNegativeNutrientSchema,
  totalFat: nonNegativeNutrientSchema,
  totalFiber: nonNegativeNutrientSchema,
  totalProtein: nonNegativeNutrientSchema,
  totalSodium: nonNegativeNutrientSchema,
});

export const createMealAnalysisSchema = z.object({
  afterImageBase64: base64ImageSchema.optional(),
  eatingDurationMinutes: z.coerce.number().positive().max(300).optional(),
  imageBase64: base64ImageSchema,
  mealType: mealTypeSchema,
});

export const createMealRecordSchema = z.object({
  analysisResult: mealAnalysisResultSchema,
  mealDate: isoMealDateSchema,
  mealType: mealTypeSchema,
});

export const listMealRecordsQuerySchema = z.object({
  date: isoMealDateSchema.optional(),
});

export const dailyMealSummaryQuerySchema = z.object({
  date: isoMealDateSchema,
});

export const generateDietGuideSchema = z.object({
  date: isoMealDateSchema,
});

export const dietGuideSchema = z.object({
  macroTargets: z.object({
    calories: nonNegativeNutrientSchema,
    carbs: nonNegativeNutrientSchema,
    fat: nonNegativeNutrientSchema,
    protein: nonNegativeNutrientSchema,
  }),
  mealPlan: z
    .array(
      z.object({
        calories: nonNegativeNutrientSchema,
        foods: z.array(z.string().trim().min(1).max(200)).min(1).max(10),
        mealName: z.string().trim().min(1).max(100),
      }),
    )
    .min(1)
    .max(10),
  overallAssessment: z.string().trim().min(1).max(3000),
  tips: z.array(z.string().trim().min(1).max(500)).min(1).max(10),
});

export type MealType = z.infer<typeof mealTypeSchema>;
export type MealAnalysisOutput = z.infer<typeof mealAnalysisResultSchema>;
export type CreateMealAnalysisInput = z.infer<typeof createMealAnalysisSchema>;
export type CreateMealRecordInput = z.infer<typeof createMealRecordSchema>;
export type DietGuideOutput = z.infer<typeof dietGuideSchema>;
