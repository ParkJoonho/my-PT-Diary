import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WorkoutRecordSource {
  Manual = 'manual',
  Routine = 'routine',
}

export enum WorkoutStepType {
  Cardio = 'cardio',
  Strength = 'strength',
  Stretch = 'stretch',
  Rest = 'rest',
}

export class WorkoutRecordStepDto {
  @ApiProperty({ example: '푸시업' })
  name!: string;

  @ApiProperty({ example: '10회 x 3세트' })
  detail!: string;

  @ApiProperty({ enum: WorkoutStepType, example: WorkoutStepType.Strength })
  type!: WorkoutStepType;

  @ApiProperty({ example: true })
  completed!: boolean;

  @ApiPropertyOptional({ example: '1분 30초' })
  restAfter?: string;

  @ApiPropertyOptional({ example: 3 })
  sets?: number;

  @ApiPropertyOptional({ example: '상체 근력 강화' })
  tag?: string;
}

export class WorkoutRecordSummaryDto {
  @ApiPropertyOptional({ example: 4 })
  completedStepCount?: number;

  @ApiPropertyOptional({ example: 5 })
  totalStepCount?: number;

  @ApiPropertyOptional({ example: 3 })
  strengthStepCount?: number;

  @ApiPropertyOptional({ example: 1 })
  cardioStepCount?: number;

  @ApiPropertyOptional({ example: 1 })
  stretchStepCount?: number;

  @ApiPropertyOptional({ example: 6 })
  strengthSetCount?: number;

  @ApiPropertyOptional({ example: 7200 })
  totalVolumeKg?: number;

  @ApiPropertyOptional({ example: 900 })
  cardioDurationSeconds?: number;

  @ApiPropertyOptional({ example: 3000 })
  cardioDistanceMeters?: number;

  @ApiPropertyOptional({ example: 4200 })
  cardioSteps?: number;
}

export class ManualWorkoutSetDto {
  @ApiPropertyOptional({ example: 60 })
  weightKg?: number;

  @ApiPropertyOptional({ example: 10 })
  reps?: number;

  @ApiPropertyOptional({ example: 2 })
  rir?: number;

  @ApiPropertyOptional({ example: 90 })
  restSeconds?: number;
}

export class ManualStrengthExerciseDto {
  @ApiProperty({ example: '벤치프레스' })
  name!: string;

  @ApiProperty({ type: [ManualWorkoutSetDto] })
  sets!: ManualWorkoutSetDto[];
}

export class ManualCardioDto {
  @ApiPropertyOptional({ example: 900 })
  durationSeconds?: number;

  @ApiPropertyOptional({ example: 3000 })
  distanceMeters?: number;

  @ApiPropertyOptional({ example: 4200 })
  steps?: number;
}

export class BodyCompositionDto {
  @ApiPropertyOptional({ example: 72.4 })
  weightKg?: number;

  @ApiPropertyOptional({ example: 34.2 })
  skeletalMuscleMassKg?: number;

  @ApiPropertyOptional({ example: 18.5 })
  bodyFatPercentage?: number;
}

export class ManualWorkoutRecordDetailDto {
  @ApiPropertyOptional({ example: 'gym' })
  location?: 'gym' | 'home' | 'outdoor' | 'unknown';

  @ApiPropertyOptional({ type: ManualCardioDto })
  cardio?: ManualCardioDto;

  @ApiPropertyOptional({ type: [ManualStrengthExerciseDto] })
  strengthExercises?: ManualStrengthExerciseDto[];

  @ApiPropertyOptional({ example: '허리 부담 없이 진행' })
  memo?: string;
}

export class WorkoutRecordDto {
  @ApiProperty({ example: '2d7708d9-32ef-492c-8b25-aef4d0d77220' })
  id!: string;

  @ApiProperty({
    enum: WorkoutRecordSource,
    example: WorkoutRecordSource.Manual,
  })
  source!: WorkoutRecordSource;

  @ApiProperty({ example: '상체 개인 운동', nullable: true, type: String })
  title!: string | null;

  @ApiProperty({ example: 'gym_60', nullable: true, type: String })
  routineId!: string | null;

  @ApiProperty({ example: '1시간 루틴', nullable: true, type: String })
  routineLabel!: string | null;

  @ApiProperty({ example: 'static', nullable: true, type: String })
  routineSource!: string | null;

  @ApiProperty({ example: '2026-07-23T12:34:56.000Z' })
  completedAt!: string;

  @ApiProperty({ example: '2026-07-23' })
  completedOn!: string;

  @ApiProperty({ example: '2026-07-23T12:34:56.000Z' })
  performedAt!: string;

  @ApiProperty({ example: '2026-07-23' })
  performedOn!: string;

  @ApiProperty({ example: 'Asia/Seoul' })
  timeZone!: string;

  @ApiProperty({ example: 1800 })
  durationSeconds!: number;

  @ApiProperty({ type: [WorkoutRecordStepDto] })
  steps!: WorkoutRecordStepDto[];

  @ApiProperty({ type: WorkoutRecordSummaryDto })
  summary!: WorkoutRecordSummaryDto;

  @ApiPropertyOptional({ type: ManualWorkoutRecordDetailDto, nullable: true })
  manualDetail!: ManualWorkoutRecordDetailDto | null;

  @ApiPropertyOptional({ type: BodyCompositionDto, nullable: true })
  bodyComposition!: BodyCompositionDto | null;

  @ApiProperty({
    example: '9362ea0f-e6f3-40d7-9932-6a4b028cbb8f',
    nullable: true,
    type: String,
  })
  weeklyCompletionId!: string | null;

  @ApiProperty({ example: '2026-07-23T12:35:02.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-07-23T12:35:02.000Z' })
  updatedAt!: string;
}

export class WeeklyCompletionLinkDto {
  @ApiProperty({
    example: '9362ea0f-e6f3-40d7-9932-6a4b028cbb8f',
  })
  id!: string;

  @ApiProperty({ example: '2026-07-23' })
  completedOn!: string;

  @ApiProperty({ example: 'personal_exercise' })
  source!: 'routine' | 'personal_exercise';
}

export class CreateRoutineWorkoutCompletionResponseDto {
  @ApiProperty({ type: WorkoutRecordDto })
  workoutRecord!: WorkoutRecordDto;

  @ApiProperty({ type: WeeklyCompletionLinkDto })
  weeklyCompletion!: WeeklyCompletionLinkDto;
}
