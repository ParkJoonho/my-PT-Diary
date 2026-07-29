import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTrainersConnectRequestsQueryKeyPrefix,
  getTrainersQueryKeyPrefix,
} from 'features/trainer-match/api/trainers';
import {
  ptLessonsControllerCreatePtLesson,
  type ptLessonsControllerCreatePtLessonResponse,
  ptLessonsControllerDeletePtLesson,
  type ptLessonsControllerDeletePtLessonResponse,
  type ptLessonsControllerGetPtLessonResponse,
  type ptLessonsControllerListPtLessonsResponse,
  ptLessonsControllerUpdatePtLesson,
  type ptLessonsControllerUpdatePtLessonResponse,
  usePtLessonsControllerGetPtLessonSuspense,
  usePtLessonsControllerListPtLessonsSuspense,
} from 'shared/api/generated/endpoints/pt-lessons/pt-lessons';
import type {
  CreatePtLessonDto,
  PtLessonsControllerListPtLessonsParams,
  UpdatePtLessonDto,
} from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';
import { getWeeklyTrackerSummaryQueryKeyPrefix } from 'shared/api/weekly-tracker';
import { toPtLesson } from '../lib/pt-lesson-payload';
import type { PtLesson } from '../types/pt-log';

export const PT_LESSONS_QUERY_KEY = ['pt-lessons'] as const;

export function getPtLessonsQueryKey(
  userKey: string,
  params: PtLessonsControllerListPtLessonsParams = {},
) {
  return [...PT_LESSONS_QUERY_KEY, userKey, params] as const;
}

export function getPtLessonsQueryKeyPrefix(userKey: string) {
  return [...PT_LESSONS_QUERY_KEY, userKey] as const;
}

export function getPtLessonQueryKey(userKey: string, lessonId: string) {
  return [...PT_LESSONS_QUERY_KEY, userKey, 'detail', lessonId] as const;
}

export function selectPtLessons(
  response: ptLessonsControllerListPtLessonsResponse,
): PtLesson[] {
  if (response.status !== 200 || !response.data) {
    throw new Error('PT 수업일지 목록 조회에 실패했어요.');
  }

  return response.data.map(toPtLesson);
}

export function selectPtLesson(
  response: ptLessonsControllerGetPtLessonResponse,
): PtLesson {
  if (response.status !== 200 || !response.data) {
    throw new Error('PT 수업일지 상세 조회에 실패했어요.');
  }

  return toPtLesson(response.data);
}

export function selectCreatedPtLesson(
  response: ptLessonsControllerCreatePtLessonResponse,
): PtLesson {
  if (response.status !== 201 || !response.data) {
    throw new Error('PT 수업일지 저장에 실패했어요.');
  }

  return toPtLesson(response.data);
}

export function selectUpdatedPtLesson(
  response: ptLessonsControllerUpdatePtLessonResponse,
): PtLesson {
  if (response.status !== 200 || !response.data) {
    throw new Error('PT 수업일지 수정에 실패했어요.');
  }

  return toPtLesson(response.data);
}

export function assertPtLessonDeleted(
  response: ptLessonsControllerDeletePtLessonResponse,
) {
  if (response.status !== 200) {
    throw new Error('PT 수업일지 삭제에 실패했어요.');
  }

  return true;
}

export function usePtLessons(
  params: PtLessonsControllerListPtLessonsParams = {},
) {
  const userKey = useTrackerUserKey();

  return usePtLessonsControllerListPtLessonsSuspense<PtLesson[], Error>(
    params,
    {
      fetch: {
        headers: {
          'x-user-key': userKey,
        },
      },
      query: {
        queryKey: getPtLessonsQueryKey(userKey, params),
        select: selectPtLessons,
      },
    },
  );
}

export function usePtLesson(lessonId: string) {
  const userKey = useTrackerUserKey();

  return usePtLessonsControllerGetPtLessonSuspense<PtLesson, Error>(lessonId, {
    fetch: {
      headers: {
        'x-user-key': userKey,
      },
    },
    query: {
      queryKey: getPtLessonQueryKey(userKey, lessonId),
      select: selectPtLesson,
    },
  });
}

export function useCreatePtLesson() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation<PtLesson, Error, CreatePtLessonDto>({
    mutationFn: async (payload) =>
      selectCreatedPtLesson(
        await ptLessonsControllerCreatePtLesson(payload, {
          headers: {
            'Content-Type': 'application/json',
            'x-user-key': userKey,
          },
        }),
      ),
    onSuccess: () => invalidatePtLessonDependencies(queryClient, userKey),
  });
}

export function useUpdatePtLesson() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation<
    PtLesson,
    Error,
    { lessonId: string; payload: UpdatePtLessonDto }
  >({
    mutationFn: async ({ lessonId, payload }) =>
      selectUpdatedPtLesson(
        await ptLessonsControllerUpdatePtLesson(lessonId, payload, {
          headers: {
            'Content-Type': 'application/json',
            'x-user-key': userKey,
          },
        }),
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getPtLessonQueryKey(userKey, variables.lessonId),
      });
      invalidatePtLessonDependencies(queryClient, userKey);
    },
  });
}

export function useDeletePtLesson() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation<boolean, Error, string>({
    mutationFn: async (lessonId) =>
      assertPtLessonDeleted(
        await ptLessonsControllerDeletePtLesson(lessonId, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
    onSuccess: (_, lessonId) => {
      queryClient.removeQueries({
        queryKey: getPtLessonQueryKey(userKey, lessonId),
      });
      invalidatePtLessonDependencies(queryClient, userKey);
    },
  });
}

export function invalidatePtLessonDependencies(
  queryClient: ReturnType<typeof useQueryClient>,
  userKey: string,
) {
  queryClient.invalidateQueries({
    queryKey: getPtLessonsQueryKeyPrefix(userKey),
  });
  queryClient.invalidateQueries({
    queryKey: getWeeklyTrackerSummaryQueryKeyPrefix(userKey),
  });
  queryClient.invalidateQueries({
    queryKey: getTrainersQueryKeyPrefix(userKey),
  });
  queryClient.invalidateQueries({
    queryKey: getTrainersConnectRequestsQueryKeyPrefix(userKey),
  });
}
