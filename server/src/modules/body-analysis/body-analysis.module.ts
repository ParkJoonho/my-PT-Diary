import { Module } from '@nestjs/common';
import { AnalysisRecordsModule } from '../analysis-records/analysis-records.module';
import { BodyAnalysisAiClientPort } from './body-analysis-ai-client.port';
import { BodyAnalysisController } from './body-analysis.controller';
import { BodyAnalysisRepository } from './body-analysis.repository';
import { BodyAnalysisRepositoryPort } from './body-analysis.repository.port';
import { BodyAnalysisService } from './body-analysis.service';
import { OpenAiBodyAnalysisClient } from './openai-body-analysis.client';

@Module({
  imports: [AnalysisRecordsModule],
  controllers: [BodyAnalysisController],
  providers: [
    BodyAnalysisRepository,
    {
      provide: BodyAnalysisRepositoryPort,
      useExisting: BodyAnalysisRepository,
    },
    {
      provide: BodyAnalysisAiClientPort,
      useClass: OpenAiBodyAnalysisClient,
    },
    BodyAnalysisService,
  ],
})
export class BodyAnalysisModule {}
