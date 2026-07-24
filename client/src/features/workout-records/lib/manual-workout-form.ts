import type {
  BodyCompositionDto,
  CreateManualWorkoutRecordDto,
  ManualCardioDto,
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
  reps: string;
  weightKg: string;
};

export type ManualStrengthExerciseForm = {
  estimated1RM: number;
  lbWeight: number;
  maxWeight: number;
  name: string;
  restTime: string;
  rir: string;
  sets: ManualWorkoutSetForm[];
  volume: number;
};

export type ManualWorkoutFormState = {
  activityLevel: string;
  bodyFatKg: string;
  bodyFatPercentage: string;
  condition: string;
  cycleMinutes: string;
  dailyReport: string;
  eveningWeightKg: string;
  exerciseTime: string;
  meals: string[];
  morningWeightKg: string;
  performedOn: string;
  skeletalMuscleMassKg: string;
  sleep: string;
  stairClimberMinutes: string;
  steps: string;
  strengthExercises: ManualStrengthExerciseForm[];
  treadmillMinutes: string;
};

export type ManualWorkoutFormError = {
  field:
    | 'exerciseTime'
    | 'performedOn'
    | 'strengthExercises'
    | 'dailyReport'
    | 'cardio';
  message: string;
};

export function createEmptyManualWorkoutSet(): ManualWorkoutSetForm {
  return {
    reps: '',
    weightKg: '',
  };
}

export function createEmptyManualStrengthExercise(): ManualStrengthExerciseForm {
  return recalculateManualStrengthExercise({
    estimated1RM: 0,
    lbWeight: 0,
    maxWeight: 0,
    name: '',
    restTime: '',
    rir: '',
    sets: [
      createEmptyManualWorkoutSet(),
      createEmptyManualWorkoutSet(),
      createEmptyManualWorkoutSet(),
    ],
    volume: 0,
  });
}

export function createManualWorkoutFormState(): ManualWorkoutFormState {
  return {
    activityLevel: '',
    bodyFatKg: '',
    bodyFatPercentage: '',
    condition: '',
    cycleMinutes: '',
    dailyReport: '',
    eveningWeightKg: '',
    exerciseTime: '',
    meals: ['', '', '', ''],
    morningWeightKg: '',
    performedOn: getClientTodayDate(),
    skeletalMuscleMassKg: '',
    sleep: '',
    stairClimberMinutes: '',
    steps: '',
    strengthExercises: [createEmptyManualStrengthExercise()],
    treadmillMinutes: '',
  };
}

export function createManualWorkoutFormStateFromRecord(
  record: WorkoutRecordDto,
): ManualWorkoutFormState {
  const detail = record.manualDetail;
  const bodyComposition = record.bodyComposition;

  return {
    activityLevel: detail?.activityLevel ?? '',
    bodyFatKg: formatOptionalNumber(bodyComposition?.bodyFatKg),
    bodyFatPercentage: formatOptionalNumber(bodyComposition?.bodyFatPercentage),
    condition: detail?.condition ?? '',
    cycleMinutes: formatOptionalNumber(detail?.cardio?.cycleMinutes),
    dailyReport: detail?.dailyReport ?? detail?.memo ?? '',
    eveningWeightKg: formatOptionalNumber(bodyComposition?.eveningWeightKg),
    exerciseTime:
      detail?.exerciseTime ?? formatExerciseTimeLabel(record.durationSeconds),
    meals: padMeals(detail?.meals),
    morningWeightKg: formatOptionalNumber(
      bodyComposition?.morningWeightKg ?? bodyComposition?.weightKg,
    ),
    performedOn: record.performedOn,
    skeletalMuscleMassKg: formatOptionalNumber(
      bodyComposition?.skeletalMuscleMassKg,
    ),
    sleep: detail?.sleep ?? '',
    stairClimberMinutes: formatOptionalNumber(
      detail?.cardio?.stairClimberMinutes,
    ),
    steps: formatOptionalNumber(detail?.cardio?.steps),
    strengthExercises: detail?.strengthExercises?.length
      ? detail.strengthExercises.map((exercise) =>
          recalculateManualStrengthExercise({
            estimated1RM: exercise.estimated1RM ?? 0,
            lbWeight: exercise.lbWeight ?? 0,
            maxWeight: exercise.maxWeight ?? 0,
            name: exercise.name,
            restTime: exercise.restTime ?? '',
            rir: exercise.rir ?? '',
            sets:
              exercise.sets.length > 0
                ? exercise.sets.map((set) => ({
                    reps: formatOptionalNumber(set.reps),
                    weightKg: formatOptionalNumber(set.weightKg),
                  }))
                : [createEmptyManualWorkoutSet()],
            volume: exercise.volume ?? 0,
          }),
        )
      : [createEmptyManualStrengthExercise()],
    treadmillMinutes: formatOptionalNumber(detail?.cardio?.treadmillMinutes),
  };
}

