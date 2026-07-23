import { Injectable } from '@nestjs/common';
import { endOfWeek, format, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { ConditionRecordRow } from '../condition-records/condition-records.repository.port';
import { WorkoutRecordRow } from '../workout-records/workout-records.repository.port';
import { WorkoutReportSummaryQueryDto } from './dto/workout-report-summary-query.dto';
import { WorkoutReportSummaryDto } from './dto/workout-report-summary-response.dto';
import { WorkoutReportsRepositoryPort } from './workout-reports.repository.port';

const REPORT_WEEK_COUNT = 12;
const DATE_FORMAT = 'yyyy-MM-dd';

@Injectable()
export class WorkoutReportsService {
  constructor(
    private readonly workoutReportsRepository: WorkoutReportsRepositoryPort,
  ) {}

  async getSummary(
    userKey: string,
    query: WorkoutReportSummaryQueryDto,
  ): Promise<WorkoutReportSummaryDto> {
    const referenceDate =
      query.referenceDate ?? format(new Date(), DATE_FORMAT);
    const reference = parseISO(referenceDate);
    const weekStartDate = this.formatDate(
      startOfWeek(reference, { weekStartsOn: 1 }),
    );
    const weekEndDate = this.formatDate(
      endOfWeek(reference, { weekStartsOn: 1 }),
    );

    const [workoutRecords, conditionRecords] = await Promise.all([
      this.workoutReportsRepository.listWorkoutRecordsForReport({ userKey }),
      this.workoutReportsRepository.listConditionRecordsForReport({ userKey }),
    ]);

    const currentWeekRecords = workoutRecords.filter((record) =>
      this.isDateBetween(this.recordDate(record), weekStartDate, weekEndDate),
    );

    return {
      condition: {
        averageConditionScore: this.average(
          conditionRecords
            .map((record) => record.summary.averageConditionScore)
            .filter((score): score is number => score !== null),
        ),
        averageSorenessScore: this.average(
          conditionRecords
            .map((record) => record.summary.averageSorenessScore)
            .filter((score): score is number => score !== null),
        ),
      },
      currentWeek: {
        weekEndDate,
        weekStartDate,
        workoutDayCount: this.uniqueWorkoutDayCount(currentWeekRecords),
        workoutRecordCount: currentWeekRecords.length,
      },
      referenceDate,
      totals: {
        cardioDurationSeconds: this.sumSummaryField(
          workoutRecords,
          'cardioDurationSeconds',
        ),
        conditionRecordCount: conditionRecords.length,
        durationSeconds: workoutRecords.reduce(
          (total, record) => total + record.duration_seconds,
          0,
        ),
        totalVolumeKg: this.sumSummaryField(workoutRecords, 'totalVolumeKg'),
        workoutDayCount: this.uniqueWorkoutDayCount(workoutRecords),
        workoutRecordCount: workoutRecords.length,
      },
      weeklyFrequency: this.buildWeeklyFrequency(workoutRecords, reference),
    };
  }

  private buildWeeklyFrequency(
    workoutRecords: WorkoutRecordRow[],
    reference: Date,
  ) {
    return Array.from({ length: REPORT_WEEK_COUNT }, (_, index) => {
      const weekReference = subWeeks(reference, REPORT_WEEK_COUNT - index - 1);
      const weekStartDate = this.formatDate(
        startOfWeek(weekReference, { weekStartsOn: 1 }),
      );
      const weekEndDate = this.formatDate(
        endOfWeek(weekReference, { weekStartsOn: 1 }),
      );
      const records = workoutRecords.filter((record) =>
        this.isDateBetween(this.recordDate(record), weekStartDate, weekEndDate),
      );

      return {
        weekEndDate,
        weekStartDate,
        workoutDayCount: this.uniqueWorkoutDayCount(records),
        workoutRecordCount: records.length,
      };
    });
  }

  private uniqueWorkoutDayCount(records: WorkoutRecordRow[]) {
    return new Set(records.map((record) => this.recordDate(record))).size;
  }

  private sumSummaryField(
    records: WorkoutRecordRow[],
    key: 'cardioDurationSeconds' | 'totalVolumeKg',
  ) {
    return records.reduce(
      (total, record) => total + (record.summary[key] ?? 0),
      0,
    );
  }

  private recordDate(record: WorkoutRecordRow) {
    return record.performed_on ?? record.completed_on;
  }

  private isDateBetween(value: string, from: string, to: string) {
    return value >= from && value <= to;
  }

  private average(values: number[]) {
    if (!values.length) {
      return null;
    }

    return Number(
      (
        values.reduce((total, value) => total + value, 0) / values.length
      ).toFixed(1),
    );
  }

  private formatDate(date: Date) {
    return format(date, DATE_FORMAT);
  }
}
