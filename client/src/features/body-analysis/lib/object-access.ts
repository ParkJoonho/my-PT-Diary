import type {
  AnalysisRecordComparison,
  AnalysisRecordDetail,
  AnalysisRecordSummary,
  BodyAnalysisResult,
} from '../types/body-analysis';

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((item): item is string => typeof item === 'string');
}

export function toBodyAnalysisResult(value: unknown): BodyAnalysisResult {
  return asRecord(value) as unknown as BodyAnalysisResult;
}

export function toAnalysisRecordSummary(value: unknown): AnalysisRecordSummary {
  return value as AnalysisRecordSummary;
}

export function toAnalysisRecordDetail(value: unknown): AnalysisRecordDetail {
  return value as AnalysisRecordDetail;
}

export function toAnalysisRecordComparison(
  value: unknown,
): AnalysisRecordComparison {
  return value as AnalysisRecordComparison;
}
