import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  BodyAnalysisRepositoryPort,
  BodyAnalysisWorkoutContextRow,
} from './body-analysis.repository.port';

@Injectable()
export class BodyAnalysisRepository implements BodyAnalysisRepositoryPort {
  constructor(private readonly databaseService: DatabaseService) {}

  async listRecentWorkoutContext(params: { limit: number; userKey: string }) {
    const result = await this.databaseService.query<BodyAnalysisWorkoutContextRow>(
      `
        SELECT
          source,
          title,
          routine_label,
          completed_at,
          completed_on,
          duration_seconds,
          summary,
          body_composition
        FROM workout_records
        WHERE user_key = $1
        ORDER BY completed_at DESC, created_at DESC
        LIMIT $2
      `,
      [params.userKey, params.limit],
    );

    return result.rows;
  }
}
