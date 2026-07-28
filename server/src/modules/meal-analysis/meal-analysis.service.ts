import { BadGatewayException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateMealAnalysisDto } from './dto/create-meal-analysis.dto';
import { CreateMealRecordDto } from './dto/create-meal-record.dto';
import {
  DailyMealSummaryDto,
  DietGuideResponseDto,
  MealAnalysisResponseDto,
  MealRecordDto,
} from './dto/meal-analysis-response.dto';
import { GenerateDietGuideDto } from './dto/meal-record-query.dto';
import { MealAnalysisAiClientPort } from './meal-analysis-ai-client.port';
import {
  dietGuideSchema,
  mealAnalysisResultSchema,
} from './meal-analysis.schemas';
import {
  MealRecordRow,
  MealRecordsRepositoryPort,
} from './meal-records.repository.port';

@Injectable()
export class MealAnalysisService {
  constructor(
    private readonly mealAnalysisAiClient: MealAnalysisAiClientPort,
    private readonly mealRecordsRepository: MealRecordsRepositoryPort,
  ) {}

  async analyzeMeal(
    dto: CreateMealAnalysisDto,
  ): Promise<MealAnalysisResponseDto> {
    const content = await this.mealAnalysisAiClient.analyzeMeal(dto);
    const parsed = this.safeParseJson(content, '식단 분석');
    const validated = mealAnalysisResultSchema.safeParse(parsed);

    if (!validated.success) {
      throw this.invalidAiResponse(
        '식단 분석 응답 형식이 올바르지 않아요.',
        validated.error.issues,
      );
    }

    return {
      analysis: validated.data,
      analyzedAt: new Date().toISOString(),
    };
  }

  async createMealRecord(
    userKey: string,
    dto: CreateMealRecordDto,
  ): Promise<MealRecordDto> {
    const row = await this.mealRecordsRepository.createMealRecord({
      analysisResult: dto.analysisResult,
      id: `meal_${randomUUID()}`,
      mealDate: dto.mealDate,
      mealType: dto.mealType,
      userKey,
    });

    return this.mapRecord(row);
  }

  async listMealRecords(
    userKey: string,
    date?: string,
  ): Promise<MealRecordDto[]> {
    const rows = await this.mealRecordsRepository.listMealRecords({
      date,
      userKey,
    });

    return rows.map((row) => this.mapRecord(row));
  }

  async getDailySummary(
    userKey: string,
    date: string,
  ): Promise<DailyMealSummaryDto> {
    const row = await this.mealRecordsRepository.getDailySummary({
      date,
      userKey,
    });

    return {
      date,
      mealCount: row.meal_count,
      totalCalories: row.total_calories,
      totalCarbs: row.total_carbs,
      totalFat: row.total_fat,
      totalFiber: row.total_fiber,
      totalProtein: row.total_protein,
      totalSodium: row.total_sodium,
    };
  }

  async generateDietGuide(
    userKey: string,
    dto: GenerateDietGuideDto,
  ): Promise<DietGuideResponseDto> {
    const records = await this.mealRecordsRepository.listMealRecords({
      date: dto.date,
      userKey,
    });
    const content = await this.mealAnalysisAiClient.generateDietGuide({
      date: dto.date,
      meals: records.map((record) => ({
        carbs: record.carbs,
        fat: record.fat,
        mealType: record.meal_type,
        protein: record.protein,
        totalCalories: record.total_calories,
      })),
    });
    const parsed = this.safeParseJson(content, '식단 가이드');
    const validated = dietGuideSchema.safeParse(parsed);

    if (!validated.success) {
      throw this.invalidAiResponse(
        '식단 가이드 응답 형식이 올바르지 않아요.',
        validated.error.issues,
      );
    }

    return {
      guide: validated.data,
      sourceMealCount: records.length,
    };
  }

  private mapRecord(row: MealRecordRow): MealRecordDto {
    return {
      analysisResult: row.analysis_result,
      carbs: row.carbs,
      createdAt: row.created_at,
      fat: row.fat,
      fiber: row.fiber,
      id: row.id,
      mealDate: row.meal_date,
      mealType: row.meal_type,
      protein: row.protein,
      sodium: row.sodium,
      totalCalories: row.total_calories,
      userKey: row.user_key,
    };
  }

  private safeParseJson(content: string, label: string): unknown {
    let cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new BadGatewayException(
          `${label} 응답에서 JSON을 찾지 못했어요.`,
        );
      }

      cleaned = jsonMatch[0].replace(/,\s*([}\]])/g, '$1');

      try {
        return JSON.parse(cleaned);
      } catch {
        throw new BadGatewayException(`${label} 응답 JSON 파싱에 실패했어요.`);
      }
    }
  }

  private invalidAiResponse(
    message: string,
    issues: Array<{ code: string; message: string; path: PropertyKey[] }>,
  ) {
    return new BadGatewayException({
      issues: issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        path: issue.path.join('.'),
      })),
      message,
    });
  }
}
