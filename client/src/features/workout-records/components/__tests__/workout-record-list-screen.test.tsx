import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import {
  useDeleteWorkoutRecord,
  useWorkoutRecords,
} from '../../api/workout-records';
import { useWorkoutRecordListStore } from '../../stores/use-workout-record-list-store';
import { WorkoutRecordListScreen } from '../workout-record-list-screen';

const mockNavigate = jest.fn();

jest.mock('@granite-js/react-native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('@granite-js/native/react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('../../api/workout-records', () => ({
  useDeleteWorkoutRecord: jest.fn(),
  useWorkoutRecords: jest.fn(),
}));

jest.mock('shared/components/icons/pt-diary-icons', () => {
  const { Text: MockText } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    OriginalAppIcon: ({ name }: { name: string }) => (
      <MockText>{`icon:${name}`}</MockText>
    ),
    SemanticIcon: ({ name }: { name: string }) => (
      <MockText>{`icon:${name}`}</MockText>
    ),
  };
});

describe('운동 기록 목록 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useWorkoutRecords).mockReturnValue({
      data: [],
      refetch: jest.fn(),
    } as never);
    jest.mocked(useDeleteWorkoutRecord).mockReturnValue({
      mutateAsync: jest.fn(),
    } as never);
    useWorkoutRecordListStore.setState({
      dateRange: { end: null, start: null },
      displayCount: 10,
      isCalendarOpen: false,
    });
  });

  it('임시 상단 헤더 없이 원본 필터와 빈 상태를 표시한다', () => {
    render(
      <WorkoutRecordListScreen
        contentBottomInset={100}
        floatingActionBottomInset={100}
      />,
    );

    expect(screen.getByText('전체 운동기록')).toBeTruthy();
    expect(screen.getByText('icon:calendarOutline')).toBeTruthy();
    expect(screen.getByText('icon:chevronDown')).toBeTruthy();
    expect(screen.getByText('icon:barbellOutline')).toBeTruthy();
    expect(screen.getByText('운동기록이 없어요')).toBeTruthy();
    expect(screen.getByText('+ 버튼을 눌러 운동을 기록하세요')).toBeTruthy();
    expect(screen.queryByText('닫기')).toBeNull();
    expect(screen.queryByText('작성')).toBeNull();
  });

  it('날짜 필터와 우하단 작성 FAB를 실제 동작에 연결한다', () => {
    render(
      <WorkoutRecordListScreen
        contentBottomInset={100}
        floatingActionBottomInset={100}
      />,
    );

    fireEvent.press(screen.getByLabelText('날짜 필터'));
    expect(screen.getByText('시작 날짜를 선택하세요')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('운동 기록 작성'));
    expect(mockNavigate).toHaveBeenCalledWith({
      name: '/exercise-form',
      params: {},
    });
  });
});
