import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import {
  ConditionItemDto,
} from './condition-record-response.dto';

export class CreateConditionRecordDto {
  @ApiProperty({ example: '2026-07-23' })
  @Allow()
  date!: string;

  @ApiProperty({ example: 1 })
  @Allow()
  weekNumber!: number;

  @ApiPropertyOptional({ example: 'Asia/Seoul' })
  @Allow()
  timeZone?: string;

  @ApiProperty({ type: ConditionItemDto, isArray: true })
  @Allow()
  conditions!: ConditionItemDto[];

  @ApiProperty({ type: ConditionItemDto, isArray: true })
  @Allow()
  muscleSoreness!: ConditionItemDto[];
}
