import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkoutReportWeekRangeDto {
  @ApiProperty({ example: '2026-07-20' })
  weekStartDate!: string;

  @ApiProperty({ example: '2026-07-26' })
  weekEndDate!: string;
}

export class WeeklyWorkoutFrequencyDto extends WorkoutReportWeekRangeDto {
  @ApiProperty({ example: 3 })
  workoutRecordCount!: number;

  @ApiProperty({ example: 2 })
  workoutDayCount!: number;
}

export class WorkoutReportTotalsDto {
  @ApiProperty({ example: 12 })
  workoutRecordCount!: number;

  @ApiProperty({ example: 8 })
  workoutDayCount!: number;

  @ApiProperty({ example: 12600 })
  durationSeconds!: number;

  @ApiProperty({ example: 32400 })
  totalVolumeKg!: number;

  @ApiProperty({ example: 2700 })
  cardioDurationSeconds!: number;

  @ApiProperty({ example: 5 })
  conditionRecordCount!: number;
}

export class WorkoutReportManualTotalsDto {
  @ApiProperty({ example: 8 })
  workoutRecordCount!: number;

  @ApiProperty({ example: 21640 })
  totalVolumeKg!: number;
}

export class WorkoutReportCurrentWeekDto extends WorkoutReportWeekRangeDto {
  @ApiProperty({ example: 3 })
  workoutRecordCount!: number;

  @ApiProperty({ example: 2 })
  workoutDayCount!: number;
}

export class WorkoutReportConditionSummaryDto {
  @ApiPropertyOptional({ example: 4.1, nullable: true, type: Number })
  averageConditionScore!: number | null;

  @ApiPropertyOptional({ example: 1.3, nullable: true, type: Number })
  averageSorenessScore!: number | null;
}

export class WorkoutReportTrendPointDto {
  @ApiProperty({ example: '2026-07-23' })
  date!: string;

  @ApiProperty({ example: 1160 })
  value!: number;
}

export class WorkoutReportBodyCompositionTrendPointDto {
  @ApiProperty({ example: '2026-07-23' })
  date!: string;

  @ApiProperty({ example: 72.4 })
  weightKg!: number;

  @ApiPropertyOptional({ example: 34.2, nullable: true, type: Number })
  skeletalMuscleMassKg!: number | null;

  @ApiPropertyOptional({ example: 18.5, nullable: true, type: Number })
  bodyFatPercentage!: number | null;
}

export class WorkoutReportSummaryDto {
  @ApiProperty({ example: '2026-07-23' })
  referenceDate!: string;

  @ApiProperty({ type: WorkoutReportTotalsDto })
  totals!: WorkoutReportTotalsDto;

  @ApiProperty({ type: WorkoutReportManualTotalsDto })
  manualTotals!: WorkoutReportManualTotalsDto;

  @ApiProperty({ type: WorkoutReportCurrentWeekDto })
  currentWeek!: WorkoutReportCurrentWeekDto;

  @ApiProperty({ type: WorkoutReportConditionSummaryDto })
  condition!: WorkoutReportConditionSummaryDto;

  @ApiProperty({ type: [WeeklyWorkoutFrequencyDto] })
  weeklyFrequency!: WeeklyWorkoutFrequencyDto[];

  @ApiProperty({ type: [WorkoutReportTrendPointDto] })
  volumeTrend!: WorkoutReportTrendPointDto[];

  @ApiProperty({ type: [WorkoutReportTrendPointDto] })
  weightTrend!: WorkoutReportTrendPointDto[];

  @ApiProperty({ type: [WorkoutReportBodyCompositionTrendPointDto] })
  bodyCompositionTrend!: WorkoutReportBodyCompositionTrendPointDto[];

  @ApiProperty({ type: [WorkoutReportTrendPointDto] })
  conditionTrend!: WorkoutReportTrendPointDto[];
}
