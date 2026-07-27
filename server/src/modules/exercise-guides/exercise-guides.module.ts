import { Module } from '@nestjs/common';
import { ServiceRoleKeyGuard } from '../../common/guards/service-role-key.guard';
import { ExerciseGuidesAdminController } from './exercise-guides.admin.controller';
import { ExerciseGuidesController } from './exercise-guides.controller';
import { ExerciseGuidesRepository } from './exercise-guides.repository';
import { ExerciseGuidesRepositoryPort } from './exercise-guides.repository.port';
import { ExerciseGuidesService } from './exercise-guides.service';

@Module({
  controllers: [ExerciseGuidesController, ExerciseGuidesAdminController],
  providers: [
    ServiceRoleKeyGuard,
    ExerciseGuidesRepository,
    {
      provide: ExerciseGuidesRepositoryPort,
      useExisting: ExerciseGuidesRepository,
    },
    ExerciseGuidesService,
  ],
})
export class ExerciseGuidesModule {}
