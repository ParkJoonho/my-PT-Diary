export type BodyAnalysisPromptWorkoutContext = {
  bodyComposition: Record<string, unknown> | null;
  completedAt: string;
  completedOn: string;
  durationSeconds: number;
  routineLabel: string | null;
  source: string;
  summary: Record<string, unknown> | null;
  title: string | null;
};

export abstract class BodyAnalysisAiClientPort {
  abstract analyzeBody(params: {
    backImageBase64?: string;
    height?: number;
    imageBase64: string;
    medicalSymptoms?: string;
    photoDate?: string;
    recentWorkoutContext: BodyAnalysisPromptWorkoutContext[];
    shoeImageBase64?: string;
    sideImageBase64?: string;
    squatImageBase64?: string;
  }): Promise<string>;
}
