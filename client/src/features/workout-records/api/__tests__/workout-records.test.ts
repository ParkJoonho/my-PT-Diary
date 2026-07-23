import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { getWorkoutReportSummaryQueryKeyPrefix } from 'features/workout-reports/api/workout-report-summary';
import {
  workoutRecordsControllerCreateManualWorkoutRecord,
  workoutRecordsControllerListWorkoutRecords,
  type workoutRecordsControllerListWorkoutRecordsResponse,
} from 'shared/api/generated/endpoints/workout-records/workout-records';
import type {
  CreateManualWorkoutRecordDto,
  WorkoutRecordDto,
} from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';
import { getWeeklyTrackerSummaryQueryKeyPrefix } from 'shared/api/weekly-tracker';
import {
  getWorkoutRecordsQueryKey,
  getWorkoutRecordsQueryKeyPrefix,
  selectWorkoutRecords,
  useCreateManualWorkoutRecord,
  useWorkoutRecords,
} from '../workout-records';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn((options) => options),
  useQueryClient: jest.fn(),
  useSuspenseQuery: jest.fn((options) => options),
}));

jest.mock(
  'shared/api/generated/endpoints/workout-records/workout-records',
  () => ({
    workoutRecordsControllerCreateManualWorkoutRecord: jest.fn(),
    workoutRecordsControllerDeleteWorkoutRecord: jest.fn(),
    workoutRecordsControllerGetWorkoutRecord: jest.fn(),
    workoutRecordsControllerListWorkoutRecords: jest.fn(),
    workoutRecordsControllerUpdateManualWorkoutRecord: jest.fn(),
  }),
);

jest.mock('shared/api/user-key', () => ({
  useTrackerUserKey: jest.fn(),
}));

const 운동기록: WorkoutRecordDto = {
  bodyComposition: null,
  completedAt: '2026-07-23T12:34:56.000Z',
  completedOn: '2026-07-23',
  createdAt: '2026-07-23T12:35:00.000Z',
  durationSeconds: 3600,
  id: 'record-1',
  manualDetail: null,
  performedAt: '2026-07-23T12:34:56.000Z',
  performedOn: '2026-07-23',
  routineId: null,
  routineLabel: null,
  routineSource: null,
  source: 'manual',
  steps: [],
  summary: {
    cardioDurationSeconds: 900,
    strengthSetCount: 2,
    totalVolumeKg: 1160,
  },
  timeZone: 'Asia/Seoul',
  title: '상체 개인 운동',
  updatedAt: '2026-07-23T12:35:00.000Z',
  weeklyCompletionId: 'weekly-1',
};

const 수동운동Payload: CreateManualWorkoutRecordDto = {
  durationSeconds: 3600,
  performedAt: '2026-07-23T12:34:56.000Z',
  performedOn: '2026-07-23',
  timeZone: 'Asia/Seoul',
  title: '상체 개인 운동',
};

describe('운동 기록 API wrapper', () => {
  const mockedUseSuspenseQuery = jest.mocked(useSuspenseQuery);
  const mockedUseMutation = jest.mocked(useMutation);
  const mockedUseQueryClient = jest.mocked(useQueryClient);
  const mockedUseTrackerUserKey = jest.mocked(useTrackerUserKey);
  const mockedListWorkoutRecords = jest.mocked(
    workoutRecordsControllerListWorkoutRecords,
  );
  const mockedCreateManualWorkoutRecord = jest.mocked(
    workoutRecordsControllerCreateManualWorkoutRecord,
  );
  const queryClient = {
    invalidateQueries: jest.fn(),
    removeQueries: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTrackerUserKey.mockReturnValue('테스트-사용자');
    mockedUseQueryClient.mockReturnValue(queryClient as never);
    mockedListWorkoutRecords.mockResolvedValue({
      data: [운동기록],
      headers: new Headers(),
      status: 200,
    });
    mockedCreateManualWorkoutRecord.mockResolvedValue({
      data: 운동기록,
      headers: new Headers(),
      status: 201,
    });
  });

  it('목록 queryKey와 사용자 키 헤더로 운동 기록을 조회한다', async () => {
    renderHook(() =>
      useWorkoutRecords({
        from: '2026-07-01',
        to: '2026-07-31',
      }),
    );

    const options = mockedUseSuspenseQuery.mock.calls[0]?.[0];

    expect(options?.queryKey).toEqual(
      getWorkoutRecordsQueryKey('테스트-사용자', {
        from: '2026-07-01',
        to: '2026-07-31',
      }),
    );

    await options?.queryFn?.({} as never);

    expect(mockedListWorkoutRecords).toHaveBeenCalledWith(
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

  it('수동 운동 생성 성공 후 운동기록·리포트·주간트래커 캐시를 무효화한다', async () => {
    renderHook(() => useCreateManualWorkoutRecord());

    const options = mockedUseMutation.mock.calls[0]?.[0];
    const result = await options?.mutationFn?.(수동운동Payload, {} as never);

    expect(result).toEqual(운동기록);

    options?.onSuccess?.(운동기록, 수동운동Payload, undefined, {} as never);

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: getWorkoutRecordsQueryKeyPrefix('테스트-사용자'),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: getWorkoutReportSummaryQueryKeyPrefix('테스트-사용자'),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: getWeeklyTrackerSummaryQueryKeyPrefix('테스트-사용자'),
    });
  });

  it('성공 응답에서 운동 기록 목록 DTO를 선택한다', () => {
    expect(
      selectWorkoutRecords({
        data: [운동기록],
        headers: new Headers(),
        status: 200,
      }),
    ).toEqual([운동기록]);
  });

  it('성공 응답이 아니면 오류를 던진다', () => {
    expect(() =>
      selectWorkoutRecords({
        data: undefined,
        headers: new Headers(),
        status: 400,
      } satisfies workoutRecordsControllerListWorkoutRecordsResponse),
    ).toThrow('운동 기록 목록 조회에 실패했어요.');
  });
});
