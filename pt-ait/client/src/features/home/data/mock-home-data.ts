import type { HomeRoutine, HomeTabItem, WeeklyDay } from '../types/routine';

export const WEEKLY_DAYS: WeeklyDay[] = [
  { label: '월', completed: true },
  { label: '화', completed: true },
  { label: '수', completed: false },
  { label: '목', completed: false },
  { label: '금', completed: false },
  { label: '토', completed: false },
  { label: '일', completed: false },
];

export const HOME_TABS: HomeTabItem[] = [
  { key: 'home', label: '홈', implemented: true },
  { key: 'exercise', label: '기록', implemented: false },
  { key: 'pt-log', label: 'PT', implemented: false },
  { key: 'ai-hub', label: 'AI', implemented: false },
  { key: 'condition', label: '내 정보', implemented: false },
];

export const MOCK_AI_GYM_ROUTINES: HomeRoutine[] = [
  {
    id: 'ai_gym_60',
    label: '1시간 루틴',
    duration: '60분',
    location: 'gym',
    source: 'mock-ai',
    steps: [
      {
        name: '러닝머신',
        detail: '12분 워밍업',
        type: 'cardio',
        restAfter: '1분',
        tag: '유산소 운동',
      },
      {
        name: '랫풀다운',
        detail: '12회 x 3세트',
        type: 'strength',
        restAfter: '1분 30초',
        tag: '등 근력 강화',
      },
      {
        name: '스쿼트',
        detail: '10회 x 3세트',
        type: 'strength',
        restAfter: '1분 30초',
        tag: '하체 근력 강화',
      },
      {
        name: '플랭크',
        detail: '40초 x 3세트',
        type: 'strength',
        tag: '코어 근력 강화',
      },
    ],
  },
  {
    id: 'ai_gym_90',
    label: '1시간 30분 루틴',
    duration: '90분',
    location: 'gym',
    source: 'mock-ai',
    steps: [
      {
        name: '사이클',
        detail: '15분',
        type: 'cardio',
        restAfter: '2분',
        tag: '유산소 운동',
      },
      {
        name: '벤치프레스',
        detail: '8회 x 4세트',
        type: 'strength',
        restAfter: '2분',
        tag: '가슴 근력 강화',
      },
      {
        name: '바벨 로우',
        detail: '10회 x 4세트',
        type: 'strength',
        restAfter: '2분',
        tag: '등 근력 강화',
      },
      {
        name: '스트레칭',
        detail: '10분',
        type: 'stretch',
        tag: '유연성 향상',
      },
    ],
  },
];

export const MOCK_AI_HOME_ROUTINES: HomeRoutine[] = [
  {
    id: 'ai_home_30',
    label: '30분 루틴',
    duration: '30분',
    location: 'home',
    source: 'mock-ai',
    steps: [
      {
        name: '제자리 뛰기',
        detail: '3분',
        type: 'cardio',
        restAfter: '1분',
        tag: '유산소 운동',
      },
      {
        name: '푸시업',
        detail: '12회 x 3세트',
        type: 'strength',
        restAfter: '1분',
        tag: '상체 근력 강화',
      },
      {
        name: '런지',
        detail: '10회 x 3세트',
        type: 'strength',
        restAfter: '1분',
        tag: '하체 근력 강화',
      },
      {
        name: '캣카우 스트레칭',
        detail: '3분',
        type: 'stretch',
        tag: '척추 안정성 향상',
      },
    ],
  },
  {
    id: 'ai_home_45',
    label: '45분 루틴',
    duration: '45분',
    location: 'home',
    source: 'mock-ai',
    steps: [
      {
        name: '점핑잭',
        detail: '5분',
        type: 'cardio',
        restAfter: '1분',
        tag: '유산소 운동',
      },
      {
        name: '와이드 스쿼트',
        detail: '18회 x 3세트',
        type: 'strength',
        restAfter: '1분',
        tag: '하체 근력 강화',
      },
      {
        name: '사이드 플랭크',
        detail: '30초 x 3세트',
        type: 'strength',
        tag: '코어 근력 강화',
      },
      {
        name: '스트레칭',
        detail: '5분',
        type: 'stretch',
        tag: '유연성 향상',
      },
    ],
  },
];
