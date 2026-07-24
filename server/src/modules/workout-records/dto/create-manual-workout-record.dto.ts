import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import {
  BodyCompositionDto,
  ManualCardioDto,
  ManualStrengthExerciseDto,
} from './workout-record-response.dto';

export class CreateManualWorkoutRecordDto {
  @ApiPropertyOptional({ example: '상체 개인 운동' })
  @Allow()
  title?: string;

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

  @ApiPropertyOptional({ example: '60분' })
  @Allow()
  exerciseTime?: string;

  @ApiPropertyOptional({ example: '7시간' })
  @Allow()
  sleep?: string;

  @ApiPropertyOptional({ example: '좋음' })
  @Allow()
  condition?: string;

  @ApiPropertyOptional({ example: '보통' })
  @Allow()
  activityLevel?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['닭가슴살 샐러드', '현미밥'],
  })
  @Allow()
  meals?: string[];

  @ApiPropertyOptional({ example: '오늘의 일과를 기록하세요' })
  @Allow()
  dailyReport?: string;

  @ApiPropertyOptional({ example: '벤치프레스 마지막 세트 RIR 1' })
  @Allow()
  memo?: string;
}
