import type {
  ConditionRecordDto,
  CreateConditionRecordDto,
  UpdateConditionRecordDto,
} from 'shared/api/generated/models';
import { getClientTimeZone, getClientTodayDate } from 'shared/lib/date';
import type { ConditionFormState } from '../stores/use-condition-form-store';
import {
  CONDITION_LABELS,
  MUSCLE_SORENESS_LABELS,
  cloneConditionItems,
  createConditionItems,
} from './condition-record-metadata';

export function createConditionFormState(): ConditionFormState {
  return {
    conditions: createConditionItems(CONDITION_LABELS),
    date: getClientTodayDate(),
    muscleSoreness: createConditionItems(MUSCLE_SORENESS_LABELS),
    weekNumberInput: '1',
  };
}

export function createConditionFormStateFromRecord(
  record: ConditionRecordDto,
): ConditionFormState {
  return {
    conditions: cloneConditionItems(record.conditions),
    date: record.date,
    muscleSoreness: cloneConditionItems(record.muscleSoreness),
    weekNumberInput: String(record.weekNumber),
  };
}

export function buildConditionPayload(
  form: ConditionFormState,
): CreateConditionRecordDto | UpdateConditionRecordDto {
  return {
    conditions: cloneConditionItems(form.conditions),
    date: form.date.trim(),
    muscleSoreness: cloneConditionItems(form.muscleSoreness),
    timeZone: getClientTimeZone(),
    weekNumber: Number.parseInt(form.weekNumberInput, 10) || 0,
  };
}

export function validateConditionForm(form: ConditionFormState) {
  if (!form.date.trim()) {
    return '날짜를 입력해 주세요.';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date.trim())) {
    return '체크일은 YYYY-MM-DD 형식으로 입력해 주세요.';
  }

  if (!/^\d+$/.test(form.weekNumberInput.trim())) {
    return '주차는 숫자로 입력해 주세요.';
  }

  return null;
}
