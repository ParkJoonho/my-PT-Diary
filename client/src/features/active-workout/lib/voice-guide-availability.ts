const VOICE_GUIDE_EXERCISE_NAMES = new Set([
  '푸시업',
  '스쿼트',
  '와이드 스쿼트',
  '런지',
  '플랭크',
  '사이드 플랭크',
  '버피',
  '벤치프레스',
  '인클라인 덤벨프레스',
  '덤벨 숄더프레스',
  '랫풀다운',
  '바벨 로우',
  '시티드 로우',
  '레그프레스',
  '레그컬',
  '다이아몬드 푸시업',
  '글루트 브릿지',
  '마운틴 클라이머',
  '파이크 푸시업',
  '슈퍼맨',
  '스트레칭',
  '점핑잭',
  '제자리 뛰기',
]);

export function hasOriginalVoiceGuide(exerciseName: string) {
  return VOICE_GUIDE_EXERCISE_NAMES.has(exerciseName);
}
