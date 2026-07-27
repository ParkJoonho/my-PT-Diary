import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ExerciseGuideCatalogType } from './dto/exercise-guide-response.dto';
import {
  ExerciseGuideCatalogRecord,
  ExerciseGuideCatalogWriteModel,
  ExerciseGuideLikeStats,
  ExerciseGuidesRepositoryPort,
} from './exercise-guides.repository.port';

@Injectable()
export class ExerciseGuidesRepository implements ExerciseGuidesRepositoryPort {
  constructor(private readonly databaseService: DatabaseService) {}

  async listGuides(params?: { catalogType?: ExerciseGuideCatalogType }) {
    type ExerciseGuideCatalogRow = {
      id: string;
      catalog_type: ExerciseGuideCatalogType;
      title: string;
      body_part: string;
      equipment: string;
      equipment_types: string[];
      duration: string;
      initial_like_count: number;
      video_url: string;
      description: string;
      target_muscles: string | null;
      display_order: number;
      created_at: Date;
      updated_at: Date;
    };

    const whereClause = params?.catalogType
      ? 'WHERE catalog_type = $1'
      : '';
    const queryParams = params?.catalogType ? [params.catalogType] : [];
    const result = await this.databaseService.query<ExerciseGuideCatalogRow>(
      `
        SELECT
          id,
          catalog_type,
          title,
          body_part,
          equipment,
          equipment_types,
          duration,
          initial_like_count,
          video_url,
          description,
          target_muscles,
          display_order,
          created_at,
          updated_at
        FROM exercise_guides
        ${whereClause}
        ORDER BY display_order ASC, created_at ASC
      `,
      queryParams,
    );

    return result.rows.map((row) => this.mapGuideRow(row));
  }

  async getGuideById(guideId: string) {
    type ExerciseGuideCatalogRow = {
      id: string;
      catalog_type: ExerciseGuideCatalogType;
      title: string;
      body_part: string;
      equipment: string;
      equipment_types: string[];
      duration: string;
      initial_like_count: number;
      video_url: string;
      description: string;
      target_muscles: string | null;
      display_order: number;
      created_at: Date;
      updated_at: Date;
    };

    const result = await this.databaseService.query<ExerciseGuideCatalogRow>(
      `
        SELECT
          id,
          catalog_type,
          title,
          body_part,
          equipment,
          equipment_types,
          duration,
          initial_like_count,
          video_url,
          description,
          target_muscles,
          display_order,
          created_at,
          updated_at
        FROM exercise_guides
        WHERE id = $1
      `,
      [guideId],
    );

    return result.rows[0] ? this.mapGuideRow(result.rows[0]) : null;
  }

  async createGuide(params: {
    guideId: string;
    guide: ExerciseGuideCatalogWriteModel;
  }) {
    type ExerciseGuideCatalogRow = {
      id: string;
      catalog_type: ExerciseGuideCatalogType;
      title: string;
      body_part: string;
      equipment: string;
      equipment_types: string[];
      duration: string;
      initial_like_count: number;
      video_url: string;
      description: string;
      target_muscles: string | null;
      display_order: number;
      created_at: Date;
      updated_at: Date;
    };

    const result = await this.databaseService.query<ExerciseGuideCatalogRow>(
      `
        INSERT INTO exercise_guides (
          id,
          catalog_type,
          title,
          body_part,
          equipment,
          equipment_types,
          duration,
          initial_like_count,
          video_url,
          description,
          target_muscles,
          display_order
        )
        VALUES (
          $1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12
        )
        RETURNING
          id,
          catalog_type,
          title,
          body_part,
          equipment,
          equipment_types,
          duration,
          initial_like_count,
          video_url,
          description,
          target_muscles,
          display_order,
          created_at,
          updated_at
      `,
      [
        params.guideId,
        params.guide.catalogType,
        params.guide.title,
        params.guide.bodyPart,
        params.guide.equipment,
        JSON.stringify(params.guide.equipmentTypes),
        params.guide.duration,
        params.guide.initialLikeCount,
        params.guide.videoUrl,
        params.guide.description,
        params.guide.targetMuscles,
        params.guide.displayOrder,
      ],
    );

    return this.mapGuideRow(result.rows[0]);
  }

  async updateGuide(params: {
    guideId: string;
    guide: ExerciseGuideCatalogWriteModel;
  }) {
    type ExerciseGuideCatalogRow = {
      id: string;
      catalog_type: ExerciseGuideCatalogType;
      title: string;
      body_part: string;
      equipment: string;
      equipment_types: string[];
      duration: string;
      initial_like_count: number;
      video_url: string;
      description: string;
      target_muscles: string | null;
      display_order: number;
      created_at: Date;
      updated_at: Date;
    };

    const result = await this.databaseService.query<ExerciseGuideCatalogRow>(
      `
        UPDATE exercise_guides
        SET
          catalog_type = $2,
          title = $3,
          body_part = $4,
          equipment = $5,
          equipment_types = $6::jsonb,
          duration = $7,
          initial_like_count = $8,
          video_url = $9,
          description = $10,
          target_muscles = $11,
          display_order = $12,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          catalog_type,
          title,
          body_part,
          equipment,
          equipment_types,
          duration,
          initial_like_count,
          video_url,
          description,
          target_muscles,
          display_order,
          created_at,
          updated_at
      `,
      [
        params.guideId,
        params.guide.catalogType,
        params.guide.title,
        params.guide.bodyPart,
        params.guide.equipment,
        JSON.stringify(params.guide.equipmentTypes),
        params.guide.duration,
        params.guide.initialLikeCount,
        params.guide.videoUrl,
        params.guide.description,
        params.guide.targetMuscles,
        params.guide.displayOrder,
      ],
    );

    return result.rows[0] ? this.mapGuideRow(result.rows[0]) : null;
  }

  async deleteGuide(guideId: string) {
    const result = await this.databaseService.query(
      `
        DELETE FROM exercise_guides
        WHERE id = $1
      `,
      [guideId],
    );

    return (result.rowCount ?? 0) > 0;
  }

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

  private mapGuideRow(row: {
    id: string;
    catalog_type: ExerciseGuideCatalogType;
    title: string;
    body_part: string;
    equipment: string;
    equipment_types: string[];
    duration: string;
    initial_like_count: number;
    video_url: string;
    description: string;
    target_muscles: string | null;
    display_order: number;
    created_at: Date;
    updated_at: Date;
  }): ExerciseGuideCatalogRecord {
    return {
      bodyPart: row.body_part,
      catalogType: row.catalog_type,
      createdAt: row.created_at.toISOString(),
      description: row.description,
      displayOrder: row.display_order,
      duration: row.duration,
      equipment: row.equipment,
      equipmentTypes: Array.isArray(row.equipment_types)
        ? row.equipment_types
        : [],
      id: row.id,
      initialLikeCount: row.initial_like_count,
      targetMuscles: row.target_muscles,
      title: row.title,
      updatedAt: row.updated_at.toISOString(),
      videoUrl: row.video_url,
    };
  }
}
