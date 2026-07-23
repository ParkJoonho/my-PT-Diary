import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class WorkoutReportSummaryQueryDto {
  @ApiPropertyOptional({
    example: '2026-07-23',
    description: 'Client-local reference date in YYYY-MM-DD format.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  referenceDate?: string;
}
