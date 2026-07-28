import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class ListMealRecordsQueryDto {
  @ApiPropertyOptional({
    example: '2026-07-28',
  })
  @Allow()
  date?: string;
}

export class DailyMealSummaryQueryDto {
  @ApiProperty({
    example: '2026-07-28',
  })
  @Allow()
  date!: string;
}

export class GenerateDietGuideDto {
  @ApiProperty({
    example: '2026-07-28',
  })
  @Allow()
  date!: string;
}
