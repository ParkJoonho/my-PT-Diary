import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { PtLesson } from '../../types/pt-log';
import { PtLessonCard } from '../pt-lesson-card';

const LESSON: PtLesson = {
  bodyParts: ['가슴', '등'],
  comment: '',
  createdAt: 0,
  date: '2026-07-30',
  dayOfWeek: '목',
  equipment: [],
  exercises: [
    {
      estimatedOneRepMaxKg: 0,
      lbWeight: 0,
      maxWeightKg: 0,
      name: '벤치프레스',
      restTime: '',
      rir: '',
      sets: [],
      volumeKg: 1200,
    },
  ],
  id: 'lesson-1',
  sessionNumber: 3,
  summary: {
    exerciseCount: 1,
    setCount: 3,
    totalVolumeKg: 1200,
  },
  warmUp: '',
};

describe('PT 수업일지 카드', () => {
  it('원본 3열 메트릭과 body part tag를 표시한다', () => {
    const onPress = jest.fn();

    render(<PtLessonCard lesson={LESSON} onPress={onPress} />);

    expect(screen.getByText('7/30 (목)')).toBeTruthy();
    expect(screen.getByText('3 Session')).toBeTruthy();
    expect(screen.getByText('1,200kg')).toBeTruthy();
    expect(screen.getByText('가슴')).toBeTruthy();
    expect(screen.getByText('등')).toBeTruthy();

    fireEvent.press(screen.getByText('3 Session'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
