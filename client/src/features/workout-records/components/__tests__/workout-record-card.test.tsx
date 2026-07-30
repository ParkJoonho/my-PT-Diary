import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { WorkoutRecordDto } from 'shared/api/generated/models';
import { WorkoutRecordCard } from '../workout-record-card';

jest.mock('shared/components/icons/pt-diary-icons', () => {
  const { Text: MockText } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    OriginalAppIcon: ({ name }: { name: string }) => (
      <MockText>{`icon:${name}`}</MockText>
    ),
  };
});

const RECORD: WorkoutRecordDto = {
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

describe('운동 기록 목록 카드', () => {
  it('원본의 아이콘이 있는 3열 지표만 표시한다', () => {
    render(<WorkoutRecordCard record={RECORD} />);

    expect(screen.getByText('icon:timeOutline')).toBeTruthy();
    expect(screen.getByText('icon:run')).toBeTruthy();
    expect(screen.getByText('icon:armFlexOutline')).toBeTruthy();
    expect(screen.getByText('운동시간')).toBeTruthy();
    expect(screen.getByText('운동종목')).toBeTruthy();
    expect(screen.getByText('총 중량')).toBeTruthy();
    expect(screen.getByText('1시간')).toBeTruthy();
    expect(screen.getByText('스쿼트 +1')).toBeTruthy();
    expect(screen.getByText('1,250kg')).toBeTruthy();
    expect(screen.queryByText('오늘 운동')).toBeNull();
  });

  it('카드 press와 long press를 각각 전달한다', () => {
    const onLongPress = jest.fn();
    const onPress = jest.fn();

    render(
      <WorkoutRecordCard
        onLongPress={onLongPress}
        onPress={onPress}
        record={RECORD}
      />,
    );

    const metricValue = screen.getByText('스쿼트 +1');
    fireEvent.press(metricValue);
    fireEvent(metricValue, 'longPress');

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});
