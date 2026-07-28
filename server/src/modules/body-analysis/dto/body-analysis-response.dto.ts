import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class BodyAnalysisRecordSaveDto {
  @ApiProperty({
    enum: ['saved', 'failed'],
    example: 'saved',
  })
  status!: 'saved' | 'failed';

  @ApiPropertyOptional({
    example: 'record_123',
  })
  recordId?: string;

  @ApiPropertyOptional({
    example: 'Analysis result was generated, but saving the history record failed.',
  })
  message?: string;
}

export class BodyAnalysisResponseDto {
  @ApiProperty({
    example: '2026-07-28T01:23:45.000Z',
  })
  analyzedAt!: string;

  @ApiProperty({
    example: {
      bodyType: 'V',
      bodyTypeDescription: '상체 비중이 상대적으로 큰 편이에요.',
      ratios: { armToHeight: 0.49, upperToLower: 1.02 },
      upperBody: {
        shoulderWidth: { value: '넓음', note: '견갑 안정화가 중요해 보여요.' },
      },
      lowerBody: {
        hipWidth: { value: '보통', note: '하체는 비교적 안정적으로 보여요.' },
      },
      posture: {
        overallAlignment: { score: 3, note: '전반적으로 보통 수준이에요.' },
      },
      recommendations: ['흉추 가동성 운동을 자주 해 주세요.'],
      summary: '상체 사용 비중이 높고 어깨 안정화가 중요해 보여요.',
    },
  })
  @Allow()
  analysis!: Record<string, unknown>;

  @ApiProperty({
    type: BodyAnalysisRecordSaveDto,
  })
  recordSave!: BodyAnalysisRecordSaveDto;
}
