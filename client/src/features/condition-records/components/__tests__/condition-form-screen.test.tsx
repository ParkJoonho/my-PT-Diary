import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import {
  useCreateConditionRecord,
  useUpdateConditionRecord,
} from '../../api/condition-records';
import { createConditionFormState } from '../../lib/condition-form';
import { useConditionFormStore } from '../../stores/use-condition-form-store';
import { ConditionFormScreen } from '../condition-form-screen';

const mockGoBack = jest.fn();

jest.mock('@granite-js/react-native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

jest.mock('../../api/condition-records', () => ({
  useConditionRecord: jest.fn(),
  useCreateConditionRecord: jest.fn(),
  useUpdateConditionRecord: jest.fn(),
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

describe('컨디션 기록 작성 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useCreateConditionRecord).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    } as never);
    jest.mocked(useUpdateConditionRecord).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    } as never);
    useConditionFormStore.setState({
      form: createConditionFormState(),
      muscleTooltipLabel: null,
    });
  });

  it('원본 icon header와 점수 안내 affordance를 표시한다', () => {
    render(<ConditionFormScreen contentBottomInset={80} />);

    expect(screen.getAllByText('컨디션 체크')).toHaveLength(2);
    expect(screen.getByText('icon:close')).toBeTruthy();
    expect(screen.getByText('icon:checkmark')).toBeTruthy();
    expect(screen.getByText('icon:informationCircle')).toBeTruthy();
    expect(
      screen.getAllByText('icon:helpCircleOutline').length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText('닫기')).toBeNull();
    expect(screen.queryByText('저장')).toBeNull();
  });

  it('근육 부위를 누르면 원본 아이콘이 있는 위치 안내를 연다', () => {
    render(<ConditionFormScreen contentBottomInset={80} />);

    fireEvent.press(screen.getByText('가슴'));

    expect(screen.getByText('가슴 (대흉근)')).toBeTruthy();
    expect(screen.getByText('icon:closeCircle')).toBeTruthy();
    expect(screen.getByText('icon:location')).toBeTruthy();
    expect(screen.getByText('icon:body')).toBeTruthy();
    expect(screen.getByText('icon:barbell')).toBeTruthy();
  });

  it('저장 중에는 icon button 위치에서 spinner 상태를 표시한다', () => {
    jest.mocked(useCreateConditionRecord).mockReturnValue({
      isPending: true,
      mutateAsync: jest.fn(),
    } as never);

    render(<ConditionFormScreen contentBottomInset={80} />);

    expect(screen.getByLabelText('저장 중')).toBeDisabled();
    expect(screen.queryByText('icon:checkmark')).toBeNull();
    expect(screen.queryByText('저장 중')).toBeNull();
  });
});
