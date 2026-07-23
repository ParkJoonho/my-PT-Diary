import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DatabaseQueryRunner,
  DatabaseService,
} from '../../database/database.service';
import { WeeklyWorkoutSource } from '../weekly-tracker/dto/create-weekly-workout.dto';
import { WorkoutRecordSource } from './dto/workout-record-response.dto';
import {
  WorkoutRecordRow,
  WorkoutRecordSummary,
  WorkoutRecordsRepositoryPort,
} from './workout-records.repository.port';
import {
  ManualWorkoutRecordInput,
  RoutineWorkoutStepInput,
} from './workout-records.schemas';

type ManualWorkoutRecordDetail = Omit<
  ManualWorkoutRecordInput,
  | 'bodyComposition'
  | 'durationSeconds'
  | 'performedAt'
  | 'performedOn'
  | 'timeZone'
  | 'title'
>;

@Injectable()
export class WorkoutRecordsRepository implements WorkoutRecordsRepositoryPort {
  constructor(private readonly databaseService: DatabaseService) {}

  async createRoutineWorkoutCompletion(params: {
    recordId: string;
    weeklyCompletionId: string;
    userKey: string;
    routineId: string;
    routineLabel: string;
    routineSource: string;
    completedAt: string;
    completedOn: string;
    timeZone: string;
    durationSeconds: number;
    steps: RoutineWorkoutStepInput[];
    summary: {
      completedStepCount: number;
      totalStepCount: number;
      strengthStepCount: number;
      cardioStepCount: number;
      stretchStepCount: number;
    };
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
          params.completedOn,
          WeeklyWorkoutSource.Routine,
          params.weeklyCompletionNote,
        ],
      );

      const result = await queryRunner.query<WorkoutRecordRow>(
        `
          INSERT INTO workout_records (
            id,
            user_key,
            source,
            routine_id,
            routine_label,
            routine_source,
            completed_at,
            completed_on,
            time_zone,
            duration_seconds,
            steps,
            summary,
            weekly_completion_id
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7::timestamptz,
            $8::date,
            $9,
            $10,
            $11::jsonb,
            $12::jsonb,
            $13
          )
          RETURNING
            id,
            user_key,
            source,
            title,
            routine_id,
            routine_label,
            routine_source,
            completed_at::text,
            completed_on::text,
            COALESCE(performed_on, completed_on)::text AS performed_on,
            time_zone,
            duration_seconds,
            steps,
            summary,
            manual_detail,
            body_composition,
            weekly_completion_id,
            created_at::text,
            updated_at::text
        `,
        [
          params.recordId,
          params.userKey,
          WorkoutRecordSource.Routine,
          params.routineId,
          params.routineLabel,
          params.routineSource,
          params.completedAt,
          params.completedOn,
          params.timeZone,
          params.durationSeconds,
          JSON.stringify(params.steps),
          JSON.stringify(params.summary),
          params.weeklyCompletionId,
        ],
      );

