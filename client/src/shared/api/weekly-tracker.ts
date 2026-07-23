import { getClientTodayDate } from '../lib/date';
import {
  useWeeklyTrackerControllerGetWeeklyTrackerSummarySuspense,
  type weeklyTrackerControllerGetWeeklyTrackerSummaryResponse,
} from './generated/endpoints/weekly-tracker/weekly-tracker';
import type { WeeklyTrackerSummaryDto } from './generated/models';
import { useTrackerUserKey } from './user-key';

export const WEEKLY_TRACKER_QUERY_KEY = ['weekly-tracker'] as const;

export function getWeeklyTrackerSummaryQueryKey(
  userKey: string,
  referenceDate: string,
) {
  return [...WEEKLY_TRACKER_QUERY_KEY, userKey, referenceDate] as const;
}

export function getWeeklyTrackerSummaryQueryKeyPrefix(userKey: string) {
  return [...WEEKLY_TRACKER_QUERY_KEY, userKey] as const;
}

export function selectWeeklyTrackerSummary(
  response: weeklyTrackerControllerGetWeeklyTrackerSummaryResponse,
): WeeklyTrackerSummaryDto {
  if (response.status !== 200 || !response.data) {
    throw new Error('Weekly tracker summary request failed.');
  }

  return response.data;
}

export function useWeeklyTrackerSummary() {
  const userKey = useTrackerUserKey();
  const referenceDate = getClientTodayDate();

  return useWeeklyTrackerControllerGetWeeklyTrackerSummarySuspense<
    WeeklyTrackerSummaryDto,
    Error
  >(
    { referenceDate },
    {
      fetch: {
        headers: {
          'x-user-key': userKey,
        },
      },
      query: {
        queryKey: getWeeklyTrackerSummaryQueryKey(userKey, referenceDate),
        select: selectWeeklyTrackerSummary,
      },
    },
  );
}
