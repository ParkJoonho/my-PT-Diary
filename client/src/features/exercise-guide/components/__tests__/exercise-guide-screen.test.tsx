import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import {
  useExerciseGuides,
  useSetExerciseGuideLike,
} from '../../api/exercise-guides';
import { ExerciseGuideScreen } from '../exercise-guide-screen';

const mockNavigate = jest.fn();

jest.mock('@granite-js/react-native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: mockNavigate,
  }),
}));

jest.mock('@granite-js/native/react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 20, left: 0, right: 0, top: 0 }),
}));

jest.mock('../../api/exercise-guides', () => ({
  useExerciseGuides: jest.fn(),
  useSetExerciseGuideLike: jest.fn(),
}));

const GUIDES = [
  {
    bodyPart: '가슴',
    catalogType: 'body_part',
    description: '가슴 운동 설명',
    duration: '12:30',
    equipment: '벤치',
    equipmentTypes: ['바벨'],
    id: 'body-1',
    likeCount: 3,
    likedByMe: false,
    targetMuscles: '가슴',
    title: '가슴 상부 집중 루틴',
    videoUrl: 'https://example.com/body',
  },
  {
    bodyPart: '하체',
    catalogType: 'equipment',
    description: '기구 운동 설명',
    duration: '14:00',
    equipment: '바벨',
    equipmentTypes: ['바벨'],
    id: 'equipment-1',
    likeCount: 4,
    likedByMe: false,
    targetMuscles: '하체',
    title: '바벨 스쿼트',
    videoUrl: 'https://example.com/equipment',
  },
] as const;

describe('운동 배우기 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useExerciseGuides).mockReturnValue({ data: GUIDES } as never);
    jest.mocked(useSetExerciseGuideLike).mockReturnValue({
      mutateAsync: jest.fn(),
    } as never);
  });

  it('원본 title area와 부위 필터를 표시하고 임시 닫기 header를 제거한다', () => {
    render(<ExerciseGuideScreen contentBottomInset={104} />);

    expect(screen.getByText('운동 배우기')).toHaveStyle({
      fontFamily: 'Pretendard-Medium',
      fontSize: 18,
    });
    expect(screen.queryByText('닫기')).toBeNull();
    expect(screen.getByText('All')).toBeTruthy();
    expect(screen.getByText('가슴 상부 집중 루틴')).toBeTruthy();
  });

  it('기구별 탭은 실제 원본처럼 camera card와 전체 목록만 표시한다', () => {
    render(<ExerciseGuideScreen contentBottomInset={104} />);

    fireEvent.press(screen.getByText('기구별'));

    expect(screen.getByText('사진으로 기구 찾기')).toBeTruthy();
    expect(screen.getByText('바벨 스쿼트')).toBeTruthy();
    expect(screen.queryByText('All')).toBeNull();
  });

  it('camera utility card는 원본 action sheet 문구를 연다', () => {
    render(<ExerciseGuideScreen contentBottomInset={104} />);

    fireEvent.press(screen.getByText('기구별'));
    fireEvent.press(screen.getByText('사진으로 기구 찾기'));

    expect(screen.getByText('카메라로 촬영')).toBeTruthy();
    expect(screen.getByText('갤러리에서 선택')).toBeTruthy();
    expect(screen.getByText('취소')).toBeTruthy();
  });
});
