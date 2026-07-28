import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AnalysisRecordComparisonClientPort } from '../analysis-record-comparison.client.port';
import {
  AnalysisRecordsRepositoryPort,
  AnalysisRecordRow,
} from '../analysis-records.repository.port';
import { AnalysisRecordsService } from '../analysis-records.service';

describe('분석 이력 서비스', () => {
  let repository: jest.Mocked<AnalysisRecordsRepositoryPort>;
  let comparisonClient: jest.Mocked<AnalysisRecordComparisonClientPort>;
  let service: AnalysisRecordsService;

  const bodyRecordA: AnalysisRecordRow = {
    analyzed_at: '2026-07-27T09:00:00.000Z',
    analysis_type: 'body',
    created_at: '2026-07-27T09:00:00.000Z',
    id: 'record_a',
    qualitative_data: { bodyType: 'V' },
    quantitative_data: { overallAlignment: 2 },
    raw_result: { bodyType: 'V', posture: { overallAlignment: { score: 2 } } },
    user_key: 'user-a',
  };
  const bodyRecordB: AnalysisRecordRow = {
    analyzed_at: '2026-07-28T09:00:00.000Z',
    analysis_type: 'body',
    created_at: '2026-07-28T09:00:00.000Z',
    id: 'record_b',
    qualitative_data: { bodyType: 'V' },
    quantitative_data: { overallAlignment: 4 },
    raw_result: { bodyType: 'V', posture: { overallAlignment: { score: 4 } } },
    user_key: 'user-a',
  };

  beforeEach(() => {
    repository = {
      createAnalysisRecord: jest.fn(),
      findAnalysisRecord: jest.fn(),
      listAnalysisRecords: jest.fn(),
    };
    comparisonClient = {
      compareRecords: jest.fn(),
    };

    service = new AnalysisRecordsService(repository, comparisonClient);
  });

  it('같은 사용자와 멱등 키의 저장 재시도는 같은 기록 ID를 사용한다', async () => {
    repository.createAnalysisRecord.mockResolvedValue(bodyRecordA);
    const record = {
      analyzedAt: '2026-07-28T01:23:45.000Z',
      analysisType: 'body' as const,
      idempotencyKey: 'body-analysis:2026-07-28T01:23:45.000Z',
      rawResult: { bodyType: 'V' },
    };

    await service.createAnalysisRecord('user-a', record);
    await service.createAnalysisRecord('user-a', record);

    const firstRecordId =
      repository.createAnalysisRecord.mock.calls[0]?.[0].recordId;
    const secondRecordId =
      repository.createAnalysisRecord.mock.calls[1]?.[0].recordId;

    expect(firstRecordId).toMatch(/^record_[a-f0-9]{64}$/);
    expect(secondRecordId).toBe(firstRecordId);
  });

  it('목록 조회는 저장 row를 응답 DTO로 매핑한다', async () => {
    repository.listAnalysisRecords.mockResolvedValue([
      bodyRecordA,
      bodyRecordB,
    ]);

    const result = await service.listAnalysisRecords('user-a', {});

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({
        analysisType: 'body',
        id: 'record_a',
      }),
    );
  });

  it('상세 조회는 rawResult까지 반환한다', async () => {
    repository.findAnalysisRecord.mockResolvedValue(bodyRecordA);

    const result = await service.getAnalysisRecord('user-a', 'record_a');

    expect(result.rawResult).toEqual(bodyRecordA.raw_result);
  });

  it('없는 기록 상세는 404를 던진다', async () => {
    repository.findAnalysisRecord.mockResolvedValue(null);

    await expect(
      service.getAnalysisRecord('user-a', 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('body 타입 두 건 비교는 AI 비교 클라이언트를 호출한다', async () => {
    repository.findAnalysisRecord
      .mockResolvedValueOnce(bodyRecordA)
      .mockResolvedValueOnce(bodyRecordB);
    comparisonClient.compareRecords.mockResolvedValue({
      bodyTypeChange: {
        from: 'V',
        note: '체형은 유지돼요.',
        to: 'V',
      },
      declines: [],
      improvements: ['어깨 균형이 좋아졌어요.'],
      motivationalNote: '좋은 흐름이에요.',
      overallChange: '전반적으로 좋아졌어요.',
      postureChanges: [
        {
          after: 4,
          area: 'overallAlignment',
          before: 2,
          change: '개선',
          note: '정렬이 좋아졌어요.',
        },
      ],
      quantitativeChanges: [],
      recommendations: ['지금 루틴을 유지해요.'],
    });

    const result = await service.compareAnalysisRecords('user-a', {
      recordId1: 'record_a',
      recordId2: 'record_b',
    });

    expect(comparisonClient.compareRecords.mock.calls[0]).toEqual([
      {
        newerRecord: bodyRecordB,
        olderRecord: bodyRecordA,
      },
    ]);
    expect(result.olderRecord.id).toBe('record_a');
    expect(result.newerRecord.id).toBe('record_b');
  });

  it('body가 아닌 기록 비교는 400을 던진다', async () => {
    repository.findAnalysisRecord
      .mockResolvedValueOnce({
        ...bodyRecordA,
        analysis_type: 'posture',
      })
      .mockResolvedValueOnce(bodyRecordB);

    await expect(
      service.compareAnalysisRecords('user-a', {
        recordId1: 'record_a',
        recordId2: 'record_b',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
