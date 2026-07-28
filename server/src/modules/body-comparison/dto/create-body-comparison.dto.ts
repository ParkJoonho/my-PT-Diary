import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class CreateBodyComparisonDto {
  @ApiProperty({
    description: 'Required before full-body image base64 payload.',
  })
  @Allow()
  beforeImageBase64!: string;

  @ApiProperty({
    description: 'Required after full-body image base64 payload.',
  })
  @Allow()
  afterImageBase64!: string;

  @ApiPropertyOptional({
    example: 175,
  })
  @Allow()
  height?: number;

  @ApiPropertyOptional({
    example: '같은 장소에서 촬영했어요.',
  })
  @Allow()
  notes?: string;
}
