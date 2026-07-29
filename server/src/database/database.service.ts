import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { DEFAULT_DATABASE_URL } from './database.constants';
import { EXERCISE_GUIDE_CATALOG } from '../modules/exercise-guides/exercise-guides.catalog';
import { TRAINER_CATALOG } from '../modules/trainers/trainers.catalog';

export type DatabaseQueryRunner = {
  query<T extends QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>>;
};

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;
  private initializationPromise: Promise<void> | null = null;

  constructor(private readonly configService: ConfigService) {
    const connectionString =
      this.configService.get<string>('DATABASE_URL') ?? DEFAULT_DATABASE_URL;

    this.pool = new Pool({
      connectionString,
    });
  }

  onModuleInit() {
    void this.ensureInitialized().catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';

      this.logger.warn(
        `Database is not ready yet. Swagger can still boot, but DB-backed endpoints will fail until PostgreSQL is available. ${message}`,
      );
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async ping() {
    await this.ensureInitialized();
    await this.pool.query('SELECT 1');
  }

  async query<T extends QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    await this.ensureInitialized();
    return this.pool.query<T>(text, params);
  }

  async transaction<T>(
    callback: (queryRunner: DatabaseQueryRunner) => Promise<T>,
  ) {
    await this.ensureInitialized();

    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback({
        query: <TRow extends QueryResultRow>(
          text: string,
          params: unknown[] = [],
        ) => client.query<TRow>(text, params),
      });
      await client.query('COMMIT');

      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async ensureInitialized() {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeSchema().catch(
        (error: unknown) => {
          this.initializationPromise = null;
          throw error;
        },
      );
    }

    await this.initializationPromise;
  }

  private async initializeSchema() {
    await this.pool.query('SELECT pg_advisory_lock(2026072301)');

    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS exercise_guides (
          id TEXT PRIMARY KEY,
          catalog_type TEXT NOT NULL,
          title TEXT NOT NULL,
          body_part TEXT NOT NULL,
          equipment TEXT NOT NULL,
          equipment_types JSONB NOT NULL,
          duration TEXT NOT NULL,
          initial_like_count INTEGER NOT NULL DEFAULT 0,
          video_url TEXT NOT NULL,
          description TEXT NOT NULL,
          target_muscles TEXT,
          display_order INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS exercise_guides_catalog_type_display_order_idx
        ON exercise_guides (catalog_type, display_order ASC, created_at ASC)
      `);

      const existingExerciseGuideCountResult = await this.pool.query<{
        count: string;
      }>(`
        SELECT COUNT(*)::text AS count
        FROM exercise_guides
      `);
      const existingExerciseGuideCount = Number(
        existingExerciseGuideCountResult.rows[0]?.count ?? '0',
      );

      if (existingExerciseGuideCount === 0) {
        for (const guide of EXERCISE_GUIDE_CATALOG) {
          await this.pool.query(
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
            `,
            [
              guide.id,
              guide.catalogType,
              guide.title,
              guide.bodyPart,
              guide.equipment,
              JSON.stringify(guide.equipmentTypes),
              guide.duration,
              guide.initialLikeCount,
              guide.videoUrl,
              guide.description,
              guide.targetMuscles,
              guide.displayOrder,
            ],
          );
        }
      }

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS workout_completions (
          id TEXT PRIMARY KEY,
          user_key TEXT NOT NULL,
          completed_on DATE NOT NULL,
          source TEXT NOT NULL,
          note TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS workout_completions_user_key_completed_on_idx
        ON workout_completions (user_key, completed_on DESC)
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS workout_records (
          id TEXT PRIMARY KEY,
          user_key TEXT NOT NULL,
          source TEXT NOT NULL,
          routine_id TEXT,
          routine_label TEXT,
          routine_source TEXT,
          completed_at TIMESTAMPTZ NOT NULL,
          completed_on DATE NOT NULL,
          time_zone TEXT NOT NULL,
          duration_seconds INTEGER NOT NULL,
          steps JSONB NOT NULL,
          summary JSONB NOT NULL,
          weekly_completion_id TEXT REFERENCES workout_completions(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS workout_records_user_key_completed_on_idx
        ON workout_records (user_key, completed_on DESC, created_at DESC)
      `);

      await this.pool.query(`
        ALTER TABLE workout_records
          ADD COLUMN IF NOT EXISTS title TEXT,
          ADD COLUMN IF NOT EXISTS performed_at TIMESTAMPTZ,
          ADD COLUMN IF NOT EXISTS performed_on DATE,
          ADD COLUMN IF NOT EXISTS manual_detail JSONB,
          ADD COLUMN IF NOT EXISTS body_composition JSONB
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS workout_records_user_key_source_completed_on_idx
        ON workout_records (user_key, source, completed_on DESC, created_at DESC)
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS pt_lessons (
          id TEXT PRIMARY KEY,
          user_key TEXT NOT NULL,
          lesson_date DATE NOT NULL,
          session_number INTEGER NOT NULL,
          body_parts JSONB NOT NULL,
          equipment JSONB NOT NULL,
          warm_up TEXT NOT NULL DEFAULT '',
          exercises JSONB NOT NULL,
          comment TEXT NOT NULL DEFAULT '',
          summary JSONB NOT NULL,
          weekly_completion_id TEXT REFERENCES workout_completions(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS pt_lessons_user_key_lesson_date_idx
        ON pt_lessons (user_key, lesson_date DESC, created_at DESC)
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS condition_records (
          id TEXT PRIMARY KEY,
          user_key TEXT NOT NULL,
          checked_on DATE NOT NULL,
          week_number INTEGER NOT NULL DEFAULT 1,
          time_zone TEXT NOT NULL,
          condition_scores JSONB NOT NULL,
          muscle_soreness JSONB NOT NULL,
          summary JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await this.pool.query(`
        ALTER TABLE condition_records
          ADD COLUMN IF NOT EXISTS week_number INTEGER NOT NULL DEFAULT 1
      `);

      await this.pool.query(`
        ALTER TABLE condition_records
          DROP CONSTRAINT IF EXISTS condition_records_user_key_checked_on_key
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS condition_records_user_key_checked_on_idx
        ON condition_records (user_key, checked_on DESC, created_at DESC)
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS trainers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          gym_name TEXT NOT NULL,
          rating NUMERIC(3, 2) NOT NULL,
          price_per_session TEXT NOT NULL,
          experience_years INTEGER NOT NULL,
          specialties JSONB NOT NULL,
          focus_body_parts JSONB NOT NULL,
          match_tags JSONB NOT NULL,
          career TEXT NOT NULL,
          certifications JSONB NOT NULL,
          bio TEXT NOT NULL,
          philosophy TEXT NOT NULL,
          avatar_color TEXT NOT NULL,
          base_member_count INTEGER NOT NULL DEFAULT 0,
          region TEXT NOT NULL,
          online_available BOOLEAN NOT NULL DEFAULT FALSE,
          beginner_friendly BOOLEAN NOT NULL DEFAULT FALSE,
          posture_friendly BOOLEAN NOT NULL DEFAULT FALSE,
          rehab_friendly BOOLEAN NOT NULL DEFAULT FALSE,
          approved BOOLEAN NOT NULL DEFAULT TRUE,
          display_order INTEGER NOT NULL DEFAULT 0,
          seeded BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS trainers_approved_display_order_idx
        ON trainers (approved, display_order ASC, created_at ASC)
      `);

      for (const trainer of TRAINER_CATALOG) {
        await this.pool.query(
          `
            INSERT INTO trainers (
              id,
              name,
              gym_name,
              rating,
              price_per_session,
              experience_years,
              specialties,
              focus_body_parts,
              match_tags,
              career,
              certifications,
              bio,
              philosophy,
              avatar_color,
              base_member_count,
              region,
              online_available,
              beginner_friendly,
              posture_friendly,
              rehab_friendly,
              approved,
              display_order,
              seeded
            )
            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7::jsonb,
              $8::jsonb,
              $9::jsonb,
              $10,
              $11::jsonb,
              $12,
              $13,
              $14,
              $15,
              $16,
              $17,
              $18,
              $19,
              $20,
              $21,
              $22,
              TRUE
            )
            ON CONFLICT (id)
            DO UPDATE SET
              name = EXCLUDED.name,
              gym_name = EXCLUDED.gym_name,
              rating = EXCLUDED.rating,
              price_per_session = EXCLUDED.price_per_session,
              experience_years = EXCLUDED.experience_years,
              specialties = EXCLUDED.specialties,
              focus_body_parts = EXCLUDED.focus_body_parts,
              match_tags = EXCLUDED.match_tags,
              career = EXCLUDED.career,
              certifications = EXCLUDED.certifications,
              bio = EXCLUDED.bio,
              philosophy = EXCLUDED.philosophy,
              avatar_color = EXCLUDED.avatar_color,
              base_member_count = EXCLUDED.base_member_count,
              region = EXCLUDED.region,
              online_available = EXCLUDED.online_available,
              beginner_friendly = EXCLUDED.beginner_friendly,
              posture_friendly = EXCLUDED.posture_friendly,
              rehab_friendly = EXCLUDED.rehab_friendly,
              approved = EXCLUDED.approved,
              display_order = EXCLUDED.display_order,
              seeded = TRUE,
              updated_at = NOW()
          `,
          [
            trainer.id,
            trainer.name,
            trainer.gymName,
            trainer.rating,
            trainer.pricePerSession,
            trainer.experienceYears,
            JSON.stringify(trainer.specialties),
            JSON.stringify(trainer.focusBodyParts),
            JSON.stringify(trainer.matchTags),
            trainer.career,
            JSON.stringify(trainer.certifications),
            trainer.bio,
            trainer.philosophy,
            trainer.avatarColor,
            trainer.baseMemberCount,
            trainer.region,
            trainer.onlineAvailable,
            trainer.beginnerFriendly,
            trainer.postureFriendly,
            trainer.rehabFriendly,
            trainer.approved,
            trainer.displayOrder,
          ],
        );
      }

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS trainer_connect_requests (
          id TEXT PRIMARY KEY,
          user_key TEXT NOT NULL,
          trainer_id TEXT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
          message TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT trainer_connect_requests_user_key_trainer_id_unique
            UNIQUE (user_key, trainer_id)
        )
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS trainer_connect_requests_user_key_created_at_idx
        ON trainer_connect_requests (user_key, created_at DESC)
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS trainer_likes (
          user_key TEXT NOT NULL,
          trainer_id TEXT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (user_key, trainer_id)
        )
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS trainer_likes_user_key_created_at_idx
        ON trainer_likes (user_key, created_at DESC)
      `);

      // Guide IDs currently come from a server hardcoded catalog. Add a
      // foreign key now that the catalog is DB-backed and seeded on boot.
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS exercise_guide_likes (
          guide_id TEXT NOT NULL,
          user_key TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (guide_id, user_key)
        )
      `);

      await this.pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'exercise_guide_likes_guide_id_fkey'
          ) THEN
            ALTER TABLE exercise_guide_likes
              ADD CONSTRAINT exercise_guide_likes_guide_id_fkey
              FOREIGN KEY (guide_id)
              REFERENCES exercise_guides(id)
              ON DELETE CASCADE;
          END IF;
        END $$;
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS exercise_guide_likes_guide_id_idx
        ON exercise_guide_likes (guide_id)
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS analysis_records (
          id TEXT PRIMARY KEY,
          user_key TEXT NOT NULL,
          analysis_type TEXT NOT NULL,
          qualitative_data JSONB,
          quantitative_data JSONB,
          raw_result JSONB NOT NULL,
          analyzed_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS analysis_records_user_key_analyzed_at_idx
        ON analysis_records (user_key, analyzed_at DESC, created_at DESC)
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS analysis_records_user_key_type_analyzed_at_idx
        ON analysis_records (user_key, analysis_type, analyzed_at DESC, created_at DESC)
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS meal_records (
          id TEXT PRIMARY KEY,
          user_key TEXT NOT NULL,
          meal_type TEXT NOT NULL CHECK (
            meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')
          ),
          analysis_result JSONB NOT NULL,
          total_calories INTEGER NOT NULL DEFAULT 0,
          protein INTEGER NOT NULL DEFAULT 0,
          carbs INTEGER NOT NULL DEFAULT 0,
          fat INTEGER NOT NULL DEFAULT 0,
          fiber INTEGER NOT NULL DEFAULT 0,
          sodium INTEGER NOT NULL DEFAULT 0,
          meal_date DATE NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS meal_records_user_key_meal_date_idx
        ON meal_records (user_key, meal_date DESC, created_at DESC)
      `);

      this.logger.log('Database schema is ready.');
    } finally {
      await this.pool.query('SELECT pg_advisory_unlock(2026072301)');
    }
  }
}
