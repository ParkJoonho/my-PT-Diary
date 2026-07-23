import { ApiPropertyOptional } from '@nestjs/swagger';

export class WorkoutReportSummaryQueryDto {
  @ApiPropertyOptional({
    example: '2026-07-23',
    description: 'Client-local reference date in YYYY-MM-DD format.',
  })
  referenceDate?: string;
}
