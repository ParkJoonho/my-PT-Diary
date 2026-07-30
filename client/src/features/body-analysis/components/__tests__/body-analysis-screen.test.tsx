import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useAnalyzeBody } from '../../api/body-analysis';
import { useBodyAnalysisEntryStore } from '../../stores/use-body-analysis-entry-store';
import { BodyAnalysisScreen } from '../body-analysis-screen';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@granite-js/react-native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
}));

jest.mock('../../api/body-analysis', () => ({
  useAnalyzeBody: jest.fn(),
}));

jest.mock('../../api/analysis-records', () => ({
  useCreateAnalysisRecord: () => ({
    isPending: false,
    mutateAsync: jest.fn(),
  }),
}));

jest.mock('../../lib/pick-image', () => ({
  pickSingleImage: jest.fn(),
}));

jest.mock('../analysis-record-save-banner', () => ({
  AnalysisRecordSaveBanner: () => null,
}));

jest.mock('../body-analysis-result', () => ({
  BodyAnalysisResultView: () => null,
}));

jest.mock('../body-comparison-section', () => {
  const { Text } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    BodyComparisonSection: () => <Text>전/후 비교 분석</Text>,
  };
});

jest.mock('shared/components/icons/pt-diary-icons', () => {
  const { Text } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    OriginalAppIcon: ({ name }: { name: string }) => (
      <Text>{`icon:${name}`}</Text>
    ),
    SemanticIcon: ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text>,
  };
});

describe('AI 체형 분석 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAnalyzeBody).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    } as never);
    useBodyAnalysisEntryStore.setState({ pendingEntryPoint: 'default' });
  });

  it('원본 icon header와 입력 카드 구성을 표시한다', () => {
    render(<BodyAnalysisScreen contentBottomInset={80} />);

    expect(screen.getByText('icon:chevronLeft')).toBeTruthy();
    expect(screen.getByText('icon:timeOutline')).toBeTruthy();
    expect(screen.getByText('icon:humanHandsUp')).toBeTruthy();
    expect(screen.getByText('icon:fitness')).toBeTruthy();
    expect(screen.getByText('icon:human')).toBeTruthy();
    expect(screen.getByText('icon:humanMaleBoard')).toBeTruthy();
    expect(screen.getAllByText('icon:shoePrint').length).toBeGreaterThan(0);
    expect(screen.getByText('icon:medicalBag')).toBeTruthy();
    expect(screen.getByText('icon:brain')).toBeTruthy();
    expect(screen.getByText('키 입력 (선택사항)')).toBeTruthy();
    expect(screen.getByText('의료 증상 입력 (선택사항)')).toBeTruthy();
  });

  it('다중 각도 영역을 열면 원본 촬영 항목 아이콘을 표시한다', () => {
    render(<BodyAnalysisScreen contentBottomInset={80} />);

    fireEvent.press(screen.getByText('다중 각도 촬영 (선택)'));

    expect(screen.getByText('icon:humanMaleHeight')).toBeTruthy();
    expect(screen.getByText('icon:humanHandsDown')).toBeTruthy();
    expect(screen.getByText('측면 사진')).toBeTruthy();
    expect(screen.getByText('후면 사진')).toBeTruthy();
    expect(screen.getByText('스쿼트 사진')).toBeTruthy();
  });

  it('분석 중에는 원본 버튼 위치에 spinner 상태를 표시한다', () => {
    jest.mocked(useAnalyzeBody).mockReturnValue({
      isPending: true,
      mutateAsync: jest.fn(),
    } as never);

    render(<BodyAnalysisScreen contentBottomInset={80} />);

    expect(screen.getByText('AI 분석 중...')).toBeTruthy();
    expect(screen.queryByText('icon:brain')).toBeNull();
  });

  it('기록 아이콘을 누르면 분석 기록 화면으로 이동한다', () => {
    render(<BodyAnalysisScreen contentBottomInset={80} />);

    fireEvent.press(screen.getByLabelText('체형 분석 기록'));

    expect(mockNavigate).toHaveBeenCalledWith({
      name: '/analysis-history',
      params: {},
    });
  });
});
