import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { WorkoutReportsController } from './workout-reports.controller';
import { WorkoutReportsRepositoryPort } from './workout-reports.repository.port';
import { WorkoutReportsRepository } from './workout-reports.repository';
import { WorkoutReportsService } from './workout-reports.service';

@Module({
  controllers: [WorkoutReportsController],
  imports: [DatabaseModule],
  providers: [
    WorkoutReportsService,
    {
      provide: WorkoutReportsRepositoryPort,
      useClass: WorkoutReportsRepository,
    },
  ],
})
export class WorkoutReportsModule {}
