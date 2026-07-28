import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import {
  analysisRecordsControllerCompareAnalysisRecords,
  analysisRecordsControllerCreateAnalysisRecord,
  analysisRecordsControllerGetAnalysisRecord,
  analysisRecordsControllerListAnalysisRecords,
} from 'shared/api/generated/endpoints/analysis-records/analysis-records';
import { useTrackerUserKey } from 'shared/api/user-key';
import {
  selectAnalysisComparison,
  selectAnalysisRecord,
  useAnalysisRecords,
  useCreateAnalysisRecord,
} from '../analysis-records';

jest.mock(
  'shared/api/generated/endpoints/analysis-records/analysis-records',
  () => ({
    analysisRecordsControllerCompareAnalysisRecords: jest.fn(),
    analysisRecordsControllerCreateAnalysisRecord: jest.fn(),
    analysisRecordsControllerGetAnalysisRecord: jest.fn(),
    analysisRecordsControllerListAnalysisRecords: jest.fn(),
  }),
);

jest.mock('shared/api/user-key', () => ({
  useTrackerUserKey: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query') as Record<
    string,
    unknown
  >;

  return {
    ...actual,
    useMutation: jest.fn(
      (options: { mutationFn: (variables: unknown) => unknown }) => ({
        mutateAsync: options.mutationFn,
      }),
    ),
    useQueryClient: jest.fn(() => ({
      invalidateQueries: jest.fn(),
    })),
    useSuspenseQuery: jest.fn((options: { queryFn: () => unknown }) => ({
      data: options.queryFn(),
    })),
  };
});

describe('분석 기록 API 래퍼', () => {
  const mockedUseTrackerUserKey = jest.mocked(useTrackerUserKey);
  const mockedListRecords = jest.mocked(
    analysisRecordsControllerListAnalysisRecords,
  );
  const mockedGetRecord = jest.mocked(
    analysisRecordsControllerGetAnalysisRecord,
  );
  const mockedCreateRecord = jest.mocked(
    analysisRecordsControllerCreateAnalysisRecord,
  );
  const mockedCompareRecords = jest.mocked(
    analysisRecordsControllerCompareAnalysisRecords,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('사용자 키 헤더로 분석 기록 목록을 조회한다', async () => {
    mockedUseTrackerUserKey.mockReturnValue('테스트-사용자');
    mockedListRecords.mockResolvedValue({
      data: [
        {
          analysisType: 'body',
          analyzedAt: '2026-07-28T01:23:45.000Z',
          createdAt: '2026-07-28T01:23:45.000Z',
          id: 'record_a',
          qualitativeData: { bodyType: 'V' },
          quantitativeData: { overallAlignment: 3 },
        },
      ],
      headers: new Headers(),
      status: 200,
    });

    const { result } = renderHook(() => useAnalysisRecords({ type: 'body' }));

    await expect(result.current.data).resolves.toHaveLength(1);
    expect(mockedListRecords).toHaveBeenCalledWith(
      { type: 'body' },
      {
        headers: {
          'x-user-key': '테스트-사용자',
        },
      },
    );
  });

  it('상세 404 응답은 NOT_FOUND 오류를 던진다', () => {
    expect(() =>
      selectAnalysisRecord({
        data: undefined,
        headers: new Headers(),
        status: 404,
      }),
    ).toThrow('NOT_FOUND');
  });

  it('비교 400 응답은 body 비교 제한 메시지로 바꾼다', () => {
    expect(() =>
      selectAnalysisComparison({
        data: undefined,
        headers: new Headers(),
        status: 400,
      }),
    ).toThrow('지금은 체형 분석 기록끼리만 비교할 수 있어요.');
  });

  it('저장 재시도는 생성된 POST 함수에 멱등 키와 사용자 키를 전달한다', async () => {
    mockedUseTrackerUserKey.mockReturnValue('테스트-사용자');
    mockedCreateRecord.mockResolvedValue({
      data: {
        analysisType: 'body',
        analyzedAt: '2026-07-28T01:23:45.000Z',
        createdAt: '2026-07-28T01:23:46.000Z',
        id: 'record_a',
        qualitativeData: {},
        quantitativeData: {},
        rawResult: { bodyType: 'V' },
      },
      headers: new Headers(),
      status: 201,
    });

    const { result } = renderHook(() => useCreateAnalysisRecord());

    await result.current.mutateAsync({
      analysisType: 'body',
      analyzedAt: '2026-07-28T01:23:45.000Z',
      idempotencyKey: 'body-analysis:2026-07-28T01:23:45.000Z',
      rawResult: { bodyType: 'V' },
    });

    expect(mockedCreateRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: 'body-analysis:2026-07-28T01:23:45.000Z',
      }),
      {
        headers: {
          'x-user-key': '테스트-사용자',
        },
      },
    );
  });

  it('생성된 엔드포인트 함수 시그니처가 유지된다', async () => {
    mockedGetRecord.mockResolvedValue({
      data: {
        analysisType: 'body',
        analyzedAt: '2026-07-28T01:23:45.000Z',
        createdAt: '2026-07-28T01:23:45.000Z',
        id: 'record_a',
        qualitativeData: {},
        quantitativeData: {},
        rawResult: { bodyType: 'V' },
      },
      headers: new Headers(),
      status: 200,
    });
    mockedCompareRecords.mockResolvedValue({
      data: {
        bodyTypeChange: { from: 'V', note: '유지돼요.', to: 'V' },
        declines: [],
        improvements: ['정렬이 좋아졌어요.'],
        motivationalNote: '좋아요.',
        newerRecord: {
          analysisType: 'body',
          analyzedAt: '2026-07-28T01:23:45.000Z',
          id: 'record_b',
        },
        olderRecord: {
          analysisType: 'body',
          analyzedAt: '2026-07-27T01:23:45.000Z',
          id: 'record_a',
        },
        overallChange: '좋아졌어요.',
        postureChanges: [],
        quantitativeChanges: [],
        recommendations: ['유지해요.'],
      },
      headers: new Headers(),
      status: 200,
    });

    await analysisRecordsControllerGetAnalysisRecord('record_a', {
      headers: { 'x-user-key': '테스트-사용자' },
    });
    await analysisRecordsControllerCompareAnalysisRecords(
      {
        recordId1: 'record_a',
        recordId2: 'record_b',
      },
      {
        headers: { 'x-user-key': '테스트-사용자' },
      },
    );

    expect(mockedGetRecord).toHaveBeenCalled();
    expect(mockedCompareRecords).toHaveBeenCalled();
  });
});
