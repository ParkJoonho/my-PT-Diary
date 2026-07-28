import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class CompareAnalysisRecordsDto {
  @ApiProperty({ example: 'record_old' })
  @Allow()
  recordId1!: string;

  @ApiProperty({ example: 'record_new' })
  @Allow()
  recordId2!: string;
}
