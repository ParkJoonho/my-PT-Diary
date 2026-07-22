import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { WeeklyWorkoutSource } from './dto/create-weekly-workout.dto';
import {
  WorkoutCompletionRow,
  WeeklyTrackerRepositoryPort,
} from './weekly-tracker.repository.port';

@Injectable()
export class WeeklyTrackerRepository implements WeeklyTrackerRepositoryPort {
  constructor(private readonly databaseService: DatabaseService) {}

  async createWorkoutCompletion(params: {
    id: string;
    userKey: string;
    completedOn: string;
    source: WeeklyWorkoutSource;
    note: string | null;
  }) {
    const result = await this.databaseService.query<WorkoutCompletionRow>(
      `
        INSERT INTO workout_completions (
          id,
          user_key,
          completed_on,
          source,
          note
        )
        VALUES ($1, $2, $3::date, $4, $5)
        RETURNING id, completed_on::text, source, note, created_at::text
      `,
      [
        params.id,
        params.userKey,
        params.completedOn,
        params.source,
        params.note,
      ],
    );

    return result.rows[0];
  }

  async listWorkoutCompletionsForWeek(params: {
    userKey: string;
    weekStartDate: string;
    weekEndDate: string;
  }) {
    const result = await this.databaseService.query<WorkoutCompletionRow>(
      `
        SELECT id, completed_on::text, source, note, created_at::text
        FROM workout_completions
        WHERE user_key = $1
          AND completed_on BETWEEN $2::date AND $3::date
        ORDER BY completed_on DESC, created_at DESC
      `,
      [params.userKey, params.weekStartDate, params.weekEndDate],
    );

    return result.rows;
  }

  async getCompletionCountsForWeek(params: {
    userKey: string;
    weekStartDate: string;
    weekEndDate: string;
  }) {
    type CompletionCountRow = {
      completed_on: string;
      completion_count: string;
    };

    const result = await this.databaseService.query<CompletionCountRow>(
      `
        SELECT completed_on::text, COUNT(*)::text AS completion_count
        FROM workout_completions
        WHERE user_key = $1
          AND completed_on BETWEEN $2::date AND $3::date
        GROUP BY completed_on
        ORDER BY completed_on ASC
      `,
      [params.userKey, params.weekStartDate, params.weekEndDate],
    );

    return result.rows.map((row: CompletionCountRow) => ({
      completedOn: row.completed_on,
      completionCount: Number(row.completion_count),
    }));
  }

  async listDistinctCompletedDatesUntil(params: {
    userKey: string;
    referenceDate: string;
  }) {
    const result = await this.databaseService.query<{ completed_on: string }>(
      `
        SELECT DISTINCT completed_on::text
        FROM workout_completions
        WHERE user_key = $1
          AND completed_on <= $2::date
        ORDER BY completed_on DESC
      `,
      [params.userKey, params.referenceDate],
    );

    return result.rows.map((row: { completed_on: string }) => row.completed_on);
  }

  async deleteWorkoutCompletion(params: { userKey: string; id: string }) {
    const result = await this.databaseService.query<{ id: string }>(
      `
        DELETE FROM workout_completions
        WHERE id = $1
          AND user_key = $2
        RETURNING id
      `,
      [params.id, params.userKey],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Workout completion not found.');
    }
  }
}
