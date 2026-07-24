import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DEFAULT_CONDITION_TIME_ZONE } from './condition-records.constants';
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
  ConditionItemInput,
  ConditionsInput,
  LegacyConditionScoresInput,
  LegacyMuscleSorenessInput,
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
    const record = await this.conditionRecordsRepository.createConditionRecord({
      conditions: dto.conditions,
      date: dto.date,
      id: randomUUID(),
      muscleSoreness: dto.muscleSoreness,
      summary: this.summarize(dto.conditions, dto.muscleSoreness),
      timeZone: dto.timeZone ?? DEFAULT_CONDITION_TIME_ZONE,
      userKey,
      weekNumber: dto.weekNumber,
    });

    return this.mapRecord(record);
  }

  async updateConditionRecord(
    userKey: string,
    conditionId: string,
    dto: UpdateConditionRecordDto,
  ): Promise<ConditionRecordDto> {
    const record = await this.conditionRecordsRepository.updateConditionRecord({
      conditions: dto.conditions,
      date: dto.date,
      id: conditionId,
      muscleSoreness: dto.muscleSoreness,
      summary: this.summarize(dto.conditions, dto.muscleSoreness),
      timeZone: dto.timeZone ?? DEFAULT_CONDITION_TIME_ZONE,
      userKey,
      weekNumber: dto.weekNumber,
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
    conditions: ConditionsInput,
    muscleSoreness: MuscleSorenessInput,
  ): ConditionRecordSummary {
    const selectedConditionScores =
      conditions.map((item) => item.score).filter(Boolean);
    const selectedSorenessScores = muscleSoreness
      .map((item) => item.score)
      .filter(Boolean);

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
    const conditions = this.normalizeConditions(record.condition_scores);
    const muscleSoreness = this.normalizeMuscleSoreness(record.muscle_soreness);

    return {
      conditions,
      createdAt: this.toUnixMilliseconds(record.created_at),
      date: record.checked_on,
      id: record.id,
      muscleSoreness,
      summary: record.summary,
      weekNumber: record.week_number,
    };
  }

  private normalizeConditions(
    value: ConditionsInput | LegacyConditionScoresInput,
  ): ConditionItemInput[] {
    if (Array.isArray(value)) {
      return value;
    }

    return [
      { label: '훈련 동기', score: value.motivation },
      { label: '일상피로도', score: 0 },
      { label: '수면시간', score: value.sleep },
      { label: '수면의 질', score: 0 },
      { label: '식욕', score: 0 },
      { label: '성욕', score: 0 },
      { label: '소화력(식사)', score: 0 },
      { label: '장내가스', score: 0 },
      { label: '배변', score: 0 },
      { label: '심박수', score: 0 },
      { label: '식단 준수성', score: 0 },
      { label: '훈련 준수성', score: 0 },
      { label: '발기 빈도 및 강도', score: 0 },
      { label: '월경 전/중/후 반응', score: 0 },
      { label: '수행력', score: value.energy },
    ];
  }

  private normalizeMuscleSoreness(
    value: MuscleSorenessInput | LegacyMuscleSorenessInput,
  ): ConditionItemInput[] {
    if (Array.isArray(value)) {
      return value;
    }

    return [
      { label: '가슴', score: value.chest },
      { label: '승모근', score: 0 },
      { label: '광배근', score: value.back },
      { label: '전삼각근', score: 0 },
      { label: '측삼각근', score: value.shoulders },
      { label: '후삼각근', score: 0 },
      { label: '상완이두근', score: value.arms },
      { label: '상완삼두근', score: 0 },
      { label: '대퇴사두근', score: value.legs },
      { label: '대퇴이두근', score: 0 },
      { label: '둔근', score: 0 },
      { label: '내전근', score: 0 },
      { label: '복근', score: value.core },
      { label: '허리', score: 0 },
      { label: '종아리', score: 0 },
    ];
  }

  private toUnixMilliseconds(value: string) {
    return new Date(value).getTime();
  }
}
