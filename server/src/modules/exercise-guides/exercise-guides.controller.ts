import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserKey } from '../../common/decorators/user-key.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ExerciseGuideDto } from './dto/exercise-guide-response.dto';
import { ListExerciseGuidesQueryDto } from './dto/list-exercise-guides-query.dto';
import { SetExerciseGuideLikeDto } from './dto/set-exercise-guide-like.dto';
import {
  listExerciseGuidesQuerySchema,
  setExerciseGuideLikeSchema,
} from './exercise-guides.schemas';
import { ExerciseGuidesService } from './exercise-guides.service';

@ApiTags('exercise-guides')
@ApiHeader({
  name: 'x-user-key',
  required: true,
  description:
    'Apps in Toss anonymous user hash. Use getAnonymousKey() on the client.',
})
@ApiBadRequestResponse({
  description: 'x-user-key is missing or request data is invalid.',
})
@Controller('api/exercise-guides')
export class ExerciseGuidesController {
  constructor(private readonly exerciseGuidesService: ExerciseGuidesService) {}

  @ApiOperation({
    summary: 'List exercise guides for the current user key.',
  })
  @ApiOkResponse({
    type: ExerciseGuideDto,
    isArray: true,
  })
  @Get()
  listExerciseGuides(
    @UserKey() userKey: string,
    @Query(new ZodValidationPipe(listExerciseGuidesQuerySchema))
    query: ListExerciseGuidesQueryDto,
  ) {
    return this.exerciseGuidesService.listExerciseGuides(userKey, query);
  }

  @ApiOperation({
    summary: 'Get an exercise guide for the current user key.',
  })
  @ApiOkResponse({
    type: ExerciseGuideDto,
  })
  @ApiNotFoundResponse({
    description: 'Exercise guide not found.',
  })
  @Get(':guideId')
  getExerciseGuide(
    @UserKey() userKey: string,
    @Param('guideId') guideId: string,
  ) {
    return this.exerciseGuidesService.getExerciseGuide(userKey, guideId);
  }

  @ApiOperation({
    summary: 'Set the current user like state for an exercise guide.',
  })
  @ApiOkResponse({
    type: ExerciseGuideDto,
  })
  @ApiNotFoundResponse({
    description: 'Exercise guide not found.',
  })
  @Put(':guideId/like')
  setExerciseGuideLike(
    @UserKey() userKey: string,
    @Param('guideId') guideId: string,
    @Body(new ZodValidationPipe(setExerciseGuideLikeSchema))
    dto: SetExerciseGuideLikeDto,
  ) {
    return this.exerciseGuidesService.setExerciseGuideLike(
      userKey,
      guideId,
      dto.liked,
    );
  }
}
