import { BadGatewayException } from '@nestjs/common';
import { AnalysisRecordsService } from '../../analysis-records/analysis-records.service';
import { BodyAnalysisAiClientPort } from '../body-analysis-ai-client.port';
import { BodyAnalysisRepositoryPort } from '../body-analysis.repository.port';
import { BodyAnalysisService } from '../body-analysis.service';

const 분석결과예시 = {
  bodyType: 'V' as const,
  bodyTypeDescription: '상체 비중이 약간 더 큰 체형이에요.',
  lowerBody: {
    hipWidth: { note: '골반 너비는 보통으로 보여요.', value: '보통' },
    kneeAlignment: { note: '무릎 정렬은 비교적 안정적이에요.', value: '양호/주의필요'.split('/')[0]! },
    legLength: { note: '다리 길이는 보통으로 보여요.', value: '보통' },
  },
  medicalAnalysis: null,
  multiViewAnalysis: null,
  posture: {
    hipBalance: { note: '좌우 균형은 보통이에요.', score: 3 },
    overallAlignment: { note: '전체 정렬은 보통 수준이에요.', score: 3 },
    shoulderBalance: { note: '어깨 높이 차가 조금 보여요.', score: 2 },
    spinalCurvature: { note: '척추 정렬은 비교적 안정적이에요.', score: 3 },
  },
  prediction: {
    currentDate: '2026-07-28',
    currentEstimate: '현재도 자세 보완 여지가 보여요.',
    daysSincePhoto: 0,
    exerciseImpact: null,
    milestones: ['흉추 가동성 개선', '견갑 안정화'],
    oneYearPrediction: '1년 뒤엔 상체 정렬이 조금 더 안정될 수 있어요.',
    photoDate: '2026-07-28',
    riskFactors: ['어깨 말림 고착'],
    sixMonthPrediction: '6개월 뒤엔 어깨 균형이 나아질 가능성이 있어요.',
    threeMonthPrediction: '3개월 뒤엔 자세 인식이 좋아질 수 있어요.',
  },
  ratios: {
    armToHeight: 0.49,
    upperToLower: 1.02,
  },
  recommendations: ['흉추 신전 운동을 자주 해 주세요.', '견갑 안정화 운동을 추가해 주세요.'],
  summary: '상체 안정화가 핵심 과제로 보여요.',
  upperBody: {
    armLength: { note: '팔 길이는 보통이에요.', value: '보통' },
    neckLength: { note: '목 길이는 보통이에요.', value: '보통' },
    shoulderWidth: { note: '어깨가 비교적 넓은 편이에요.', value: '넓음' },
    spineAlignment: { note: '흉추 정렬을 조금 더 보는 편이 좋아요.', value: '주의필요' },
  },
};

describe('체형 분석 서비스', () => {
  let aiClient: jest.Mocked<BodyAnalysisAiClientPort>;
  let repository: jest.Mocked<BodyAnalysisRepositoryPort>;
  let analysisRecordsService: jest.Mocked<AnalysisRecordsService>;
  let service: BodyAnalysisService;

  beforeEach(() => {
    aiClient = {
      analyzeBody: jest.fn(),
    };
    repository = {
      listRecentWorkoutContext: jest.fn(),
    };
    analysisRecordsService = {
      compareAnalysisRecords: jest.fn(),
      createAnalysisRecord: jest.fn(),
      getAnalysisRecord: jest.fn(),
      listAnalysisRecords: jest.fn(),
    } as unknown as jest.Mocked<AnalysisRecordsService>;

    service = new BodyAnalysisService(aiClient, repository, analysisRecordsService);
    repository.listRecentWorkoutContext.mockResolvedValue([
      {
        body_composition: { morningWeightKg: 72.4 },
        completed_at: '2026-07-27T10:00:00.000Z',
        completed_on: '2026-07-27',
        duration_seconds: 2400,
        routine_label: '가슴 루틴',
        source: 'manual',
        summary: { totalVolumeKg: 12000 },
        title: '상체 운동',
      },
    ]);
  });

  it('분석 성공과 저장 성공을 함께 반환한다', async () => {
    aiClient.analyzeBody.mockResolvedValue(JSON.stringify(분석결과예시));
    analysisRecordsService.createAnalysisRecord.mockResolvedValue({
      analysisType: 'body' as never,
      analyzedAt: '2026-07-28T01:23:45.000Z',
      createdAt: '2026-07-28T01:23:45.000Z',
      id: 'record_saved',
      qualitativeData: {},
      quantitativeData: {},
      rawResult: 분석결과예시,
    });

    const result = await service.analyzeBody('user-a', {
      imageBase64: 'a'.repeat(200),
      medicalSymptoms: '어깨가 자주 뻐근해요.',
    });

    expect(repository.listRecentWorkoutContext).toHaveBeenCalledWith({
      limit: 20,
      userKey: 'user-a',
    });
    expect(aiClient.analyzeBody).toHaveBeenCalledWith(
      expect.objectContaining({
        imageBase64: 'a'.repeat(200),
        medicalSymptoms: '어깨가 자주 뻐근해요.',
      }),
    );
    expect(analysisRecordsService.createAnalysisRecord).toHaveBeenCalledWith(
      'user-a',
      expect.objectContaining({
        analysisType: 'body',
      }),
    );
    expect(result.analysis.bodyType).toBe('V');
    expect(result.recordSave).toEqual({
      recordId: 'record_saved',
      status: 'saved',
    });
  });

  it('저장 실패여도 분석 결과는 반환한다', async () => {
    aiClient.analyzeBody.mockResolvedValue(JSON.stringify(분석결과예시));
    analysisRecordsService.createAnalysisRecord.mockRejectedValue(
      new Error('insert failed'),
    );

    const result = await service.analyzeBody('user-a', {
      imageBase64: 'a'.repeat(200),
    });

    expect(result.analysis.summary).toBe('상체 안정화가 핵심 과제로 보여요.');
    expect(result.recordSave.status).toBe('failed');
    expect(result.recordSave.message).toContain('이력 저장');
  });

  it('AI 응답 구조가 맞지 않으면 502를 던진다', async () => {
    aiClient.analyzeBody.mockResolvedValue(
      JSON.stringify({
        bodyType: 'V',
      }),
    );

    await expect(
      service.analyzeBody('user-a', {
        imageBase64: 'a'.repeat(200),
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
