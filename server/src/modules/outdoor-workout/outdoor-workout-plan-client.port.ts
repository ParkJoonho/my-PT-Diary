export abstract class OutdoorWorkoutPlanClientPort {
  abstract generatePlan(params: {
    prompt: string;
    systemPrompt: string;
  }): Promise<string>;
}
