import { getClientTodayDate } from 'shared/lib/date';

export const WORKOUT_RECORD_PAGE_SIZE = 10;
export const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

export type DateRange = {
  end: string | null;
  start: string | null;
};

export function formatGroupDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const safeYear = year || 0;
  const safeMonth = month || 1;
  const safeDay = day || 1;
  const dayOfWeek = new Date(safeYear, safeMonth - 1, safeDay).getDay();

  return {
    display: `${safeMonth}/${safeDay} (${DAY_KO[dayOfWeek] ?? DAY_KO[0]})`,
    isToday: date === getClientTodayDate(),
  };
}

export function formatShortDate(date: string) {
  const [, month, day] = date.split('-').map(Number);
  const safeMonth = month || 1;
  const safeDay = day || 1;

  return `${safeMonth}/${safeDay}`;
}

export function formatRangeLabel(range: DateRange) {
  if (!range.start) {
    return '전체';
  }

  if (!range.end || range.start === range.end) {
    return formatShortDate(range.start);
  }

  return `${formatShortDate(range.start)} ~ ${formatShortDate(range.end)}`;
}
