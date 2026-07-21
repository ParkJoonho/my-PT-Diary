export type AppTabKey = 'home' | 'exercise' | 'pt-log' | 'ai-hub' | 'condition';

export type AppTabItem = {
  key: AppTabKey;
  label: string;
  implemented: boolean;
};
