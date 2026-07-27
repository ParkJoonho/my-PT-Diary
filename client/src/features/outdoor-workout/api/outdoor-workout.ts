import { useMutation } from '@tanstack/react-query';
import {
  outdoorWorkoutControllerCreateOutdoorWorkoutPlan,
  type outdoorWorkoutControllerCreateOutdoorWorkoutPlanResponse,
} from 'shared/api/generated/endpoints/outdoor-workout/outdoor-workout';
import type {
  CreateOutdoorWorkoutPlanDto,
  OutdoorWorkoutPlanDto,
} from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';

export function selectOutdoorWorkoutPlan(
  response: outdoorWorkoutControllerCreateOutdoorWorkoutPlanResponse,
): OutdoorWorkoutPlanDto {
  if (response.status === 503) {
    throw new Error('야외운동 AI 기능이 아직 설정되지 않았어요.');
  }

  if (response.status === 502) {
    throw new Error('야외운동 계획을 생성하지 못했어요.');
  }

  if (response.status !== 200 || !response.data) {
    throw new Error('야외운동 계획 생성에 실패했어요.');
  }

  return response.data;
}

export function useCreateOutdoorWorkoutPlan() {
  const userKey = useTrackerUserKey();

  return useMutation<OutdoorWorkoutPlanDto, Error, CreateOutdoorWorkoutPlanDto>({
    mutationFn: async (payload) =>
      selectOutdoorWorkoutPlan(
        await outdoorWorkoutControllerCreateOutdoorWorkoutPlan(payload, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
  });
}
