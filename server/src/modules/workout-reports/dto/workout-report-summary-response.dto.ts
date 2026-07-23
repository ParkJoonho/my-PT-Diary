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

export class WorkoutReportSummaryDto {
  @ApiProperty({ example: '2026-07-23' })
  referenceDate!: string;

  @ApiProperty({ type: WorkoutReportTotalsDto })
  totals!: WorkoutReportTotalsDto;

  @ApiProperty({ type: WorkoutReportCurrentWeekDto })
  currentWeek!: WorkoutReportCurrentWeekDto;

  @ApiProperty({ type: WorkoutReportConditionSummaryDto })
  condition!: WorkoutReportConditionSummaryDto;

  @ApiProperty({ type: [WeeklyWorkoutFrequencyDto] })
  weeklyFrequency!: WeeklyWorkoutFrequencyDto[];
}
