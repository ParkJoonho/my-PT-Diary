import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  ConditionRecordRow,
  ConditionRecordSummary,
  ConditionRecordsRepositoryPort,
} from './condition-records.repository.port';
import {
  ConditionsInput,
  MuscleSorenessInput,
} from './condition-records.schemas';

@Injectable()
export class ConditionRecordsRepository implements ConditionRecordsRepositoryPort {
  constructor(private readonly databaseService: DatabaseService) {}

  async createConditionRecord(params: {
    id: string;
    userKey: string;
    date: string;
    weekNumber: number;
    timeZone: string;
    conditions: ConditionsInput;
    muscleSoreness: MuscleSorenessInput;
    summary: ConditionRecordSummary;
  }) {
    const result = await this.databaseService.query<ConditionRecordRow>(
      `
        INSERT INTO condition_records (
          id,
          user_key,
          checked_on,
          week_number,
          time_zone,
          condition_scores,
          muscle_soreness,
          summary
        )
        VALUES ($1, $2, $3::date, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb)
        RETURNING ${this.selectColumns()}
      `,
      [
        params.id,
        params.userKey,
        params.date,
        params.weekNumber,
        params.timeZone,
        JSON.stringify(params.conditions),
        JSON.stringify(params.muscleSoreness),
        JSON.stringify(params.summary),
      ],
    );

    return result.rows[0];
  }

  async updateConditionRecord(params: {
    id: string;
    userKey: string;
    date: string;
    weekNumber: number;
    timeZone: string;
    conditions: ConditionsInput;
    muscleSoreness: MuscleSorenessInput;
    summary: ConditionRecordSummary;
  }) {
    const result = await this.databaseService.query<ConditionRecordRow>(
      `
        UPDATE condition_records
        SET
          checked_on = $3::date,
          week_number = $4,
          time_zone = $5,
          condition_scores = $6::jsonb,
          muscle_soreness = $7::jsonb,
          summary = $8::jsonb,
          updated_at = NOW()
        WHERE id = $1
          AND user_key = $2
        RETURNING ${this.selectColumns()}
      `,
      [
        params.id,
        params.userKey,
        params.date,
        params.weekNumber,
        params.timeZone,
        JSON.stringify(params.conditions),
        JSON.stringify(params.muscleSoreness),
        JSON.stringify(params.summary),
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
      week_number,
      time_zone,
      condition_scores,
      muscle_soreness,
      summary,
      created_at::text,
      updated_at::text
    `;
  }
}
