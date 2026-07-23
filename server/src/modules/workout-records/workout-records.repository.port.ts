import { WorkoutRecordSource } from './dto/workout-record-response.dto';
import {
  ManualWorkoutRecordInput,
  RoutineWorkoutStepInput,
} from './workout-records.schemas';

export type WorkoutRecordSummary = {
  completedStepCount?: number;
  totalStepCount?: number;
  strengthStepCount?: number;
  cardioStepCount?: number;
  stretchStepCount?: number;
  strengthExerciseCount?: number;
  strengthSetCount?: number;
  totalVolumeKg?: number;
  cardioDurationSeconds?: number;
  cardioDistanceMeters?: number;
  cardioSteps?: number;
};

export type WorkoutRecordRow = {
  id: string;
  user_key: string;
  source: WorkoutRecordSource;
  title: string | null;
  routine_id: string | null;
  routine_label: string | null;
  routine_source: string | null;
  completed_at: string;
  completed_on: string;
  performed_on: string;
  time_zone: string;
  duration_seconds: number;
  steps: RoutineWorkoutStepInput[];
  summary: WorkoutRecordSummary;
  manual_detail: Omit<
    ManualWorkoutRecordInput,
    | 'bodyComposition'
    | 'durationSeconds'
    | 'performedAt'
    | 'performedOn'
    | 'timeZone'
    | 'title'
  > | null;
  body_composition: ManualWorkoutRecordInput['bodyComposition'] | null;
  weekly_completion_id: string | null;
  created_at: string;
  updated_at: string;
};

export abstract class WorkoutRecordsRepositoryPort {
  abstract createRoutineWorkoutCompletion(params: {
    recordId: string;
    weeklyCompletionId: string;
    userKey: string;
    routineId: string;
    routineLabel: string;
    routineSource: string;
    completedAt: string;
    completedOn: string;
    timeZone: string;
    durationSeconds: number;
    steps: RoutineWorkoutStepInput[];
    summary: WorkoutRecordSummary;
    weeklyCompletionNote: string;
  }): Promise<WorkoutRecordRow>;

  abstract createManualWorkoutRecord(params: {
    recordId: string;
    weeklyCompletionId: string;
    userKey: string;
    title: string;
    performedAt: string;
    performedOn: string;
    timeZone: string;
    durationSeconds: number;
    manualDetail: Omit<
      ManualWorkoutRecordInput,
      | 'bodyComposition'
      | 'durationSeconds'
      | 'performedAt'
      | 'performedOn'
      | 'timeZone'
      | 'title'
    >;
    bodyComposition: ManualWorkoutRecordInput['bodyComposition'] | null;
    summary: WorkoutRecordSummary;
    weeklyCompletionNote: string;
  }): Promise<WorkoutRecordRow>;

  abstract updateManualWorkoutRecord(params: {
    recordId: string;
    userKey: string;
    title: string;
    performedAt: string;
    performedOn: string;
    timeZone: string;
    durationSeconds: number;
    manualDetail: Omit<
      ManualWorkoutRecordInput,
      | 'bodyComposition'
      | 'durationSeconds'
      | 'performedAt'
      | 'performedOn'
      | 'timeZone'
      | 'title'
    >;
    bodyComposition: ManualWorkoutRecordInput['bodyComposition'] | null;
    summary: WorkoutRecordSummary;
    weeklyCompletionNote: string;
  }): Promise<WorkoutRecordRow>;

  abstract listWorkoutRecords(params: {
    userKey: string;
    from?: string;
    to?: string;
    source?: WorkoutRecordSource;
  }): Promise<WorkoutRecordRow[]>;

  abstract findWorkoutRecord(params: {
    userKey: string;
    id: string;
  }): Promise<WorkoutRecordRow | null>;

  abstract deleteWorkoutRecord(params: {
    userKey: string;
    id: string;
  }): Promise<WorkoutRecordRow>;
}
