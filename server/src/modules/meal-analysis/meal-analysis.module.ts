import { Module } from '@nestjs/common';
import { MealAnalysisAiClientPort } from './meal-analysis-ai-client.port';
import { MealAnalysisController } from './meal-analysis.controller';
import { MealAnalysisService } from './meal-analysis.service';
import { MealRecordsRepositoryPort } from './meal-records.repository.port';
import { MealRecordsRepository } from './meal-records.repository';
import { OpenAiMealAnalysisClient } from './openai-meal-analysis.client';

@Module({
  controllers: [MealAnalysisController],
  providers: [
    MealRecordsRepository,
    {
      provide: MealRecordsRepositoryPort,
      useExisting: MealRecordsRepository,
    },
    {
      provide: MealAnalysisAiClientPort,
      useClass: OpenAiMealAnalysisClient,
    },
    MealAnalysisService,
  ],
})
export class MealAnalysisModule {}
