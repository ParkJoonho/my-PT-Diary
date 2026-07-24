import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateManualWorkoutRecordDto } from './dto/create-manual-workout-record.dto';
import { CreateRoutineWorkoutCompletionDto } from './dto/create-routine-workout-completion.dto';
import {
  BodyCompositionDto,
  ManualCardioDto,
  ManualStrengthExerciseDto,
} from './dto/workout-record-response.dto';
import { ListWorkoutRecordsQueryDto } from './dto/list-workout-records-query.dto';
import { UpdateManualWorkoutRecordDto } from './dto/update-manual-workout-record.dto';
import {
  CreateRoutineWorkoutCompletionResponseDto,
  WorkoutRecordDto,
  WorkoutRecordSource,
  WorkoutStepType,
} from './dto/workout-record-response.dto';
import {
  WorkoutRecordRow,
  WorkoutRecordSummary,
  WorkoutRecordsRepositoryPort,
} from './workout-records.repository.port';
import {
  ManualWorkoutRecordInput,
  RoutineWorkoutStepInput,
} from './workout-records.schemas';

type ManualWorkoutRecordDetail = Omit<
  ManualWorkoutRecordInput,
  | 'bodyComposition'
  | 'durationSeconds'
  | 'performedAt'
  | 'performedOn'
  | 'timeZone'
  | 'title'
>;

type NormalizedCardio = NonNullable<ManualWorkoutRecordDetail['cardio']>;
type NormalizedStrengthExercise = NonNullable<
  ManualWorkoutRecordDetail['strengthExercises']
>[number];
type NormalizedBodyComposition = NonNullable<
  ManualWorkoutRecordInput['bodyComposition']
>;

@Injectable()
export class WorkoutRecordsService {
  constructor(
    private readonly workoutRecordsRepository: WorkoutRecordsRepositoryPort,
  ) {}

  async createRoutineWorkoutCompletion(
    userKey: string,
    dto: CreateRoutineWorkoutCompletionDto,
  ): Promise<CreateRoutineWorkoutCompletionResponseDto> {
    const recordId = randomUUID();
    const weeklyCompletionId = randomUUID();
    const summary = this.summarizeSteps(dto.steps);

    const record =
      await this.workoutRecordsRepository.createRoutineWorkoutCompletion({
        completedAt: dto.completedAt,
        completedOn: dto.completedOn,
        durationSeconds: dto.durationSeconds,
        recordId,
        routineId: dto.routineId,
        routineLabel: dto.routineLabel,
        routineSource: dto.routineSource,
        steps: dto.steps,
        summary,
        timeZone: dto.timeZone,
        userKey,
        weeklyCompletionId,
        weeklyCompletionNote: this.buildWeeklyCompletionNote(dto, summary),
      });

    return {
      weeklyCompletion: {
        completedOn: record.completed_on,
        id: weeklyCompletionId,
        source: WorkoutRecordSource.Routine,
      },
      workoutRecord: this.mapRecord(record),
    };
  }

  async createManualWorkoutRecord(
    userKey: string,
    dto: CreateManualWorkoutRecordDto,
  ): Promise<WorkoutRecordDto> {
    const recordId = randomUUID();
    const weeklyCompletionId = randomUUID();
    const normalizedCardio = this.normalizeCardio(dto.cardio);
    const normalizedExercises = this.normalizeStrengthExercises(
      dto.strengthExercises,
    );
    const normalizedBodyComposition = this.normalizeBodyComposition(
      dto.bodyComposition,
    );
    const manualDetail = this.pickManualDetail(
      dto,
      normalizedCardio,
      normalizedExercises,
    );
    const summary = this.summarizeManualWorkout(
      normalizedCardio,
      normalizedExercises,
    );
    const title = this.normalizeTitle(dto.title);

    const record =
      await this.workoutRecordsRepository.createManualWorkoutRecord({
        bodyComposition: normalizedBodyComposition,
        durationSeconds: dto.durationSeconds,
        manualDetail,
        performedAt: dto.performedAt,
        performedOn: dto.performedOn,
        recordId,
        summary,
        timeZone: dto.timeZone,
        title,
        userKey,
        weeklyCompletionId,
        weeklyCompletionNote: this.buildManualWeeklyCompletionNote(
          title,
          dto,
          summary,
          normalizedExercises,
        ),
      });

    return this.mapRecord(record);
  }

