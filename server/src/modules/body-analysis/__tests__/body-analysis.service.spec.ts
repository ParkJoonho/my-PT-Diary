import { BadGatewayException } from '@nestjs/common';
import { AnalysisRecordsService } from '../../analysis-records/analysis-records.service';
import { BodyAnalysisAiClientPort } from '../body-analysis-ai-client.port';
import { BodyAnalysisRepositoryPort } from '../body-analysis.repository.port';
import { BodyAnalysisService } from '../body-analysis.service';

const 분석결과예시 = {
  bodyType: 'V' as const,
  bodyTypeDescription: '상체 비중이 약간 더 큰 체형이에요.',
  gaitAnalysis: null,
  lowerBody: {
    hipWidth: { note: '골반 너비는 보통으로 보여요.', value: '보통' },
    kneeAlignment: {
      note: '무릎 정렬은 비교적 안정적이에요.',
      value: '양호',
    },
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
  recommendations: [
    '흉추 신전 운동을 자주 해 주세요.',
    '견갑 안정화 운동을 추가해 주세요.',
  ],
  summary: '상체 안정화가 핵심 과제로 보여요.',
  upperBody: {
    armLength: { note: '팔 길이는 보통이에요.', value: '보통' },
    neckLength: { note: '목 길이는 보통이에요.', value: '보통' },
    shoulderWidth: { note: '어깨가 비교적 넓은 편이에요.', value: '넓음' },
    spineAlignment: {
      note: '흉추 정렬을 조금 더 보는 편이 좋아요.',
      value: '주의필요',
    },
  },
};

const 보행분석예시 = {
  bodyImpact: {
    hipImpact: { note: '골반 회전 보완이 필요해 보여요.', score: 3 },
    kneeImpact: { note: '무릎 안쪽 부하를 조금 줄이는 편이 좋아요.', score: 2 },
    spineImpact: { note: '허리 보상 패턴 가능성이 보여요.', score: 3 },
  },
  footAlignment: {
    ankleAlignment: { note: '발목 안정성이 약간 떨어져 보여요.', score: 2 },
    archType: '평발(편평족)',
    toeAlignment: { note: '엄지 쪽 압력이 커 보여요.', value: '외반모지경향' },
  },
  gaitRecommendations: [
    '아치 지지 인솔을 고려해 주세요.',
    '종아리와 발목 안정화 운동을 추가해 주세요.',
    '뒤꿈치 착지와 발 중앙 이동을 의식해 주세요.',
  ],
  gaitType: {
    description: '내측으로 무게가 조금 더 실리는 보행으로 보여요.',
    type: '내전보행(오버프로네이션)',
  },
  shoeRecommendations: {
    afterCorrection: {
      correctedGaitType: '정상보행',
      daily: [
        {
          archSupport: '보통',
          brand: '뉴발란스',
          cushioning: '보통',
          features: ['유연한 미드솔', '적당한 아치 지지', '안정적 착화감'],
          model: '880',
          priceRange: '15만~18만원',
          reason: '교정 후에는 과한 안정성보다 균형 잡힌 쿠셔닝이 적합해요.',
          stability: '보통',
          type: '워킹화',
        },
      ],
      timeline: '3~6개월',
      workout: [
        {
          archSupport: '보통',
          brand: '아식스',
          cushioning: '보통',
          features: ['중립형 쿠셔닝', '균형 잡힌 반발력', '안정적 힐컵'],
          model: '젤 님버스',
          priceRange: '19만~22만원',
          reason: '교정 후에는 중립형 러닝화가 더 자연스러워요.',
          stability: '보통',
          type: '러닝화',
        },
      ],
    },
    current: {
      daily: [
        {
          archSupport: '높음',
          brand: '아식스',
          cushioning: '보통',
          features: ['안정화 구조', '아치 지지', '뒤꿈치 고정'],
          model: '젤 카야노',
          priceRange: '18만~22만원',
          reason: '현재 보행 패턴에서 내측 지지를 보완해 주기 좋아요.',
          stability: '높음',
          type: '워킹화',
        },
      ],
      workout: [
        {
          archSupport: '높음',
          brand: '브룩스',
          cushioning: '높음',
          features: ['가이드레일', '안정성', '충격 흡수'],
          model: '아드레날린 GTS',
          priceRange: '17만~20만원',
          reason: '오버프로네이션 보완에 적합한 안정화 러닝화예요.',
          stability: '높음',
          type: '러닝화',
        },
      ],
    },
    matchingLogic:
      '내전보행과 평발 경향이 보여 안정성, 아치 지지, 뒤꿈치 고정성이 높은 모델이 적합해요.',
  },
  shoeSizeEstimate: {
    ageGroup: '성인',
    estimatedSize: 265,
    footLength: '약 26.5cm',
    footWidthCm: '약 10.2cm',
    gender: '남성',
    genderReason: '사이즈와 발볼이 남성용 러닝화 라인업에 더 가까워 보여요.',
    sizeRange: '260~270',
    sizeSystem: '한국(mm) 265 = US 8.5 = EU 42',
    width: '넓음(E~EE)',
    widthDescription: '발볼이 보통보다 조금 넓은 편으로 보여요.',
  },
  wearPattern: {
    description: '뒤꿈치 안쪽과 전족부 안쪽 마모가 조금 더 두드러져 보여요.',
    leftRight: '좌우 대칭',
    type: '내측마모',
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

    service = new BodyAnalysisService(
      aiClient,
      repository,
      analysisRecordsService,
    );
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
    aiClient.analyzeBody.mockResolvedValue(
      JSON.stringify({
        ...분석결과예시,
        gaitAnalysis: 보행분석예시,
      }),
    );
    analysisRecordsService.createAnalysisRecord.mockResolvedValue({
      analysisType: 'body' as never,
      analyzedAt: '2026-07-28T01:23:45.000Z',
      createdAt: '2026-07-28T01:23:45.000Z',
      id: 'record_saved',
      qualitativeData: {},
      quantitativeData: {},
      rawResult: {
        ...분석결과예시,
        gaitAnalysis: 보행분석예시,
      },
    });

    const result = await service.analyzeBody('user-a', {
      imageBase64: 'a'.repeat(200),
      medicalSymptoms: '어깨가 자주 뻐근해요.',
      shoeImageBase64: 'b'.repeat(200),
    });

    expect(repository.listRecentWorkoutContext.mock.calls[0]?.[0]).toEqual({
      limit: 20,
      userKey: 'user-a',
    });
    expect(aiClient.analyzeBody.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        imageBase64: 'a'.repeat(200),
        medicalSymptoms: '어깨가 자주 뻐근해요.',
        shoeImageBase64: 'b'.repeat(200),
      }),
    );
    const createRecordCall =
      analysisRecordsService.createAnalysisRecord.mock.calls[0];

    expect(createRecordCall?.[0]).toBe('user-a');
    expect(createRecordCall?.[1]).toEqual(
      expect.objectContaining({
        analysisType: 'body',
      }),
    );
    expect(createRecordCall?.[1].idempotencyKey).toMatch(/^body-analysis:/);
    expect(result.analysis.bodyType).toBe('V');
    expect(result.analysis.gaitAnalysis?.shoeSizeEstimate?.gender).toBe('남성');
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
    expect(result.analysis.gaitAnalysis).toBeNull();
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
