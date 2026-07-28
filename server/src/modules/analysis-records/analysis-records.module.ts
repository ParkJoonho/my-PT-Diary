import { Module } from '@nestjs/common';
import { AnalysisRecordComparisonClientPort } from './analysis-record-comparison.client.port';
import { AnalysisRecordsController } from './analysis-records.controller';
import { AnalysisRecordsRepository } from './analysis-records.repository';
import { AnalysisRecordsRepositoryPort } from './analysis-records.repository.port';
import { AnalysisRecordsService } from './analysis-records.service';
import { OpenAiAnalysisRecordComparisonClient } from './openai-analysis-record-comparison.client';

@Module({
  controllers: [AnalysisRecordsController],
  providers: [
    AnalysisRecordsRepository,
    {
      provide: AnalysisRecordsRepositoryPort,
      useExisting: AnalysisRecordsRepository,
    },
    {
      provide: AnalysisRecordComparisonClientPort,
      useClass: OpenAiAnalysisRecordComparisonClient,
    },
    AnalysisRecordsService,
  ],
  exports: [AnalysisRecordsService],
})
export class AnalysisRecordsModule {}
