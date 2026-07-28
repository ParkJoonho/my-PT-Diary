import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserKey } from '../../common/decorators/user-key.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createBodyComparisonSchema } from './body-comparison.schemas';
import { BodyComparisonService } from './body-comparison.service';
import { BodyComparisonResponseDto } from './dto/body-comparison-response.dto';
import { CreateBodyComparisonDto } from './dto/create-body-comparison.dto';

@ApiTags('body-comparison')
@ApiHeader({
  name: 'x-user-key',
  required: true,
  description:
    'Apps in Toss anonymous user hash. Use getAnonymousKey() on the client.',
})
@ApiBadRequestResponse({
  description: 'x-user-key is missing or request data is invalid.',
})
@Controller('api/body-comparison')
export class BodyComparisonController {
  constructor(
    private readonly bodyComparisonService: BodyComparisonService,
  ) {}

  @ApiOperation({
    summary: 'Analyze before/after full-body images for the current user key.',
  })
  @ApiOkResponse({
    type: BodyComparisonResponseDto,
  })
  @ApiBadGatewayResponse({
    description: 'AI provider returned an invalid response or upstream error.',
  })
  @ApiServiceUnavailableResponse({
    description: 'Body comparison AI is not configured on the server.',
  })
  @Post('analyze')
  @HttpCode(200)
  analyzeBodyComparison(
    @UserKey() userKey: string,
    @Body(new ZodValidationPipe(createBodyComparisonSchema))
    dto: CreateBodyComparisonDto,
  ) {
    return this.bodyComparisonService.analyzeBodyComparison(userKey, dto);
  }
}
