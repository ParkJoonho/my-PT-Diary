import type {
  CreateManualWorkoutRecordDto,
  CreateManualWorkoutRecordDtoLocation,
  ManualStrengthExerciseDto,
  ManualWorkoutSetDto,
  UpdateManualWorkoutRecordDto,
  WorkoutRecordDto,
} from 'shared/api/generated/models';
import {
  getClientTimeZone,
  getClientTodayDate,
  getUtcISOString,
} from 'shared/lib/date';

export type ManualWorkoutSetForm = {
  weightKg: string;
  reps: string;
  rir: string;
  restSeconds: string;
};

export type ManualStrengthExerciseForm = {
  name: string;
  sets: ManualWorkoutSetForm[];
};

export type ManualWorkoutFormState = {
  title: string;
  performedOn: string;
  durationMinutes: string;
  location: CreateManualWorkoutRecordDto['location'];
  cardioDurationMinutes: string;
  cardioDistanceKm: string;
  cardioSteps: string;
  weightKg: string;
  skeletalMuscleMassKg: string;
  bodyFatPercentage: string;
  memo: string;
  strengthExercises: ManualStrengthExerciseForm[];
};

export type ManualWorkoutFormError = {
  field: keyof ManualWorkoutFormState | 'strengthExercises';
  message: string;
};

export function createEmptyManualWorkoutSet(): ManualWorkoutSetForm {
  return {
    reps: '',
    restSeconds: '',
    rir: '',
    weightKg: '',
  };
}

export function createEmptyManualStrengthExercise(): ManualStrengthExerciseForm {
  return {
    name: '',
    sets: [createEmptyManualWorkoutSet()],
  };
}

export function createManualWorkoutFormState(): ManualWorkoutFormState {
  return {
    bodyFatPercentage: '',
    cardioDistanceKm: '',
    cardioDurationMinutes: '',
    cardioSteps: '',
    durationMinutes: '60',
    location: 'gym',
    memo: '',
    performedOn: getClientTodayDate(),
    skeletalMuscleMassKg: '',
    strengthExercises: [createEmptyManualStrengthExercise()],
    title: '개인 운동',
    weightKg: '',
  };
}

export function createManualWorkoutFormStateFromRecord(
  record: WorkoutRecordDto,
): ManualWorkoutFormState {
  const detail = record.manualDetail;

  return {
    bodyFatPercentage: formatOptionalNumber(
      record.bodyComposition?.bodyFatPercentage,
    ),
    cardioDistanceKm: formatOptionalNumber(
      detail?.cardio?.distanceMeters
        ? detail.cardio.distanceMeters / 1000
        : undefined,
    ),
    cardioDurationMinutes: formatOptionalNumber(
      detail?.cardio?.durationSeconds
        ? Math.round(detail.cardio.durationSeconds / 60)
        : undefined,
    ),
    cardioSteps: formatOptionalNumber(detail?.cardio?.steps),
    durationMinutes: formatOptionalNumber(
      Math.max(0, Math.round(record.durationSeconds / 60)),
    ),
    location: normalizeLocation(detail?.location),
    memo: detail?.memo ?? '',
    performedOn: record.performedOn,
    skeletalMuscleMassKg: formatOptionalNumber(
      record.bodyComposition?.skeletalMuscleMassKg,
    ),
    strengthExercises: detail?.strengthExercises?.length
      ? detail.strengthExercises.map((exercise) => ({
          name: exercise.name,
          sets: exercise.sets.map((set) => ({
            reps: formatOptionalNumber(set.reps),
            restSeconds: formatOptionalNumber(set.restSeconds),
            rir: formatOptionalNumber(set.rir),
            weightKg: formatOptionalNumber(set.weightKg),
          })),
        }))
      : [createEmptyManualStrengthExercise()],
    title: record.title ?? record.routineLabel ?? '개인 운동',
    weightKg: formatOptionalNumber(record.bodyComposition?.weightKg),
  };
}

