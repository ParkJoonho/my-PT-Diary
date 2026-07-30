import type { WorkoutReportSummaryDto } from 'shared/api/generated/models';
import type { OriginalAppIconName } from 'shared/components/icons/pt-diary-icons';

export type WorkoutReportTab =
  | 'volume'
  | 'weight'
  | 'bodyComp'
  | 'condition'
  | 'frequency';

export const WORKOUT_REPORT_TABS: Array<{
  icon: OriginalAppIconName;
  key: WorkoutReportTab;
  label: string;
}> = [
  { icon: 'barbell', key: 'volume', label: '볼륨' },
  { icon: 'body', key: 'weight', label: '체중' },
  { icon: 'pulse', key: 'bodyComp', label: '체성분' },
  { icon: 'heart', key: 'condition', label: '컨디션' },
  { icon: 'calendar', key: 'frequency', label: '빈도' },
];

export function formatShortDate(date: string) {
  const [, month, day] = date.split('-').map(Number);
  const safeMonth = month || 1;
  const safeDay = day || 1;

  return `${safeMonth}/${safeDay}`;
}

export function formatReportNumber(value: number) {
  return value.toLocaleString();
}

export function formatReportCompactNumber(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

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

export function getWorkoutReportInsight(
  summary: WorkoutReportSummaryDto,
  activeTab: WorkoutReportTab,
) {
  if (activeTab === 'volume' && summary.volumeTrend.length >= 2) {
    const last = summary.volumeTrend.at(-1)?.value ?? 0;
    const previous = summary.volumeTrend.at(-2)?.value ?? 0;

    if (last > previous) {
      return `지난 운동 대비 볼륨이 ${(last - previous).toFixed(0)}kg 늘었어요. 꾸준히 성장하고 있어요!`;
    }

    if (last < previous) {
      return `지난 운동 대비 볼륨이 ${(previous - last).toFixed(0)}kg 줄었어요. 컨디션을 점검해 보세요.`;
    }

    return '운동 볼륨을 잘 유지하고 있어요!';
  }

  if (activeTab === 'weight' && summary.weightTrend.length >= 2) {
    const first = summary.weightTrend[0]?.value ?? 0;
    const last = summary.weightTrend.at(-1)?.value ?? 0;
    const diff = last - first;

    if (Math.abs(diff) < 0.1) {
      return '체중을 안정적으로 유지하고 있어요.';
    }

    return diff > 0
      ? `첫 기록 대비 ${diff.toFixed(1)}kg 늘었어요.`
      : `첫 기록 대비 ${Math.abs(diff).toFixed(1)}kg 줄었어요.`;
  }

  if (activeTab === 'condition' && summary.conditionTrend.length >= 2) {
    const average =
      summary.conditionTrend.reduce((total, item) => total + item.value, 0) /
      summary.conditionTrend.length;
    const last = summary.conditionTrend.at(-1)?.value ?? 0;

    return last >= average
      ? `최근 컨디션이 평균(${average.toFixed(1)}) 이상으로 좋은 상태입니다.`
      : `최근 컨디션이 평균(${average.toFixed(1)}) 이하입니다. 충분한 휴식을 권장합니다.`;
  }

  if (activeTab === 'frequency' && summary.weeklyFrequency.length >= 2) {
    const average =
      summary.weeklyFrequency.reduce(
        (total, item) => total + item.workoutRecordCount,
        0,
      ) / summary.weeklyFrequency.length;

    return `주당 평균 ${average.toFixed(1)}회 운동하고 있습니다. ${
      average >= 3 ? '꾸준히 잘하고 있어요!' : '주 3회 이상을 목표로 해보세요!'
    }`;
  }

  return null;
}
