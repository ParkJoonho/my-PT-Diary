import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkoutStepType } from './workout-record-response.dto';

export class RoutineWorkoutStepDto {
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

export class CreateRoutineWorkoutCompletionDto {
  @ApiProperty({ example: 'gym_60' })
  routineId!: string;

  @ApiProperty({ example: '1시간 루틴' })
  routineLabel!: string;

  @ApiProperty({
    example: 'static',
    description: 'Routine origin such as static, ai, or trainer.',
  })
  routineSource!: string;

  @ApiProperty({ example: '2026-07-23T12:34:56.000Z' })
  completedAt!: string;

  @ApiProperty({ example: '2026-07-23' })
  completedOn!: string;

  @ApiProperty({ example: 'Asia/Seoul' })
  timeZone!: string;

  @ApiProperty({ example: 1800 })
  durationSeconds!: number;

  @ApiProperty({ type: [RoutineWorkoutStepDto] })
  steps!: RoutineWorkoutStepDto[];
}
