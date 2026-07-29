import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListPtLessonsQueryDto {
  @ApiPropertyOptional({
    example: '2026-07-01',
  })
  from?: string;

  @ApiPropertyOptional({
    example: '2026-07-31',
  })
  to?: string;
}
