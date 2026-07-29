import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
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
import { CreateTrainerConnectRequestDto } from './dto/create-trainer-connect-request.dto';
import { SetTrainerLikeDto } from './dto/set-trainer-like.dto';
import { TrainerConnectRequestDto } from './dto/trainer-connect-request-response.dto';
import {
  RecommendedTrainerDto,
  TrainerDto,
} from './dto/trainer-response.dto';
import {
  createTrainerConnectRequestSchema,
  setTrainerLikeSchema,
} from './trainers.schemas';
import { TrainersService } from './trainers.service';

@ApiTags('trainers')
@ApiHeader({
  name: 'x-user-key',
  required: true,
  description:
    'Apps in Toss anonymous user hash. Use getAnonymousKey() on the client.',
})
@ApiBadRequestResponse({
  description: 'x-user-key is missing or request data is invalid.',
})
@Controller('api/trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @ApiOperation({
    summary: 'List approved trainers for the current user key.',
  })
  @ApiOkResponse({
    isArray: true,
    type: TrainerDto,
  })
  @Get()
  listTrainers(@UserKey() userKey: string) {
    return this.trainersService.listTrainers(userKey);
  }

  @ApiOperation({
    summary: 'List AI-style recommended trainers for the current user key.',
  })
  @ApiOkResponse({
    isArray: true,
    type: RecommendedTrainerDto,
  })
  @Get('recommended')
  listRecommendedTrainers(@UserKey() userKey: string) {
    return this.trainersService.listRecommendedTrainers(userKey);
  }

  @ApiOperation({
    summary: 'List trainer connect requests for the current user key.',
  })
  @ApiOkResponse({
    isArray: true,
    type: TrainerConnectRequestDto,
  })
  @Get('connect-requests')
  listConnectRequests(@UserKey() userKey: string) {
    return this.trainersService.listConnectRequests(userKey);
  }

  @ApiOperation({
    summary: 'Create or return a trainer connect request for the current user key.',
  })
  @ApiCreatedResponse({
    type: TrainerConnectRequestDto,
  })
  @Post(':trainerId/connect-request')
  createConnectRequest(
    @UserKey() userKey: string,
    @Param('trainerId') trainerId: string,
    @Body(new ZodValidationPipe(createTrainerConnectRequestSchema))
    dto: CreateTrainerConnectRequestDto,
  ) {
    return this.trainersService.createConnectRequest(userKey, trainerId, dto);
  }

  @ApiOperation({
    summary: 'Set the current user like state for a trainer.',
  })
  @ApiOkResponse({
    type: TrainerDto,
  })
  @Put(':trainerId/like')
  setTrainerLike(
    @UserKey() userKey: string,
    @Param('trainerId') trainerId: string,
    @Body(new ZodValidationPipe(setTrainerLikeSchema))
    dto: SetTrainerLikeDto,
  ) {
    return this.trainersService.setTrainerLike(userKey, trainerId, dto.liked);
  }
}
