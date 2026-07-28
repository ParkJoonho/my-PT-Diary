import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { MealAnalysisResultDto } from './meal-analysis-response.dto';

export class CreateMealRecordDto {
  @ApiProperty({
    type: MealAnalysisResultDto,
  })
  @Allow()
  analysisResult!: MealAnalysisResultDto;

  @ApiProperty({
    example: '2026-07-28',
  })
  @Allow()
  mealDate!: string;

  @ApiProperty({
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
  })
  @Allow()
  mealType!: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}
