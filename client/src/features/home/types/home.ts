export type WeeklyDay = {
  completionCount?: number;
  date?: string;
  label: string;
  completed: boolean;
};

export type HomeTabItem = {
  key: 'home' | 'exercise' | 'pt-log' | 'ai-hub' | 'condition';
  label: string;
  implemented: boolean;
};
