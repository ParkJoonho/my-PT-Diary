import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class GetWeeklyTrackerQueryDto {
  @ApiPropertyOptional({
    example: '2026-07-22',
    description:
      'Reference date in YYYY-MM-DD format. The server resolves the containing Monday-Sunday week.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  referenceDate?: string;
}
