import { Module } from '@nestjs/common';
import { AnalysisRecordsModule } from '../analysis-records/analysis-records.module';
import { BodyComparisonAiClientPort } from './body-comparison-ai-client.port';
import { BodyComparisonController } from './body-comparison.controller';
import { BodyComparisonService } from './body-comparison.service';
import { OpenAiBodyComparisonClient } from './openai-body-comparison.client';

@Module({
  imports: [AnalysisRecordsModule],
  controllers: [BodyComparisonController],
  providers: [
    {
      provide: BodyComparisonAiClientPort,
      useClass: OpenAiBodyComparisonClient,
    },
    BodyComparisonService,
  ],
})
export class BodyComparisonModule {}
