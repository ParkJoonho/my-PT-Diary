import { Module } from '@nestjs/common';
import { ExerciseGuidesController } from './exercise-guides.controller';
import { ExerciseGuidesRepository } from './exercise-guides.repository';
import { ExerciseGuidesRepositoryPort } from './exercise-guides.repository.port';
import { ExerciseGuidesService } from './exercise-guides.service';

@Module({
  controllers: [ExerciseGuidesController],
  providers: [
    ExerciseGuidesRepository,
    {
      provide: ExerciseGuidesRepositoryPort,
      useExisting: ExerciseGuidesRepository,
    },
    ExerciseGuidesService,
  ],
})
export class ExerciseGuidesModule {}
