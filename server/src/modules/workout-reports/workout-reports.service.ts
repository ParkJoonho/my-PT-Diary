import { Injectable } from '@nestjs/common';
import { endOfWeek, format, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { WorkoutRecordSource } from '../workout-records/dto/workout-record-response.dto';
import { ConditionRecordRow } from '../condition-records/condition-records.repository.port';
import { WorkoutRecordRow } from '../workout-records/workout-records.repository.port';
import { WorkoutReportSummaryQueryDto } from './dto/workout-report-summary-query.dto';
import { WorkoutReportSummaryDto } from './dto/workout-report-summary-response.dto';
import { WorkoutReportsRepositoryPort } from './workout-reports.repository.port';

const REPORT_WEEK_COUNT = 12;
const REPORT_TREND_LIMIT = 30;
const DATE_FORMAT = 'yyyy-MM-dd';
const REPORT_WEEK_STARTS_ON = 0;

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
      startOfWeek(reference, { weekStartsOn: REPORT_WEEK_STARTS_ON }),
    );
    const weekEndDate = this.formatDate(
      endOfWeek(reference, { weekStartsOn: REPORT_WEEK_STARTS_ON }),
    );

    const [workoutRecords, conditionRecords] = await Promise.all([
      this.workoutReportsRepository.listWorkoutRecordsForReport({ userKey }),
      this.workoutReportsRepository.listConditionRecordsForReport({ userKey }),
    ]);
    const manualWorkoutRecords = workoutRecords.filter(
      (record) => record.source === WorkoutRecordSource.Manual,
    );

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
      manualTotals: {
        totalVolumeKg: this.sumSummaryField(manualWorkoutRecords, 'totalVolumeKg'),
        workoutRecordCount: manualWorkoutRecords.length,
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
      bodyCompositionTrend: this.buildBodyCompositionTrend(manualWorkoutRecords),
      conditionTrend: this.buildConditionTrend(conditionRecords),
      volumeTrend: this.buildVolumeTrend(workoutRecords),
      weightTrend: this.buildWeightTrend(manualWorkoutRecords),
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
        startOfWeek(weekReference, { weekStartsOn: REPORT_WEEK_STARTS_ON }),
      );
      const weekEndDate = this.formatDate(
        endOfWeek(weekReference, { weekStartsOn: REPORT_WEEK_STARTS_ON }),
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

  private buildVolumeTrend(workoutRecords: WorkoutRecordRow[]) {
    return workoutRecords
      .filter((record) => (record.summary.totalVolumeKg ?? 0) > 0)
      .slice()
      .sort((left, right) =>
        this.compareRecordDate(left, right, this.recordDate(left), this.recordDate(right)),
      )
      .slice(-REPORT_TREND_LIMIT)
      .map((record) => ({
        date: this.recordDate(record),
        value: record.summary.totalVolumeKg ?? 0,
      }));
  }

  private buildWeightTrend(workoutRecords: WorkoutRecordRow[]) {
    return workoutRecords
      .map((record) => ({
        date: this.recordDate(record),
        record,
        value:
          record.body_composition?.morningWeightKg ??
          record.body_composition?.weightKg ??
          0,
      }))
      .filter((record) => record.value > 0)
      .sort((left, right) =>
        this.compareRecordDate(
          left.record,
          right.record,
          left.date,
          right.date,
        ),
      )
      .slice(-REPORT_TREND_LIMIT)
      .map(({ date, value }) => ({
        date,
        value,
      }));
  }

  private buildBodyCompositionTrend(workoutRecords: WorkoutRecordRow[]) {
    return workoutRecords
      .map((record) => {
        const skeletalMuscleMassKg =
          record.body_composition?.skeletalMuscleMassKg ?? null;
        const bodyFatPercentage =
          record.body_composition?.bodyFatPercentage ?? null;
        const weightKg =
          record.body_composition?.morningWeightKg ??
          record.body_composition?.weightKg ??
          0;

        return {
          bodyFatPercentage,
          date: this.recordDate(record),
          record,
          skeletalMuscleMassKg,
          weightKg,
        };
      })
      .filter(
        (record) =>
          record.weightKg > 0 ||
          (record.skeletalMuscleMassKg ?? 0) > 0 ||
          (record.bodyFatPercentage ?? 0) > 0,
      )
      .sort((left, right) =>
        this.compareRecordDate(
          left.record,
          right.record,
          left.date,
          right.date,
        ),
      )
      .slice(-REPORT_TREND_LIMIT)
      .map(({ bodyFatPercentage, date, skeletalMuscleMassKg, weightKg }) => ({
        bodyFatPercentage,
        date,
        skeletalMuscleMassKg,
        weightKg,
      }));
  }

  private buildConditionTrend(conditionRecords: ConditionRecordRow[]) {
    return conditionRecords
      .map((record) => ({
        createdAt: record.created_at,
        date: record.checked_on,
        value: record.summary.averageConditionScore,
      }))
      .filter((record): record is { createdAt: string; date: string; value: number } =>
        typeof record.value === 'number' && record.value > 0,
      )
      .sort((left, right) => {
        if (left.date === right.date) {
          return left.createdAt.localeCompare(right.createdAt);
        }

        return left.date.localeCompare(right.date);
      })
      .slice(-REPORT_TREND_LIMIT)
      .map(({ date, value }) => ({
        date,
        value,
      }));
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

  private compareRecordDate(
    leftRecord: WorkoutRecordRow,
    rightRecord: WorkoutRecordRow,
    leftDate: string,
    rightDate: string,
  ) {
    if (leftDate === rightDate) {
      return this.recordDateTime(leftRecord).localeCompare(
        this.recordDateTime(rightRecord),
      );
    }

    return leftDate.localeCompare(rightDate);
  }

  private recordDateTime(record: WorkoutRecordRow) {
    return record.performed_at ?? record.completed_at;
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
