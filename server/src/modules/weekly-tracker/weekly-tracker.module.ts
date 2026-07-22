import { Module } from '@nestjs/common';
import { WeeklyTrackerController } from './weekly-tracker.controller';
import { WeeklyTrackerRepository } from './weekly-tracker.repository';
import { WeeklyTrackerRepositoryPort } from './weekly-tracker.repository.port';
import { WeeklyTrackerService } from './weekly-tracker.service';

@Module({
  controllers: [WeeklyTrackerController],
  providers: [
    WeeklyTrackerRepository,
    {
      provide: WeeklyTrackerRepositoryPort,
      useExisting: WeeklyTrackerRepository,
    },
    WeeklyTrackerService,
  ],
})
export class WeeklyTrackerModule {}
