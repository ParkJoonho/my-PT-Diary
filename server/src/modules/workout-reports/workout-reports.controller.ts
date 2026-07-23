import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserKey } from '../../common/decorators/user-key.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { WorkoutReportSummaryQueryDto } from './dto/workout-report-summary-query.dto';
import { WorkoutReportSummaryDto } from './dto/workout-report-summary-response.dto';
import { workoutReportSummaryQuerySchema } from './workout-reports.schemas';
import { WorkoutReportsService } from './workout-reports.service';

@ApiTags('workout-reports')
@ApiHeader({
  name: 'x-user-key',
  required: true,
  description:
    'Apps in Toss anonymous user hash. Use getAnonymousKey() on the client.',
})
@ApiBadRequestResponse({
  description: 'x-user-key is missing or request data is invalid.',
})
@Controller('api/workout-reports')
export class WorkoutReportsController {
  constructor(private readonly workoutReportsService: WorkoutReportsService) {}

  @ApiOperation({
    summary: 'Get workout and condition report summary for the current user.',
  })
  @ApiOkResponse({
    type: WorkoutReportSummaryDto,
  })
  @Get('summary')
  getSummary(
    @UserKey() userKey: string,
    @Query(new ZodValidationPipe(workoutReportSummaryQuerySchema))
    query: WorkoutReportSummaryQueryDto,
  ) {
    return this.workoutReportsService.getSummary(userKey, query);
  }
}
