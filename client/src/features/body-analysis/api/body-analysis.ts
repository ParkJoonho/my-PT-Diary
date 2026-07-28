import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  bodyAnalysisControllerAnalyzeBody,
  type bodyAnalysisControllerAnalyzeBodyResponse,
} from 'shared/api/generated/endpoints/body-analysis/body-analysis';
import type { CreateBodyAnalysisDto } from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';
import { getAnalysisRecordsQueryKeyPrefix } from './analysis-records';

export function selectBodyAnalysisResponse(
  response: bodyAnalysisControllerAnalyzeBodyResponse,
) {
  if (response.status === 503) {
    throw new Error('체형 분석 AI 기능이 아직 설정되지 않았어요.');
  }

  if (response.status === 502) {
    throw new Error('체형 분석 응답을 처리하지 못했어요.');
  }

  if (response.status !== 200 || !response.data) {
    throw new Error('체형 분석 요청에 실패했어요.');
  }

  return response.data;
}

export function useAnalyzeBody() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation({
    mutationFn: async (dto: CreateBodyAnalysisDto) =>
      selectBodyAnalysisResponse(
        await bodyAnalysisControllerAnalyzeBody(dto, {
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
