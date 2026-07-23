import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import {
  BodyCompositionDto,
  ManualCardioDto,
  ManualStrengthExerciseDto,
} from './workout-record-response.dto';

export class CreateManualWorkoutRecordDto {
  @ApiProperty({ example: '상체 개인 운동' })
  @Allow()
  title!: string;

  @ApiProperty({ example: '2026-07-23T12:34:56.000Z' })
  @Allow()
  performedAt!: string;

  @ApiProperty({ example: '2026-07-23' })
  @Allow()
  performedOn!: string;

  @ApiProperty({ example: 'Asia/Seoul' })
  @Allow()
  timeZone!: string;

  @ApiProperty({ example: 3600 })
  @Allow()
  durationSeconds!: number;

  @ApiPropertyOptional({
    enum: ['gym', 'home', 'outdoor', 'unknown'],
    example: 'gym',
  })
  @Allow()
  location?: 'gym' | 'home' | 'outdoor' | 'unknown';

  @ApiPropertyOptional({ type: ManualCardioDto })
  @Allow()
  cardio?: ManualCardioDto;

  @ApiPropertyOptional({ type: [ManualStrengthExerciseDto] })
  @Allow()
  strengthExercises?: ManualStrengthExerciseDto[];

  @ApiPropertyOptional({ type: BodyCompositionDto })
  @Allow()
  bodyComposition?: BodyCompositionDto;

  @ApiPropertyOptional({ example: '벤치프레스 마지막 세트 RIR 1' })
  @Allow()
  memo?: string;
}
