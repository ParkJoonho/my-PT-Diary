import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  exerciseGuidesControllerGetExerciseGuide,
  type exerciseGuidesControllerGetExerciseGuideResponse,
  exerciseGuidesControllerListExerciseGuides,
  type exerciseGuidesControllerListExerciseGuidesResponse,
  exerciseGuidesControllerSetExerciseGuideLike,
  type exerciseGuidesControllerSetExerciseGuideLikeResponse,
} from "shared/api/generated/endpoints/exercise-guides/exercise-guides";
import type {
  ExerciseGuideDto,
  ExerciseGuidesControllerListExerciseGuidesParams,
} from "shared/api/generated/models";
import { useTrackerUserKey } from "shared/api/user-key";

export const EXERCISE_GUIDES_QUERY_KEY = ["exercise-guides"] as const;

export function getExerciseGuidesQueryKey(
  userKey: string,
  params: ExerciseGuidesControllerListExerciseGuidesParams = {},
) {
  return [...EXERCISE_GUIDES_QUERY_KEY, userKey, params] as const;
}

export function getExerciseGuidesQueryKeyPrefix(userKey: string) {
  return [...EXERCISE_GUIDES_QUERY_KEY, userKey] as const;
}

export function getExerciseGuideQueryKey(userKey: string, guideId: string) {
  return [...EXERCISE_GUIDES_QUERY_KEY, userKey, "detail", guideId] as const;
}

export function selectExerciseGuides(
  response: exerciseGuidesControllerListExerciseGuidesResponse,
): ExerciseGuideDto[] {
  if (response.status !== 200 || !response.data) {
    throw new Error("운동 가이드 목록 조회에 실패했어요.");
  }

  return response.data;
}

export function selectExerciseGuide(
  response: exerciseGuidesControllerGetExerciseGuideResponse,
): ExerciseGuideDto {
  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (response.status !== 200 || !response.data) {
    throw new Error("운동 가이드 상세 조회에 실패했어요.");
  }

  return response.data;
}

export function selectUpdatedExerciseGuideLike(
  response: exerciseGuidesControllerSetExerciseGuideLikeResponse,
): ExerciseGuideDto {
  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (response.status !== 200 || !response.data) {
    throw new Error("운동 가이드 좋아요 저장에 실패했어요.");
  }

  return response.data;
}

export function useExerciseGuides(
  params: ExerciseGuidesControllerListExerciseGuidesParams = {},
) {
  const userKey = useTrackerUserKey();

  return useSuspenseQuery({
    queryFn: async () =>
      selectExerciseGuides(
        await exerciseGuidesControllerListExerciseGuides(params, {
          headers: {
            "x-user-key": userKey,
          },
        }),
      ),
    queryKey: getExerciseGuidesQueryKey(userKey, params),
  });
}

export function useExerciseGuide(guideId: string) {
  const userKey = useTrackerUserKey();

  return useSuspenseQuery({
    queryFn: async () =>
      selectExerciseGuide(
        await exerciseGuidesControllerGetExerciseGuide(guideId, {
          headers: {
            "x-user-key": userKey,
          },
        }),
      ),
    queryKey: getExerciseGuideQueryKey(userKey, guideId),
  });
}

export function useSetExerciseGuideLike() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation<
    ExerciseGuideDto,
    Error,
    { guideId: string; liked: boolean }
  >({
    mutationFn: async ({ guideId, liked }) =>
      selectUpdatedExerciseGuideLike(
        await exerciseGuidesControllerSetExerciseGuideLike(
          guideId,
          { liked },
          {
            headers: {
              "x-user-key": userKey,
            },
          },
        ),
      ),
    onSuccess: (updatedGuide) => {
      queryClient.setQueryData(
        getExerciseGuideQueryKey(userKey, updatedGuide.id),
        updatedGuide,
      );
      queryClient.setQueriesData<ExerciseGuideDto[]>(
        {
          queryKey: getExerciseGuidesQueryKeyPrefix(userKey),
        },
        (existing) =>
          existing?.map((guide) =>
            guide.id === updatedGuide.id ? updatedGuide : guide,
          ) ?? existing,
      );
    },
  });
}
