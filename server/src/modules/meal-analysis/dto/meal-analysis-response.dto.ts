import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import type { MealAnalysisOutput } from '../meal-analysis.schemas';

export class MealFoodDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  category!: string;

  @ApiProperty()
  estimatedWeight!: string;

  @ApiProperty()
  calories!: number;

  @ApiProperty()
  protein!: number;

  @ApiProperty()
  carbs!: number;

  @ApiProperty()
  fat!: number;

  @ApiProperty()
  fiber!: number;

  @ApiProperty()
  sodium!: number;

  @ApiProperty()
  consumptionRate!: number;
}

export class MealBalanceDto {
  @ApiProperty()
  score!: number;

  @ApiProperty({
    enum: ['S', 'A', 'B', 'C', 'D', 'F'],
  })
  grade!: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

  @ApiProperty()
  proteinRatio!: number;

  @ApiProperty()
  carbRatio!: number;

  @ApiProperty()
  fatRatio!: number;

  @ApiProperty()
  feedback!: string;
}

export class ExerciseToOffsetDto {
  @ApiProperty({
    oneOf: [{ type: 'number' }, { type: 'string' }],
  })
  walking!: number | string;

  @ApiProperty({
    oneOf: [{ type: 'number' }, { type: 'string' }],
  })
  running!: number | string;

  @ApiProperty({
    oneOf: [{ type: 'number' }, { type: 'string' }],
  })
  cycling!: number | string;
}

export class EatingSpeedAnalysisDto {
  @ApiProperty()
  durationMinutes!: number;

  @ApiProperty({
    enum: ['fast', 'moderate', 'good'],
  })
  grade!: 'fast' | 'moderate' | 'good';

  @ApiProperty()
  advice!: string;

  @ApiProperty({
    type: [String],
  })
  healthRisks!: string[];

  @ApiProperty({
    type: [String],
  })
  tips!: string[];
}

export class MealAnalysisResultDto implements MealAnalysisOutput {
  @ApiProperty({
    type: [MealFoodDto],
  })
  foods!: MealFoodDto[];

  @ApiProperty()
  totalCalories!: number;

  @ApiProperty()
  totalProtein!: number;

  @ApiProperty()
  totalCarbs!: number;

  @ApiProperty()
  totalFat!: number;

  @ApiProperty()
  totalFiber!: number;

  @ApiProperty()
  totalSodium!: number;

  @ApiProperty({
    type: MealBalanceDto,
  })
  mealBalance!: MealBalanceDto;

  @ApiProperty({
    type: [String],
  })
  dietaryAdvice!: string[];

  @ApiProperty({
    type: ExerciseToOffsetDto,
  })
  exerciseToOffset!: ExerciseToOffsetDto;

  @ApiProperty()
  summary!: string;

  @ApiProperty({
    required: false,
    type: EatingSpeedAnalysisDto,
  })
  eatingSpeedAnalysis?: EatingSpeedAnalysisDto;
}

export class DietGuideMacroTargetsDto {
  @ApiProperty()
  calories!: number;

  @ApiProperty()
  protein!: number;

  @ApiProperty()
  carbs!: number;

  @ApiProperty()
  fat!: number;
}

export class DietGuideMealPlanDto {
  @ApiProperty()
  mealName!: string;

  @ApiProperty({
    type: [String],
  })
  foods!: string[];

  @ApiProperty()
  calories!: number;
}

export class DietGuideDto {
  @ApiProperty()
  overallAssessment!: string;

  @ApiProperty({
    type: DietGuideMacroTargetsDto,
  })
  macroTargets!: DietGuideMacroTargetsDto;

  @ApiProperty({
    type: [DietGuideMealPlanDto],
  })
  mealPlan!: DietGuideMealPlanDto[];

  @ApiProperty({
    type: [String],
  })
  tips!: string[];
}

export class MealAnalysisResponseDto {
  @ApiProperty({
    type: MealAnalysisResultDto,
  })
  @Allow()
  analysis!: MealAnalysisResultDto;

  @ApiProperty({
    example: '2026-07-28T01:23:45.000Z',
  })
  analyzedAt!: string;
}

export class MealRecordDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userKey!: string;

  @ApiProperty({
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
  })
  mealType!: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @ApiProperty({
    type: MealAnalysisResultDto,
  })
  @Allow()
  analysisResult!: MealAnalysisResultDto;

  @ApiProperty()
  totalCalories!: number;

  @ApiProperty()
  protein!: number;

  @ApiProperty()
  carbs!: number;

  @ApiProperty()
  fat!: number;

  @ApiProperty()
  fiber!: number;

  @ApiProperty()
  sodium!: number;

  @ApiProperty({
    example: '2026-07-28',
  })
  mealDate!: string;

  @ApiProperty()
  createdAt!: string;
}

export class DailyMealSummaryDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  totalCalories!: number;

  @ApiProperty()
  totalProtein!: number;

  @ApiProperty()
  totalCarbs!: number;

  @ApiProperty()
  totalFat!: number;

  @ApiProperty()
  totalFiber!: number;

  @ApiProperty()
  totalSodium!: number;

  @ApiProperty()
  mealCount!: number;
}

export class DietGuideResponseDto {
  @ApiProperty({
    type: DietGuideDto,
  })
  @Allow()
  guide!: DietGuideDto;

  @ApiProperty()
  sourceMealCount!: number;
}
