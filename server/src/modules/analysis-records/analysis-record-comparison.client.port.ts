import type { AnalysisRecordRow } from './analysis-records.repository.port';
import type { AnalysisRecordComparisonOutput } from './analysis-records.schemas';

export abstract class AnalysisRecordComparisonClientPort {
  abstract compareRecords(params: {
    newerRecord: AnalysisRecordRow;
    olderRecord: AnalysisRecordRow;
  }): Promise<AnalysisRecordComparisonOutput>;
}
