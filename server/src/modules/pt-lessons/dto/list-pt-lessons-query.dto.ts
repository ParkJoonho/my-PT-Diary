import { ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class ListPtLessonsQueryDto {
  @ApiPropertyOptional({
    example: '2026-07-01',
  })
  @Allow()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-07-31',
  })
  @Allow()
  to?: string;
}
