export type HomeQuickActionKind = 'outdoor' | 'guide';

export type HomeQuickAction = {
  kind: HomeQuickActionKind;
  subtitle: string;
  title: string;
};
