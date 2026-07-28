import Colors from 'shared/constants/colors';

export function getMealGradeColor(grade: string) {
  const colors: Record<string, string> = {
    A: Colors.success,
    B: Colors.info,
    C: Colors.warning,
    D: Colors.accent,
    F: Colors.danger,
    S: '#AF52DE',
  };

  return colors[grade] ?? Colors.info;
}

export function formatEatingDuration(minutes: number) {
  if (minutes < 1) {
    return '1분 미만';
  }

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);

    return remainingMinutes > 0
      ? `${hours}시간 ${remainingMinutes}분`
      : `${hours}시간`;
  }

  return `${Math.round(minutes)}분`;
}

export function formatExerciseDuration(value: number | string) {
  const text = String(value);

  return /분|시간/.test(text) ? text : `${text}분`;
}

export function formatNutrient(value: number) {
  return Math.round(value);
}