export function buildManualWorkoutPayload(
  form: ManualWorkoutFormState,
): CreateManualWorkoutRecordDto | UpdateManualWorkoutRecordDto {
  const normalizedExercises = normalizeStrengthExercises(form.strengthExercises);
  const cardio = buildCardioPayload(form);
  const bodyComposition = buildBodyCompositionPayload(form);
  const meals = form.meals.map((meal) => meal.trim());
  const hasMeals = meals.some((meal) => meal.length > 0);
  const dailyReport = form.dailyReport.trim();
  const activityLevel = form.activityLevel.trim();
  const sleep = form.sleep.trim();
  const condition = form.condition.trim();
  const exerciseTime = form.exerciseTime.trim();
  const durationSeconds = parseExerciseTimeToSeconds(exerciseTime) ?? 0;

  return {
    activityLevel: activityLevel || undefined,
    bodyComposition: bodyComposition ?? undefined,
    cardio: cardio ?? undefined,
    condition: condition || undefined,
    dailyReport: dailyReport || undefined,
    durationSeconds,
    exerciseTime: exerciseTime || undefined,
    location: inferLocation(activityLevel),
    meals: hasMeals ? meals : undefined,
    memo: dailyReport || undefined,
    performedAt: getUtcISOString(),
    performedOn: form.performedOn,
    sleep: sleep || undefined,
    strengthExercises: normalizedExercises.length ? normalizedExercises : undefined,
    timeZone: getClientTimeZone(),
  };
}

export function validateManualWorkoutForm(
  form: ManualWorkoutFormState,
): ManualWorkoutFormError[] {
  const errors: ManualWorkoutFormError[] = [];
  const exerciseTime = form.exerciseTime.trim();
  const durationSeconds = parseExerciseTimeToSeconds(exerciseTime);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.performedOn.trim())) {
    errors.push({
      field: 'performedOn',
      message: '날짜는 YYYY-MM-DD 형식으로 입력해 주세요.',
    });
  }

  if (exerciseTime && durationSeconds === undefined) {
    errors.push({
      field: 'exerciseTime',
      message: '운동시간은 예시처럼 60분 또는 1시간 30분으로 입력해 주세요.',
    });
  }

  if (!hasAnyWorkoutDetail(form)) {
    errors.push({
      field: 'strengthExercises',
      message:
        '근력 운동, 유산소, 컨디션, 체성분, 식단, 하루 일과 중 하나는 입력해 주세요.',
    });
  }

  return errors;
}

export function calculateManualWorkoutVolume(
  exercises: ManualStrengthExerciseForm[],
) {
  return exercises.reduce((total, exercise) => total + exercise.volume, 0);
}

export function recalculateManualStrengthExercise(
  exercise: ManualStrengthExerciseForm,
): ManualStrengthExerciseForm {
  const stats = calculateStrengthExerciseStats(exercise.sets);

  return {
    ...exercise,
    estimated1RM: stats.estimated1RM,
    lbWeight: stats.lbWeight,
    maxWeight: stats.maxWeight,
    volume: stats.volume,
  };
}

