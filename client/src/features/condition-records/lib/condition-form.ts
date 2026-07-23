import type {
  ConditionRecordDto,
  CreateConditionRecordDto,
  MuscleSorenessDto,
  UpdateConditionRecordDto,
} from 'shared/api/generated/models';
import { getClientTimeZone, getClientTodayDate } from 'shared/lib/date';

export type ConditionScoreKey =
  keyof CreateConditionRecordDto['conditionScores'];
export type MuscleSorenessKey = keyof MuscleSorenessDto;

export type ConditionFormState = {
  checkedOn: string;
  conditionScores: Record<ConditionScoreKey, number>;
  memo: string;
  muscleSoreness: Record<MuscleSorenessKey, number>;
};

export type ConditionQuestion = {
  key: ConditionScoreKey;
  label: string;
};

export type MuscleQuestion = {
  key: MuscleSorenessKey;
  label: string;
};

export const CONDITION_QUESTIONS: ConditionQuestion[] = [
  { key: 'energy', label: '에너지' },
  { key: 'sleep', label: '수면' },
  { key: 'stress', label: '스트레스' },
  { key: 'motivation', label: '운동 의욕' },
];

export const MUSCLE_QUESTIONS: MuscleQuestion[] = [
  { key: 'chest', label: '가슴' },
  { key: 'back', label: '등' },
  { key: 'legs', label: '하체' },
  { key: 'shoulders', label: '어깨' },
  { key: 'arms', label: '팔' },
  { key: 'core', label: '코어' },
];

export function createConditionFormState(): ConditionFormState {
  return {
    checkedOn: getClientTodayDate(),
    conditionScores: {
      energy: 0,
      motivation: 0,
      sleep: 0,
      stress: 0,
    },
    memo: '',
    muscleSoreness: {
      arms: 0,
      back: 0,
      chest: 0,
      core: 0,
      legs: 0,
      shoulders: 0,
    },
  };
}

export function createConditionFormStateFromRecord(
  record: ConditionRecordDto,
): ConditionFormState {
  return {
    checkedOn: record.checkedOn,
    conditionScores: record.conditionScores,
    memo: record.memo ?? '',
    muscleSoreness: record.muscleSoreness,
  };
}

export function buildConditionPayload(
  form: ConditionFormState,
): CreateConditionRecordDto | UpdateConditionRecordDto {
  return {
    checkedOn: form.checkedOn,
    conditionScores: form.conditionScores,
    memo: form.memo.trim() || undefined,
    muscleSoreness: form.muscleSoreness,
    timeZone: getClientTimeZone(),
  };
}

export function validateConditionForm(form: ConditionFormState) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.checkedOn)) {
    return '체크일은 YYYY-MM-DD 형식으로 입력해 주세요.';
  }

  const hasConditionScore = Object.values(form.conditionScores).some(
    (score) => score > 0,
  );
  const hasSorenessScore = Object.values(form.muscleSoreness).some(
    (score) => score > 0,
  );

  if (!hasConditionScore && !hasSorenessScore && !form.memo.trim()) {
    return '컨디션 점수, 근육통, 메모 중 하나는 입력해 주세요.';
  }

  return null;
}

export function getConditionScoreLabel(score: number) {
  const labels: Record<number, string> = {
    1: '매우 나쁨',
    2: '나쁨',
    3: '보통',
    4: '좋음',
    5: '매우 좋음',
  };

  return labels[score] ?? '미선택';
}

export function getSorenessScoreLabel(score: number) {
  const labels: Record<number, string> = {
    1: '약함',
    2: '보통',
    3: '강함',
    4: '심함',
  };

  return labels[score] ?? '없음';
}
