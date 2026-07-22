import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetWeeklyTrackerQueryDto {
  @ApiPropertyOptional({
    example: '2026-07-22',
    description:
      'Reference date in YYYY-MM-DD format. The server resolves the containing Monday-Sunday week.',
  })
  referenceDate?: string;
}
