import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import { bodyAnalysisControllerAnalyzeBody } from 'shared/api/generated/endpoints/body-analysis/body-analysis';
import { useTrackerUserKey } from 'shared/api/user-key';
import { selectBodyAnalysisResponse, useAnalyzeBody } from '../body-analysis';

jest.mock('shared/api/generated/endpoints/body-analysis/body-analysis', () => ({
  bodyAnalysisControllerAnalyzeBody: jest.fn(),
}));

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
  };
});

describe('체형 분석 API 래퍼', () => {
  const mockedUseTrackerUserKey = jest.mocked(useTrackerUserKey);
  const mockedAnalyzeBody = jest.mocked(bodyAnalysisControllerAnalyzeBody);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('사용자 키 헤더로 체형 분석 요청을 보낸다', async () => {
    mockedUseTrackerUserKey.mockReturnValue('테스트-사용자');
    mockedAnalyzeBody.mockResolvedValue({
      data: {
        analysis: {
          bodyType: 'V',
          summary: '상체 안정화가 중요해 보여요.',
        },
        analyzedAt: '2026-07-28T01:23:45.000Z',
        recordSave: {
          recordId: 'record_saved',
          status: 'saved',
        },
      },
      headers: new Headers(),
      status: 200,
    });

    const { result } = renderHook(() => useAnalyzeBody());

    const response = await result.current.mutateAsync({
      imageBase64: 'a'.repeat(200),
    });

    expect(mockedAnalyzeBody).toHaveBeenCalledWith(
      {
        imageBase64: 'a'.repeat(200),
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
      selectBodyAnalysisResponse({
        data: undefined,
        headers: new Headers(),
        status: 503,
      }),
    ).toThrow('체형 분석 AI 기능이 아직 설정되지 않았어요.');
  });

  it('200 응답만 성공으로 허용한다', () => {
    expect(
      selectBodyAnalysisResponse({
        data: {
          analysis: {
            bodyType: 'V',
            summary: 'ok',
          },
          analyzedAt: '2026-07-28T01:23:45.000Z',
          recordSave: {
            status: 'failed',
          },
        },
        headers: new Headers(),
        status: 200,
      }),
    ).toEqual(
      expect.objectContaining({
        recordSave: expect.objectContaining({
          status: 'failed',
        }),
      }),
    );
  });
});
