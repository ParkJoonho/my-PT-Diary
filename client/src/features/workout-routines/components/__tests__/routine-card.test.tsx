import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { RoutineCard } from '../routine-card';

describe('루틴 선택 카드', () => {
  it('원본 홈 UX처럼 AI추천 루틴을 기본으로 열고 운동 시작을 전달한다', () => {
    const onStartRoutine = jest.fn();

    render(<RoutineCard onStartRoutine={onStartRoutine} />);

    expect(screen.getByText('AI추천')).toBeTruthy();
    expect(
      screen.getByText(
        'AI가 체형과 자세를 분석해 만든 루틴이에요. 약한 부위를 강화하고 척추·무릎 정렬을 잡아줘요.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('러닝머신')).toBeTruthy();

    fireEvent.press(screen.getByText('운동 시작'));

    expect(onStartRoutine).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'ai_gym_60',
        source: 'mock-ai',
      }),
    );
  });
});
