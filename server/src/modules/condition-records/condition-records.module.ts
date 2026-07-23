import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ConditionRecordsController } from './condition-records.controller';
import { ConditionRecordsRepositoryPort } from './condition-records.repository.port';
import { ConditionRecordsRepository } from './condition-records.repository';
import { ConditionRecordsService } from './condition-records.service';

@Module({
  controllers: [ConditionRecordsController],
  imports: [DatabaseModule],
  providers: [
    ConditionRecordsService,
    {
      provide: ConditionRecordsRepositoryPort,
      useClass: ConditionRecordsRepository,
    },
  ],
})
export class ConditionRecordsModule {}
