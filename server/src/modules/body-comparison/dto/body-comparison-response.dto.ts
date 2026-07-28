import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class BodyComparisonRecordSaveDto {
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
    example: 'Comparison result was generated, but saving the history record failed.',
  })
  message?: string;
}

export class BodyComparisonResponseDto {
  @ApiProperty({
    example: '2026-07-28T01:23:45.000Z',
  })
  analyzedAt!: string;

  @ApiProperty({
    example: {
      overallChange: {
        grade: 'A',
        score: 84,
        summary: '상체와 코어 안정성이 전반적으로 좋아졌어요.',
      },
      bodyChanges: {
        upperBody: {
          change: '개선',
          description: '어깨 라인이 더 정돈돼 보여요.',
          details: ['견갑 안정성이 조금 더 좋아 보여요.'],
        },
      },
      recommendations: {
        keepDoing: ['현재 루틴을 유지해 주세요.'],
        improve: ['하체 가동성도 함께 챙겨 주세요.'],
        nextGoal: '다음 단계는 하체 균형 보완이에요.',
      },
    },
  })
  @Allow()
  comparison!: Record<string, unknown>;

  @ApiProperty({
    type: BodyComparisonRecordSaveDto,
  })
  recordSave!: BodyComparisonRecordSaveDto;
}
