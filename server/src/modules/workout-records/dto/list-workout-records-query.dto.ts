import { ApiPropertyOptional } from '@nestjs/swagger';
import { WorkoutRecordSource } from './workout-record-response.dto';

export class ListWorkoutRecordsQueryDto {
  @ApiPropertyOptional({ example: '2026-07-01' })
  from?: string;

  @ApiPropertyOptional({ example: '2026-07-31' })
  to?: string;

  @ApiPropertyOptional({ enum: WorkoutRecordSource })
  source?: WorkoutRecordSource;
}
