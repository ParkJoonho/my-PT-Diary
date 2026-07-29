import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { PtLessonsController } from './pt-lessons.controller';
import { PtLessonsRepositoryPort } from './pt-lessons.repository.port';
import { PtLessonsRepository } from './pt-lessons.repository';
import { PtLessonsService } from './pt-lessons.service';

@Module({
  controllers: [PtLessonsController],
  imports: [DatabaseModule],
  providers: [
    PtLessonsService,
    {
      provide: PtLessonsRepositoryPort,
      useClass: PtLessonsRepository,
    },
  ],
})
export class PtLessonsModule {}
