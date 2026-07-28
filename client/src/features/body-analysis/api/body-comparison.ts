import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  bodyComparisonControllerAnalyzeBodyComparison,
  type bodyComparisonControllerAnalyzeBodyComparisonResponse,
} from 'shared/api/generated/endpoints/body-comparison/body-comparison';
import type { CreateBodyComparisonDto } from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';
import { getAnalysisRecordsQueryKeyPrefix } from './analysis-records';

export function selectBodyComparisonResponse(
  response: bodyComparisonControllerAnalyzeBodyComparisonResponse,
) {
  if (response.status === 503) {
    throw new Error('체형 비교 분석 AI 기능이 아직 설정되지 않았어요.');
  }

  if (response.status === 502) {
    throw new Error('전·후 비교 분석 응답을 처리하지 못했어요.');
  }

  if (response.status === 400) {
    throw new Error('전·후 사진과 입력값을 다시 확인해 주세요.');
  }

  if (response.status !== 200 || !response.data) {
    throw new Error('전·후 비교 분석 요청에 실패했어요.');
  }

  return response.data;
}

export function useAnalyzeBodyComparison() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation({
    mutationFn: async (dto: CreateBodyComparisonDto) =>
      selectBodyComparisonResponse(
        await bodyComparisonControllerAnalyzeBodyComparison(dto, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
    onSuccess: (result) => {
      if (result.recordSave.status === 'saved') {
        queryClient.invalidateQueries({
          queryKey: getAnalysisRecordsQueryKeyPrefix(userKey),
        });
      }
    },
  });
}
