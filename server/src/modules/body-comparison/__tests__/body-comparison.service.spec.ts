import { BadGatewayException } from '@nestjs/common';
import { AnalysisRecordsService } from '../../analysis-records/analysis-records.service';
import { BodyComparisonAiClientPort } from '../body-comparison-ai-client.port';
import { bodyComparisonResultSchema } from '../body-comparison.schemas';
import { BodyComparisonService } from '../body-comparison.service';

const 비교분석결과예시 = {
  bodyChanges: {
    core: {
      change: '개선' as const,
      description: '복부와 코어 라인이 조금 더 안정적으로 보여요.',
      details: ['복부 긴장도가 조금 더 정돈돼 보여요.'],
    },
    lowerBody: {
      change: '유지' as const,
      description: '하체 라인은 큰 차이 없이 유지된 편이에요.',
      details: ['무릎 정렬은 전반적으로 비슷해 보여요.'],
    },
    upperBody: {
      change: '개선' as const,
      description: '어깨와 상체 정렬이 더 자연스럽게 보여요.',
      details: ['견갑 주변 안정성이 조금 더 좋아 보여요.'],
    },
  },
  bodyComposition: {
    fatChange: '체지방은 소폭 감소한 것으로 추정돼요.',
    muscleChange: '근육량은 소폭 증가한 것으로 추정돼요.',
    proportionChange: '상체와 코어 비율이 전보다 더 안정적으로 보여요.',
  },
  motivationalMessage:
    '지금 흐름을 유지하면 다음 변화도 충분히 기대할 수 있어요.',
  overallChange: {
    grade: 'A' as const,
    score: 84,
    summary: '상체와 코어 안정성이 전반적으로 좋아졌어요.',
  },
  postureChanges: {
    improvements: ['어깨 높이 균형이 조금 더 안정돼 보여요.'],
    overallPosture: '전체 자세 정렬이 전보다 더 정돈된 편이에요.',
    remaining: ['골반 주변 안정성은 더 지켜볼 필요가 있어요.'],
  },
  recommendations: {
    improve: ['하체 가동성 운동도 같이 진행해 주세요.'],
    keepDoing: ['현재 상체 안정화 루틴을 유지해 주세요.'],
    nextGoal: '다음 목표는 하체와 코어 연동 강화예요.',
  },
};

describe('전·후 비교 분석 서비스', () => {
  let aiClient: jest.Mocked<BodyComparisonAiClientPort>;
  let analysisRecordsService: jest.Mocked<AnalysisRecordsService>;
  let service: BodyComparisonService;

  beforeEach(() => {
    aiClient = {
      analyzeBodyComparison: jest.fn(),
    };
    analysisRecordsService = {
      compareAnalysisRecords: jest.fn(),
      createAnalysisRecord: jest.fn(),
      getAnalysisRecord: jest.fn(),
      listAnalysisRecords: jest.fn(),
    } as unknown as jest.Mocked<AnalysisRecordsService>;

    service = new BodyComparisonService(aiClient, analysisRecordsService);
  });

  it('분석 성공과 저장 성공을 함께 반환한다', async () => {
    aiClient.analyzeBodyComparison.mockResolvedValue(
      JSON.stringify(비교분석결과예시),
    );
    analysisRecordsService.createAnalysisRecord.mockResolvedValue({
      analysisType: 'body-comparison' as never,
      analyzedAt: '2026-07-28T01:23:45.000Z',
      createdAt: '2026-07-28T01:23:45.000Z',
      id: 'record_saved',
      qualitativeData: {},
      quantitativeData: {},
      rawResult: 비교분석결과예시,
    });

    const result = await service.analyzeBodyComparison('user-a', {
      afterImageBase64: 'b'.repeat(200),
      beforeImageBase64: 'a'.repeat(200),
      notes: '같은 장소에서 촬영했어요.',
    });

    expect(aiClient.analyzeBodyComparison.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        afterImageBase64: 'b'.repeat(200),
        beforeImageBase64: 'a'.repeat(200),
        notes: '같은 장소에서 촬영했어요.',
      }),
    );
    const createRecordCall =
      analysisRecordsService.createAnalysisRecord.mock.calls[0];

    expect(createRecordCall?.[0]).toBe('user-a');
    expect(createRecordCall?.[1]).toEqual(
      expect.objectContaining({
        analysisType: 'body-comparison',
        qualitativeData: {
          grade: 'A',
          summary: '상체와 코어 안정성이 전반적으로 좋아졌어요.',
        },
        quantitativeData: {
          score: 84,
        },
      }),
    );
    expect(createRecordCall?.[1].idempotencyKey).toMatch(/^body-comparison:/);
    const comparison = bodyComparisonResultSchema.parse(result.comparison);

    expect(comparison.overallChange.grade).toBe('A');
    expect(result.recordSave).toEqual({
      recordId: 'record_saved',
      status: 'saved',
    });
  });

  it('저장 실패여도 분석 결과는 반환한다', async () => {
    aiClient.analyzeBodyComparison.mockResolvedValue(
      JSON.stringify(비교분석결과예시),
    );
    analysisRecordsService.createAnalysisRecord.mockRejectedValue(
      new Error('insert failed'),
    );

    const result = await service.analyzeBodyComparison('user-a', {
      afterImageBase64: 'b'.repeat(200),
      beforeImageBase64: 'a'.repeat(200),
    });

    const comparison = bodyComparisonResultSchema.parse(result.comparison);

    expect(comparison.overallChange.summary).toBe(
      '상체와 코어 안정성이 전반적으로 좋아졌어요.',
    );
    expect(result.recordSave.status).toBe('failed');
    expect(result.recordSave.message).toContain('이력 저장');
  });

  it('AI 응답 구조가 맞지 않으면 502를 던진다', async () => {
    aiClient.analyzeBodyComparison.mockResolvedValue(
      JSON.stringify({
        overallChange: {
          grade: 'A',
        },
      }),
    );

    await expect(
      service.analyzeBodyComparison('user-a', {
        afterImageBase64: 'b'.repeat(200),
        beforeImageBase64: 'a'.repeat(200),
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('코드펜스가 섞인 JSON도 안전하게 파싱한다', async () => {
    aiClient.analyzeBodyComparison.mockResolvedValue(
      `\`\`\`json\n${JSON.stringify(비교분석결과예시)}\n\`\`\``,
    );
    analysisRecordsService.createAnalysisRecord.mockResolvedValue({
      analysisType: 'body-comparison' as never,
      analyzedAt: '2026-07-28T01:23:45.000Z',
      createdAt: '2026-07-28T01:23:45.000Z',
      id: 'record_saved',
      qualitativeData: {},
      quantitativeData: {},
      rawResult: 비교분석결과예시,
    });

    const result = await service.analyzeBodyComparison('user-a', {
      afterImageBase64: 'b'.repeat(200),
      beforeImageBase64: 'a'.repeat(200),
    });

    const comparison = bodyComparisonResultSchema.parse(result.comparison);

    expect(comparison.overallChange.score).toBe(84);
  });
});
