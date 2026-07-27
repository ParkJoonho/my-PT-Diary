import type { CreateManualWorkoutRecordDto, OutdoorWorkoutPlanDto } from 'shared/api/generated/models';
import {
  formatClientDate,
  getClientTimeZone,
  getUtcISOString,
} from 'shared/lib/date';
import type { OutdoorWorkoutMode } from '../types/outdoor-workout';

const MODE_LABELS: Record<OutdoorWorkoutMode, string> = {
  hiking: '등산',
  walking: '걷기',
};

export function buildOutdoorWorkoutRecordPayload({
  now = new Date(),
  plan,
  workoutMode,
}: {
  now?: Date;
  plan: OutdoorWorkoutPlanDto;
  workoutMode: OutdoorWorkoutMode;
}): CreateManualWorkoutRecordDto {
  const modeLabel = MODE_LABELS[workoutMode];
  const estimatedMinutes = extractFirstNumber(plan.estimatedTime) || 30;
  const stepsEstimate =
    workoutMode === 'walking' ? estimatedMinutes * 100 : estimatedMinutes * 80;
  const strengthExercises = plan.bodyTypeExercises?.map((exercise) => ({
    estimated1RM: 0,
    lbWeight: 0,
    maxWeight: 0,
    name: exercise.name,
    restTime: '',
    rir: '',
    sets: [
      {
        reps: extractFirstNumber(exercise.duration) || 10,
        weightKg: 0,
      },
    ],
    volume: 0,
  }));

  return {
    activityLevel: `야외 ${modeLabel}`,
    cardio: {
      durationSeconds: estimatedMinutes * 60,
      steps: stepsEstimate,
    },
    dailyReport: `[야외] ${modeLabel} ${plan.totalDistance || ''} · ${plan.estimatedTime || ''} · ${plan.estimatedCalories || ''}`,
    durationSeconds: estimatedMinutes * 60,
    exerciseTime: plan.estimatedTime || `${estimatedMinutes}분`,
    location: 'outdoor',
    performedAt: getUtcISOString(now),
    performedOn: formatClientDate(now),
    strengthExercises: strengthExercises?.length ? strengthExercises : undefined,
    timeZone: getClientTimeZone(),
    title: `야외 ${modeLabel}`,
  };
}

function extractFirstNumber(value?: string) {
  if (!value) {
    return 0;
  }

  const match = value.match(/(\d+)/);

  return match?.[1] ? Number.parseInt(match[1], 10) : 0;
}

// TODO(outdoor-workout-migration): 원본 앱 구현을 존중해 현재 저장 payload는
// 실제 GPS 실측값이 아니라 AI 계획에서 추출한 예상 시간/걸음 수를 그대로 기록에 사용해요.
// GPS 추적이 마이그레이션되면 duration/cardio 값을 실측값으로 바꾸고,
// 계획 기반 추정값은 별도 필드나 메모로만 남기도록 구조를 재설계해야 해요.
