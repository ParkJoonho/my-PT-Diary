import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  AnalysisRecordRow,
  AnalysisRecordsRepositoryPort,
  AnalysisRecordWriteModel,
} from './analysis-records.repository.port';
import { AnalysisTypeInput } from './analysis-records.schemas';

@Injectable()
export class AnalysisRecordsRepository implements AnalysisRecordsRepositoryPort {
  constructor(private readonly databaseService: DatabaseService) {}

  async createAnalysisRecord(params: {
    recordId: string;
    userKey: string;
    record: AnalysisRecordWriteModel;
  }) {
    const result = await this.databaseService.query<AnalysisRecordRow>(
      `
        INSERT INTO analysis_records (
          id,
          user_key,
          analysis_type,
          qualitative_data,
          quantitative_data,
          raw_result,
          analyzed_at
        )
        VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::timestamptz)
        RETURNING
          id,
          user_key,
          analysis_type,
          qualitative_data,
          quantitative_data,
          raw_result,
          analyzed_at,
          created_at
      `,
      [
        params.recordId,
        params.userKey,
        params.record.analysisType,
        JSON.stringify(params.record.qualitativeData ?? {}),
        JSON.stringify(params.record.quantitativeData ?? {}),
        JSON.stringify(params.record.rawResult),
        params.record.analyzedAt,
      ],
    );

    return result.rows[0]!;
  }

  async listAnalysisRecords(params: {
    userKey: string;
    type?: AnalysisTypeInput;
  }) {
    const values: unknown[] = [params.userKey];
    let typeFilter = '';

    if (params.type) {
      values.push(params.type);
      typeFilter = 'AND analysis_type = $2';
    }

    const result = await this.databaseService.query<AnalysisRecordRow>(
      `
        SELECT
          id,
          user_key,
          analysis_type,
          qualitative_data,
          quantitative_data,
          raw_result,
          analyzed_at,
          created_at
        FROM analysis_records
        WHERE user_key = $1
        ${typeFilter}
        ORDER BY analyzed_at DESC, created_at DESC
      `,
      values,
    );

    return result.rows;
  }

  async findAnalysisRecord(params: { recordId: string; userKey: string }) {
    const result = await this.databaseService.query<AnalysisRecordRow>(
      `
        SELECT
          id,
          user_key,
          analysis_type,
          qualitative_data,
          quantitative_data,
          raw_result,
          analyzed_at,
          created_at
        FROM analysis_records
        WHERE id = $1
          AND user_key = $2
      `,
      [params.recordId, params.userKey],
    );

    return result.rows[0] ?? null;
  }
}
