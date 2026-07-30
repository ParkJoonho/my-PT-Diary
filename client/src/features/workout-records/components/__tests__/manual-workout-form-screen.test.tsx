import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import {
  useCreateManualWorkoutRecord,
  useUpdateManualWorkoutRecord,
} from '../../api/workout-records';
import { createManualWorkoutFormState } from '../../lib/manual-workout-form';
import { useManualWorkoutFormStore } from '../../stores/use-manual-workout-form-store';
import { ManualWorkoutFormScreen } from '../manual-workout-form-screen';

const mockGoBack = jest.fn();

jest.mock('@granite-js/react-native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

jest.mock('../../api/workout-records', () => ({
  useCreateManualWorkoutRecord: jest.fn(),
  useUpdateManualWorkoutRecord: jest.fn(),
  useWorkoutRecord: jest.fn(),
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

describe('운동 기록 작성 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useCreateManualWorkoutRecord).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    } as never);
    jest.mocked(useUpdateManualWorkoutRecord).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    } as never);
    useManualWorkoutFormStore.setState({
      form: createManualWorkoutFormState(),
    });
  });

  it('원본 icon header와 운동 편집 affordance를 표시한다', () => {
    render(<ManualWorkoutFormScreen contentBottomInset={80} />);

    expect(screen.getByText('새 운동기록')).toBeTruthy();
    expect(screen.getByText('icon:close')).toBeTruthy();
    expect(screen.getByText('icon:checkmark')).toBeTruthy();
    expect(screen.getByText('icon:addCircle')).toBeTruthy();
    expect(screen.getAllByText('icon:removeCircleOutline')).toHaveLength(3);
    expect(screen.getByText('icon:add')).toBeTruthy();
    expect(screen.queryByText(/총 볼륨/)).toBeNull();
    expect(screen.queryByText('삭제')).toBeNull();
  });

  it('운동 추가 후 각 운동 카드에 원본 trash action을 노출한다', () => {
    render(<ManualWorkoutFormScreen contentBottomInset={80} />);

    fireEvent.press(screen.getByLabelText('운동 추가'));

    expect(screen.getAllByText('icon:trashOutline')).toHaveLength(2);
    expect(screen.getByLabelText('운동종목 1 삭제')).toBeTruthy();
    expect(screen.getByLabelText('운동종목 2 삭제')).toBeTruthy();
  });

  it('저장 중에는 icon button 위치에서 spinner 상태를 표시한다', () => {
    jest.mocked(useCreateManualWorkoutRecord).mockReturnValue({
      isPending: true,
      mutateAsync: jest.fn(),
    } as never);

    render(<ManualWorkoutFormScreen contentBottomInset={80} />);

    expect(screen.getByLabelText('저장 중')).toBeDisabled();
    expect(screen.queryByText('icon:checkmark')).toBeNull();
    expect(screen.queryByText('저장 중')).toBeNull();
  });
});
