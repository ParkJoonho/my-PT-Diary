import {
  AnalysisRecordComparisonOutput,
  AnalysisTypeInput,
} from './analysis-records.schemas';

export type AnalysisRecordRow = {
  analyzed_at: string;
  analysis_type: AnalysisTypeInput;
  created_at: string;
  id: string;
  qualitative_data: Record<string, unknown> | null;
  quantitative_data: Record<string, unknown> | null;
  raw_result: Record<string, unknown>;
  user_key: string;
};

export type AnalysisRecordWriteModel = {
  analyzedAt: string;
  analysisType: AnalysisTypeInput;
  qualitativeData?: Record<string, unknown>;
  quantitativeData?: Record<string, unknown>;
  rawResult: Record<string, unknown>;
};

export abstract class AnalysisRecordsRepositoryPort {
  abstract createAnalysisRecord(params: {
    recordId: string;
    userKey: string;
    record: AnalysisRecordWriteModel;
  }): Promise<AnalysisRecordRow>;

  abstract listAnalysisRecords(params: {
    userKey: string;
    type?: AnalysisTypeInput;
  }): Promise<AnalysisRecordRow[]>;

  abstract findAnalysisRecord(params: {
    recordId: string;
    userKey: string;
  }): Promise<AnalysisRecordRow | null>;
}
