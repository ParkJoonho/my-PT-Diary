import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { WorkoutStepType } from './workout-record-response.dto';

export class RoutineWorkoutStepDto {
  @ApiProperty({ example: '푸시업' })
  @Allow()
  name!: string;

  @ApiProperty({ example: '10회 x 3세트' })
  @Allow()
  detail!: string;

  @ApiProperty({ enum: WorkoutStepType, example: WorkoutStepType.Strength })
  @Allow()
  type!: WorkoutStepType;

  @ApiProperty({ example: true })
  @Allow()
  completed!: boolean;

  @ApiPropertyOptional({ example: '1분 30초' })
  @Allow()
  restAfter?: string;

  @ApiPropertyOptional({ example: 3 })
  @Allow()
  sets?: number;

  @ApiPropertyOptional({ example: '상체 근력 강화' })
  @Allow()
  tag?: string;
}

export class CreateRoutineWorkoutCompletionDto {
  @ApiProperty({ example: 'gym_60' })
  @Allow()
  routineId!: string;

  @ApiProperty({ example: '1시간 루틴' })
  @Allow()
  routineLabel!: string;

  @ApiProperty({
    example: 'static',
    description: 'Routine origin such as static, ai, or trainer.',
  })
  @Allow()
  routineSource!: string;

  @ApiProperty({ example: '2026-07-23T12:34:56.000Z' })
  @Allow()
  completedAt!: string;

  @ApiProperty({ example: '2026-07-23' })
  @Allow()
  completedOn!: string;

  @ApiProperty({ example: 'Asia/Seoul' })
  @Allow()
  timeZone!: string;

  @ApiProperty({ example: 1800 })
  @Allow()
  durationSeconds!: number;

  @ApiProperty({ type: [RoutineWorkoutStepDto] })
  @Allow()
  steps!: RoutineWorkoutStepDto[];
}
