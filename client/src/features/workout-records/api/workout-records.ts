import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { getWorkoutReportSummaryQueryKeyPrefix } from 'features/workout-reports/api/workout-report-summary';
import {
  workoutRecordsControllerCreateManualWorkoutRecord,
  type workoutRecordsControllerCreateManualWorkoutRecordResponse,
  workoutRecordsControllerDeleteWorkoutRecord,
  type workoutRecordsControllerDeleteWorkoutRecordResponse,
  workoutRecordsControllerGetWorkoutRecord,
  type workoutRecordsControllerGetWorkoutRecordResponse,
  workoutRecordsControllerListWorkoutRecords,
  type workoutRecordsControllerListWorkoutRecordsResponse,
  workoutRecordsControllerUpdateManualWorkoutRecord,
  type workoutRecordsControllerUpdateManualWorkoutRecordResponse,
} from 'shared/api/generated/endpoints/workout-records/workout-records';
import type {
  CreateManualWorkoutRecordDto,
  UpdateManualWorkoutRecordDto,
  WorkoutRecordDto,
  WorkoutRecordsControllerListWorkoutRecordsParams,
} from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';
import { getWeeklyTrackerSummaryQueryKeyPrefix } from 'shared/api/weekly-tracker';

export const WORKOUT_RECORDS_QUERY_KEY = ['workout-records'] as const;

export function getWorkoutRecordsQueryKey(
  userKey: string,
  params: WorkoutRecordsControllerListWorkoutRecordsParams = {},
) {
  return [...WORKOUT_RECORDS_QUERY_KEY, userKey, params] as const;
}

export function getWorkoutRecordsQueryKeyPrefix(userKey: string) {
  return [...WORKOUT_RECORDS_QUERY_KEY, userKey] as const;
}

export function getWorkoutRecordQueryKey(userKey: string, recordId: string) {
  return [...WORKOUT_RECORDS_QUERY_KEY, userKey, 'detail', recordId] as const;
}

export function selectWorkoutRecords(
  response: workoutRecordsControllerListWorkoutRecordsResponse,
): WorkoutRecordDto[] {
  if (response.status !== 200 || !response.data) {
    throw new Error('운동 기록 목록 조회에 실패했어요.');
  }

  return response.data;
}

export function selectWorkoutRecord(
  response: workoutRecordsControllerGetWorkoutRecordResponse,
): WorkoutRecordDto {
  if (response.status !== 200 || !response.data) {
    throw new Error('운동 기록 상세 조회에 실패했어요.');
  }

  return response.data;
}

export function selectCreatedManualWorkoutRecord(
  response: workoutRecordsControllerCreateManualWorkoutRecordResponse,
): WorkoutRecordDto {
  if (response.status !== 201 || !response.data) {
    throw new Error('운동 기록 저장에 실패했어요.');
  }

  return response.data;
}

export function selectUpdatedManualWorkoutRecord(
  response: workoutRecordsControllerUpdateManualWorkoutRecordResponse,
): WorkoutRecordDto {
  if (response.status !== 200 || !response.data) {
    throw new Error('운동 기록 수정에 실패했어요.');
  }

  return response.data;
}

export function assertWorkoutRecordDeleted(
  response: workoutRecordsControllerDeleteWorkoutRecordResponse,
) {
  if (response.status !== 200) {
    throw new Error('운동 기록 삭제에 실패했어요.');
  }

  return true;
}

export function useWorkoutRecords(
  params: WorkoutRecordsControllerListWorkoutRecordsParams = {},
) {
  const userKey = useTrackerUserKey();

  return useSuspenseQuery({
    queryFn: async () =>
      selectWorkoutRecords(
        await workoutRecordsControllerListWorkoutRecords(params, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
    queryKey: getWorkoutRecordsQueryKey(userKey, params),
  });
}

export function useWorkoutRecord(recordId: string) {
  const userKey = useTrackerUserKey();

  return useSuspenseQuery({
    queryFn: async () =>
      selectWorkoutRecord(
        await workoutRecordsControllerGetWorkoutRecord(recordId, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
    queryKey: getWorkoutRecordQueryKey(userKey, recordId),
  });
}

export function useCreateManualWorkoutRecord() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation<WorkoutRecordDto, Error, CreateManualWorkoutRecordDto>({
    mutationFn: async (payload) =>
      selectCreatedManualWorkoutRecord(
        await workoutRecordsControllerCreateManualWorkoutRecord(payload, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
    onSuccess: () => invalidateWorkoutRecordDependencies(queryClient, userKey),
  });
}

export function useUpdateManualWorkoutRecord() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation<
    WorkoutRecordDto,
    Error,
    { payload: UpdateManualWorkoutRecordDto; recordId: string }
  >({
    mutationFn: async ({ payload, recordId }) =>
      selectUpdatedManualWorkoutRecord(
        await workoutRecordsControllerUpdateManualWorkoutRecord(
          recordId,
          payload,
          {
            headers: {
              'x-user-key': userKey,
            },
          },
        ),
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getWorkoutRecordQueryKey(userKey, variables.recordId),
      });
      invalidateWorkoutRecordDependencies(queryClient, userKey);
    },
  });
}

export function useDeleteWorkoutRecord() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation<boolean, Error, string>({
    mutationFn: async (recordId) =>
      assertWorkoutRecordDeleted(
        await workoutRecordsControllerDeleteWorkoutRecord(recordId, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
    onSuccess: (_, recordId) => {
      queryClient.removeQueries({
        queryKey: getWorkoutRecordQueryKey(userKey, recordId),
      });
      invalidateWorkoutRecordDependencies(queryClient, userKey);
    },
  });
}

export function invalidateWorkoutRecordDependencies(
  queryClient: ReturnType<typeof useQueryClient>,
  userKey: string,
) {
  queryClient.invalidateQueries({
    queryKey: getWorkoutRecordsQueryKeyPrefix(userKey),
  });
  queryClient.invalidateQueries({
    queryKey: getWorkoutReportSummaryQueryKeyPrefix(userKey),
  });
  queryClient.invalidateQueries({
    queryKey: getWeeklyTrackerSummaryQueryKeyPrefix(userKey),
  });
}
