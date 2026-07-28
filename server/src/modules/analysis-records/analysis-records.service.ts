import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import {
  AnalysisRecordDetailDto,
  AnalysisRecordDto,
  AnalysisRecordType,
} from './dto/analysis-record-response.dto';
import { CompareAnalysisRecordsDto } from './dto/compare-analysis-records.dto';
import { CompareAnalysisRecordsResponseDto } from './dto/compare-analysis-response.dto';
import { ListAnalysisRecordsQueryDto } from './dto/list-analysis-records-query.dto';
import {
  AnalysisRecordRow,
  AnalysisRecordsRepositoryPort,
  AnalysisRecordWriteModel,
} from './analysis-records.repository.port';
import { AnalysisRecordComparisonClientPort } from './analysis-record-comparison.client.port';

@Injectable()
export class AnalysisRecordsService {
  constructor(
    private readonly analysisRecordsRepository: AnalysisRecordsRepositoryPort,
    private readonly analysisRecordComparisonClient: AnalysisRecordComparisonClientPort,
  ) {}

  async createAnalysisRecord(
    userKey: string,
    record: AnalysisRecordWriteModel,
  ): Promise<AnalysisRecordDetailDto> {
    const recordId = record.idempotencyKey
      ? this.createIdempotentRecordId(userKey, record.idempotencyKey)
      : `record_${randomUUID()}`;
    const created = await this.analysisRecordsRepository.createAnalysisRecord({
      record,
      recordId,
      userKey,
    });

    return this.mapDetail(created);
  }

  private createIdempotentRecordId(userKey: string, idempotencyKey: string) {
    const digest = createHash('sha256')
      .update(`${userKey}\u0000${idempotencyKey}`)
      .digest('hex');

    return `record_${digest}`;
  }

  async listAnalysisRecords(
    userKey: string,
    query: ListAnalysisRecordsQueryDto,
  ): Promise<AnalysisRecordDto[]> {
    const rows = await this.analysisRecordsRepository.listAnalysisRecords({
      type: query.type,
      userKey,
    });

    return rows.map((row) => this.mapSummary(row));
  }

  async getAnalysisRecord(
    userKey: string,
    recordId: string,
  ): Promise<AnalysisRecordDetailDto> {
    const row = await this.analysisRecordsRepository.findAnalysisRecord({
      recordId,
      userKey,
    });

    if (!row) {
      throw new NotFoundException('Analysis record not found.');
    }

    return this.mapDetail(row);
  }

  async compareAnalysisRecords(
    userKey: string,
    dto: CompareAnalysisRecordsDto,
  ): Promise<CompareAnalysisRecordsResponseDto> {
    const [record1, record2] = await Promise.all([
      this.analysisRecordsRepository.findAnalysisRecord({
        recordId: dto.recordId1,
        userKey,
      }),
      this.analysisRecordsRepository.findAnalysisRecord({
        recordId: dto.recordId2,
        userKey,
      }),
    ]);

    if (!record1 || !record2) {
      throw new NotFoundException('Analysis record not found.');
    }

    if (record1.analysis_type !== 'body' || record2.analysis_type !== 'body') {
      throw new BadRequestException(
        'Only body analysis records can be compared right now.',
      );
    }

    const olderRecord =
      new Date(record1.analyzed_at).getTime() <=
      new Date(record2.analyzed_at).getTime()
        ? record1
        : record2;
    const newerRecord = olderRecord === record1 ? record2 : record1;

    const comparison = await this.analysisRecordComparisonClient.compareRecords(
      {
        newerRecord,
        olderRecord,
      },
    );

    return {
      ...comparison,
      newerRecord: this.mapComparedMeta(newerRecord),
      olderRecord: this.mapComparedMeta(olderRecord),
    };
  }

  private mapComparedMeta(row: AnalysisRecordRow) {
    return {
      analysisType: row.analysis_type,
      analyzedAt: row.analyzed_at,
      id: row.id,
    };
  }

  private mapSummary(row: AnalysisRecordRow): AnalysisRecordDto {
    return {
      analysisType: row.analysis_type as AnalysisRecordType,
      analyzedAt: row.analyzed_at,
      createdAt: row.created_at,
      id: row.id,
      qualitativeData: row.qualitative_data ?? {},
      quantitativeData: row.quantitative_data ?? {},
    };
  }

  private mapDetail(row: AnalysisRecordRow): AnalysisRecordDetailDto {
    return {
      ...this.mapSummary(row),
      rawResult: row.raw_result,
    };
  }
}
