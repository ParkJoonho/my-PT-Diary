import { describe, expect, it } from '@jest/globals';
import { MOCK_AI_GYM_ROUTINES } from 'features/workout-routines/data/mock-routines';
import { RECOMMENDED_ROUTINES } from 'features/workout-routines/data/recommended-routines';
import { resolveActiveWorkoutRouteRoutine } from '../resolve-active-workout-routine';

describe('활성 운동 루틴 해석', () => {
  it('선택된 루틴이 현재 route id와 같으면 저장된 루틴을 우선 사용한다', () => {
    const selectedRoutine = MOCK_AI_GYM_ROUTINES[0];

    expect(
      resolveActiveWorkoutRouteRoutine({
        routeRoutineId: selectedRoutine?.id,
        selectedRoutine,
      }),
    ).toBe(selectedRoutine);
  });

  it('route id가 없더라도 저장된 루틴이 있으면 그 루틴으로 화면을 연다', () => {
    const selectedRoutine = MOCK_AI_GYM_ROUTINES[0];

    expect(
      resolveActiveWorkoutRouteRoutine({
        selectedRoutine,
      }),
    ).toBe(selectedRoutine);
  });

  it('저장된 루틴 id가 다르면 route id 기준 정적 루틴을 다시 찾는다', () => {
    const selectedRoutine = MOCK_AI_GYM_ROUTINES[0];
    const routeRoutine = RECOMMENDED_ROUTINES[0];

    expect(
      resolveActiveWorkoutRouteRoutine({
        routeRoutineId: routeRoutine?.id,
        selectedRoutine,
      }),
    ).toEqual(expect.objectContaining({ id: routeRoutine?.id }));
  });
});
