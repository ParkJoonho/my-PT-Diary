import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export enum WeeklyWorkoutSource {
  Manual = 'manual',
  PersonalExercise = 'personal_exercise',
  PtLesson = 'pt_lesson',
  Routine = 'routine',
  Outdoor = 'outdoor',
}

export class CreateWeeklyWorkoutDto {
  @ApiProperty({
    example: '2026-07-22',
    description: 'Workout completion date in YYYY-MM-DD format.',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  completedOn!: string;

  @ApiProperty({
    enum: WeeklyWorkoutSource,
    example: WeeklyWorkoutSource.PersonalExercise,
  })
  @IsEnum(WeeklyWorkoutSource)
  source!: WeeklyWorkoutSource;

  @ApiPropertyOptional({
    example: '퇴근 후 하체 운동 완료',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
