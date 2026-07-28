import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserKey } from '../../common/decorators/user-key.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AnalysisRecordsService } from './analysis-records.service';
import { CreateAnalysisRecordDto } from './dto/create-analysis-record.dto';
import { CompareAnalysisRecordsDto } from './dto/compare-analysis-records.dto';
import { CompareAnalysisRecordsResponseDto } from './dto/compare-analysis-response.dto';
import {
  AnalysisRecordDetailDto,
  AnalysisRecordDto,
} from './dto/analysis-record-response.dto';
import { ListAnalysisRecordsQueryDto } from './dto/list-analysis-records-query.dto';
import {
  createAnalysisRecordSchema,
  compareAnalysisRecordsSchema,
  listAnalysisRecordsQuerySchema,
} from './analysis-records.schemas';

@ApiTags('analysis-records')
@ApiHeader({
  name: 'x-user-key',
  required: true,
  description:
    'Apps in Toss anonymous user hash. Use getAnonymousKey() on the client.',
})
@ApiBadRequestResponse({
  description: 'x-user-key is missing or request data is invalid.',
})
@Controller('api/analysis-records')
export class AnalysisRecordsController {
  constructor(
    private readonly analysisRecordsService: AnalysisRecordsService,
  ) {}

  @ApiOperation({
    summary: 'Create one analysis record for the current user key.',
  })
  @ApiOkResponse({
    type: AnalysisRecordDetailDto,
  })
  @Post()
  createAnalysisRecord(
    @UserKey() userKey: string,
    @Body(new ZodValidationPipe(createAnalysisRecordSchema))
    dto: CreateAnalysisRecordDto,
  ) {
    return this.analysisRecordsService.createAnalysisRecord(userKey, dto);
  }

  @ApiOperation({
    summary: 'List analysis records for the current user key.',
  })
  @ApiOkResponse({
    type: AnalysisRecordDto,
    isArray: true,
  })
  @Get()
  listAnalysisRecords(
    @UserKey() userKey: string,
    @Query(new ZodValidationPipe(listAnalysisRecordsQuerySchema))
    query: ListAnalysisRecordsQueryDto,
  ) {
    return this.analysisRecordsService.listAnalysisRecords(userKey, query);
  }

  @ApiOperation({
    summary: 'Get one analysis record for the current user key.',
  })
  @ApiOkResponse({
    type: AnalysisRecordDetailDto,
  })
  @ApiNotFoundResponse({
    description: 'Analysis record not found.',
  })
  @Get(':recordId')
  getAnalysisRecord(
    @UserKey() userKey: string,
    @Param('recordId') recordId: string,
  ) {
    return this.analysisRecordsService.getAnalysisRecord(userKey, recordId);
  }

  @ApiOperation({
    summary: 'Compare two body analysis records for the current user key.',
  })
  @ApiOkResponse({
    type: CompareAnalysisRecordsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Analysis record not found.',
  })
  @ApiServiceUnavailableResponse({
    description: 'Comparison AI is not configured on the server.',
  })
  @Post('compare')
  compareAnalysisRecords(
    @UserKey() userKey: string,
    @Body(new ZodValidationPipe(compareAnalysisRecordsSchema))
    dto: CompareAnalysisRecordsDto,
  ) {
    return this.analysisRecordsService.compareAnalysisRecords(userKey, dto);
  }
}
