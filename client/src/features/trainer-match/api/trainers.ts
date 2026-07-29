import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  trainersControllerCreateConnectRequest,
  type trainersControllerCreateConnectRequestResponse,
  type trainersControllerListRecommendedTrainersResponse,
  type trainersControllerListTrainersResponse,
  trainersControllerSetTrainerLike,
  type trainersControllerSetTrainerLikeResponse,
  useTrainersControllerListRecommendedTrainersSuspense,
  useTrainersControllerListTrainersSuspense,
} from 'shared/api/generated/endpoints/trainers/trainers';
import type {
  CreateTrainerConnectRequestDto,
  RecommendedTrainerDto,
  SetTrainerLikeDto,
  TrainerConnectRequestDto,
  TrainerDto,
} from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';

export const TRAINERS_QUERY_KEY = ['trainers'] as const;

export function getTrainersQueryKey(userKey: string) {
  return [...TRAINERS_QUERY_KEY, userKey, 'catalog'] as const;
}

export function getRecommendedTrainersQueryKey(userKey: string) {
  return [...TRAINERS_QUERY_KEY, userKey, 'recommended'] as const;
}

export function getTrainersConnectRequestsQueryKeyPrefix(userKey: string) {
  return [...TRAINERS_QUERY_KEY, userKey, 'connect-requests'] as const;
}

export function getTrainersQueryKeyPrefix(userKey: string) {
  return [...TRAINERS_QUERY_KEY, userKey] as const;
}

export function selectTrainers(
  response: trainersControllerListTrainersResponse,
): TrainerDto[] {
  if (response.status !== 200 || !response.data) {
    throw new Error('트레이너 목록 조회에 실패했어요.');
  }

  return response.data;
}

export function selectRecommendedTrainers(
  response: trainersControllerListRecommendedTrainersResponse,
): RecommendedTrainerDto[] {
  if (response.status !== 200 || !response.data) {
    throw new Error('추천 트레이너 조회에 실패했어요.');
  }

  return response.data;
}

export function selectCreatedConnectRequest(
  response: trainersControllerCreateConnectRequestResponse,
): TrainerConnectRequestDto {
  if (response.status !== 201 || !response.data) {
    throw new Error('연결 요청 전송에 실패했어요.');
  }

  return response.data;
}

export function selectUpdatedTrainer(
  response: trainersControllerSetTrainerLikeResponse,
): TrainerDto {
  if (response.status !== 200 || !response.data) {
    throw new Error('트레이너 찜 상태를 저장하지 못했어요.');
  }

  return response.data;
}

export function useTrainers() {
  const userKey = useTrackerUserKey();

  return useTrainersControllerListTrainersSuspense<TrainerDto[], Error>({
    fetch: {
      headers: {
        'x-user-key': userKey,
      },
    },
    query: {
      queryKey: getTrainersQueryKey(userKey),
      select: selectTrainers,
    },
  });
}

export function useRecommendedTrainers() {
  const userKey = useTrackerUserKey();

  return useTrainersControllerListRecommendedTrainersSuspense<
    RecommendedTrainerDto[],
    Error
  >({
    fetch: {
      headers: {
        'x-user-key': userKey,
      },
    },
    query: {
      queryKey: getRecommendedTrainersQueryKey(userKey),
      select: selectRecommendedTrainers,
    },
  });
}

export function useCreateTrainerConnectRequest() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation<
    TrainerConnectRequestDto,
    Error,
    { payload: CreateTrainerConnectRequestDto; trainerId: string }
  >({
    mutationFn: async ({ payload, trainerId }) =>
      selectCreatedConnectRequest(
        await trainersControllerCreateConnectRequest(trainerId, payload, {
          headers: {
            'Content-Type': 'application/json',
            'x-user-key': userKey,
          },
        }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTrainersQueryKeyPrefix(userKey),
      });
    },
  });
}

export function useSetTrainerLike() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation<
    TrainerDto,
    Error,
    { payload: SetTrainerLikeDto; trainerId: string }
  >({
    mutationFn: async ({ payload, trainerId }) =>
      selectUpdatedTrainer(
        await trainersControllerSetTrainerLike(trainerId, payload, {
          headers: {
            'Content-Type': 'application/json',
            'x-user-key': userKey,
          },
        }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTrainersQueryKeyPrefix(userKey),
      });
    },
  });
}
