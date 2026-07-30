import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type {
  ConditionRecordDto,
  WorkoutRecordDto,
} from 'shared/api/generated/models';
import {
  DashboardConditionCard,
  DashboardReportSummaryCard,
  DashboardWorkoutRecordCard,
} from '../dashboard-cards';

const WORKOUT_RECORD: WorkoutRecordDto = {
  completedAt: '2026-07-30T09:30:00.000Z',
  completedOn: '2026-07-30',
  createdAt: '2026-07-30T09:30:00.000Z',
  durationSeconds: 3600,
  id: 'workout-1',
  manualDetail: {
    exerciseTime: '1시간',
    strengthExercises: [
      { name: '스쿼트', sets: [] },
      { name: '벤치프레스', sets: [] },
    ],
  },
  performedAt: '2026-07-30T08:30:00.000Z',
  performedOn: '2026-07-30',
  routineId: null,
  routineLabel: null,
  routineSource: null,
  source: 'manual',
  steps: [],
  summary: {
    totalVolumeKg: 1250,
  },
  timeZone: 'Asia/Seoul',
  title: '오늘 운동',
  updatedAt: '2026-07-30T09:30:00.000Z',
  weeklyCompletionId: null,
};

const CONDITION_RECORD: ConditionRecordDto = {
  conditions: [
    { label: '훈련 동기', score: 4 },
    { label: '일상피로도', score: 1 },
  ],
  date: '2026-07-30',
  id: 'condition-1',
  muscleSoreness: [
    { label: '가슴', score: 2 },
    { label: '둔근', score: 3 },
  ],
  summary: {
    selectedConditionCount: 2,
    selectedSorenessCount: 2,
    severeSorenessCount: 1,
  },
  weekNumber: 31,
};

describe('기록 대시보드 카드', () => {
  it('원본 3열 운동 스냅샷 구조로 오늘 운동을 표시한다', () => {
    const onPress = jest.fn();

    render(
      <DashboardWorkoutRecordCard onPress={onPress} record={WORKOUT_RECORD} />,
    );

    expect(screen.getByText('1시간')).toBeTruthy();
    expect(screen.getByText('스쿼트 외 1개')).toBeTruthy();
    expect(screen.getByText('1,250kg')).toBeTruthy();

    fireEvent.press(screen.getByText('스쿼트 외 1개'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('컨디션과 근육통의 첫 항목 및 부위 요약을 표시한다', () => {
    render(<DashboardConditionCard record={CONDITION_RECORD} />);

    expect(screen.getByText('4.0')).toBeTruthy();
    expect(screen.getByText('좋음')).toBeTruthy();
    expect(screen.getByText('2.0')).toBeTruthy();
    expect(screen.getByText('약간')).toBeTruthy();
    expect(screen.getByText('가슴 +1')).toBeTruthy();
  });

  it('리포트 메트릭을 하나의 3분할 카드로 표시한다', () => {
    render(
      <DashboardReportSummaryCard
        conditionCount="7"
        totalVolume="12,500"
        workoutCount="10"
      />,
    );

    expect(screen.getByText('10')).toBeTruthy();
    expect(screen.getByText('12,500')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
  });
});
