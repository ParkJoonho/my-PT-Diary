import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class CreateMealAnalysisDto {
  @ApiProperty({
    description: 'Required before-meal food image base64 payload.',
  })
  @Allow()
  imageBase64!: string;

  @ApiPropertyOptional({
    description: 'Optional after-meal image for consumed-amount comparison.',
  })
  @Allow()
  afterImageBase64?: string;

  @ApiProperty({
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
  })
  @Allow()
  mealType!: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @ApiPropertyOptional({
    example: 18,
  })
  @Allow()
  eatingDurationMinutes?: number;
}
