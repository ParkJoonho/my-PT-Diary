import { format } from 'date-fns';

export const DEFAULT_TIME_ZONE = 'Asia/Seoul';
export const ISO_DATE_FORMAT = 'yyyy-MM-dd';

export function getClientTimeZone() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return timeZone || DEFAULT_TIME_ZONE;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

export function formatClientDate(date: Date) {
  return format(date, ISO_DATE_FORMAT);
}

export function getClientTodayDate() {
  return formatClientDate(new Date());
}

export function getUtcISOString(date = new Date()) {
  return date.toISOString();
}
