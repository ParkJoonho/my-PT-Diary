import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  ConditionRecordRow,
  ConditionRecordSummary,
  ConditionRecordsRepositoryPort,
} from './condition-records.repository.port';
import {
  ConditionScoresInput,
  MuscleSorenessInput,
} from './condition-records.schemas';

@Injectable()
export class ConditionRecordsRepository implements ConditionRecordsRepositoryPort {
  constructor(private readonly databaseService: DatabaseService) {}

  async upsertConditionRecord(params: {
    id: string;
    userKey: string;
    checkedOn: string;
    timeZone: string;
    conditionScores: ConditionScoresInput;
    muscleSoreness: MuscleSorenessInput;
    summary: ConditionRecordSummary;
    memo: string | null;
  }) {
    const result = await this.databaseService.query<ConditionRecordRow>(
      `
        INSERT INTO condition_records (
          id,
          user_key,
          checked_on,
          time_zone,
          condition_scores,
          muscle_soreness,
          summary,
          memo
        )
        VALUES ($1, $2, $3::date, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8)
        ON CONFLICT (user_key, checked_on)
        DO UPDATE SET
          time_zone = EXCLUDED.time_zone,
          condition_scores = EXCLUDED.condition_scores,
          muscle_soreness = EXCLUDED.muscle_soreness,
          summary = EXCLUDED.summary,
          memo = EXCLUDED.memo,
          updated_at = NOW()
        RETURNING ${this.selectColumns()}
      `,
      [
        params.id,
        params.userKey,
        params.checkedOn,
        params.timeZone,
        JSON.stringify(params.conditionScores),
        JSON.stringify(params.muscleSoreness),
        JSON.stringify(params.summary),
        params.memo,
      ],
    );

    return result.rows[0];
  }

  async updateConditionRecord(params: {
    id: string;
    userKey: string;
    checkedOn: string;
    timeZone: string;
    conditionScores: ConditionScoresInput;
    muscleSoreness: MuscleSorenessInput;
    summary: ConditionRecordSummary;
    memo: string | null;
  }) {
    const result = await this.databaseService.query<ConditionRecordRow>(
      `
        UPDATE condition_records
        SET
          checked_on = $3::date,
          time_zone = $4,
          condition_scores = $5::jsonb,
          muscle_soreness = $6::jsonb,
          summary = $7::jsonb,
          memo = $8,
          updated_at = NOW()
        WHERE id = $1
          AND user_key = $2
        RETURNING ${this.selectColumns()}
      `,
      [
        params.id,
        params.userKey,
        params.checkedOn,
        params.timeZone,
        JSON.stringify(params.conditionScores),
        JSON.stringify(params.muscleSoreness),
        JSON.stringify(params.summary),
        params.memo,
      ],
    );

    const record = result.rows[0];

    if (!record) {
      throw new NotFoundException('Condition record not found.');
    }

    return record;
  }

  async listConditionRecords(params: {
    userKey: string;
    from?: string;
    to?: string;
  }) {
    const where: string[] = ['user_key = $1'];
    const values: unknown[] = [params.userKey];

    if (params.from) {
      values.push(params.from);
      where.push(`checked_on >= $${values.length}::date`);
    }

    if (params.to) {
      values.push(params.to);
      where.push(`checked_on <= $${values.length}::date`);
    }

    const result = await this.databaseService.query<ConditionRecordRow>(
      `
        SELECT ${this.selectColumns()}
        FROM condition_records
        WHERE ${where.join(' AND ')}
        ORDER BY checked_on DESC, created_at DESC
      `,
      values,
    );

    return result.rows;
  }

  async findConditionRecord(params: { userKey: string; id: string }) {
    const result = await this.databaseService.query<ConditionRecordRow>(
      `
        SELECT ${this.selectColumns()}
        FROM condition_records
        WHERE id = $1
          AND user_key = $2
      `,
      [params.id, params.userKey],
    );

    return result.rows[0] ?? null;
  }

  async deleteConditionRecord(params: { userKey: string; id: string }) {
    const result = await this.databaseService.query<ConditionRecordRow>(
      `
        DELETE FROM condition_records
        WHERE id = $1
          AND user_key = $2
        RETURNING ${this.selectColumns()}
      `,
      [params.id, params.userKey],
    );

    const record = result.rows[0];

    if (!record) {
      throw new NotFoundException('Condition record not found.');
    }

    return record;
  }

  private selectColumns() {
    return `
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
    `;
  }
}
