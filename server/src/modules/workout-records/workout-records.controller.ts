import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserKey } from '../../common/decorators/user-key.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateManualWorkoutRecordDto } from './dto/create-manual-workout-record.dto';
import { CreateRoutineWorkoutCompletionDto } from './dto/create-routine-workout-completion.dto';
import { ListWorkoutRecordsQueryDto } from './dto/list-workout-records-query.dto';
import { UpdateManualWorkoutRecordDto } from './dto/update-manual-workout-record.dto';
import {
  CreateRoutineWorkoutCompletionResponseDto,
  WorkoutRecordDto,
} from './dto/workout-record-response.dto';
import {
  createRoutineWorkoutCompletionSchema,
  listWorkoutRecordsQuerySchema,
  manualWorkoutRecordSchema,
} from './workout-records.schemas';
import { WorkoutRecordsService } from './workout-records.service';

@ApiTags('workout-records')
@ApiHeader({
  name: 'x-user-key',
  required: true,
  description:
    'Apps in Toss anonymous user hash. Use getAnonymousKey() on the client.',
})
@ApiBadRequestResponse({
  description: 'x-user-key is missing or request data is invalid.',
})
@Controller('api/workout-records')
export class WorkoutRecordsController {
  constructor(private readonly workoutRecordsService: WorkoutRecordsService) {}

  @ApiOperation({
    summary:
      'Create a routine workout record and linked weekly tracker completion.',
  })
  @ApiCreatedResponse({
    type: CreateRoutineWorkoutCompletionResponseDto,
  })
  @Post('routine-completions')
  createRoutineWorkoutCompletion(
    @UserKey() userKey: string,
    @Body(new ZodValidationPipe(createRoutineWorkoutCompletionSchema))
    dto: CreateRoutineWorkoutCompletionDto,
  ) {
    return this.workoutRecordsService.createRoutineWorkoutCompletion(
      userKey,
      dto,
    );
  }

  @ApiOperation({
    summary:
      'Create a manual personal workout record and linked weekly tracker completion.',
  })
  @ApiCreatedResponse({
    type: WorkoutRecordDto,
  })
  @Post('manual')
  createManualWorkoutRecord(
    @UserKey() userKey: string,
    @Body(new ZodValidationPipe(manualWorkoutRecordSchema))
    dto: CreateManualWorkoutRecordDto,
  ) {
    return this.workoutRecordsService.createManualWorkoutRecord(userKey, dto);
  }

  @ApiOperation({
    summary: 'List workout records for the current user key.',
  })
  @ApiOkResponse({
    type: WorkoutRecordDto,
    isArray: true,
  })
  @Get()
  listWorkoutRecords(
    @UserKey() userKey: string,
    @Query(new ZodValidationPipe(listWorkoutRecordsQuerySchema))
    query: ListWorkoutRecordsQueryDto,
  ) {
    return this.workoutRecordsService.listWorkoutRecords(userKey, query);
  }

  @ApiOperation({
    summary: 'Get a workout record for the current user key.',
  })
  @ApiOkResponse({
    type: WorkoutRecordDto,
  })
  @ApiNotFoundResponse({
    description: 'Workout record not found.',
  })
  @Get(':recordId')
  getWorkoutRecord(
    @UserKey() userKey: string,
    @Param('recordId', new ParseUUIDPipe()) recordId: string,
  ) {
    return this.workoutRecordsService.getWorkoutRecord(userKey, recordId);
  }

  @ApiOperation({
    summary: 'Replace a manual workout record for the current user key.',
  })
  @ApiOkResponse({
    type: WorkoutRecordDto,
  })
  @ApiNotFoundResponse({
    description: 'Workout record not found.',
  })
  @Put(':recordId')
  updateManualWorkoutRecord(
    @UserKey() userKey: string,
    @Param('recordId', new ParseUUIDPipe()) recordId: string,
    @Body(new ZodValidationPipe(manualWorkoutRecordSchema))
    dto: UpdateManualWorkoutRecordDto,
  ) {
    return this.workoutRecordsService.updateManualWorkoutRecord(
      userKey,
      recordId,
      dto,
    );
  }

  @ApiOperation({
    summary:
      'Delete a workout record and its linked weekly tracker completion.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        deleted: true,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Workout record not found.',
  })
  @Delete(':recordId')
  deleteWorkoutRecord(
    @UserKey() userKey: string,
    @Param('recordId', new ParseUUIDPipe()) recordId: string,
  ) {
    return this.workoutRecordsService.deleteWorkoutRecord(userKey, recordId);
  }
}
