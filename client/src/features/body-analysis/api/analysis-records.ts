import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  analysisRecordsControllerCompareAnalysisRecords,
  type analysisRecordsControllerCompareAnalysisRecordsResponse,
  analysisRecordsControllerCreateAnalysisRecord,
  type analysisRecordsControllerCreateAnalysisRecordResponse,
  analysisRecordsControllerGetAnalysisRecord,
  type analysisRecordsControllerGetAnalysisRecordResponse,
  analysisRecordsControllerListAnalysisRecords,
  type analysisRecordsControllerListAnalysisRecordsResponse,
} from 'shared/api/generated/endpoints/analysis-records/analysis-records';
import type {
  AnalysisRecordDetailDto,
  AnalysisRecordDto,
  AnalysisRecordsControllerListAnalysisRecordsParams,
  CompareAnalysisRecordsDto,
  CompareAnalysisRecordsResponseDto,
  CreateAnalysisRecordDto,
} from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';

export const ANALYSIS_RECORDS_QUERY_KEY = ['analysis-records'] as const;

export function getAnalysisRecordsQueryKey(
  userKey: string,
  params: AnalysisRecordsControllerListAnalysisRecordsParams = {},
) {
  return [...ANALYSIS_RECORDS_QUERY_KEY, userKey, params] as const;
}

export function getAnalysisRecordsQueryKeyPrefix(userKey: string) {
  return [...ANALYSIS_RECORDS_QUERY_KEY, userKey] as const;
}

export function getAnalysisRecordQueryKey(userKey: string, recordId: string) {
  return [...ANALYSIS_RECORDS_QUERY_KEY, userKey, 'detail', recordId] as const;
}

export function selectAnalysisRecords(
  response: analysisRecordsControllerListAnalysisRecordsResponse,
): AnalysisRecordDto[] {
  if (response.status !== 200 || !response.data) {
    throw new Error('분석 기록 목록을 불러오지 못했어요.');
  }

  return response.data;
}

export function selectAnalysisRecord(
  response: analysisRecordsControllerGetAnalysisRecordResponse,
): AnalysisRecordDetailDto {
  if (response.status === 404) {
    throw new Error('NOT_FOUND');
  }

  if (response.status !== 200 || !response.data) {
    throw new Error('분석 기록 상세를 불러오지 못했어요.');
  }

  return response.data;
}

export function selectAnalysisComparison(
  response: analysisRecordsControllerCompareAnalysisRecordsResponse,
): CompareAnalysisRecordsResponseDto {
  if (response.status === 503) {
    throw new Error('체형 분석 비교 AI 기능이 아직 설정되지 않았어요.');
  }

  if (response.status === 404) {
    throw new Error('비교할 분석 기록을 찾지 못했어요.');
  }

  if (response.status === 400) {
    throw new Error('지금은 체형 분석 기록끼리만 비교할 수 있어요.');
  }

  if (response.status !== 200 || !response.data) {
    throw new Error('분석 기록 비교에 실패했어요.');
  }

  return response.data;
}

export function selectCreatedAnalysisRecord(
  response: analysisRecordsControllerCreateAnalysisRecordResponse,
): AnalysisRecordDetailDto {
  if (response.status !== 201 || !response.data) {
    throw new Error('분석 기록 저장에 실패했어요.');
  }

  return response.data;
}

export function useAnalysisRecords(
  params: AnalysisRecordsControllerListAnalysisRecordsParams = {},
) {
  const userKey = useTrackerUserKey();

  return useSuspenseQuery({
    queryFn: async () =>
      selectAnalysisRecords(
        await analysisRecordsControllerListAnalysisRecords(params, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
    queryKey: getAnalysisRecordsQueryKey(userKey, params),
  });
}

export function useAnalysisRecord(recordId: string) {
  const userKey = useTrackerUserKey();

  return useSuspenseQuery({
    queryFn: async () =>
      selectAnalysisRecord(
        await analysisRecordsControllerGetAnalysisRecord(recordId, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
    queryKey: getAnalysisRecordQueryKey(userKey, recordId),
  });
}

export function useCompareAnalysisRecords() {
  const userKey = useTrackerUserKey();

  return useMutation({
    mutationFn: async (dto: CompareAnalysisRecordsDto) =>
      selectAnalysisComparison(
        await analysisRecordsControllerCompareAnalysisRecords(dto, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
  });
}

export function useCreateAnalysisRecord() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation({
    mutationFn: async (dto: CreateAnalysisRecordDto) =>
      selectCreatedAnalysisRecord(
        await analysisRecordsControllerCreateAnalysisRecord(dto, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getAnalysisRecordsQueryKeyPrefix(userKey),
      });
    },
  });
}
