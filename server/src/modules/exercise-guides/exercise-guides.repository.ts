import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  ExerciseGuideLikeStats,
  ExerciseGuidesRepositoryPort,
} from './exercise-guides.repository.port';

@Injectable()
export class ExerciseGuidesRepository implements ExerciseGuidesRepositoryPort {
  constructor(private readonly databaseService: DatabaseService) {}

  async listLikeStatsForGuideIds(params: {
    guideIds: string[];
    userKey: string;
  }) {
    if (params.guideIds.length === 0) {
      return [];
    }

    type ExerciseGuideLikeStatsRow = {
      guide_id: string;
      like_count: string;
      liked_by_me: boolean;
    };

    const result = await this.databaseService.query<ExerciseGuideLikeStatsRow>(
      `
        SELECT
          guide_id,
          COUNT(*)::text AS like_count,
          BOOL_OR(user_key = $1)::boolean AS liked_by_me
        FROM exercise_guide_likes
        WHERE guide_id = ANY($2::text[])
        GROUP BY guide_id
      `,
      [params.userKey, params.guideIds],
    );

    return result.rows.map(
      (row: ExerciseGuideLikeStatsRow): ExerciseGuideLikeStats => ({
        guideId: row.guide_id,
        likeCount: Number(row.like_count),
        likedByMe: row.liked_by_me,
      }),
    );
  }

  async addLike(params: { guideId: string; userKey: string }) {
    await this.databaseService.query(
      `
        INSERT INTO exercise_guide_likes (
          guide_id,
          user_key
        )
        VALUES ($1, $2)
        ON CONFLICT (guide_id, user_key) DO NOTHING
      `,
      [params.guideId, params.userKey],
    );
  }

  async removeLike(params: { guideId: string; userKey: string }) {
    await this.databaseService.query(
      `
        DELETE FROM exercise_guide_likes
        WHERE guide_id = $1
          AND user_key = $2
      `,
      [params.guideId, params.userKey],
    );
  }
}
