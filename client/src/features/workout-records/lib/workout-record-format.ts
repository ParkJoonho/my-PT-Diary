import type { WorkoutRecordDto } from 'shared/api/generated/models';

export function getWorkoutRecordTitle(record: WorkoutRecordDto) {
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

export function formatWorkoutVolume(record: WorkoutRecordDto) {
  const volume = record.summary.totalVolumeKg ?? 0;

  return volume > 0 ? `${volume.toLocaleString()}kg` : '-';
}

export function formatWorkoutCardio(record: WorkoutRecordDto) {
  const seconds = record.summary.cardioDurationSeconds ?? 0;

  return seconds > 0 ? formatDurationSeconds(seconds) : '-';
}

export function getWorkoutRecordSummaryLine(record: WorkoutRecordDto) {
  if (record.source === 'routine') {
    const completed = record.summary.completedStepCount ?? 0;
    const total = record.summary.totalStepCount ?? record.steps.length;

    return `${completed}/${total}개 항목 완료`;
  }

  const setCount = record.summary.strengthSetCount ?? 0;
  const cardioSeconds = record.summary.cardioDurationSeconds ?? 0;

  if (setCount > 0 && cardioSeconds > 0) {
    return `근력 ${setCount}세트 · 유산소 ${formatDurationSeconds(cardioSeconds)}`;
  }

  if (setCount > 0) {
    return `근력 ${setCount}세트`;
  }

  if (cardioSeconds > 0) {
    return `유산소 ${formatDurationSeconds(cardioSeconds)}`;
  }

  return record.manualDetail?.memo ?? '기록된 메모가 있어요.';
}
