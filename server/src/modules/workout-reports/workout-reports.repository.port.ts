import { ConditionRecordRow } from '../condition-records/condition-records.repository.port';
import { WorkoutRecordRow } from '../workout-records/workout-records.repository.port';

export abstract class WorkoutReportsRepositoryPort {
  abstract listWorkoutRecordsForReport(params: {
    userKey: string;
  }): Promise<WorkoutRecordRow[]>;

  abstract listConditionRecordsForReport(params: {
    userKey: string;
  }): Promise<ConditionRecordRow[]>;
}
