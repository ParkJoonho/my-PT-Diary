import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(MealAnalysisService.name);

  constructor(
    private readonly mealAnalysisAiClient: MealAnalysisAiClientPort,
    private readonly mealRecordsRepository: MealRecordsRepositoryPort,
  ) {}

  async analyzeMeal(
    userKey: string,
    dto: CreateMealAnalysisDto,
  ): Promise<MealAnalysisResponseDto> {
    const logContext = this.buildMealAnalysisLogContext(userKey, dto);
    let previousResponse: string | undefined;
    let retryFeedback: string | undefined;

    // 형식 오류는 같은 사진으로 한 번만 다시 요청해 일시적인 AI 출력 흔들림을 복구해요.
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const content = await this.mealAnalysisAiClient.analyzeMeal({
        ...dto,
        ...(previousResponse && retryFeedback
          ? { previousResponse, retryFeedback }
          : {}),
      });
      let parsed: unknown;

      try {
        parsed = this.safeParseJson(content, '식단 분석', logContext);
      } catch (error) {
        if (attempt === 1) {
          previousResponse = content;
          retryFeedback = this.getRetryFeedback(error);
          this.logger.warn(
            `Meal analysis AI response parsing failed. Retrying once: ${JSON.stringify(
              {
                ...logContext,
                error: retryFeedback,
              },
            )}`,
          );
          continue;
        }

        throw error;
      }

      const validated = mealAnalysisResultSchema.safeParse(parsed);

      if (validated.success) {
        return {
          analysis: validated.data,
          analyzedAt: new Date().toISOString(),
        };
      }

      const issues = validated.error.issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        path: issue.path.join('.'),
      }));

      this.logger.error(
        `Meal analysis AI response validation failed: ${JSON.stringify({
          ...logContext,
          attempt,
          issues,
          responsePreview: this.previewContent(content),
        })}`,
      );

      if (attempt === 1) {
        previousResponse = content;
        retryFeedback = this.formatValidationIssues(issues);
        continue;
      }

      throw this.invalidAiResponse(
        '식단 분석 응답 형식이 올바르지 않아요.',
        validated.error.issues,
      );
    }

    throw new BadGatewayException('식단 분석 응답을 처리하지 못했어요.');
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
    const parsed = this.safeParseJson(content, '식단 가이드', {
      date: dto.date,
      mealCount: records.length,
      userKey,
    });
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

  private safeParseJson(
    content: string,
    label: string,
    logContext: Record<string, unknown>,
  ): unknown {
    let cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        this.logger.error(
          `${label} AI response did not contain JSON: ${JSON.stringify({
            ...logContext,
            responsePreview: this.previewContent(content),
          })}`,
        );
        throw new BadGatewayException(
          `${label} 응답에서 JSON을 찾지 못했어요.`,
        );
      }

      cleaned = jsonMatch[0].replace(/,\s*([}\]])/g, '$1');

      try {
        return JSON.parse(cleaned);
      } catch {
        this.logger.error(
          `${label} AI response JSON parsing failed: ${JSON.stringify({
            ...logContext,
            responsePreview: this.previewContent(content),
          })}`,
        );
        throw new BadGatewayException(`${label} 응답 JSON 파싱에 실패했어요.`);
      }
    }
  }

  private buildMealAnalysisLogContext(
    userKey: string,
    dto: CreateMealAnalysisDto,
  ) {
    return {
      afterImageProvided: Boolean(dto.afterImageBase64),
      afterImageSize: dto.afterImageBase64?.length ?? 0,
      eatingDurationMinutes: dto.eatingDurationMinutes ?? null,
      imageSize: dto.imageBase64.length,
      mealType: dto.mealType,
      userKey,
    };
  }

  private previewContent(content: string) {
    return content.replace(/\s+/g, ' ').trim().slice(0, 500);
  }

  private formatValidationIssues(
    issues: Array<{ code: string; message: string; path: string }>,
  ) {
    return issues
      .map(
        (issue) =>
          `${issue.path || '응답 전체'}: ${issue.message} (${issue.code})`,
      )
      .join('\n');
  }

  private getRetryFeedback(error: unknown) {
    if (error instanceof BadGatewayException) {
      const response = error.getResponse();

      if (typeof response === 'string') {
        return response;
      }

      if (
        response &&
        typeof response === 'object' &&
        'message' in response &&
        typeof response.message === 'string'
      ) {
        return response.message;
      }
    }

    return error instanceof Error
      ? error.message
      : '응답을 JSON 객체로 파싱할 수 없어요.';
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
