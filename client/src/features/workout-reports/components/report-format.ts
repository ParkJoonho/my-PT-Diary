import type {
  ConditionRecordDto,
  WorkoutRecordDto,
} from 'shared/api/generated/models';

export function formatReportNumber(value: number) {
  return value.toLocaleString();
}

export function formatReportVolume(value: number) {
  return value > 0 ? `${value.toLocaleString()}kg` : '0kg';
}

export function formatReportDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  return restMinutes ? `${hours}시간 ${restMinutes}분` : `${hours}시간`;
}

export function formatNullableScore(value: number | null | undefined) {
  return typeof value === 'number' ? value.toFixed(1) : '-';
}

export function buildVolumeTrend(records: WorkoutRecordDto[]) {
  return records
    .filter((record) => (record.summary.totalVolumeKg ?? 0) > 0)
    .slice()
    .sort((a, b) => a.performedOn.localeCompare(b.performedOn))
    .slice(-8)
    .map((record) => ({
      date: record.performedOn,
      value: record.summary.totalVolumeKg ?? 0,
    }));
}

export function buildConditionTrend(records: ConditionRecordDto[]) {
  return records
    .filter(
      (record) => typeof record.summary.averageConditionScore === 'number',
    )
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8)
    .map((record) => ({
      date: record.date,
      value: record.summary.averageConditionScore ?? 0,
    }));
}

export function buildBodyCompositionTrend(records: WorkoutRecordDto[]) {
  return records
    .filter((record) => (record.bodyComposition?.weightKg ?? 0) > 0)
    .slice()
    .sort((a, b) => a.performedOn.localeCompare(b.performedOn))
    .slice(-8)
    .map((record) => ({
      bodyFatPercentage: record.bodyComposition?.bodyFatPercentage,
      date: record.performedOn,
      skeletalMuscleMassKg: record.bodyComposition?.skeletalMuscleMassKg,
      weightKg: record.bodyComposition?.weightKg ?? 0,
    }));
}
