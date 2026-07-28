import { ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { AnalysisRecordType } from './analysis-record-response.dto';

export class ListAnalysisRecordsQueryDto {
  @ApiPropertyOptional({
    enum: AnalysisRecordType,
    example: AnalysisRecordType.Body,
  })
  @Allow()
  type?: AnalysisRecordType;
}