export function buildManualWorkoutPayload(
  form: ManualWorkoutFormState,
): CreateManualWorkoutRecordDto | UpdateManualWorkoutRecordDto {
  const title = form.title.trim();
  const durationMinutes = parseOptionalNumber(form.durationMinutes) ?? 0;
  const cardioDurationMinutes =
    parseOptionalNumber(form.cardioDurationMinutes) ?? 0;
  const cardioDistanceKm = parseOptionalNumber(form.cardioDistanceKm) ?? 0;
  const cardioSteps = parseOptionalInteger(form.cardioSteps) ?? 0;
  const strengthExercises = normalizeStrengthExercises(form.strengthExercises);
  const bodyComposition = {
    bodyFatPercentage: parseOptionalNumber(form.bodyFatPercentage),
    skeletalMuscleMassKg: parseOptionalNumber(form.skeletalMuscleMassKg),
    weightKg: parseOptionalNumber(form.weightKg),
  };
  const memo = form.memo.trim();

  return {
    bodyComposition: hasAnyValue(bodyComposition) ? bodyComposition : undefined,
    cardio:
      cardioDurationMinutes > 0 || cardioDistanceKm > 0 || cardioSteps > 0
        ? {
            distanceMeters:
              cardioDistanceKm > 0 ? Math.round(cardioDistanceKm * 1000) : 0,
            durationSeconds:
              cardioDurationMinutes > 0
                ? Math.round(cardioDurationMinutes * 60)
                : 0,
            steps: cardioSteps,
          }
        : undefined,
    durationSeconds: Math.round(durationMinutes * 60),
    location: form.location,
    memo: memo || undefined,
    performedAt: getUtcISOString(),
    performedOn: form.performedOn,
    strengthExercises: strengthExercises.length ? strengthExercises : undefined,
    timeZone: getClientTimeZone(),
    title,
  };
}

export function validateManualWorkoutForm(
  form: ManualWorkoutFormState,
): ManualWorkoutFormError[] {
  const errors: ManualWorkoutFormError[] = [];
  const payload = buildManualWorkoutPayload(form);

  if (!payload.title) {
    errors.push({ field: 'title', message: '운동 제목을 입력해 주세요.' });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.performedOn)) {
    errors.push({
      field: 'performedOn',
      message: '운동일은 YYYY-MM-DD 형식으로 입력해 주세요.',
    });
  }

  if (payload.durationSeconds <= 0) {
    errors.push({
      field: 'durationMinutes',
      message: '운동 시간은 1분 이상 입력해 주세요.',
    });
  }

  if (
    !payload.strengthExercises?.length &&
    !payload.cardio &&
    !payload.memo &&
    !payload.bodyComposition
  ) {
    errors.push({
      field: 'strengthExercises',
      message: '근력, 유산소, 체성분, 메모 중 하나는 입력해 주세요.',
    });
  }

  return errors;
}

export function calculateManualWorkoutVolume(
  exercises: ManualStrengthExerciseForm[],
) {
  return normalizeStrengthExercises(exercises).reduce(
    (total, exercise) =>
      total +
      exercise.sets.reduce(
        (exerciseTotal, set) =>
          exerciseTotal + (set.weightKg ?? 0) * (set.reps ?? 0),
        0,
      ),
    0,
  );
}

function normalizeStrengthExercises(
  exercises: ManualStrengthExerciseForm[],
): ManualStrengthExerciseDto[] {
  return exercises
    .map((exercise) => ({
      name: exercise.name.trim(),
      sets: normalizeSets(exercise.sets),
    }))
    .filter((exercise) => exercise.name && exercise.sets.length);
}

function normalizeSets(sets: ManualWorkoutSetForm[]): ManualWorkoutSetDto[] {
  return sets
    .map((set) => ({
      reps: parseOptionalInteger(set.reps),
      restSeconds: parseOptionalInteger(set.restSeconds),
      rir: parseOptionalInteger(set.rir),
      weightKg: parseOptionalNumber(set.weightKg),
    }))
    .filter((set) => hasAnyValue(set));
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseOptionalInteger(value: string) {
  const parsed = parseOptionalNumber(value);

  return parsed === undefined ? undefined : Math.round(parsed);
}

function hasAnyValue(record: Record<string, unknown>) {
  return Object.values(record).some((value) => value !== undefined);
}

function formatOptionalNumber(value: number | undefined) {
  return value === undefined || value === null || value === 0
    ? ''
    : String(value);
}

function normalizeLocation(
  location: string | undefined,
): CreateManualWorkoutRecordDtoLocation {
  if (
    location === 'gym' ||
    location === 'home' ||
    location === 'outdoor' ||
    location === 'unknown'
  ) {
    return location;
  }

  return 'unknown';
}
