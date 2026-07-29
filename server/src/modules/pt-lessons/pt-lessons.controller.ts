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
import { PtLessonsService } from './pt-lessons.service';
import {
  listPtLessonsQuerySchema,
  ptLessonSchema,
} from './pt-lessons.schemas';
import { CreatePtLessonDto } from './dto/create-pt-lesson.dto';
import { ListPtLessonsQueryDto } from './dto/list-pt-lessons-query.dto';
import { PtLessonDto } from './dto/pt-lesson-response.dto';
import { UpdatePtLessonDto } from './dto/update-pt-lesson.dto';

@ApiTags('pt-lessons')
@ApiHeader({
  name: 'x-user-key',
  required: true,
  description:
    'Apps in Toss anonymous user hash. Use getAnonymousKey() on the client.',
})
@ApiBadRequestResponse({
  description: 'x-user-key is missing or request data is invalid.',
})
@Controller('api/pt-lessons')
export class PtLessonsController {
  constructor(private readonly ptLessonsService: PtLessonsService) {}

  @ApiOperation({
    summary: 'Create a PT lesson for the current user key.',
  })
  @ApiCreatedResponse({
    type: PtLessonDto,
  })
  @Post()
  createPtLesson(
    @UserKey() userKey: string,
    @Body(new ZodValidationPipe(ptLessonSchema))
    dto: CreatePtLessonDto,
  ) {
    return this.ptLessonsService.createPtLesson(userKey, dto);
  }

  @ApiOperation({
    summary: 'List PT lessons for the current user key.',
  })
  @ApiOkResponse({
    isArray: true,
    type: PtLessonDto,
  })
  @Get()
  listPtLessons(
    @UserKey() userKey: string,
    @Query(new ZodValidationPipe(listPtLessonsQuerySchema))
    query: ListPtLessonsQueryDto,
  ) {
    return this.ptLessonsService.listPtLessons(userKey, query);
  }

  @ApiOperation({
    summary: 'Get a PT lesson for the current user key.',
  })
  @ApiOkResponse({
    type: PtLessonDto,
  })
  @ApiNotFoundResponse({
    description: 'PT lesson not found.',
  })
  @Get(':lessonId')
  getPtLesson(
    @UserKey() userKey: string,
    @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
  ) {
    return this.ptLessonsService.getPtLesson(userKey, lessonId);
  }

  @ApiOperation({
    summary: 'Update a PT lesson for the current user key.',
  })
  @ApiOkResponse({
    type: PtLessonDto,
  })
  @ApiNotFoundResponse({
    description: 'PT lesson not found.',
  })
  @Put(':lessonId')
  updatePtLesson(
    @UserKey() userKey: string,
    @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
    @Body(new ZodValidationPipe(ptLessonSchema))
    dto: UpdatePtLessonDto,
  ) {
    return this.ptLessonsService.updatePtLesson(userKey, lessonId, dto);
  }

  @ApiOperation({
    summary: 'Delete a PT lesson for the current user key.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        deleted: true,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'PT lesson not found.',
  })
  @Delete(':lessonId')
  deletePtLesson(
    @UserKey() userKey: string,
    @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
  ) {
    return this.ptLessonsService.deletePtLesson(userKey, lessonId);
  }
}
