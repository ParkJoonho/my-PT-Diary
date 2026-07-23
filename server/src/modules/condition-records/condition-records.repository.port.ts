import {
  ConditionScoresInput,
  MuscleSorenessInput,
} from './condition-records.schemas';

export type ConditionRecordSummary = {
  averageConditionScore: number | null;
  averageSorenessScore: number | null;
  selectedConditionCount: number;
  selectedSorenessCount: number;
  severeSorenessCount: number;
};

export type ConditionRecordRow = {
  id: string;
  user_key: string;
  checked_on: string;
  time_zone: string;
  condition_scores: ConditionScoresInput;
  muscle_soreness: MuscleSorenessInput;
  summary: ConditionRecordSummary;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export abstract class ConditionRecordsRepositoryPort {
  abstract upsertConditionRecord(params: {
    id: string;
    userKey: string;
    checkedOn: string;
    timeZone: string;
    conditionScores: ConditionScoresInput;
    muscleSoreness: MuscleSorenessInput;
    summary: ConditionRecordSummary;
    memo: string | null;
  }): Promise<ConditionRecordRow>;

  abstract updateConditionRecord(params: {
    id: string;
    userKey: string;
    checkedOn: string;
    timeZone: string;
    conditionScores: ConditionScoresInput;
    muscleSoreness: MuscleSorenessInput;
    summary: ConditionRecordSummary;
    memo: string | null;
  }): Promise<ConditionRecordRow>;

  abstract listConditionRecords(params: {
    userKey: string;
    from?: string;
    to?: string;
  }): Promise<ConditionRecordRow[]>;

  abstract findConditionRecord(params: {
    userKey: string;
    id: string;
  }): Promise<ConditionRecordRow | null>;

  abstract deleteConditionRecord(params: {
    userKey: string;
    id: string;
  }): Promise<ConditionRecordRow>;
}
