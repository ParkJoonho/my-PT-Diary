export type BodyAnalysisWorkoutContextRow = {
  body_composition: Record<string, unknown> | null;
  completed_at: string;
  completed_on: string;
  duration_seconds: number;
  routine_label: string | null;
  source: string;
  summary: Record<string, unknown> | null;
  title: string | null;
};

export abstract class BodyAnalysisRepositoryPort {
  abstract listRecentWorkoutContext(params: {
    limit: number;
    userKey: string;
  }): Promise<BodyAnalysisWorkoutContextRow[]>;
}
