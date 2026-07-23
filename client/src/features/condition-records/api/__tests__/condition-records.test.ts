import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { getWorkoutReportSummaryQueryKeyPrefix } from 'features/workout-reports/api/workout-report-summary';
import {
  conditionRecordsControllerCreateConditionRecord,
  conditionRecordsControllerListConditionRecords,
  type conditionRecordsControllerListConditionRecordsResponse,
} from 'shared/api/generated/endpoints/condition-records/condition-records';
import type {
  ConditionRecordDto,
  CreateConditionRecordDto,
} from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';
import {
  getConditionRecordsQueryKey,
  getConditionRecordsQueryKeyPrefix,
  selectConditionRecords,
  useConditionRecords,
  useCreateConditionRecord,
} from '../condition-records';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn((options) => options),
  useQueryClient: jest.fn(),
  useSuspenseQuery: jest.fn((options) => options),
}));

jest.mock(
  'shared/api/generated/endpoints/condition-records/condition-records',
  () => ({
    conditionRecordsControllerCreateConditionRecord: jest.fn(),
    conditionRecordsControllerDeleteConditionRecord: jest.fn(),
    conditionRecordsControllerGetConditionRecord: jest.fn(),
    conditionRecordsControllerListConditionRecords: jest.fn(),
    conditionRecordsControllerUpdateConditionRecord: jest.fn(),
  }),
);

jest.mock('shared/api/user-key', () => ({
  useTrackerUserKey: jest.fn(),
}));

const 컨디션기록: ConditionRecordDto = {
  checkedOn: '2026-07-23',
  conditionScores: {
    energy: 4,
    motivation: 5,
    sleep: 3,
    stress: 0,
  },
  createdAt: '2026-07-23T12:35:00.000Z',
  id: 'condition-1',
  memo: null,
  muscleSoreness: {
    arms: 0,
    back: 1,
    chest: 2,
    core: 0,
    legs: 3,
    shoulders: 0,
  },
  summary: {
    averageConditionScore: 4,
    averageSorenessScore: 2,
    selectedConditionCount: 3,
    selectedSorenessCount: 3,
    severeSorenessCount: 1,
  },
  timeZone: 'Asia/Seoul',
  updatedAt: '2026-07-23T12:35:00.000Z',
};

const 컨디션Payload: CreateConditionRecordDto = {
  checkedOn: '2026-07-23',
  conditionScores: 컨디션기록.conditionScores,
  muscleSoreness: 컨디션기록.muscleSoreness,
  timeZone: 'Asia/Seoul',
};

describe('컨디션 기록 API wrapper', () => {
  const mockedUseSuspenseQuery = jest.mocked(useSuspenseQuery);
  const mockedUseMutation = jest.mocked(useMutation);
  const mockedUseQueryClient = jest.mocked(useQueryClient);
  const mockedUseTrackerUserKey = jest.mocked(useTrackerUserKey);
  const mockedListConditionRecords = jest.mocked(
    conditionRecordsControllerListConditionRecords,
  );
  const mockedCreateConditionRecord = jest.mocked(
    conditionRecordsControllerCreateConditionRecord,
  );
  const queryClient = {
    invalidateQueries: jest.fn(),
    removeQueries: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTrackerUserKey.mockReturnValue('테스트-사용자');
    mockedUseQueryClient.mockReturnValue(queryClient as never);
    mockedListConditionRecords.mockResolvedValue({
      data: [컨디션기록],
      headers: new Headers(),
      status: 200,
    });
    mockedCreateConditionRecord.mockResolvedValue({
      data: 컨디션기록,
      headers: new Headers(),
      status: 201,
    });
  });

  it('목록 queryKey와 사용자 키 헤더로 컨디션 기록을 조회한다', async () => {
    renderHook(() =>
      useConditionRecords({
        from: '2026-07-01',
        to: '2026-07-31',
      }),
    );

    const options = mockedUseSuspenseQuery.mock.calls[0]?.[0];

    expect(options?.queryKey).toEqual(
      getConditionRecordsQueryKey('테스트-사용자', {
        from: '2026-07-01',
        to: '2026-07-31',
      }),
    );

    await options?.queryFn?.({} as never);

    expect(mockedListConditionRecords).toHaveBeenCalledWith(
      {
        from: '2026-07-01',
        to: '2026-07-31',
      },
      {
        headers: {
          'x-user-key': '테스트-사용자',
        },
      },
    );
  });

  it('컨디션 생성 성공 후 컨디션·리포트 캐시를 무효화한다', async () => {
    renderHook(() => useCreateConditionRecord());

    const options = mockedUseMutation.mock.calls[0]?.[0];
    const result = await options?.mutationFn?.(컨디션Payload, {} as never);

    expect(result).toEqual(컨디션기록);

    options?.onSuccess?.(컨디션기록, 컨디션Payload, undefined, {} as never);

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: getConditionRecordsQueryKeyPrefix('테스트-사용자'),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: getWorkoutReportSummaryQueryKeyPrefix('테스트-사용자'),
    });
  });

  it('성공 응답에서 컨디션 기록 목록 DTO를 선택한다', () => {
    expect(
      selectConditionRecords({
        data: [컨디션기록],
        headers: new Headers(),
        status: 200,
      }),
    ).toEqual([컨디션기록]);
  });

  it('성공 응답이 아니면 오류를 던진다', () => {
    expect(() =>
      selectConditionRecords({
        data: undefined,
        headers: new Headers(),
        status: 400,
      } satisfies conditionRecordsControllerListConditionRecordsResponse),
    ).toThrow('컨디션 기록 목록 조회에 실패했어요.');
  });
});
