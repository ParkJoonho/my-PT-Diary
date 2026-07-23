import { Module } from '@nestjs/common';
import { WorkoutRecordsController } from './workout-records.controller';
import { WorkoutRecordsRepository } from './workout-records.repository';
import { WorkoutRecordsRepositoryPort } from './workout-records.repository.port';
import { WorkoutRecordsService } from './workout-records.service';

@Module({
  controllers: [WorkoutRecordsController],
  providers: [
    WorkoutRecordsRepository,
    {
      provide: WorkoutRecordsRepositoryPort,
      useExisting: WorkoutRecordsRepository,
    },
    WorkoutRecordsService,
  ],
})
export class WorkoutRecordsModule {}
