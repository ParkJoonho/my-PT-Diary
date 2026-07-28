import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  DailyMealSummaryRow,
  MealRecordRow,
  MealRecordsRepositoryPort,
} from './meal-records.repository.port';

@Injectable()
export class MealRecordsRepository implements MealRecordsRepositoryPort {
  constructor(private readonly databaseService: DatabaseService) {}

  async createMealRecord(
    params: Parameters<MealRecordsRepositoryPort['createMealRecord']>[0],
  ) {
    const analysis = params.analysisResult;
    const result = await this.databaseService.query<MealRecordRow>(
      `
        INSERT INTO meal_records (
          id,
          user_key,
          meal_type,
          analysis_result,
          total_calories,
          protein,
          carbs,
          fat,
          fiber,
          sodium,
          meal_date
        )
        VALUES (
          $1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11::date
        )
        RETURNING
          id,
          user_key,
          meal_type,
          analysis_result,
          total_calories,
          protein,
          carbs,
          fat,
          fiber,
          sodium,
          meal_date::text,
          created_at::text
      `,
      [
        params.id,
        params.userKey,
        params.mealType,
        JSON.stringify(analysis),
        Math.round(analysis.totalCalories),
        Math.round(analysis.totalProtein),
        Math.round(analysis.totalCarbs),
        Math.round(analysis.totalFat),
        Math.round(analysis.totalFiber),
        Math.round(analysis.totalSodium),
        params.mealDate,
      ],
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error('Meal record insert did not return a row.');
    }

    return row;
  }

  async listMealRecords(
    params: Parameters<MealRecordsRepositoryPort['listMealRecords']>[0],
  ) {
    const values: unknown[] = [params.userKey];
    const dateFilter = params.date
      ? `AND meal_date = $${values.push(params.date)}::date`
      : '';
    const result = await this.databaseService.query<MealRecordRow>(
      `
        SELECT
          id,
          user_key,
          meal_type,
          analysis_result,
          total_calories,
          protein,
          carbs,
          fat,
          fiber,
          sodium,
          meal_date::text,
          created_at::text
        FROM meal_records
        WHERE user_key = $1
          ${dateFilter}
        ORDER BY meal_date DESC, created_at DESC
      `,
      values,
    );

    return result.rows;
  }

  async getDailySummary(
    params: Parameters<MealRecordsRepositoryPort['getDailySummary']>[0],
  ) {
    const result = await this.databaseService.query<DailyMealSummaryRow>(
      `
        SELECT
          COALESCE(SUM(total_calories), 0)::int AS total_calories,
          COALESCE(SUM(protein), 0)::int AS total_protein,
          COALESCE(SUM(carbs), 0)::int AS total_carbs,
          COALESCE(SUM(fat), 0)::int AS total_fat,
          COALESCE(SUM(fiber), 0)::int AS total_fiber,
          COALESCE(SUM(sodium), 0)::int AS total_sodium,
          COUNT(*)::int AS meal_count
        FROM meal_records
        WHERE user_key = $1
          AND meal_date = $2::date
      `,
      [params.userKey, params.date],
    );

    return (
      result.rows[0] ?? {
        meal_count: 0,
        total_calories: 0,
        total_carbs: 0,
        total_fat: 0,
        total_fiber: 0,
        total_protein: 0,
        total_sodium: 0,
      }
    );
  }
}
