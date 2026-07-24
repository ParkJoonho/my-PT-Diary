import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConditionItemDto {
  @ApiProperty({ example: '훈련 동기' })
  label!: string;

  @ApiProperty({ example: 4 })
  score!: number;
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
  date!: string;

  @ApiProperty({ example: 1 })
  weekNumber!: number;

  @ApiProperty({ type: ConditionItemDto, isArray: true })
  conditions!: ConditionItemDto[];

  @ApiProperty({ type: ConditionItemDto, isArray: true })
  muscleSoreness!: ConditionItemDto[];

  @ApiProperty({ type: ConditionRecordSummaryDto })
  summary!: ConditionRecordSummaryDto;

  @ApiPropertyOptional({ example: 1753274102000, type: Number })
  createdAt!: number;
}
