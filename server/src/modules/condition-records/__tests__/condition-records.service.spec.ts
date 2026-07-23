import { NotFoundException } from '@nestjs/common';
import {
  ConditionRecordRow,
  ConditionRecordsRepositoryPort,
} from '../condition-records.repository.port';
import { ConditionRecordsService } from '../condition-records.service';
import { CreateConditionRecordDto } from '../dto/create-condition-record.dto';

const 컨디션요청: CreateConditionRecordDto = {
  checkedOn: '2026-07-23',
  conditionScores: {
    energy: 4,
    motivation: 5,
    sleep: 3,
    stress: 0,
  },
  memo: '수면 부족',
  muscleSoreness: {
    arms: 0,
    back: 1,
    chest: 2,
    core: 0,
    legs: 3,
    shoulders: 0,
  },
  timeZone: 'Asia/Seoul',
};

function createConditionRow(
  overrides: Partial<ConditionRecordRow> = {},
): ConditionRecordRow {
  return {
    checked_on: '2026-07-23',
    condition_scores: 컨디션요청.conditionScores,
    created_at: '2026-07-23 12:35:00+00',
    id: 'condition-1',
    memo: '수면 부족',
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
    ...overrides,
  };
}

describe('컨디션 기록 서비스', () => {
  let repository: jest.Mocked<ConditionRecordsRepositoryPort>;
  let service: ConditionRecordsService;

  beforeEach(() => {
    repository = {
      deleteConditionRecord: jest.fn(),
      findConditionRecord: jest.fn(),
      listConditionRecords: jest.fn(),
      updateConditionRecord: jest.fn(),
      upsertConditionRecord: jest.fn(),
    };
    service = new ConditionRecordsService(repository);
  });

  it('컨디션 기록을 요약해서 날짜별 upsert로 저장한다', async () => {
    repository.upsertConditionRecord.mockResolvedValue(createConditionRow());

    const result = await service.createConditionRecord('user-a', 컨디션요청);
    const createArgs = repository.upsertConditionRecord.mock.calls[0]?.[0];

    expect(createArgs).toEqual(
      expect.objectContaining({
        checkedOn: '2026-07-23',
        memo: '수면 부족',
        timeZone: 'Asia/Seoul',
        userKey: 'user-a',
      }),
    );
    expect(createArgs?.summary).toEqual({
      averageConditionScore: 4,
      averageSorenessScore: 2,
      selectedConditionCount: 3,
      selectedSorenessCount: 3,
      severeSorenessCount: 1,
    });
    expect(result.checkedOn).toBe('2026-07-23');
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
        checkedOn: '2026-07-23',
        id: 'condition-1',
        memo: '수면 부족',
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
