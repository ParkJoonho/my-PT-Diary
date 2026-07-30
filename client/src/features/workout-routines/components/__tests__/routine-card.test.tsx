import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { RoutineCard } from '../routine-card';

describe('루틴 선택 카드', () => {
  it('원본 홈 UX처럼 AI추천 루틴을 접힌 상태로 시작하고 선택한 운동을 전달한다', () => {
    const onStartRoutine = jest.fn();

    render(<RoutineCard onStartRoutine={onStartRoutine} />);

    expect(screen.getByText('AI추천')).toBeTruthy();
    expect(
      screen.getByText(
        'AI가 체형과 자세를 분석해 만든 루틴이에요. 약한 부위를 강화하고 척추·무릎 정렬을 잡아줘요.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText('러닝머신')).toBeNull();

    fireEvent.press(screen.getByText('1시간 루틴'));
    expect(screen.getByText('러닝머신')).toBeTruthy();
    fireEvent.press(screen.getByText('운동 시작'));

    expect(onStartRoutine).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'ai_gym_60',
        source: 'mock-ai',
      }),
    );
  });

  it('장소를 바꾸면 원본처럼 펼친 루틴을 접는다', () => {
    render(<RoutineCard />);

    fireEvent.press(screen.getByText('1시간 루틴'));
    expect(screen.getByText('러닝머신')).toBeTruthy();

    const [, homeLocationTab] = screen.getAllByText('홈트');
    if (!homeLocationTab) {
      throw new Error('홈트 장소 탭을 찾지 못했습니다.');
    }
    fireEvent.press(homeLocationTab);

    expect(screen.queryByText('제자리 뛰기')).toBeNull();
  });
});
