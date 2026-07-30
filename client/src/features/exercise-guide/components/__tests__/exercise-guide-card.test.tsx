import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ExerciseGuide } from '../../types/exercise-guide';
import { ExerciseGuideCard } from '../exercise-guide-card';

const GUIDE: ExerciseGuide = {
  bodyPart: '가슴',
  catalogType: 'body_part',
  description: '가슴 운동 설명',
  duration: '12:30',
  equipment: '벤치',
  equipmentTypes: ['바벨'],
  id: 'guide-1',
  likeCount: 3,
  likedByMe: false,
  targetMuscles: '가슴',
  title: '가슴 상부 집중 루틴',
  videoUrl: 'https://example.com/video',
};

describe('운동 배우기 목록 카드', () => {
  it('좋아요가 있을 때만 원본 heart asset과 count를 노출한다', () => {
    const onToggleLike = jest.fn();

    const { rerender } = render(
      <ExerciseGuideCard
        guide={GUIDE}
        isEquipmentTab={false}
        isFirst
        isLast
        onPress={jest.fn()}
        onToggleLike={onToggleLike}
      />,
    );

    fireEvent.press(screen.getByText('3'));
    expect(onToggleLike).toHaveBeenCalledTimes(1);

    rerender(
      <ExerciseGuideCard
        guide={{ ...GUIDE, likeCount: 0 }}
        isEquipmentTab={false}
        isFirst
        isLast
        onPress={jest.fn()}
        onToggleLike={onToggleLike}
      />,
    );

    expect(screen.queryByText('0')).toBeNull();
  });
});
