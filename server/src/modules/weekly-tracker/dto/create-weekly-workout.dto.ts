import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  completedOn!: string;

  @ApiProperty({
    enum: WeeklyWorkoutSource,
    example: WeeklyWorkoutSource.PersonalExercise,
  })
  source!: WeeklyWorkoutSource;

  @ApiPropertyOptional({
    example: '퇴근 후 하체 운동 완료',
  })
  note?: string;
}
