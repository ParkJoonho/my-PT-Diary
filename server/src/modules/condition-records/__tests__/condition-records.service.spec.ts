import { NotFoundException } from '@nestjs/common';
import {
  ConditionRecordRow,
  ConditionRecordsRepositoryPort,
} from '../condition-records.repository.port';
import {
  CONDITION_LABELS,
  MUSCLE_SORENESS_LABELS,
} from '../condition-records.constants';
import { ConditionRecordsService } from '../condition-records.service';
import { CreateConditionRecordDto } from '../dto/create-condition-record.dto';

function getConditionScore(label: string) {
  switch (label) {
    case '훈련 동기':
      return 5;
    case '수면시간':
      return 3;
    case '수행력':
      return 4;
    default:
      return 0;
  }
}

function getSorenessScore(label: string) {
  switch (label) {
    case '가슴':
      return 2;
    case '광배근':
      return 1;
    case '대퇴사두근':
      return 3;
    default:
      return 0;
  }
}

const 컨디션요청: CreateConditionRecordDto = {
  conditions: CONDITION_LABELS.map((label) => ({
    label,
    score: getConditionScore(label),
  })),
  date: '2026-07-23',
  muscleSoreness: MUSCLE_SORENESS_LABELS.map((label) => ({
    label,
    score: getSorenessScore(label),
  })),
  timeZone: 'Asia/Seoul',
  weekNumber: 1,
};

function createConditionRow(
  overrides: Partial<ConditionRecordRow> = {},
): ConditionRecordRow {
  return {
    checked_on: '2026-07-23',
    condition_scores: 컨디션요청.conditions,
    created_at: '2026-07-23 12:35:00+00',
    id: 'condition-1',
    muscle_soreness: 컨디션요청.muscleSoreness,
    summary: {
      averageConditionScore: 4,
      averageSorenessScore: 2,
      selectedConditionCount: 3,
      selectedSorenessCount: 3,
      severeSorenessCount: 1,
    },
    time_zone: 'Asia/Seoul',
    updated_at: '2026-07-23 12:35:00+00',
    user_key: 'user-a',
    week_number: 1,
    ...overrides,
  };
}

describe('컨디션 기록 서비스', () => {
  let repository: jest.Mocked<ConditionRecordsRepositoryPort>;
  let service: ConditionRecordsService;

  beforeEach(() => {
    repository = {
      createConditionRecord: jest.fn(),
      deleteConditionRecord: jest.fn(),
      findConditionRecord: jest.fn(),
      listConditionRecords: jest.fn(),
      updateConditionRecord: jest.fn(),
    };
    service = new ConditionRecordsService(repository);
  });

  it('컨디션 기록을 요약해서 새 레코드로 저장한다', async () => {
    repository.createConditionRecord.mockResolvedValue(createConditionRow());

    const result = await service.createConditionRecord('user-a', 컨디션요청);
    const createArgs = repository.createConditionRecord.mock.calls[0]?.[0];

    expect(createArgs).toEqual(
      expect.objectContaining({
        date: '2026-07-23',
        timeZone: 'Asia/Seoul',
        userKey: 'user-a',
        weekNumber: 1,
      }),
    );
    expect(createArgs?.summary).toEqual({
      averageConditionScore: 4,
      averageSorenessScore: 2,
      selectedConditionCount: 3,
      selectedSorenessCount: 3,
      severeSorenessCount: 1,
    });
    expect(result.date).toBe('2026-07-23');
  });

  it('컨디션 목록을 응답 DTO로 변환한다', async () => {
    repository.listConditionRecords.mockResolvedValue([createConditionRow()]);

    const result = await service.listConditionRecords('user-a', {
      from: '2026-07-01',
      to: '2026-07-31',
    });

    expect(repository.listConditionRecords.mock.calls[0]?.[0]).toEqual({
      from: '2026-07-01',
      to: '2026-07-31',
      userKey: 'user-a',
    });
    expect(result[0]).toEqual(
      expect.objectContaining({
        date: '2026-07-23',
        id: 'condition-1',
        weekNumber: 1,
      }),
    );
  });

  it('상세 컨디션 기록이 없으면 NotFoundException을 던진다', async () => {
    repository.findConditionRecord.mockResolvedValue(null);

    await expect(
      service.getConditionRecord('user-a', 'missing-condition'),
    ).rejects.toThrow(NotFoundException);
  });
});
