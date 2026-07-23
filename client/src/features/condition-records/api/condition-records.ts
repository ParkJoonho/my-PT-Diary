import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { getWorkoutReportSummaryQueryKeyPrefix } from 'features/workout-reports/api/workout-report-summary';
import {
  conditionRecordsControllerCreateConditionRecord,
  type conditionRecordsControllerCreateConditionRecordResponse,
  conditionRecordsControllerDeleteConditionRecord,
  type conditionRecordsControllerDeleteConditionRecordResponse,
  conditionRecordsControllerGetConditionRecord,
  type conditionRecordsControllerGetConditionRecordResponse,
  conditionRecordsControllerListConditionRecords,
  type conditionRecordsControllerListConditionRecordsResponse,
  conditionRecordsControllerUpdateConditionRecord,
  type conditionRecordsControllerUpdateConditionRecordResponse,
} from 'shared/api/generated/endpoints/condition-records/condition-records';
import type {
  ConditionRecordDto,
  ConditionRecordsControllerListConditionRecordsParams,
  CreateConditionRecordDto,
  UpdateConditionRecordDto,
} from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';

export const CONDITION_RECORDS_QUERY_KEY = ['condition-records'] as const;

export function getConditionRecordsQueryKey(
  userKey: string,
  params: ConditionRecordsControllerListConditionRecordsParams = {},
) {
  return [...CONDITION_RECORDS_QUERY_KEY, userKey, params] as const;
}

export function getConditionRecordsQueryKeyPrefix(userKey: string) {
  return [...CONDITION_RECORDS_QUERY_KEY, userKey] as const;
}

export function getConditionRecordQueryKey(
  userKey: string,
  conditionId: string,
) {
  return [
    ...CONDITION_RECORDS_QUERY_KEY,
    userKey,
    'detail',
    conditionId,
  ] as const;
}

export function selectConditionRecords(
  response: conditionRecordsControllerListConditionRecordsResponse,
): ConditionRecordDto[] {
  if (response.status !== 200 || !response.data) {
    throw new Error('컨디션 기록 목록 조회에 실패했어요.');
  }

  return response.data;
}

export function selectConditionRecord(
  response: conditionRecordsControllerGetConditionRecordResponse,
): ConditionRecordDto {
  if (response.status !== 200 || !response.data) {
    throw new Error('컨디션 기록 상세 조회에 실패했어요.');
  }

  return response.data;
}

export function selectCreatedConditionRecord(
  response: conditionRecordsControllerCreateConditionRecordResponse,
): ConditionRecordDto {
  if (response.status !== 201 || !response.data) {
    throw new Error('컨디션 기록 저장에 실패했어요.');
  }

  return response.data;
}

export function selectUpdatedConditionRecord(
  response: conditionRecordsControllerUpdateConditionRecordResponse,
): ConditionRecordDto {
  if (response.status !== 200 || !response.data) {
    throw new Error('컨디션 기록 수정에 실패했어요.');
  }

  return response.data;
}

export function assertConditionRecordDeleted(
  response: conditionRecordsControllerDeleteConditionRecordResponse,
) {
  if (response.status !== 200) {
    throw new Error('컨디션 기록 삭제에 실패했어요.');
  }

  return true;
}

export function useConditionRecords(
  params: ConditionRecordsControllerListConditionRecordsParams = {},
) {
  const userKey = useTrackerUserKey();

  return useSuspenseQuery({
    queryFn: async () =>
      selectConditionRecords(
        await conditionRecordsControllerListConditionRecords(params, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
    queryKey: getConditionRecordsQueryKey(userKey, params),
  });
}

export function useConditionRecord(conditionId: string) {
  const userKey = useTrackerUserKey();

  return useSuspenseQuery({
    queryFn: async () =>
      selectConditionRecord(
        await conditionRecordsControllerGetConditionRecord(conditionId, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
    queryKey: getConditionRecordQueryKey(userKey, conditionId),
  });
}

export function useCreateConditionRecord() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation<ConditionRecordDto, Error, CreateConditionRecordDto>({
    mutationFn: async (payload) =>
      selectCreatedConditionRecord(
        await conditionRecordsControllerCreateConditionRecord(payload, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
    onSuccess: () =>
      invalidateConditionRecordDependencies(queryClient, userKey),
  });
}

export function useUpdateConditionRecord() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation<
    ConditionRecordDto,
    Error,
    { conditionId: string; payload: UpdateConditionRecordDto }
  >({
    mutationFn: async ({ conditionId, payload }) =>
      selectUpdatedConditionRecord(
        await conditionRecordsControllerUpdateConditionRecord(
          conditionId,
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
        queryKey: getConditionRecordQueryKey(userKey, variables.conditionId),
      });
      invalidateConditionRecordDependencies(queryClient, userKey);
    },
  });
}

export function useDeleteConditionRecord() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation<boolean, Error, string>({
    mutationFn: async (conditionId) =>
      assertConditionRecordDeleted(
        await conditionRecordsControllerDeleteConditionRecord(conditionId, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
    onSuccess: (_, conditionId) => {
      queryClient.removeQueries({
        queryKey: getConditionRecordQueryKey(userKey, conditionId),
      });
      invalidateConditionRecordDependencies(queryClient, userKey);
    },
  });
}

export function invalidateConditionRecordDependencies(
  queryClient: ReturnType<typeof useQueryClient>,
  userKey: string,
) {
  queryClient.invalidateQueries({
    queryKey: getConditionRecordsQueryKeyPrefix(userKey),
  });
  queryClient.invalidateQueries({
    queryKey: getWorkoutReportSummaryQueryKeyPrefix(userKey),
  });
}
