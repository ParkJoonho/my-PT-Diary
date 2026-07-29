import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../database/database.service';
import {
  TrainerConnectRequestRow,
  TrainerProfileData,
  TrainerRow,
  TrainersRepositoryPort,
} from './trainers.repository.port';

@Injectable()
export class TrainersRepository implements TrainersRepositoryPort {
  constructor(private readonly databaseService: DatabaseService) {}

  async listApprovedTrainers(userKey: string) {
    const result = await this.databaseService.query<TrainerRow>(
      `
        SELECT
          t.id,
          t.name,
          t.gym_name,
          t.rating::double precision AS rating,
          t.price_per_session,
          t.experience_years,
          t.specialties,
          t.focus_body_parts,
          t.match_tags,
          t.career,
          t.certifications,
          t.bio,
          t.philosophy,
          t.avatar_color,
          t.base_member_count,
          t.region,
          t.online_available,
          (liked.user_key IS NOT NULL) AS liked,
          t.beginner_friendly,
          t.posture_friendly,
          t.rehab_friendly,
          t.display_order,
          request.status AS connect_request_status,
          COALESCE(accepted.accepted_member_count, 0) AS accepted_member_count
        FROM trainers t
        LEFT JOIN trainer_connect_requests request
          ON request.trainer_id = t.id
         AND request.user_key = $1
        LEFT JOIN trainer_likes liked
          ON liked.trainer_id = t.id
         AND liked.user_key = $1
        LEFT JOIN (
          SELECT
            trainer_id,
            COUNT(*)::int AS accepted_member_count
          FROM trainer_connect_requests
          WHERE status = 'accepted'
          GROUP BY trainer_id
        ) accepted
          ON accepted.trainer_id = t.id
        WHERE t.approved = TRUE
        ORDER BY t.display_order ASC, t.created_at ASC
      `,
      [userKey],
    );

    return result.rows;
  }

  async findTrainerById(params: { trainerId: string; userKey: string }) {
    const result = await this.databaseService.query<TrainerRow>(
      `
        SELECT
          t.id,
          t.name,
          t.gym_name,
          t.rating::double precision AS rating,
          t.price_per_session,
          t.experience_years,
          t.specialties,
          t.focus_body_parts,
          t.match_tags,
          t.career,
          t.certifications,
          t.bio,
          t.philosophy,
          t.avatar_color,
          t.base_member_count,
          t.region,
          t.online_available,
          (liked.user_key IS NOT NULL) AS liked,
          t.beginner_friendly,
          t.posture_friendly,
          t.rehab_friendly,
          t.display_order,
          request.status AS connect_request_status,
          COALESCE(accepted.accepted_member_count, 0) AS accepted_member_count
        FROM trainers t
        LEFT JOIN trainer_connect_requests request
          ON request.trainer_id = t.id
         AND request.user_key = $2
        LEFT JOIN trainer_likes liked
          ON liked.trainer_id = t.id
         AND liked.user_key = $2
        LEFT JOIN (
          SELECT
            trainer_id,
            COUNT(*)::int AS accepted_member_count
          FROM trainer_connect_requests
          WHERE status = 'accepted'
          GROUP BY trainer_id
        ) accepted
          ON accepted.trainer_id = t.id
        WHERE t.id = $1
          AND t.approved = TRUE
      `,
      [params.trainerId, params.userKey],
    );

    return result.rows[0] ?? null;
  }

