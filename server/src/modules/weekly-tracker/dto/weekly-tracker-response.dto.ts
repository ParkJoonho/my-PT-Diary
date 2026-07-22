import { ApiProperty } from '@nestjs/swagger';
import { WeeklyWorkoutSource } from './create-weekly-workout.dto';

export class WeeklyTrackerDayDto {
  @ApiProperty({ example: '2026-07-20' })
  date!: string;

  @ApiProperty({ example: '월' })
  label!: string;

  @ApiProperty({ example: true })
  completed!: boolean;

  @ApiProperty({ example: 2 })
  completionCount!: number;
}

export class WeeklyWorkoutCompletionDto {
  @ApiProperty({
    example: '2d7708d9-32ef-492c-8b25-aef4d0d77220',
  })
  id!: string;

  @ApiProperty({ example: '2026-07-22' })
  completedOn!: string;

  @ApiProperty({ enum: WeeklyWorkoutSource })
  source!: WeeklyWorkoutSource;

  @ApiProperty({ example: '퇴근 후 하체 운동 완료', nullable: true })
  note!: string | null;

  @ApiProperty({ example: '2026-07-22T09:12:33.000Z' })
  createdAt!: string;
}

export class WeeklyTrackerSummaryDto {
  @ApiProperty({ example: '2026-07-20' })
  weekStartDate!: string;

  @ApiProperty({ example: '2026-07-26' })
  weekEndDate!: string;

  @ApiProperty({ example: '2026-07-22' })
  referenceDate!: string;

  @ApiProperty({ example: 3 })
  streakCount!: number;

  @ApiProperty({ example: 2 })
  totalCompletedDays!: number;

  @ApiProperty({ type: [WeeklyTrackerDayDto] })
  days!: WeeklyTrackerDayDto[];
}
