import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { HomeRoutine } from 'features/workout-routines/types/routine';
import { WorkoutStepList } from '../workout-step-list';

const ROUTINE: HomeRoutine = {
  duration: '30분',
  id: 'active-test',
  label: '테스트 루틴',
  location: 'gym',
  source: 'mock-ai',
  steps: [
    {
      detail: '10분',
      name: '러닝머신',
      restAfter: '1분',
      type: 'cardio',
    },
    {
      detail: '10회 x 3세트',
      name: '스쿼트',
      restAfter: '1분 30초',
      sets: 3,
      type: 'strength',
    },
    {
      detail: '10회',
      name: '가이드 없는 근력 운동',
      type: 'strength',
    },
  ],
};

describe('운동 진행 단계 카드', () => {
  it('원본 title block과 액션 노출 조건을 따른다', () => {
    render(
      <WorkoutStepList
        completedSteps={{}}
        contentBottomInset={100}
        errorMessage={null}
        onRecordVideo={jest.fn()}
        onToggleStep={jest.fn()}
        onVoiceGuide={jest.fn()}
        routine={ROUTINE}
      />,
    );

    expect(screen.getByText('AI 추천: 테스트 루틴')).toBeTruthy();
    expect(screen.queryByText('30분 · 헬스장')).toBeNull();
    expect(screen.getAllByText('영상촬영')).toHaveLength(2);
    expect(screen.getAllByText('음성가이드')).toHaveLength(1);
    expect(screen.getByText('세트 간 휴식 1분 30초 × 3회')).toBeTruthy();
  });

  it('원본 액션과 체크박스 콜백을 해당 단계 index로 호출한다', () => {
    const onRecordVideo = jest.fn();
    const onToggleStep = jest.fn();
    const onVoiceGuide = jest.fn();

    render(
      <WorkoutStepList
        completedSteps={{ 1: true }}
        contentBottomInset={100}
        errorMessage={null}
        onRecordVideo={onRecordVideo}
        onToggleStep={onToggleStep}
        onVoiceGuide={onVoiceGuide}
        routine={ROUTINE}
      />,
    );

    const [firstVideoButton] = screen.getAllByText('영상촬영');
    if (!firstVideoButton) {
      throw new Error('영상촬영 버튼을 찾지 못했습니다.');
    }

    fireEvent.press(screen.getByText('음성가이드'));
    fireEvent.press(firstVideoButton);
    fireEvent.press(screen.getByTestId('step-checkbox-1'));

    expect(onVoiceGuide).toHaveBeenCalledWith(1);
    expect(onRecordVideo).toHaveBeenCalledWith(1);
    expect(onToggleStep).toHaveBeenCalledWith(1);
  });
});