      return result.rows[0];
    });
  }

  async createManualWorkoutRecord(params: {
    recordId: string;
    weeklyCompletionId: string;
    userKey: string;
    title: string;
    performedAt: string;
    performedOn: string;
    timeZone: string;
    durationSeconds: number;
    manualDetail: ManualWorkoutRecordDetail;
    bodyComposition: ManualWorkoutRecordInput['bodyComposition'] | null;
    summary: WorkoutRecordSummary;
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
          params.performedOn,
          WeeklyWorkoutSource.PersonalExercise,
          params.weeklyCompletionNote,
        ],
      );

      const result = await queryRunner.query<WorkoutRecordRow>(
        `
          INSERT INTO workout_records (
            id,
            user_key,
            source,
            title,
            completed_at,
            completed_on,
            performed_on,
            time_zone,
            duration_seconds,
            steps,
            summary,
            manual_detail,
            body_composition,
            weekly_completion_id
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5::timestamptz,
            $6::date,
            $6::date,
            $7,
            $8,
            $9::jsonb,
            $10::jsonb,
            $11::jsonb,
            $12::jsonb,
            $13
          )
          RETURNING ${this.selectColumns()}
        `,
        [
          params.recordId,
          params.userKey,
          WorkoutRecordSource.Manual,
          params.title,
          params.performedAt,
          params.performedOn,
          params.timeZone,
          params.durationSeconds,
          JSON.stringify([]),
          JSON.stringify(params.summary),
          JSON.stringify(params.manualDetail),
          JSON.stringify(params.bodyComposition),
          params.weeklyCompletionId,
        ],
      );

      return result.rows[0];
    });
  }

  async updateManualWorkoutRecord(params: {
    recordId: string;
    userKey: string;
    title: string;
    performedAt: string;
    performedOn: string;
    timeZone: string;
    durationSeconds: number;
    manualDetail: ManualWorkoutRecordDetail;
    bodyComposition: ManualWorkoutRecordInput['bodyComposition'] | null;
    summary: WorkoutRecordSummary;
    weeklyCompletionNote: string;
  }) {
    return this.databaseService.transaction(async (queryRunner) => {
      const result = await queryRunner.query<WorkoutRecordRow>(
        `
          UPDATE workout_records
          SET
            title = $3,
            completed_at = $4::timestamptz,
            completed_on = $5::date,
            performed_on = $5::date,
            time_zone = $6,
            duration_seconds = $7,
            summary = $8::jsonb,
            manual_detail = $9::jsonb,
            body_composition = $10::jsonb,
            updated_at = NOW()
          WHERE id = $1
            AND user_key = $2
            AND source = $11
          RETURNING ${this.selectColumns()}
        `,
        [
          params.recordId,
          params.userKey,
          params.title,
          params.performedAt,
          params.performedOn,
          params.timeZone,
          params.durationSeconds,
          JSON.stringify(params.summary),
          JSON.stringify(params.manualDetail),
          JSON.stringify(params.bodyComposition),
          WorkoutRecordSource.Manual,
        ],
      );

      const updatedRecord = result.rows[0];

      if (!updatedRecord) {
        throw new NotFoundException('Workout record not found.');
      }

      if (updatedRecord.weekly_completion_id) {
        await queryRunner.query(
          `
            UPDATE workout_completions
            SET
              completed_on = $3::date,
              source = $4,
              note = $5
            WHERE id = $1
              AND user_key = $2
          `,
          [
            updatedRecord.weekly_completion_id,
            params.userKey,
            params.performedOn,
            WeeklyWorkoutSource.PersonalExercise,
            params.weeklyCompletionNote,
          ],
        );
      }

      return updatedRecord;
    });
  }

  async listWorkoutRecords(params: {
    userKey: string;
    from?: string;
    to?: string;
    source?: WorkoutRecordSource;
  }) {
    const where: string[] = ['user_key = $1'];
    const values: unknown[] = [params.userKey];

    if (params.from) {
      values.push(params.from);
      where.push(`completed_on >= $${values.length}::date`);
    }

    if (params.to) {
      values.push(params.to);
      where.push(`completed_on <= $${values.length}::date`);
    }

    if (params.source) {
      values.push(params.source);
      where.push(`source = $${values.length}`);
    }

    const result = await this.databaseService.query<WorkoutRecordRow>(
      `
        SELECT ${this.selectColumns()}
        FROM workout_records
        WHERE ${where.join(' AND ')}
        ORDER BY completed_on DESC, completed_at DESC, created_at DESC
      `,
      values,
    );

    return result.rows;
  }

  async findWorkoutRecord(params: { userKey: string; id: string }) {
    const result = await this.databaseService.query<WorkoutRecordRow>(
      `
        SELECT ${this.selectColumns()}
        FROM workout_records
        WHERE id = $1
          AND user_key = $2
      `,
      [params.id, params.userKey],
    );

    return result.rows[0] ?? null;
  }

  async deleteWorkoutRecord(params: { userKey: string; id: string }) {
    return this.databaseService.transaction(async (queryRunner) => {
      const result = await queryRunner.query<WorkoutRecordRow>(
        `
          DELETE FROM workout_records
          WHERE id = $1
            AND user_key = $2
          RETURNING ${this.selectColumns()}
        `,
        [params.id, params.userKey],
      );

      const deletedRecord = result.rows[0];

      if (!deletedRecord) {
        throw new NotFoundException('Workout record not found.');
      }

      if (deletedRecord.weekly_completion_id) {
        await this.deleteWeeklyCompletion(
          queryRunner,
          params.userKey,
          deletedRecord.weekly_completion_id,
        );
      }

      return deletedRecord;
    });
  }

  private async deleteWeeklyCompletion(
    queryRunner: DatabaseQueryRunner,
    userKey: string,
    weeklyCompletionId: string,
  ) {
    await queryRunner.query(
      `
        DELETE FROM workout_completions
        WHERE id = $1
          AND user_key = $2
      `,
      [weeklyCompletionId, userKey],
    );
  }

  private selectColumns() {
    return `
      id,
      user_key,
      source,
      title,
      routine_id,
      routine_label,
      routine_source,
      completed_at::text,
      completed_on::text,
      COALESCE(performed_on, completed_on)::text AS performed_on,
      time_zone,
      duration_seconds,
      steps,
      summary,
      manual_detail,
      body_composition,
      weekly_completion_id,
      created_at::text,
      updated_at::text
    `;
  }
}
