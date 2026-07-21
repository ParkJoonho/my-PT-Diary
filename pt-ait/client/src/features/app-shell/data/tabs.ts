import type { AppTabItem } from '../types/tab';

export const APP_TABS: AppTabItem[] = [
  { key: 'home', label: '홈', implemented: true },
  { key: 'exercise', label: '기록', implemented: false },
  { key: 'pt-log', label: 'PT', implemented: false },
  { key: 'ai-hub', label: 'AI', implemented: false },
  { key: 'condition', label: '내 정보', implemented: false },
];
