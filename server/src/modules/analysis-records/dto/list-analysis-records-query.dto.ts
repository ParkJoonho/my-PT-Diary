import { ApiPropertyOptional } from '@nestjs/swagger';
import { AnalysisRecordType } from './analysis-record-response.dto';

export class ListAnalysisRecordsQueryDto {
  @ApiPropertyOptional({
    enum: AnalysisRecordType,
    example: AnalysisRecordType.Body,
  })
  type?: AnalysisRecordType;
}
