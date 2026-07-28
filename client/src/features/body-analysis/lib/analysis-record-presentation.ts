import type { AnalysisRecordSummary } from '../types/body-analysis';
import { asString } from './object-access';

export function getAnalysisRecordTypeLabel(type: string) {
  switch (type) {
    case 'body':
      return '체형 분석';
    case 'body-comparison':
      return '전·후 비교';
    case 'posture':
      return '자세 분석';
    case 'state-vector':
      return '통합 분석';
    default:
      return type;
  }
}

export function isComparableAnalysisRecordType(type: string) {
  return type === 'body';
}

export function getAnalysisRecordCardMeta(record: AnalysisRecordSummary) {
  const qualitativeData = record.qualitativeData ?? {};
  const summary =
    asString(qualitativeData.summary) ?? '요약 정보가 아직 없어요.';

  if (record.analysisType === 'body-comparison') {
    return {
      badgeText: asString(qualitativeData.grade) ?? '비교',
      comparable: false,
      summary,
      title: '전·후 비교 분석',
    };
  }

  if (record.analysisType === 'body') {
    return {
      badgeText: asString(qualitativeData.bodyType) ?? '-',
      comparable: true,
      summary,
      title: '체형 분석',
    };
  }

  return {
    badgeText: getAnalysisRecordTypeLabel(record.analysisType),
    comparable: false,
    summary,
    title: getAnalysisRecordTypeLabel(record.analysisType),
  };
}
