import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConditionRecordDto } from './dto/condition-record-response.dto';
import { CreateConditionRecordDto } from './dto/create-condition-record.dto';
import { ListConditionRecordsQueryDto } from './dto/list-condition-records-query.dto';
import { UpdateConditionRecordDto } from './dto/update-condition-record.dto';
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
export class ConditionRecordsService {
  constructor(
    private readonly conditionRecordsRepository: ConditionRecordsRepositoryPort,
  ) {}

  async createConditionRecord(
    userKey: string,
    dto: CreateConditionRecordDto,
  ): Promise<ConditionRecordDto> {
    const record = await this.conditionRecordsRepository.upsertConditionRecord({
      checkedOn: dto.checkedOn,
      conditionScores: dto.conditionScores,
      id: randomUUID(),
      memo: dto.memo ?? null,
      muscleSoreness: dto.muscleSoreness,
      summary: this.summarize(dto.conditionScores, dto.muscleSoreness),
      timeZone: dto.timeZone,
      userKey,
    });

    return this.mapRecord(record);
  }

  async updateConditionRecord(
    userKey: string,
    conditionId: string,
    dto: UpdateConditionRecordDto,
  ): Promise<ConditionRecordDto> {
    const record = await this.conditionRecordsRepository.updateConditionRecord({
      checkedOn: dto.checkedOn,
      conditionScores: dto.conditionScores,
      id: conditionId,
      memo: dto.memo ?? null,
      muscleSoreness: dto.muscleSoreness,
      summary: this.summarize(dto.conditionScores, dto.muscleSoreness),
      timeZone: dto.timeZone,
      userKey,
    });

    return this.mapRecord(record);
  }

  async listConditionRecords(
    userKey: string,
    query: ListConditionRecordsQueryDto,
  ) {
    const records = await this.conditionRecordsRepository.listConditionRecords({
      from: query.from,
      to: query.to,
      userKey,
    });

    return records.map((record) => this.mapRecord(record));
  }

  async getConditionRecord(userKey: string, conditionId: string) {
    const record = await this.conditionRecordsRepository.findConditionRecord({
      id: conditionId,
      userKey,
    });

    if (!record) {
      throw new NotFoundException('Condition record not found.');
    }

    return this.mapRecord(record);
  }

  async deleteConditionRecord(userKey: string, conditionId: string) {
    await this.conditionRecordsRepository.deleteConditionRecord({
      id: conditionId,
      userKey,
    });

    return {
      deleted: true,
    };
  }

  private summarize(
    conditionScores: ConditionScoresInput,
    muscleSoreness: MuscleSorenessInput,
  ): ConditionRecordSummary {
    const selectedConditionScores =
      Object.values(conditionScores).filter(Boolean);
    const selectedSorenessScores =
      Object.values(muscleSoreness).filter(Boolean);

    return {
      averageConditionScore: this.average(selectedConditionScores),
      averageSorenessScore: this.average(selectedSorenessScores),
      selectedConditionCount: selectedConditionScores.length,
      selectedSorenessCount: selectedSorenessScores.length,
      severeSorenessCount: selectedSorenessScores.filter((score) => score >= 3)
        .length,
    };
  }

  private average(values: number[]) {
    if (!values.length) {
      return null;
    }

    return Number(
      (
        values.reduce((total, value) => total + value, 0) / values.length
      ).toFixed(1),
    );
  }

  private mapRecord(record: ConditionRecordRow): ConditionRecordDto {
    return {
      checkedOn: record.checked_on,
      conditionScores: record.condition_scores,
      createdAt: this.toUtcISOString(record.created_at),
      id: record.id,
      memo: record.memo,
      muscleSoreness: record.muscle_soreness,
      summary: record.summary,
      timeZone: record.time_zone,
      updatedAt: this.toUtcISOString(record.updated_at),
    };
  }

  private toUtcISOString(value: string) {
    return new Date(value).toISOString();
  }
}
