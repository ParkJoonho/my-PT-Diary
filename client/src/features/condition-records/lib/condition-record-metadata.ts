import type { ConditionItemDto } from 'shared/api/generated/models';
import Colors from 'shared/constants/colors';
import { getClientTodayDate } from 'shared/lib/date';

export const CONDITION_LABELS = [
  '훈련 동기',
  '일상피로도',
  '수면시간',
  '수면의 질',
  '식욕',
  '성욕',
  '소화력(식사)',
  '장내가스',
  '배변',
  '심박수',
  '식단 준수성',
  '훈련 준수성',
  '발기 빈도 및 강도',
  '월경 전/중/후 반응',
  '수행력',
] as const;

export const MUSCLE_SORENESS_LABELS = [
  '가슴',
  '승모근',
  '광배근',
  '전삼각근',
  '측삼각근',
  '후삼각근',
  '상완이두근',
  '상완삼두근',
  '대퇴사두근',
  '대퇴이두근',
  '둔근',
  '내전근',
  '복근',
  '허리',
  '종아리',
] as const;

export const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;
export const CONDITION_PAGE_SIZE = 10;

export type DateRange = {
  end: string | null;
  start: string | null;
};

export function createConditionItems(
  labels: readonly string[],
): ConditionItemDto[] {
  return labels.map((label) => ({
    label,
    score: 0,
  }));
}

export function cloneConditionItems(items: ConditionItemDto[]) {
  return items.map((item) => ({ ...item }));
}

export function getConditionScoreLabel(score: number) {
  const labels: Record<number, string> = {
    1: '매우 나쁨',
    2: '나쁨',
    3: '보통',
    4: '좋음',
    5: '매우 좋음',
  };

  return labels[score] ?? '';
}

export function getConditionScoreColor(score: number) {
  const colors: Record<number, string> = {
    1: Colors.score1,
    2: Colors.score2,
    3: Colors.score3,
    4: Colors.score4,
    5: Colors.score5,
  };

  return colors[score] ?? Colors.inputBg;
}

export function getSorenessScoreLabel(score: number) {
  const labels: Record<number, string> = {
    1: '전혀 없음',
    2: '2일 후 살짝',
    3: '1~2일차 느껴짐',
    4: '3일 이상 아픔',
  };

  return labels[score] ?? '';
}

export function getSorenessScoreColor(score: number) {
  const colors: Record<number, string> = {
    1: '#22C55E',
    2: '#3B82F6',
    3: '#F59E0B',
    4: '#EF4444',
  };

  return colors[score] ?? Colors.inputBg;
}

export function calculateAverageScore(items: ConditionItemDto[]) {
  const scores = items
    .filter((item) => item.score > 0)
    .map((item) => item.score);

  if (!scores.length) {
    return 0;
  }

  return Number(
    (scores.reduce((total, score) => total + score, 0) / scores.length).toFixed(
      1,
    ),
  );
}

export function getConditionBadge(score: number) {
  if (score <= 0) {
    return { color: Colors.textMuted, label: '-' };
  }

  if (score <= 1.5) {
    return { color: Colors.score1, label: '매우 나쁨' };
  }

  if (score <= 2.5) {
    return { color: Colors.score2, label: '나쁨' };
  }

  if (score <= 3.5) {
    return { color: Colors.score3, label: '보통' };
  }

  if (score <= 4.5) {
    return { color: Colors.score4, label: '좋음' };
  }

  return { color: Colors.score5, label: '매우 좋음' };
}

export function getSorenessBadge(score: number) {
  if (score <= 0) {
    return { color: Colors.textMuted, label: '-' };
  }

  if (score <= 1.2) {
    return { color: '#22C55E', label: '양호' };
  }

  if (score <= 2.2) {
    return { color: '#F59E0B', label: '약간' };
  }

  if (score <= 3.2) {
    return { color: '#F97316', label: '중간' };
  }

  return { color: '#EF4444', label: '심함' };
}

export function getSorePartsText(items: ConditionItemDto[]) {
  const soreParts = items.filter((item) => item.score >= 2);

  if (!soreParts.length) {
    return '없음';
  }

  return soreParts.length === 1
    ? (soreParts[0]?.label ?? '없음')
    : `${soreParts[0]?.label ?? ''} +${soreParts.length - 1}`;
}

export function formatGroupDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const safeYear = year || 0;
  const safeMonth = month || 1;
  const safeDay = day || 1;
  const dayOfWeek = new Date(safeYear, safeMonth - 1, safeDay).getDay();

  return {
    display: `${safeMonth}/${safeDay} (${DAY_KO[dayOfWeek] ?? DAY_KO[0]})`,
    isToday: date === getClientTodayDate(),
  };
}

export function formatShortDate(date: string) {
  const [, month, day] = date.split('-').map(Number);
  const safeMonth = month || 1;
  const safeDay = day || 1;

  return `${safeMonth}/${safeDay}`;
}

export function formatRangeLabel(range: DateRange) {
  if (!range.start) {
    return '전체';
  }

  if (!range.end || range.start === range.end) {
    return formatShortDate(range.start);
  }

  return `${formatShortDate(range.start)} ~ ${formatShortDate(range.end)}`;
}
