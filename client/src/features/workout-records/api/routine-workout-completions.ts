import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutRecordsControllerCreateRoutineWorkoutCompletion } from 'shared/api/generated/endpoints/workout-records/workout-records';
import type {
  CreateRoutineWorkoutCompletionDto,
  CreateRoutineWorkoutCompletionResponseDto,
} from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';
import { invalidateWorkoutRecordDependencies } from './workout-records';

export function useCreateRoutineWorkoutCompletion() {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation<
    CreateRoutineWorkoutCompletionResponseDto,
    Error,
    CreateRoutineWorkoutCompletionDto
  >({
    mutationFn: async (payload) => {
      const response =
        await workoutRecordsControllerCreateRoutineWorkoutCompletion(payload, {
          headers: {
            'x-user-key': userKey,
          },
        });

      if (response.status !== 201) {
        throw new Error('운동 완료 기록 저장에 실패했어요.');
      }

      return response.data;
    },
    onSuccess: () => {
      invalidateWorkoutRecordDependencies(queryClient, userKey);
    },
  });
}
