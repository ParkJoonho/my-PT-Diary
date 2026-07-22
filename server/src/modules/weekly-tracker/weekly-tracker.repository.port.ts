import { WeeklyWorkoutSource } from './dto/create-weekly-workout.dto';

export type WorkoutCompletionRow = {
  id: string;
  completed_on: string;
  source: WeeklyWorkoutSource;
  note: string | null;
  created_at: string;
};

export type CompletionCount = {
  completedOn: string;
  completionCount: number;
};

export abstract class WeeklyTrackerRepositoryPort {
  abstract createWorkoutCompletion(params: {
    id: string;
    userKey: string;
    completedOn: string;
    source: WeeklyWorkoutSource;
    note: string | null;
  }): Promise<WorkoutCompletionRow>;

  abstract listWorkoutCompletionsForWeek(params: {
    userKey: string;
    weekStartDate: string;
    weekEndDate: string;
  }): Promise<WorkoutCompletionRow[]>;

  abstract getCompletionCountsForWeek(params: {
    userKey: string;
    weekStartDate: string;
    weekEndDate: string;
  }): Promise<CompletionCount[]>;

  abstract listDistinctCompletedDatesUntil(params: {
    userKey: string;
    referenceDate: string;
  }): Promise<string[]>;

  abstract deleteWorkoutCompletion(params: {
    userKey: string;
    id: string;
  }): Promise<void>;
}
