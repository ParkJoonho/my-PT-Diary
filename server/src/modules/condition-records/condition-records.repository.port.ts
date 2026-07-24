import {
  ConditionsInput,
  LegacyConditionScoresInput,
  LegacyMuscleSorenessInput,
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
  week_number: number;
  time_zone: string;
  condition_scores: ConditionsInput | LegacyConditionScoresInput;
  muscle_soreness: MuscleSorenessInput | LegacyMuscleSorenessInput;
  summary: ConditionRecordSummary;
  created_at: string;
  updated_at: string;
};

export abstract class ConditionRecordsRepositoryPort {
  abstract createConditionRecord(params: {
    id: string;
    userKey: string;
    date: string;
    weekNumber: number;
    timeZone: string;
    conditions: ConditionsInput;
    muscleSoreness: MuscleSorenessInput;
    summary: ConditionRecordSummary;
  }): Promise<ConditionRecordRow>;

  abstract updateConditionRecord(params: {
    id: string;
    userKey: string;
    date: string;
    weekNumber: number;
    timeZone: string;
    conditions: ConditionsInput;
    muscleSoreness: MuscleSorenessInput;
    summary: ConditionRecordSummary;
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
