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

      this.logger.log('Database schema is ready.');
    } finally {
      await this.pool.query('SELECT pg_advisory_unlock(2026072301)');
    }
  }
}