export function formatExerciseTimeLabel(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}시간 ${minutes}분`;
  }

  if (hours > 0) {
    return `${hours}시간`;
  }

  if (minutes > 0) {
    return `${minutes}분`;
  }

  return '1분 미만';
}

export function parseExerciseTimeToSeconds(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  const hourMatch = trimmed.match(/(\d+)\s*시간/);
  const minuteMatch = trimmed.match(/(\d+)\s*분/);

  if (hourMatch || minuteMatch) {
    const hours = Number(hourMatch?.[1] ?? 0);
    const minutes = Number(minuteMatch?.[1] ?? 0);

    return hours * 3600 + minutes * 60;
  }

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed) * 60;
  }

  return undefined;
}

export function getExerciseNameSummary(record: WorkoutRecordDto) {
  const exercises = record.manualDetail?.strengthExercises ?? [];

  if (!exercises.length) {
    if (hasManualCardio(record.manualDetail?.cardio)) {
      return '유산소 운동';
    }

    return '-';
  }

  return exercises.length === 1
    ? exercises[0]?.name ?? '-'
    : `${exercises[0]?.name ?? '-'} +${exercises.length - 1}`;
}

export function getWorkoutDurationLabel(record: WorkoutRecordDto) {
  return record.manualDetail?.exerciseTime ?? formatExerciseTimeLabel(record.durationSeconds);
}

export function getDailyReport(record: WorkoutRecordDto) {
  return record.manualDetail?.dailyReport ?? record.manualDetail?.memo ?? '';
}

function padMeals(meals: string[] | undefined) {
  const normalized = (meals ?? []).slice(0, 4);

  while (normalized.length < 4) {
    normalized.push('');
  }

  return normalized;
}

function buildCardioPayload(form: ManualWorkoutFormState): ManualCardioDto | null {
  const treadmillMinutes = parseOptionalInteger(form.treadmillMinutes);
  const cycleMinutes = parseOptionalInteger(form.cycleMinutes);
  const stairClimberMinutes = parseOptionalInteger(form.stairClimberMinutes);
  const steps = parseOptionalInteger(form.steps);
  const durationSeconds =
    ((treadmillMinutes ?? 0) +
      (cycleMinutes ?? 0) +
      (stairClimberMinutes ?? 0)) *
    60;
  const payload: ManualCardioDto = {
    cycleMinutes,
    durationSeconds: durationSeconds > 0 ? durationSeconds : undefined,
    stairClimberMinutes,
    steps,
    treadmillMinutes,
  };

  return hasAnyValue(payload as Record<string, unknown>) ? payload : null;
}

function buildBodyCompositionPayload(form: ManualWorkoutFormState) {
  const morningWeightKg = parseOptionalNumber(form.morningWeightKg);
  const eveningWeightKg = parseOptionalNumber(form.eveningWeightKg);
  const payload: BodyCompositionDto = {
    bodyFatKg: parseOptionalNumber(form.bodyFatKg),
    bodyFatPercentage: parseOptionalNumber(form.bodyFatPercentage),
    eveningWeightKg,
    morningWeightKg,
    skeletalMuscleMassKg: parseOptionalNumber(form.skeletalMuscleMassKg),
    weightKg: morningWeightKg ?? eveningWeightKg,
  };

  return hasAnyValue(payload as Record<string, unknown>) ? payload : null;
}

function normalizeStrengthExercises(
  exercises: ManualStrengthExerciseForm[],
): ManualStrengthExerciseDto[] {
  const normalizedExercises: ManualStrengthExerciseDto[] = [];

  exercises.forEach((exercise) => {
      const name = exercise.name.trim();
      const sets = normalizeSets(exercise.sets);

      if (!name || !sets.length) {
        return;
      }

      const recalculated = recalculateManualStrengthExercise({
        ...exercise,
        name,
        sets: exercise.sets,
      });

      normalizedExercises.push({
        estimated1RM: recalculated.estimated1RM || undefined,
        lbWeight: recalculated.lbWeight || undefined,
        maxWeight: recalculated.maxWeight || undefined,
        name,
        restTime: exercise.restTime?.trim() || undefined,
        rir: exercise.rir?.trim() || undefined,
        sets,
        volume: recalculated.volume || undefined,
      });
    });

  return normalizedExercises;
}

function normalizeSets(sets: ManualWorkoutSetForm[]): ManualWorkoutSetDto[] {
  return sets
    .map((set) => ({
      reps: parseOptionalInteger(set.reps),
      weightKg: parseOptionalNumber(set.weightKg),
    }))
    .filter((set) => hasAnyValue(set));
}

function hasAnyWorkoutDetail(form: ManualWorkoutFormState) {
  const hasStrengthExercises = normalizeStrengthExercises(form.strengthExercises).length > 0;
  const hasCardio = buildCardioPayload(form) !== null;
  const hasBodyComposition = buildBodyCompositionPayload(form) !== null;
  const hasMeals = form.meals.some((meal) => meal.trim().length > 0);

  return (
    hasStrengthExercises ||
    hasCardio ||
    hasBodyComposition ||
    hasMeals ||
    form.sleep.trim().length > 0 ||
    form.condition.trim().length > 0 ||
    form.activityLevel.trim().length > 0 ||
    form.dailyReport.trim().length > 0
  );
}

function calculateStrengthExerciseStats(sets: ManualWorkoutSetForm[]) {
  const normalizedSets = sets.map((set) => ({
    reps: parseOptionalInteger(set.reps) ?? 0,
    weightKg: parseOptionalNumber(set.weightKg) ?? 0,
  }));
  const volume = normalizedSets.reduce(
    (total, set) => total + set.weightKg * set.reps,
    0,
  );
  const maxSet = normalizedSets.reduce(
    (best, set) => (set.weightKg > best.weightKg ? set : best),
    { reps: 0, weightKg: 0 },
  );
  const lbWeight = roundToSingleDecimal(maxSet.weightKg * 2.20462);
  const estimated1RM =
    maxSet.weightKg > 0 && maxSet.reps > 0
      ? maxSet.reps === 1
        ? maxSet.weightKg
        : roundToSingleDecimal(maxSet.weightKg * (1 + maxSet.reps / 30))
      : 0;

  return {
    estimated1RM,
    lbWeight,
    maxWeight: maxSet.weightKg,
    volume,
  };
}

function hasManualCardio(cardio: ManualCardioDto | undefined) {
  return Boolean(
    cardio?.steps ||
      cardio?.treadmillMinutes ||
      cardio?.cycleMinutes ||
      cardio?.stairClimberMinutes ||
      cardio?.durationSeconds,
  );
}

function inferLocation(activityLevel: string): CreateManualWorkoutRecordDto['location'] {
  if (activityLevel.includes('홈')) {
    return 'home';
  }

  if (activityLevel.includes('헬스')) {
    return 'gym';
  }

  return 'unknown';
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

function formatOptionalNumber(value: number | undefined) {
  return value === undefined || value === null || value === 0
    ? ''
    : String(value);
}

function hasAnyValue(record: Record<string, unknown>) {
  return Object.values(record).some((value) => value !== undefined);
}

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

export const DEFAULT_MANUAL_WORKOUT_DATE = getClientTodayDate();
