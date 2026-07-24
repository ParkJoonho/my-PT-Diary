import type { ManualCardioDto, WorkoutRecordDto } from 'shared/api/generated/models';
import {
  formatExerciseTimeLabel,
  getDailyReport,
  getExerciseNameSummary,
  getWorkoutDurationLabel,
} from './manual-workout-form';

export function getWorkoutRecordTitle(record: WorkoutRecordDto) {
  if (record.source === 'manual') {
    return getExerciseNameSummary(record);
  }

  return record.title ?? record.routineLabel ?? '운동 기록';
}

export function getWorkoutRecordKindLabel(record: WorkoutRecordDto) {
  return record.source === 'routine' ? '루틴 완료' : '개인 운동';
}

export function formatDurationSeconds(seconds: number) {
  const minutes = Math.round(seconds / 60);

  if (minutes <= 0) {
    return '0분';
  }

  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  return restMinutes ? `${hours}시간 ${restMinutes}분` : `${hours}시간`;
}

export function formatWorkoutDuration(record: WorkoutRecordDto) {
  return record.source === 'manual'
    ? getWorkoutDurationLabel(record)
    : formatExerciseTimeLabel(record.durationSeconds);
}

export function formatWorkoutVolume(record: WorkoutRecordDto) {
  const volume = record.summary.totalVolumeKg ?? 0;

  return volume > 0 ? `${volume.toLocaleString()}kg` : '-';
}

export function formatWorkoutCardio(record: WorkoutRecordDto) {
  if (record.source === 'manual') {
    return formatManualCardio(record.manualDetail?.cardio);
  }

  const seconds = record.summary.cardioDurationSeconds ?? 0;

  return seconds > 0 ? formatDurationSeconds(seconds) : '-';
}

export function getWorkoutRecordSummaryLine(record: WorkoutRecordDto) {
  if (record.source === 'routine') {
    const completed = record.summary.completedStepCount ?? 0;
    const total = record.summary.totalStepCount ?? record.steps.length;

    return `${completed}/${total}개 항목 완료`;
  }

  const dailyReport = getDailyReport(record);

  return dailyReport || '운동 기록이 저장되어 있어요.';
}

function formatManualCardio(cardio: ManualCardioDto | undefined) {
  if (!cardio) {
    return '-';
  }

  const labels: string[] = [];

  if (cardio.treadmillMinutes) {
    labels.push(`러닝머신 ${cardio.treadmillMinutes}분`);
  }

  if (cardio.cycleMinutes) {
    labels.push(`사이클 ${cardio.cycleMinutes}분`);
  }

  if (cardio.stairClimberMinutes) {
    labels.push(`천국의 계단 ${cardio.stairClimberMinutes}분`);
  }

  if (!labels.length && cardio.steps) {
    labels.push(`${cardio.steps.toLocaleString()}걸음`);
  }

  if (!labels.length && cardio.durationSeconds) {
    labels.push(formatDurationSeconds(cardio.durationSeconds));
  }

  return labels.length ? labels.join(' · ') : '-';
}
