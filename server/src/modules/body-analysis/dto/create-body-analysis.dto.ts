import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class CreateBodyAnalysisDto {
  @ApiProperty({
    description: 'Required front full-body image base64 payload.',
  })
  @Allow()
  imageBase64!: string;

  @ApiPropertyOptional()
  @Allow()
  sideImageBase64?: string;

  @ApiPropertyOptional()
  @Allow()
  backImageBase64?: string;

  @ApiPropertyOptional()
  @Allow()
  squatImageBase64?: string;

  @ApiPropertyOptional({
    example: 175,
  })
  @Allow()
  height?: number;

  @ApiPropertyOptional({
    example: '허리 통증이 가끔 있어요.',
  })
  @Allow()
  medicalSymptoms?: string;

  @ApiPropertyOptional({
    example: '2026-07-01',
  })
  @Allow()
  photoDate?: string;
}
