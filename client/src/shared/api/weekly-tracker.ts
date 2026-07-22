import {
  type weeklyTrackerControllerGetWeeklyTrackerSummaryResponse,
  useWeeklyTrackerControllerGetWeeklyTrackerSummarySuspense,
} from './generated/endpoints/weekly-tracker/weekly-tracker';
import type { WeeklyTrackerSummaryDto } from './generated/models';
import { getClientTodayDate } from '../lib/date';
import { useTrackerUserKey } from './user-key';

const WEEKLY_TRACKER_QUERY_KEY = ['weekly-tracker'] as const;

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
  >({ referenceDate }, {
    fetch: {
      headers: {
        'x-user-key': userKey,
      },
    },
    query: {
      queryKey: [...WEEKLY_TRACKER_QUERY_KEY, userKey, referenceDate],
      select: selectWeeklyTrackerSummary,
    },
  });
}