  async updateManualWorkoutRecord(
    userKey: string,
    recordId: string,
    dto: UpdateManualWorkoutRecordDto,
  ): Promise<WorkoutRecordDto> {
    const normalizedCardio = this.normalizeCardio(dto.cardio);
    const normalizedExercises = this.normalizeStrengthExercises(
      dto.strengthExercises,
    );
    const normalizedBodyComposition = this.normalizeBodyComposition(
      dto.bodyComposition,
    );
    const manualDetail = this.pickManualDetail(
      dto,
      normalizedCardio,
      normalizedExercises,
    );
    const summary = this.summarizeManualWorkout(
      normalizedCardio,
      normalizedExercises,
    );
    const title = this.normalizeTitle(dto.title);

    const record =
      await this.workoutRecordsRepository.updateManualWorkoutRecord({
        bodyComposition: normalizedBodyComposition,
        durationSeconds: dto.durationSeconds,
        manualDetail,
        performedAt: dto.performedAt,
        performedOn: dto.performedOn,
        recordId,
        summary,
        timeZone: dto.timeZone,
        title,
        userKey,
        weeklyCompletionNote: this.buildManualWeeklyCompletionNote(
          title,
          dto,
          summary,
          normalizedExercises,
        ),
      });

    return this.mapRecord(record);
  }

  async listWorkoutRecords(userKey: string, query: ListWorkoutRecordsQueryDto) {
    const records = await this.workoutRecordsRepository.listWorkoutRecords({
      from: query.from,
      source: query.source,
      to: query.to,
      userKey,
    });

    return records.map((record) => this.mapRecord(record));
  }

  async getWorkoutRecord(userKey: string, recordId: string) {
    const record = await this.workoutRecordsRepository.findWorkoutRecord({
      id: recordId,
      userKey,
    });

    if (!record) {
      throw new NotFoundException('Workout record not found.');
    }

    return this.mapRecord(record);
  }

  async deleteWorkoutRecord(userKey: string, recordId: string) {
    await this.workoutRecordsRepository.deleteWorkoutRecord({
      id: recordId,
      userKey,
    });

    return {
      deleted: true,
    };
  }

  private summarizeSteps(
    steps: RoutineWorkoutStepInput[],
  ): WorkoutRecordSummary {
    const completedSteps = steps.filter((step) => step.completed);

    return {
      cardioStepCount: completedSteps.filter(
        (step) => step.type === WorkoutStepType.Cardio,
      ).length,
      completedStepCount: completedSteps.length,
      strengthStepCount: completedSteps.filter(
        (step) => step.type === WorkoutStepType.Strength,
      ).length,
      stretchStepCount: completedSteps.filter(
        (step) => step.type === WorkoutStepType.Stretch,
      ).length,
      totalStepCount: steps.length,
    };
  }

  private buildWeeklyCompletionNote(
    dto: CreateRoutineWorkoutCompletionDto,
    summary: WorkoutRecordSummary,
  ) {
    return `${dto.routineLabel} 완료 ${summary.completedStepCount}/${summary.totalStepCount}`;
  }

  private summarizeManualWorkout(
    cardio: NormalizedCardio | undefined,
    strengthExercises: NormalizedStrengthExercise[],
  ): WorkoutRecordSummary {
    const strengthSetCount = strengthExercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    );
    const totalVolumeKg = strengthExercises.reduce(
      (total, exercise) => total + (exercise.volume ?? 0),
      0,
    );

