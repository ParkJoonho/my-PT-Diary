import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useCreatePtLesson, useUpdatePtLesson } from '../../api/pt-lessons';
import { PtLessonFormScreen } from '../pt-lesson-form-screen';

const mockGoBack = jest.fn();

jest.mock('@granite-js/react-native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

jest.mock('../../api/pt-lessons', () => ({
  useCreatePtLesson: jest.fn(),
  usePtLesson: jest.fn(),
  useUpdatePtLesson: jest.fn(),
}));

jest.mock('shared/components/icons/pt-diary-icons', () => {
  const { Text: MockText } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    OriginalAppIcon: ({ name }: { name: string }) => (
      <MockText>{`icon:${name}`}</MockText>
    ),
  };
});

describe('PT 수업일지 작성 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useCreatePtLesson).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    } as never);
    jest.mocked(useUpdatePtLesson).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    } as never);
  });

  it('원본 icon header와 운동 편집 affordance를 표시한다', () => {
    render(<PtLessonFormScreen contentBottomInset={80} />);

    expect(screen.getByText('새 수업일지')).toBeTruthy();
    expect(screen.getByText('icon:close')).toBeTruthy();
    expect(screen.getByText('icon:checkmark')).toBeTruthy();
    expect(screen.getByText('icon:addCircle')).toBeTruthy();
    expect(screen.getAllByText('icon:removeCircleOutline')).toHaveLength(3);
    expect(screen.getByText('icon:add')).toBeTruthy();
  });

  it('운동 추가 후 각 카드에 원본 trash action을 노출한다', () => {
    render(<PtLessonFormScreen contentBottomInset={80} />);

    fireEvent.press(screen.getByLabelText('운동 추가'));

    expect(screen.getAllByText('icon:trashOutline')).toHaveLength(2);
    expect(screen.getByLabelText('운동종목 1 삭제')).toBeTruthy();
    expect(screen.getByLabelText('운동종목 2 삭제')).toBeTruthy();
  });

  it('저장 중에는 icon button 위치에서 spinner 상태를 표시한다', () => {
    jest.mocked(useCreatePtLesson).mockReturnValue({
      isPending: true,
      mutateAsync: jest.fn(),
    } as never);

    render(<PtLessonFormScreen contentBottomInset={80} />);

    expect(screen.getByLabelText('저장 중')).toBeDisabled();
    expect(screen.queryByText('icon:checkmark')).toBeNull();
    expect(screen.queryByText('저장 중')).toBeNull();
  });
});
