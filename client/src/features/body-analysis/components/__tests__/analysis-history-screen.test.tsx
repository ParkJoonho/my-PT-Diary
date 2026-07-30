import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import {
  useAnalysisRecord,
  useAnalysisRecords,
  useCompareAnalysisRecords,
} from '../../api/analysis-records';
import { AnalysisHistoryScreen } from '../analysis-history-screen';

const mockGoBack = jest.fn();
const mockCompare = jest.fn();
const mockResetComparison = jest.fn();

const records = [
  {
    analysisType: 'body' as const,
    analyzedAt: '2026-07-29T12:00:00.000Z',
    createdAt: '2026-07-29T12:00:00.000Z',
    id: 'body-1',
    qualitativeData: {
      bodyType: 'V',
      bodyTypeDescription: '첫 번째 체형',
      summary: '첫 번째 체형',
    },
    quantitativeData: {
      hipBalance: 3,
      overallAlignment: 4,
      shoulderBalance: 2,
    },
  },
  {
    analysisType: 'body' as const,
    analyzedAt: '2026-07-28T12:00:00.000Z',
    createdAt: '2026-07-28T12:00:00.000Z',
    id: 'body-2',
    qualitativeData: {
      bodyType: 'H',
      bodyTypeDescription: '두 번째 체형',
      summary: '두 번째 체형',
    },
    quantitativeData: {
      hipBalance: 4,
      overallAlignment: 4,
      shoulderBalance: 4,
    },
  },
  {
    analysisType: 'posture' as const,
    analyzedAt: '2026-07-27T12:00:00.000Z',
    createdAt: '2026-07-27T12:00:00.000Z',
    id: 'posture-1',
    qualitativeData: {
      exerciseName: '백 스쿼트',
      grade: 'A',
      summary: '자세가 안정적이에요.',
    },
    quantitativeData: {
      accuracyScore: 8,
      injuryRiskScore: 2,
    },
  },
  {
    analysisType: 'state-vector' as const,
    analyzedAt: '2026-07-26T12:00:00.000Z',
    createdAt: '2026-07-26T12:00:00.000Z',
    id: 'state-1',
    qualitativeData: {
      compositeGrade: 'B',
      summary: '균형을 유지하고 있어요.',
    },
    quantitativeData: {
      compositeScore: 74,
    },
  },
];

jest.mock('@granite-js/react-native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

jest.mock('@granite-js/native/react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('../../api/analysis-records', () => ({
  useAnalysisRecord: jest.fn(),
  useAnalysisRecords: jest.fn(),
  useCompareAnalysisRecords: jest.fn(),
}));

jest.mock('../analysis-record-comparison-result', () => {
  const { Text } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    AnalysisRecordComparisonResult: () => <Text>비교 결과 본문</Text>,
  };
});

jest.mock('../analysis-record-detail-content', () => {
  const { Text } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    AnalysisRecordDetailContent: ({
      record,
    }: {
      record: { analysisType: string };
    }) => <Text>{`상세:${record.analysisType}`}</Text>,
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

describe('분석 기록 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAnalysisRecords).mockImplementation(
      (params) =>
        ({
          data:
            params?.type === undefined
              ? records
              : records.filter(
                  (record) => record.analysisType === params?.type,
                ),
        }) as never,
    );
    jest.mocked(useAnalysisRecord).mockReturnValue({
      data: {
        ...records[0],
        rawResult: {},
      },
    } as never);
    jest.mocked(useCompareAnalysisRecords).mockReturnValue({
      data: null,
      isPending: false,
      mutateAsync: mockCompare,
      reset: mockResetComparison,
    } as never);
  });

  it('고정 header 아래 원본 필터와 타입별 기록 요약을 표시한다', () => {
    render(<AnalysisHistoryScreen contentBottomInset={80} />);

    expect(screen.getByText('icon:chevronLeft')).toBeTruthy();
    expect(screen.getAllByText('icon:humanHandsUp')).toHaveLength(2);
    expect(screen.getByText('icon:human')).toBeTruthy();
    expect(screen.getByText('icon:brain')).toBeTruthy();
    expect(screen.getByText(/백 스쿼트/)).toBeTruthy();
    expect(screen.getByText('8/10')).toBeTruthy();
    expect(screen.getByText(/종합 등급: B/)).toBeTruthy();
    expect(screen.getByText('74')).toBeTruthy();
  });

  it('체형 기록 두 개를 선택하면 원본 비교 CTA를 표시하고 mutation을 호출한다', async () => {
    render(<AnalysisHistoryScreen contentBottomInset={80} />);

    const selectors = screen.getAllByLabelText('체형 분석 기록 비교 선택');
    const [firstSelector, secondSelector] = selectors;

    if (!firstSelector || !secondSelector) {
      throw new Error('비교할 체형 기록 selector가 부족해요.');
    }

    fireEvent.press(firstSelector, { stopPropagation: jest.fn() });
    fireEvent.press(secondSelector, { stopPropagation: jest.fn() });
    fireEvent.press(screen.getByText('선택한 2개 기록 비교 분석'));

    await waitFor(() => {
      expect(mockCompare).toHaveBeenCalledWith({
        recordId1: 'body-1',
        recordId2: 'body-2',
      });
    });
    expect(screen.getByText('icon:compareHorizontal')).toBeTruthy();
  });

  it('필터 변경 시 해당 타입의 suspense query만 다시 소비한다', () => {
    render(<AnalysisHistoryScreen contentBottomInset={80} />);

    fireEvent.press(screen.getByText('자세'));

    expect(useAnalysisRecords).toHaveBeenLastCalledWith({ type: 'posture' });
    expect(screen.getByText(/백 스쿼트/)).toBeTruthy();
    expect(screen.queryByText('첫 번째 체형')).toBeNull();
  });

  it('기록을 누르면 원본 modal header와 서버 상세 본문을 연다', () => {
    render(<AnalysisHistoryScreen contentBottomInset={80} />);

    fireEvent.press(screen.getByText('첫 번째 체형'));

    expect(screen.getByLabelText('분석 상세 닫기')).toBeTruthy();
    expect(screen.getByText('icon:close')).toBeTruthy();
    expect(screen.getByText('상세:body')).toBeTruthy();
  });
});
