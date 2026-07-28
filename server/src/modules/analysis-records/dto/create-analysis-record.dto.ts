import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { AnalysisRecordType } from './analysis-record-response.dto';

export class CreateAnalysisRecordDto {
  @ApiProperty({ enum: AnalysisRecordType, example: AnalysisRecordType.Body })
  analysisType!: AnalysisRecordType;

  @ApiProperty({
    example: '2026-07-28T01:23:45.000Z',
  })
  analyzedAt!: string;

  @ApiPropertyOptional({
    example: {
      bodyType: 'V',
      bodyTypeDescription: '상체가 상대적으로 발달한 체형이에요.',
      summary: '어깨 안정화와 골반 균형을 함께 보는 편이 좋아요.',
    },
  })
  @Allow()
  qualitativeData?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: {
      armToHeight: 0.49,
      upperToLower: 1.02,
      overallAlignment: 3,
    },
  })
  @Allow()
  quantitativeData?: Record<string, unknown>;

  @ApiProperty({
    example: {
      bodyType: 'V',
      bodyTypeDescription: '상체가 상대적으로 발달한 체형이에요.',
      ratios: { armToHeight: 0.49, upperToLower: 1.02 },
      recommendations: ['흉추 신전을 자주 해 주세요.'],
      summary: '상체 사용 비중이 높아 보여요.',
    },
  })
  @Allow()
  rawResult!: Record<string, unknown>;
}
