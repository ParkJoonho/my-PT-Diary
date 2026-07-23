import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ConditionRecordRow } from '../condition-records/condition-records.repository.port';
import { WorkoutRecordRow } from '../workout-records/workout-records.repository.port';
import { WorkoutReportsRepositoryPort } from './workout-reports.repository.port';

@Injectable()
export class WorkoutReportsRepository implements WorkoutReportsRepositoryPort {
  constructor(private readonly databaseService: DatabaseService) {}

  async listWorkoutRecordsForReport(params: { userKey: string }) {
    const result = await this.databaseService.query<WorkoutRecordRow>(
      `
        SELECT
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
        FROM workout_records
        WHERE user_key = $1
        ORDER BY completed_on DESC, completed_at DESC, created_at DESC
      `,
      [params.userKey],
    );

    return result.rows;
  }

  async listConditionRecordsForReport(params: { userKey: string }) {
    const result = await this.databaseService.query<ConditionRecordRow>(
      `
        SELECT
          id,
          user_key,
          checked_on::text,
          time_zone,
          condition_scores,
          muscle_soreness,
          summary,
          memo,
          created_at::text,
          updated_at::text
        FROM condition_records
        WHERE user_key = $1
        ORDER BY checked_on DESC, created_at DESC
      `,
      [params.userKey],
    );

    return result.rows;
  }
}