    return {
      cardioDistanceMeters: cardio?.distanceMeters ?? 0,
      cardioDurationSeconds: cardio?.durationSeconds ?? 0,
      cardioSteps: cardio?.steps ?? 0,
      strengthExerciseCount: strengthExercises.length,
      strengthSetCount,
      totalVolumeKg,
    };
  }

  private buildManualWeeklyCompletionNote(
    title: string | null,
    dto: CreateManualWorkoutRecordDto,
    summary: WorkoutRecordSummary,
    strengthExercises: NormalizedStrengthExercise[],
  ) {
    const baseLabel =
      title ??
      strengthExercises[0]?.name ??
      this.normalizeOptionalText(dto.activityLevel) ??
      '개인 운동';
    const volume = summary.totalVolumeKg ? ` · ${summary.totalVolumeKg}kg` : '';
    const cardio = summary.cardioDurationSeconds
      ? ` · 유산소 ${Math.round(summary.cardioDurationSeconds / 60)}분`
      : '';

    return `${baseLabel}${volume}${cardio}`;
  }

  private pickManualDetail(
    dto: CreateManualWorkoutRecordDto,
    cardio: NormalizedCardio | undefined,
    strengthExercises: NormalizedStrengthExercise[],
  ): ManualWorkoutRecordDetail {
    return {
      activityLevel: this.normalizeOptionalText(dto.activityLevel),
      cardio,
      condition: this.normalizeOptionalText(dto.condition),
      dailyReport: this.normalizeOptionalText(dto.dailyReport),
      exerciseTime: this.normalizeOptionalText(dto.exerciseTime),
      location: dto.location,
      meals: this.normalizeMeals(dto.meals),
      memo: this.normalizeOptionalText(dto.memo),
      sleep: this.normalizeOptionalText(dto.sleep),
      strengthExercises: strengthExercises.length ? strengthExercises : undefined,
    };
  }

  private normalizeTitle(value: string | undefined) {
    const normalized = this.normalizeOptionalText(value);

    return normalized ?? null;
  }

  private normalizeCardio(cardio: ManualCardioDto | undefined) {
    if (!cardio) {
      return undefined;
    }

    const treadmillMinutes = this.normalizeOptionalInteger(
      cardio.treadmillMinutes,
    );
    const cycleMinutes = this.normalizeOptionalInteger(cardio.cycleMinutes);
    const stairClimberMinutes = this.normalizeOptionalInteger(
      cardio.stairClimberMinutes,
    );
    const derivedDurationSeconds =
      ((treadmillMinutes ?? 0) +
        (cycleMinutes ?? 0) +
        (stairClimberMinutes ?? 0)) *
      60;
    const durationSeconds =
      this.normalizeOptionalInteger(cardio.durationSeconds) ??
      (derivedDurationSeconds > 0 ? derivedDurationSeconds : undefined);
    const normalized: NormalizedCardio = {
      cycleMinutes,
      distanceMeters: this.normalizeOptionalInteger(cardio.distanceMeters),
      durationSeconds,
      stairClimberMinutes,
      steps: this.normalizeOptionalInteger(cardio.steps),
      treadmillMinutes,
    };

    return this.hasDefinedValue(normalized) ? normalized : undefined;
  }

  private normalizeStrengthExercises(
    strengthExercises: ManualStrengthExerciseDto[] | undefined,
  ) {
    if (!strengthExercises?.length) {
      return [];
    }

    const normalizedExercises: NormalizedStrengthExercise[] = [];

    strengthExercises.forEach((exercise) => {
        const name = exercise.name.trim();
        const sets = exercise.sets
          .map((set) => ({
            reps: this.normalizeOptionalInteger(set.reps),
            restSeconds: this.normalizeOptionalInteger(set.restSeconds),
            rir: this.normalizeOptionalInteger(set.rir),
            weightKg: this.normalizeOptionalNumber(set.weightKg),
          }))
          .filter((set) => this.hasDefinedValue(set));

        if (!name || !sets.length) {
          return;
        }

        const volume = sets.reduce(
          (total, set) => total + (set.weightKg ?? 0) * (set.reps ?? 0),
          0,
        );
        const maxSet = sets.reduce(
          (best, set) => ((set.weightKg ?? 0) > (best.weightKg ?? 0) ? set : best),
          {
            reps: 0,
            weightKg: 0,
          },
        );
        const maxWeight = maxSet.weightKg ?? 0;
        const lbWeight = this.roundToSingleDecimal(maxWeight * 2.20462);
        const estimated1RM =
          maxWeight > 0 && (maxSet.reps ?? 0) > 0
            ? maxSet.reps === 1
              ? maxWeight
              : this.roundToSingleDecimal(
                  maxWeight * (1 + (maxSet.reps ?? 0) / 30),
                )
            : 0;

        normalizedExercises.push({
          estimated1RM,
          lbWeight,
          maxWeight,
          name,
          restTime: this.normalizeOptionalText(exercise.restTime),
          rir: this.normalizeOptionalText(exercise.rir),
          sets,
          volume,
        });
      });

    return normalizedExercises;
  }

  private normalizeBodyComposition(bodyComposition: BodyCompositionDto | undefined) {
    if (!bodyComposition) {
      return null;
    }

    const morningWeightKg = this.normalizeOptionalNumber(
      bodyComposition.morningWeightKg,
    );
    const eveningWeightKg = this.normalizeOptionalNumber(
      bodyComposition.eveningWeightKg,
    );
    const normalized: NormalizedBodyComposition = {
      bodyFatKg: this.normalizeOptionalNumber(bodyComposition.bodyFatKg),
      bodyFatPercentage: this.normalizeOptionalNumber(
        bodyComposition.bodyFatPercentage,
      ),
      eveningWeightKg,
      morningWeightKg,
      skeletalMuscleMassKg: this.normalizeOptionalNumber(
        bodyComposition.skeletalMuscleMassKg,
      ),
      weightKg:
        this.normalizeOptionalNumber(bodyComposition.weightKg) ??
        morningWeightKg ??
        eveningWeightKg,
    };

    return this.hasDefinedValue(normalized) ? normalized : null;
  }

  private normalizeMeals(meals: string[] | undefined) {
    if (!meals?.length) {
      return undefined;
    }

    const normalized = meals
      .map((meal) => meal.trim())
      .filter((meal) => meal.length > 0);

    return normalized.length ? normalized : undefined;
  }

  private normalizeOptionalText(value: string | undefined) {
    const normalized = value?.trim();

    return normalized ? normalized : undefined;
  }

  private normalizeOptionalNumber(value: number | undefined) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
      ? value
      : undefined;
  }

  private normalizeOptionalInteger(value: number | undefined) {
    const normalized = this.normalizeOptionalNumber(value);

    return normalized === undefined ? undefined : Math.round(normalized);
  }

  private hasDefinedValue(record: Record<string, unknown>) {
    return Object.values(record).some((value) => value !== undefined);
  }

  private roundToSingleDecimal(value: number) {
    return Math.round(value * 10) / 10;
  }

  private mapRecord(record: WorkoutRecordRow): WorkoutRecordDto {
    return {
      completedAt: this.toUtcISOString(record.completed_at),
      completedOn: record.completed_on,
      createdAt: this.toUtcISOString(record.created_at),
      bodyComposition: record.body_composition ?? null,
      durationSeconds: record.duration_seconds,
      id: record.id,
      manualDetail: record.manual_detail,
      performedAt: this.toUtcISOString(record.performed_at),
      performedOn: record.performed_on,
      routineId: record.routine_id,
      routineLabel: record.routine_label,
      routineSource: record.routine_source,
      source: record.source,
      steps: record.steps,
      summary: record.summary,
      timeZone: record.time_zone,
      title: record.title ?? record.routine_label,
      updatedAt: this.toUtcISOString(record.updated_at),
      weeklyCompletionId: record.weekly_completion_id,
    };
  }

  private toUtcISOString(value: string) {
    return new Date(value).toISOString();
  }
}
