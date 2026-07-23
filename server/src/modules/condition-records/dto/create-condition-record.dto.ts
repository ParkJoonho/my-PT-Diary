import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import {
  ConditionScoresDto,
  MuscleSorenessDto,
} from './condition-record-response.dto';

export class CreateConditionRecordDto {
  @ApiProperty({ example: '2026-07-23' })
  @Allow()
  checkedOn!: string;

  @ApiProperty({ example: 'Asia/Seoul' })
  @Allow()
  timeZone!: string;

  @ApiProperty({ type: ConditionScoresDto })
  @Allow()
  conditionScores!: ConditionScoresDto;

  @ApiProperty({ type: MuscleSorenessDto })
  @Allow()
  muscleSoreness!: MuscleSorenessDto;

  @ApiPropertyOptional({ example: '수면 부족, 하체 근육통 약간 있음' })
  @Allow()
  memo?: string;
}
