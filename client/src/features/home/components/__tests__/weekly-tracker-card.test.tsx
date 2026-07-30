import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { WeeklyTrackerCard } from '../weekly-tracker-card';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'].map((label) => ({
  completed: false,
  label,
}));

describe('주간 트래커 카드', () => {
  it('원본처럼 연속 운동일이 0이면 배지를 표시하지 않는다', () => {
    render(<WeeklyTrackerCard days={DAYS} streakCount={0} />);

    expect(screen.getByText('주간 트래커')).toBeTruthy();
    expect(screen.queryByText('0일 연속')).toBeNull();
  });

  it('연속 운동일이 있으면 제목 옆 배지에 표시한다', () => {
    render(<WeeklyTrackerCard days={DAYS} streakCount={2} />);

    expect(screen.getByText('2일 연속')).toBeTruthy();
  });
});
