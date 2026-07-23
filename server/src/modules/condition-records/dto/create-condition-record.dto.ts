import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ConditionScoresDto,
  MuscleSorenessDto,
} from './condition-record-response.dto';

export class CreateConditionRecordDto {
  @ApiProperty({ example: '2026-07-23' })
  checkedOn!: string;

  @ApiProperty({ example: 'Asia/Seoul' })
  timeZone!: string;

  @ApiProperty({ type: ConditionScoresDto })
  conditionScores!: ConditionScoresDto;

  @ApiProperty({ type: MuscleSorenessDto })
  muscleSoreness!: MuscleSorenessDto;

  @ApiPropertyOptional({ example: '수면 부족, 하체 근육통 약간 있음' })
  memo?: string;
}
