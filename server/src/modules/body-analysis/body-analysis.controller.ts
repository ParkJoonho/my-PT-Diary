import { Body, Controller, Post } from '@nestjs/common';
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
import { BodyAnalysisService } from './body-analysis.service';
import { createBodyAnalysisSchema } from './body-analysis.schemas';
import { CreateBodyAnalysisDto } from './dto/create-body-analysis.dto';
import { BodyAnalysisResponseDto } from './dto/body-analysis-response.dto';

@ApiTags('body-analysis')
@ApiHeader({
  name: 'x-user-key',
  required: true,
  description:
    'Apps in Toss anonymous user hash. Use getAnonymousKey() on the client.',
})
@ApiBadRequestResponse({
  description: 'x-user-key is missing or request data is invalid.',
})
@Controller('api/body-analysis')
export class BodyAnalysisController {
  constructor(private readonly bodyAnalysisService: BodyAnalysisService) {}

  @ApiOperation({
    summary: 'Analyze a full-body image for the current user key.',
  })
  @ApiOkResponse({
    type: BodyAnalysisResponseDto,
  })
  @ApiBadGatewayResponse({
    description: 'AI provider returned an invalid response or upstream error.',
  })
  @ApiServiceUnavailableResponse({
    description: 'Body analysis AI is not configured on the server.',
  })
  @Post('analyze')
  analyzeBody(
    @UserKey() userKey: string,
    @Body(new ZodValidationPipe(createBodyAnalysisSchema))
    dto: CreateBodyAnalysisDto,
  ) {
    return this.bodyAnalysisService.analyzeBody(userKey, dto);
  }
}