  async createOrReturnConnectRequest(params: {
    trainerId: string;
    userKey: string;
    message: string | null;
  }) {
    const existingResult =
      await this.databaseService.query<TrainerConnectRequestRow>(
        `
          SELECT
            request.id,
            request.user_key,
            request.trainer_id,
            trainer.name AS trainer_name,
            request.status,
            request.message,
            request.created_at::text,
            request.updated_at::text
          FROM trainer_connect_requests request
          JOIN trainers trainer
            ON trainer.id = request.trainer_id
          WHERE request.trainer_id = $1
            AND request.user_key = $2
        `,
        [params.trainerId, params.userKey],
      );
    const existing = existingResult.rows[0];

    if (existing) {
      return existing;
    }

    const trainer = await this.findTrainerById({
      trainerId: params.trainerId,
      userKey: params.userKey,
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found.');
    }

    const result = await this.databaseService.query<TrainerConnectRequestRow>(
      `
        INSERT INTO trainer_connect_requests (
          id,
          user_key,
          trainer_id,
          message
        )
        VALUES (
          $1,
          $2,
          $3,
          $4
        )
        RETURNING
          id,
          user_key,
          trainer_id,
          $5::text AS trainer_name,
          status,
          message,
          created_at::text,
          updated_at::text
      `,
      [
        randomUUID(),
        params.userKey,
        params.trainerId,
        params.message,
        trainer.name,
      ],
    );

    return result.rows[0];
  }

  async setTrainerLike(params: {
    liked: boolean;
    trainerId: string;
    userKey: string;
  }) {
    const trainer = await this.findTrainerById({
      trainerId: params.trainerId,
      userKey: params.userKey,
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found.');
    }

    if (params.liked) {
      await this.databaseService.query(
        `
          INSERT INTO trainer_likes (
            user_key,
            trainer_id
          )
          VALUES ($1, $2)
          ON CONFLICT (user_key, trainer_id) DO NOTHING
        `,
        [params.userKey, params.trainerId],
      );
    } else {
      await this.databaseService.query(
        `
          DELETE FROM trainer_likes
          WHERE user_key = $1
            AND trainer_id = $2
        `,
        [params.userKey, params.trainerId],
      );
    }

    const refreshedTrainer = await this.findTrainerById({
      trainerId: params.trainerId,
      userKey: params.userKey,
    });

    if (!refreshedTrainer) {
      throw new NotFoundException('Trainer not found.');
    }

    return refreshedTrainer;
  }

  async listConnectRequests(userKey: string) {
    const result = await this.databaseService.query<TrainerConnectRequestRow>(
      `
        SELECT
          request.id,
          request.user_key,
          request.trainer_id,
          trainer.name AS trainer_name,
          request.status,
          request.message,
          request.created_at::text,
          request.updated_at::text
        FROM trainer_connect_requests request
        JOIN trainers trainer
          ON trainer.id = request.trainer_id
        WHERE request.user_key = $1
        ORDER BY request.created_at DESC
      `,
      [userKey],
    );

    return result.rows;
  }

  async getTrainerProfileData(userKey: string): Promise<TrainerProfileData> {
    const [ptLessonsResult, conditionRecordsResult, workoutCountResult] =
      await Promise.all([
        this.databaseService.query<{
          body_parts: string[];
          summary: { totalVolumeKg: number };
        }>(
          `
            SELECT body_parts, summary
            FROM pt_lessons
            WHERE user_key = $1
            ORDER BY lesson_date DESC, created_at DESC
            LIMIT 24
          `,
          [userKey],
        ),
        this.databaseService.query<{
          muscle_soreness: Array<{ label: string; score: number }>;
          summary: {
            averageSorenessScore: number | null;
            severeSorenessCount: number;
          };
        }>(
          `
            SELECT muscle_soreness, summary
            FROM condition_records
            WHERE user_key = $1
            ORDER BY checked_on DESC, created_at DESC
            LIMIT 3
          `,
          [userKey],
        ),
        this.databaseService.query<{ count: string }>(
          `
            SELECT COUNT(*)::text AS count
            FROM workout_records
            WHERE user_key = $1
              AND completed_on >= CURRENT_DATE - INTERVAL '56 day'
          `,
          [userKey],
        ),
      ]);

    return {
      conditionRecords: conditionRecordsResult.rows,
      ptLessons: ptLessonsResult.rows,
      workoutActivityCount: Number(workoutCountResult.rows[0]?.count ?? '0'),
    };
  }
}
