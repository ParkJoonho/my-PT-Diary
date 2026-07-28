import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserKey } from '../../common/decorators/user-key.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateMealAnalysisDto } from './dto/create-meal-analysis.dto';
import { CreateMealRecordDto } from './dto/create-meal-record.dto';
import {
  DailyMealSummaryDto,
  DietGuideResponseDto,
  MealAnalysisResponseDto,
  MealRecordDto,
} from './dto/meal-analysis-response.dto';
import {
  DailyMealSummaryQueryDto,
  GenerateDietGuideDto,
  ListMealRecordsQueryDto,
} from './dto/meal-record-query.dto';
import { MealAnalysisService } from './meal-analysis.service';
import {
  createMealAnalysisSchema,
  createMealRecordSchema,
  dailyMealSummaryQuerySchema,
  generateDietGuideSchema,
  listMealRecordsQuerySchema,
} from './meal-analysis.schemas';

@ApiTags('meal-analysis')
@ApiHeader({
  name: 'x-user-key',
  required: true,
  description:
    'Apps in Toss anonymous user hash. Use getAnonymousKey() on the client.',
})
@ApiBadRequestResponse({
  description: 'x-user-key is missing or request data is invalid.',
})
@Controller('api/meal-analysis')
export class MealAnalysisController {
  constructor(private readonly mealAnalysisService: MealAnalysisService) {}

  @ApiOperation({
    summary: 'Analyze before/after meal images for the current user key.',
  })
  @ApiOkResponse({
    type: MealAnalysisResponseDto,
  })
  @ApiBadGatewayResponse({
    description: 'AI provider returned an invalid response or upstream error.',
  })
  @ApiServiceUnavailableResponse({
    description: 'Meal analysis AI is not configured on the server.',
  })
  @Post('analyze')
  @HttpCode(200)
  analyzeMeal(
    @UserKey() _userKey: string,
    @Body(new ZodValidationPipe(createMealAnalysisSchema))
    dto: CreateMealAnalysisDto,
  ) {
    return this.mealAnalysisService.analyzeMeal(dto);
  }

  @ApiOperation({
    summary: 'Save a meal analysis record for the current user key.',
  })
  @ApiCreatedResponse({
    type: MealRecordDto,
  })
  @Post('records')
  createMealRecord(
    @UserKey() userKey: string,
    @Body(new ZodValidationPipe(createMealRecordSchema))
    dto: CreateMealRecordDto,
  ) {
    return this.mealAnalysisService.createMealRecord(userKey, dto);
  }

  @ApiOperation({
    summary: 'List meal records for the current user key.',
  })
  @ApiOkResponse({
    isArray: true,
    type: MealRecordDto,
  })
  @Get('records')
  listMealRecords(
    @UserKey() userKey: string,
    @Query(new ZodValidationPipe(listMealRecordsQuerySchema))
    query: ListMealRecordsQueryDto,
  ) {
    return this.mealAnalysisService.listMealRecords(userKey, query.date);
  }

  @ApiOperation({
    summary: 'Get daily nutrient totals for the current user key.',
  })
  @ApiOkResponse({
    type: DailyMealSummaryDto,
  })
  @Get('daily-summary')
  getDailySummary(
    @UserKey() userKey: string,
    @Query(new ZodValidationPipe(dailyMealSummaryQuerySchema))
    query: DailyMealSummaryQueryDto,
  ) {
    return this.mealAnalysisService.getDailySummary(userKey, query.date);
  }

  @ApiOperation({
    summary:
      'Generate an original-app diet guide from the current user meal records.',
  })
  @ApiOkResponse({
    type: DietGuideResponseDto,
  })
  @ApiBadGatewayResponse({
    description: 'AI provider returned an invalid response or upstream error.',
  })
  @ApiServiceUnavailableResponse({
    description: 'Meal analysis AI is not configured on the server.',
  })
  @Post('guide')
  @HttpCode(200)
  generateDietGuide(
    @UserKey() userKey: string,
    @Body(new ZodValidationPipe(generateDietGuideSchema))
    dto: GenerateDietGuideDto,
  ) {
    return this.mealAnalysisService.generateDietGuide(userKey, dto);
  }
}
