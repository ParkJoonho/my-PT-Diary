import type {
  BodyAnalysisResult,
  BodyComparisonResult,
} from '../types/body-analysis';

export function buildBodyAnalysisRecordPayload(
  analyzedAt: string,
  result: BodyAnalysisResult,
) {
  return {
    analysisType: 'body',
    analyzedAt,
    qualitativeData: {
      bodyType: result.bodyType ?? '',
      bodyTypeDescription: result.bodyTypeDescription ?? '',
      summary: result.summary ?? '',
    },
    quantitativeData: {
      armToHeight: result.ratios?.armToHeight ?? 0,
      hipBalance: result.posture?.hipBalance?.score ?? 0,
      overallAlignment: result.posture?.overallAlignment?.score ?? 0,
      shoulderBalance: result.posture?.shoulderBalance?.score ?? 0,
      spinalCurvature: result.posture?.spinalCurvature?.score ?? 0,
      upperToLower: result.ratios?.upperToLower ?? 0,
    },
    rawResult: result as Record<string, unknown>,
  };
}

export function buildBodyComparisonRecordPayload(
  analyzedAt: string,
  result: BodyComparisonResult,
) {
  return {
    analysisType: 'body-comparison',
    analyzedAt,
    qualitativeData: {
      grade: result.overallChange?.grade ?? '',
      summary: result.overallChange?.summary ?? '',
    },
    quantitativeData: {
      score: result.overallChange?.score ?? 0,
    },
    rawResult: result as Record<string, unknown>,
  };
}
