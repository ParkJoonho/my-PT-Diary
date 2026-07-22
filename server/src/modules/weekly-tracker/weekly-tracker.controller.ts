import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserKey } from '../../common/decorators/user-key.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateWeeklyWorkoutDto } from './dto/create-weekly-workout.dto';
import { GetWeeklyTrackerQueryDto } from './dto/get-weekly-tracker-query.dto';
import { ListWeeklyWorkoutsQueryDto } from './dto/list-weekly-workouts-query.dto';
import {
  WeeklyTrackerSummaryDto,
  WeeklyWorkoutCompletionDto,
} from './dto/weekly-tracker-response.dto';
import {
  createWeeklyWorkoutSchema,
  weeklyTrackerQuerySchema,
} from './weekly-tracker.schemas';
import { WeeklyTrackerService } from './weekly-tracker.service';

@ApiTags('weekly-tracker')
@ApiHeader({
  name: 'x-user-key',
  required: true,
  description:
    'Apps in Toss anonymous user hash. Use getAnonymousKey() on the client.',
})
@ApiBadRequestResponse({
  description: 'x-user-key is missing or request data is invalid.',
})
@Controller('api/weekly-tracker')
export class WeeklyTrackerController {
  constructor(private readonly weeklyTrackerService: WeeklyTrackerService) {}

  @ApiOperation({
    summary: 'Create a workout completion record for the current user key.',
  })
  @ApiCreatedResponse({
    type: WeeklyWorkoutCompletionDto,
  })
  @Post('workouts')
  createWorkoutCompletion(
    @UserKey() userKey: string,
    @Body(new ZodValidationPipe(createWeeklyWorkoutSchema))
    dto: CreateWeeklyWorkoutDto,
  ) {
    return this.weeklyTrackerService.createWorkoutCompletion(userKey, dto);
  }

  @ApiOperation({
    summary: 'Get the weekly tracker summary for the current user key.',
  })
  @ApiOkResponse({
    type: WeeklyTrackerSummaryDto,
  })
  @Get()
  getWeeklyTrackerSummary(
    @UserKey() userKey: string,
    @Query(new ZodValidationPipe(weeklyTrackerQuerySchema))
    query: GetWeeklyTrackerQueryDto,
  ) {
    return this.weeklyTrackerService.getWeeklySummary(
      userKey,
      query.referenceDate,
    );
  }

  @ApiOperation({
    summary: 'List raw workout completion records for the selected week.',
  })
  @ApiOkResponse({
    type: WeeklyWorkoutCompletionDto,
    isArray: true,
  })
  @Get('workouts')
  listWeeklyWorkoutCompletions(
    @UserKey() userKey: string,
    @Query(new ZodValidationPipe(weeklyTrackerQuerySchema))
    query: ListWeeklyWorkoutsQueryDto,
  ) {
    return this.weeklyTrackerService.listWeeklyWorkoutCompletions(
      userKey,
      query.referenceDate,
    );
  }

  @ApiOperation({
    summary: 'Delete a workout completion record for the current user key.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        deleted: true,
      },
    },
  })
  @Delete('workouts/:workoutId')
  deleteWorkoutCompletion(
    @UserKey() userKey: string,
    @Param('workoutId', new ParseUUIDPipe()) workoutId: string,
  ) {
    return this.weeklyTrackerService.deleteWorkoutCompletion(
      userKey,
      workoutId,
    );
  }
}
