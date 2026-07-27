import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
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
import { CreateOutdoorWorkoutPlanDto } from './dto/create-outdoor-workout-plan.dto';
import { OutdoorWorkoutPlanDto } from './dto/outdoor-workout-plan-response.dto';
import { createOutdoorWorkoutPlanSchema } from './outdoor-workout.schemas';
import { OutdoorWorkoutService } from './outdoor-workout.service';

@ApiTags('outdoor-workout')
@ApiHeader({
  name: 'x-user-key',
  required: true,
  description:
    'Apps in Toss anonymous user hash. Use getAnonymousKey() on the client.',
})
@ApiBadRequestResponse({
  description: 'x-user-key is missing or request data is invalid.',
})
@Controller('api/outdoor-workout')
export class OutdoorWorkoutController {
  constructor(
    private readonly outdoorWorkoutService: OutdoorWorkoutService,
  ) {}

  @ApiOperation({
    summary: 'Generate an AI outdoor workout plan from source-faithful route hints.',
  })
  @ApiOkResponse({
    type: OutdoorWorkoutPlanDto,
  })
  @ApiBadGatewayResponse({
    description: 'AI provider returned an invalid response or upstream error.',
  })
  @ApiServiceUnavailableResponse({
    description: 'Outdoor workout AI is not configured on the server.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('plan')
  createOutdoorWorkoutPlan(
    @UserKey() _userKey: string,
    @Body(new ZodValidationPipe(createOutdoorWorkoutPlanSchema))
    dto: CreateOutdoorWorkoutPlanDto,
  ) {
    return this.outdoorWorkoutService.createOutdoorWorkoutPlan(dto);
  }
}
