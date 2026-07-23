import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BodyCompositionDto,
  ManualCardioDto,
  ManualStrengthExerciseDto,
} from './workout-record-response.dto';

export class CreateManualWorkoutRecordDto {
  @ApiProperty({ example: '상체 개인 운동' })
  title!: string;

  @ApiProperty({ example: '2026-07-23T12:34:56.000Z' })
  performedAt!: string;

  @ApiProperty({ example: '2026-07-23' })
  performedOn!: string;

  @ApiProperty({ example: 'Asia/Seoul' })
  timeZone!: string;

  @ApiProperty({ example: 3600 })
  durationSeconds!: number;

  @ApiPropertyOptional({
    enum: ['gym', 'home', 'outdoor', 'unknown'],
    example: 'gym',
  })
  location?: 'gym' | 'home' | 'outdoor' | 'unknown';

  @ApiPropertyOptional({ type: ManualCardioDto })
  cardio?: ManualCardioDto;

  @ApiPropertyOptional({ type: [ManualStrengthExerciseDto] })
  strengthExercises?: ManualStrengthExerciseDto[];

  @ApiPropertyOptional({ type: BodyCompositionDto })
  bodyComposition?: BodyCompositionDto;

  @ApiPropertyOptional({ example: '벤치프레스 마지막 세트 RIR 1' })
  memo?: string;
}
