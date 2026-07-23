import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateManualWorkoutRecordDto } from './dto/create-manual-workout-record.dto';
import { CreateRoutineWorkoutCompletionDto } from './dto/create-routine-workout-completion.dto';
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
    const manualDetail = this.pickManualDetail(dto);
    const summary = this.summarizeManualWorkout(dto);

    const record =
      await this.workoutRecordsRepository.createManualWorkoutRecord({
        bodyComposition: dto.bodyComposition ?? null,
        durationSeconds: dto.durationSeconds,
        manualDetail,
        performedAt: dto.performedAt,
        performedOn: dto.performedOn,
        recordId,
        summary,
        timeZone: dto.timeZone,
        title: dto.title,
        userKey,
        weeklyCompletionId,
        weeklyCompletionNote: this.buildManualWeeklyCompletionNote(
          dto,
          summary,
        ),
      });

    return this.mapRecord(record);
  }

  async updateManualWorkoutRecord(
    userKey: string,
    recordId: string,
    dto: UpdateManualWorkoutRecordDto,
  ): Promise<WorkoutRecordDto> {
    const manualDetail = this.pickManualDetail(dto);
    const summary = this.summarizeManualWorkout(dto);

    const record =
      await this.workoutRecordsRepository.updateManualWorkoutRecord({
        bodyComposition: dto.bodyComposition ?? null,
        durationSeconds: dto.durationSeconds,
        manualDetail,
        performedAt: dto.performedAt,
        performedOn: dto.performedOn,
        recordId,
        summary,
        timeZone: dto.timeZone,
        title: dto.title,
        userKey,
        weeklyCompletionNote: this.buildManualWeeklyCompletionNote(
          dto,
          summary,
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
    dto: CreateManualWorkoutRecordDto,
  ): WorkoutRecordSummary {
    const strengthExercises = dto.strengthExercises ?? [];
    const strengthSetCount = strengthExercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    );
    const totalVolumeKg = strengthExercises.reduce(
      (total, exercise) =>
        total +
        exercise.sets.reduce(
          (exerciseTotal, set) =>
            exerciseTotal + (set.weightKg ?? 0) * (set.reps ?? 0),
          0,
        ),
      0,
    );

    return {
      cardioDistanceMeters: dto.cardio?.distanceMeters ?? 0,
      cardioDurationSeconds: dto.cardio?.durationSeconds ?? 0,
      cardioSteps: dto.cardio?.steps ?? 0,
      strengthExerciseCount: strengthExercises.length,
      strengthSetCount,
      totalVolumeKg,
    };
  }

  private buildManualWeeklyCompletionNote(
    dto: CreateManualWorkoutRecordDto,
    summary: WorkoutRecordSummary,
  ) {
    const volume = summary.totalVolumeKg ? ` · ${summary.totalVolumeKg}kg` : '';
    const cardio = summary.cardioDurationSeconds
      ? ` · 유산소 ${Math.round(summary.cardioDurationSeconds / 60)}분`
      : '';

    return `${dto.title}${volume}${cardio}`;
  }

  private pickManualDetail(
    dto: CreateManualWorkoutRecordDto,
  ): ManualWorkoutRecordDetail {
    return {
      cardio: dto.cardio,
      location: dto.location,
      memo: dto.memo,
      strengthExercises: dto.strengthExercises ?? [],
    };
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
      performedAt: this.toUtcISOString(record.completed_at),
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
