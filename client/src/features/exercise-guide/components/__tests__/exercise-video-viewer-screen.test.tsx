import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import {
  useExerciseGuide,
  useSetExerciseGuideLike,
} from '../../api/exercise-guides';
import { ExerciseVideoViewerScreen } from '../exercise-video-viewer-screen';

jest.mock('../../api/exercise-guides', () => ({
  useExerciseGuide: jest.fn(),
  useSetExerciseGuideLike: jest.fn(),
}));

jest.mock('../youtube-video-player', () => {
  const { Text: MockText } = jest.requireActual(
    'react-native',
  ) as typeof import('react-native');

  return {
    YoutubeVideoPlayer: () => <MockText>영상 플레이어</MockText>,
  };
});

const GUIDE = {
  bodyPart: '가슴',
  catalogType: 'body_part',
  description: '인클라인 벤치프레스 동작 설명',
  duration: '12:30',
  equipment: '벤치, 케이블',
  equipmentTypes: ['케이블', '바벨'],
  id: 'guide-1',
  likeCount: 0,
  likedByMe: false,
  targetMuscles: '대흉근 상부',
  title: '가슴 상부 집중 루틴',
  videoUrl: 'https://example.com/video',
};

describe('운동 영상 상세 화면', () => {
  const mutateAsync = jest.fn(async () => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useExerciseGuide).mockReturnValue({ data: GUIDE } as never);
    jest.mocked(useSetExerciseGuideLike).mockReturnValue({
      mutateAsync,
    } as never);
  });

  it('원본 정보 계층대로 장비 badge와 타겟/설명 block을 분리한다', () => {
    render(
      <ExerciseVideoViewerScreen contentBottomInset={104} guideId="guide-1" />,
    );

    expect(screen.getByText('영상 플레이어')).toBeTruthy();
    expect(screen.getByText('가슴 상부 집중 루틴')).toBeTruthy();
    expect(screen.getByText('벤치, 케이블')).toBeTruthy();
    expect(screen.getByText('타겟 근육')).toBeTruthy();
    expect(screen.getByText('대흉근 상부')).toBeTruthy();
    expect(screen.getByText('운동 설명')).toBeTruthy();
    expect(screen.getByText('인클라인 벤치프레스 동작 설명')).toBeTruthy();
    expect(screen.queryByText('0')).toBeNull();
    expect(screen.queryByText('닫기')).toBeNull();
  });

  it('icon like 버튼은 서버 mutation을 호출한다', async () => {
    render(
      <ExerciseVideoViewerScreen contentBottomInset={104} guideId="guide-1" />,
    );

    fireEvent.press(screen.getByTestId('video-like-button'));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        guideId: 'guide-1',
        liked: true,
      });
    });
  });
});
