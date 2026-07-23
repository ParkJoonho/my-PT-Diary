import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConditionScoresDto {
  @ApiProperty({ example: 4 })
  energy!: number;

  @ApiProperty({ example: 3 })
  sleep!: number;

  @ApiProperty({ example: 4 })
  stress!: number;

  @ApiProperty({ example: 5 })
  motivation!: number;
}

export class MuscleSorenessDto {
  @ApiProperty({ example: 2 })
  chest!: number;

  @ApiProperty({ example: 1 })
  back!: number;

  @ApiProperty({ example: 0 })
  legs!: number;

  @ApiProperty({ example: 1 })
  shoulders!: number;

  @ApiProperty({ example: 0 })
  arms!: number;

  @ApiProperty({ example: 0 })
  core!: number;
}

export class ConditionRecordSummaryDto {
  @ApiPropertyOptional({ example: 4, nullable: true, type: Number })
  averageConditionScore!: number | null;

  @ApiPropertyOptional({ example: 1.2, nullable: true, type: Number })
  averageSorenessScore!: number | null;

  @ApiProperty({ example: 4 })
  selectedConditionCount!: number;

  @ApiProperty({ example: 3 })
  selectedSorenessCount!: number;

  @ApiProperty({ example: 0 })
  severeSorenessCount!: number;
}

export class ConditionRecordDto {
  @ApiProperty({ example: '2d7708d9-32ef-492c-8b25-aef4d0d77220' })
  id!: string;

  @ApiProperty({ example: '2026-07-23' })
  checkedOn!: string;

  @ApiProperty({ example: 'Asia/Seoul' })
  timeZone!: string;

  @ApiProperty({ type: ConditionScoresDto })
  conditionScores!: ConditionScoresDto;

  @ApiProperty({ type: MuscleSorenessDto })
  muscleSoreness!: MuscleSorenessDto;

  @ApiProperty({ type: ConditionRecordSummaryDto })
  summary!: ConditionRecordSummaryDto;

  @ApiPropertyOptional({
    example: '수면 부족, 하체 근육통 약간 있음',
    nullable: true,
    type: String,
  })
  memo!: string | null;

  @ApiProperty({ example: '2026-07-23T12:35:02.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-07-23T12:35:02.000Z' })
  updatedAt!: string;
}
