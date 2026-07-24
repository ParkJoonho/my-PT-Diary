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
import { ConditionRecordsService } from './condition-records.service';
import {
  conditionRecordSchema,
  listConditionRecordsQuerySchema,
} from './condition-records.schemas';
import { ConditionRecordDto } from './dto/condition-record-response.dto';
import { CreateConditionRecordDto } from './dto/create-condition-record.dto';
import { ListConditionRecordsQueryDto } from './dto/list-condition-records-query.dto';
import { UpdateConditionRecordDto } from './dto/update-condition-record.dto';

@ApiTags('condition-records')
@ApiHeader({
  name: 'x-user-key',
  required: true,
  description:
    'Apps in Toss anonymous user hash. Use getAnonymousKey() on the client.',
})
@ApiBadRequestResponse({
  description: 'x-user-key is missing or request data is invalid.',
})
@Controller('api/condition-records')
export class ConditionRecordsController {
  constructor(
    private readonly conditionRecordsService: ConditionRecordsService,
  ) {}

  @ApiOperation({
    summary: 'Create a condition record for the current user key.',
  })
  @ApiCreatedResponse({
    type: ConditionRecordDto,
  })
  @Post()
  createConditionRecord(
    @UserKey() userKey: string,
    @Body(new ZodValidationPipe(conditionRecordSchema))
    dto: CreateConditionRecordDto,
  ) {
    return this.conditionRecordsService.createConditionRecord(userKey, dto);
  }

  @ApiOperation({
    summary: 'List condition records for the current user key.',
  })
  @ApiOkResponse({
    type: ConditionRecordDto,
    isArray: true,
  })
  @Get()
  listConditionRecords(
    @UserKey() userKey: string,
    @Query(new ZodValidationPipe(listConditionRecordsQuerySchema))
    query: ListConditionRecordsQueryDto,
  ) {
    return this.conditionRecordsService.listConditionRecords(userKey, query);
  }

  @ApiOperation({
    summary: 'Get a condition record for the current user key.',
  })
  @ApiOkResponse({
    type: ConditionRecordDto,
  })
  @ApiNotFoundResponse({
    description: 'Condition record not found.',
  })
  @Get(':conditionId')
  getConditionRecord(
    @UserKey() userKey: string,
    @Param('conditionId', new ParseUUIDPipe()) conditionId: string,
  ) {
    return this.conditionRecordsService.getConditionRecord(
      userKey,
      conditionId,
    );
  }

  @ApiOperation({
    summary: 'Update a condition record for the current user key.',
  })
  @ApiOkResponse({
    type: ConditionRecordDto,
  })
  @ApiNotFoundResponse({
    description: 'Condition record not found.',
  })
  @Put(':conditionId')
  updateConditionRecord(
    @UserKey() userKey: string,
    @Param('conditionId', new ParseUUIDPipe()) conditionId: string,
    @Body(new ZodValidationPipe(conditionRecordSchema))
    dto: UpdateConditionRecordDto,
  ) {
    return this.conditionRecordsService.updateConditionRecord(
      userKey,
      conditionId,
      dto,
    );
  }

  @ApiOperation({
    summary: 'Delete a condition record for the current user key.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        deleted: true,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Condition record not found.',
  })
  @Delete(':conditionId')
  deleteConditionRecord(
    @UserKey() userKey: string,
    @Param('conditionId', new ParseUUIDPipe()) conditionId: string,
  ) {
    return this.conditionRecordsService.deleteConditionRecord(
      userKey,
      conditionId,
    );
  }
}
