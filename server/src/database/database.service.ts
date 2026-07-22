import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { DEFAULT_DATABASE_URL } from './database.constants';

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

    this.logger.log('Database schema is ready.');
  }
}
