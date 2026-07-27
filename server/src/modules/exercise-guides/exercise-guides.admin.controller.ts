import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceRoleKeyGuard } from '../../common/guards/service-role-key.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AdminExerciseGuideDto } from './dto/admin-exercise-guide.dto';
import { CreateAdminExerciseGuideDto } from './dto/create-admin-exercise-guide.dto';
import { ListExerciseGuidesQueryDto } from './dto/list-exercise-guides-query.dto';
import { UpdateAdminExerciseGuideDto } from './dto/update-admin-exercise-guide.dto';
import {
  createAdminExerciseGuideSchema,
  listExerciseGuidesQuerySchema,
} from './exercise-guides.schemas';
import { updateAdminExerciseGuideSchema } from './exercise-guides.schemas';
import { ExerciseGuidesService } from './exercise-guides.service';

@ApiTags('admin-exercise-guides')
@ApiHeader({
  name: 'x-service-role-key',
  required: true,
  description:
    'Server-side service role key for admin-only exercise guide catalog mutations.',
})
@ApiForbiddenResponse({
  description: 'A valid service role key is required.',
})
@ApiServiceUnavailableResponse({
  description: 'SERVICE_ROLE_KEY is not configured on the server.',
})
@UseGuards(ServiceRoleKeyGuard)
@Controller('api/admin/exercise-guides')
export class ExerciseGuidesAdminController {
  constructor(private readonly exerciseGuidesService: ExerciseGuidesService) {}

  @ApiOperation({
    summary: 'List admin exercise guide catalog rows.',
  })
  @ApiOkResponse({
    type: AdminExerciseGuideDto,
    isArray: true,
  })
  @Get()
  listExerciseGuides(
    @Query(new ZodValidationPipe(listExerciseGuidesQuerySchema))
    query: ListExerciseGuidesQueryDto,
  ) {
    return this.exerciseGuidesService.listAdminExerciseGuides(query);
  }

  @ApiOperation({
    summary: 'Get a single admin exercise guide catalog row.',
  })
  @ApiOkResponse({
    type: AdminExerciseGuideDto,
  })
  @ApiNotFoundResponse({
    description: 'Exercise guide not found.',
  })
  @Get(':guideId')
  getExerciseGuide(@Param('guideId') guideId: string) {
    return this.exerciseGuidesService.getAdminExerciseGuide(guideId);
  }

  @ApiOperation({
    summary: 'Create a new exercise guide catalog row.',
  })
  @ApiCreatedResponse({
    type: AdminExerciseGuideDto,
  })
  @Post()
  createExerciseGuide(
    @Body(new ZodValidationPipe(createAdminExerciseGuideSchema))
    dto: CreateAdminExerciseGuideDto,
  ) {
    return this.exerciseGuidesService.createAdminExerciseGuide(dto);
  }

  @ApiOperation({
    summary: 'Replace an existing exercise guide catalog row.',
  })
  @ApiOkResponse({
    type: AdminExerciseGuideDto,
  })
  @ApiNotFoundResponse({
    description: 'Exercise guide not found.',
  })
  @Put(':guideId')
  updateExerciseGuide(
    @Param('guideId') guideId: string,
    @Body(new ZodValidationPipe(updateAdminExerciseGuideSchema))
    dto: UpdateAdminExerciseGuideDto,
  ) {
    return this.exerciseGuidesService.updateAdminExerciseGuide(guideId, dto);
  }

  @ApiOperation({
    summary: 'Delete an exercise guide catalog row.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNotFoundResponse({
    description: 'Exercise guide not found.',
  })
  @Delete(':guideId')
  async deleteExerciseGuide(@Param('guideId') guideId: string) {
    await this.exerciseGuidesService.deleteAdminExerciseGuide(guideId);
  }
}
