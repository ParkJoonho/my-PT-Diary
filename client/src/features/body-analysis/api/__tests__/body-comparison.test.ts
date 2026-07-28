import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import {
  bodyComparisonControllerAnalyzeBodyComparison,
} from 'shared/api/generated/endpoints/body-comparison/body-comparison';
import { useTrackerUserKey } from 'shared/api/user-key';
import {
  selectBodyComparisonResponse,
  useAnalyzeBodyComparison,
} from '../body-comparison';

jest.mock(
  'shared/api/generated/endpoints/body-comparison/body-comparison',
  () => ({
    bodyComparisonControllerAnalyzeBodyComparison: jest.fn(),
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
    useMutation: jest.fn((options: { mutationFn: (variables: unknown) => unknown }) => ({
      mutateAsync: options.mutationFn,
    })),
    useQueryClient: jest.fn(() => ({
      invalidateQueries: jest.fn(),
    })),
  };
});

describe('전·후 비교 분석 API 래퍼', () => {
  const mockedUseTrackerUserKey = jest.mocked(useTrackerUserKey);
  const mockedAnalyzeComparison = jest.mocked(
    bodyComparisonControllerAnalyzeBodyComparison,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('사용자 키 헤더로 전·후 비교 분석 요청을 보낸다', async () => {
    mockedUseTrackerUserKey.mockReturnValue('테스트-사용자');
    mockedAnalyzeComparison.mockResolvedValue({
      data: {
        analyzedAt: '2026-07-28T01:23:45.000Z',
        comparison: {
          overallChange: {
            grade: 'A',
            score: 84,
            summary: '상체와 코어 안정성이 전반적으로 좋아졌어요.',
          },
        },
        recordSave: {
          recordId: 'record_saved',
          status: 'saved',
        },
      },
      headers: new Headers(),
      status: 200,
    });

    const { result } = renderHook(() => useAnalyzeBodyComparison());

    const response = await result.current.mutateAsync({
      afterImageBase64: 'b'.repeat(200),
      beforeImageBase64: 'a'.repeat(200),
    });

    expect(mockedAnalyzeComparison).toHaveBeenCalledWith(
      {
        afterImageBase64: 'b'.repeat(200),
        beforeImageBase64: 'a'.repeat(200),
      },
      {
        headers: {
          'x-user-key': '테스트-사용자',
        },
      },
    );
    expect(response.recordSave.status).toBe('saved');
  });

  it('503 응답은 설정 오류 메시지로 바꾼다', () => {
    expect(() =>
      selectBodyComparisonResponse({
        data: undefined,
        headers: new Headers(),
        status: 503,
      }),
    ).toThrow('체형 비교 분석 AI 기능이 아직 설정되지 않았어요.');
  });

  it('400 응답은 입력 오류 메시지로 바꾼다', () => {
    expect(() =>
      selectBodyComparisonResponse({
        data: undefined,
        headers: new Headers(),
        status: 400,
      }),
    ).toThrow('전·후 사진과 입력값을 다시 확인해 주세요.');
  });
});
