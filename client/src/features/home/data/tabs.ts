import type { HomeTabItem } from '../types/home';

export const HOME_TABS: HomeTabItem[] = [
  { key: 'home', label: '홈', implemented: true },
  { key: 'exercise', label: '기록', implemented: true },
  { key: 'pt-log', label: 'PT', implemented: false },
  { key: 'ai-hub', label: 'AI', implemented: true },
  { key: 'condition', label: '내 정보', implemented: false },
];
