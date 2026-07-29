import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { WeeklyWorkoutSource } from '../weekly-tracker/dto/create-weekly-workout.dto';
import {
  PtLessonRow,
  PtLessonsRepositoryPort,
  PtLessonSummary,
} from './pt-lessons.repository.port';
import { PtLessonInput } from './pt-lessons.schemas';

@Injectable()
export class PtLessonsRepository implements PtLessonsRepositoryPort {
  constructor(private readonly databaseService: DatabaseService) {}

  async createPtLesson(params: {
    id: string;
    userKey: string;
    date: string;
    sessionNumber: number;
    bodyParts: string[];
    equipment: string[];
    warmUp: string;
    exercises: PtLessonInput['exercises'];
    comment: string;
    summary: PtLessonSummary;
    weeklyCompletionId: string;
    weeklyCompletionNote: string;
  }) {
    return this.databaseService.transaction(async (queryRunner) => {
      await queryRunner.query(
        `
          INSERT INTO workout_completions (
            id,
            user_key,
            completed_on,
            source,
            note
          )
          VALUES ($1, $2, $3::date, $4, $5)
        `,
        [
          params.weeklyCompletionId,
          params.userKey,
          params.date,
          WeeklyWorkoutSource.PtLesson,
          params.weeklyCompletionNote,
        ],
      );

      const result = await queryRunner.query<PtLessonRow>(
        `
          INSERT INTO pt_lessons (
            id,
            user_key,
            lesson_date,
            session_number,
            body_parts,
            equipment,
            warm_up,
            exercises,
            comment,
            summary,
            weekly_completion_id
          )
          VALUES (
            $1,
            $2,
            $3::date,
            $4,
            $5::jsonb,
            $6::jsonb,
            $7,
            $8::jsonb,
            $9,
            $10::jsonb,
            $11
          )
          RETURNING ${this.selectColumns()}
        `,
        [
          params.id,
          params.userKey,
          params.date,
          params.sessionNumber,
          JSON.stringify(params.bodyParts),
          JSON.stringify(params.equipment),
          params.warmUp,
          JSON.stringify(params.exercises),
          params.comment,
          JSON.stringify(params.summary),
          params.weeklyCompletionId,
        ],
      );

      return result.rows[0];
    });
  }

  async updatePtLesson(params: {
    id: string;
    userKey: string;
    date: string;
    sessionNumber: number;
    bodyParts: string[];
    equipment: string[];
    warmUp: string;
    exercises: PtLessonInput['exercises'];
    comment: string;
    summary: PtLessonSummary;
    weeklyCompletionNote: string;
  }) {
    return this.databaseService.transaction(async (queryRunner) => {
      const existingResult = await queryRunner.query<PtLessonRow>(
        `
          SELECT ${this.selectColumns()}
          FROM pt_lessons
          WHERE id = $1
            AND user_key = $2
        `,
        [params.id, params.userKey],
      );
      const existing = existingResult.rows[0];

      if (!existing) {
        throw new NotFoundException('PT lesson not found.');
      }

      const result = await queryRunner.query<PtLessonRow>(
        `
          UPDATE pt_lessons
          SET
            lesson_date = $3::date,
            session_number = $4,
            body_parts = $5::jsonb,
            equipment = $6::jsonb,
            warm_up = $7,
            exercises = $8::jsonb,
            comment = $9,
            summary = $10::jsonb,
            updated_at = NOW()
          WHERE id = $1
            AND user_key = $2
          RETURNING ${this.selectColumns()}
        `,
        [
          params.id,
          params.userKey,
          params.date,
          params.sessionNumber,
          JSON.stringify(params.bodyParts),
          JSON.stringify(params.equipment),
          params.warmUp,
          JSON.stringify(params.exercises),
          params.comment,
          JSON.stringify(params.summary),
        ],
      );

      if (existing.weekly_completion_id) {
        await queryRunner.query(
          `
            UPDATE workout_completions
            SET
              completed_on = $3::date,
              note = $4
            WHERE id = $1
              AND user_key = $2
          `,
          [
            existing.weekly_completion_id,
            params.userKey,
            params.date,
            params.weeklyCompletionNote,
          ],
        );
      }

      return result.rows[0];
    });
  }

  async listPtLessons(params: {
    userKey: string;
    from?: string;
    to?: string;
  }) {
    const where: string[] = ['user_key = $1'];
    const values: unknown[] = [params.userKey];

    if (params.from) {
      values.push(params.from);
      where.push(`lesson_date >= $${values.length}::date`);
    }

    if (params.to) {
      values.push(params.to);
      where.push(`lesson_date <= $${values.length}::date`);
    }

    const result = await this.databaseService.query<PtLessonRow>(
      `
        SELECT ${this.selectColumns()}
        FROM pt_lessons
        WHERE ${where.join(' AND ')}
        ORDER BY lesson_date DESC, created_at DESC
      `,
      values,
    );

    return result.rows;
  }

  async findPtLesson(params: {
    id: string;
    userKey: string;
  }) {
    const result = await this.databaseService.query<PtLessonRow>(
      `
        SELECT ${this.selectColumns()}
        FROM pt_lessons
        WHERE id = $1
          AND user_key = $2
      `,
      [params.id, params.userKey],
    );

    return result.rows[0] ?? null;
  }

  async deletePtLesson(params: {
    id: string;
    userKey: string;
  }) {
    return this.databaseService.transaction(async (queryRunner) => {
      const result = await queryRunner.query<PtLessonRow>(
        `
          DELETE FROM pt_lessons
          WHERE id = $1
            AND user_key = $2
          RETURNING ${this.selectColumns()}
        `,
        [params.id, params.userKey],
      );
      const record = result.rows[0];

      if (!record) {
        throw new NotFoundException('PT lesson not found.');
      }

      if (record.weekly_completion_id) {
        await queryRunner.query(
          `
            DELETE FROM workout_completions
            WHERE id = $1
              AND user_key = $2
          `,
          [record.weekly_completion_id, params.userKey],
        );
      }

      return record;
    });
  }

  private selectColumns() {
    return `
      id,
      user_key,
      lesson_date::text,
      session_number,
      body_parts,
      equipment,
      warm_up,
      exercises,
      comment,
      summary,
      weekly_completion_id,
      created_at::text,
      updated_at::text
    `;
  }
}
