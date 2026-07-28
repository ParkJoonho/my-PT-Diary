export abstract class BodyComparisonAiClientPort {
  abstract analyzeBodyComparison(params: {
    afterImageBase64: string;
    beforeImageBase64: string;
    height?: number;
    notes?: string;
  }): Promise<string>;
}
