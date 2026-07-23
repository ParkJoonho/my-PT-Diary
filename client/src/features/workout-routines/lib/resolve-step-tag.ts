const EXERCISE_TAG_MAP: Record<string, string> = {
  스쿼트: '하체 근력 강화',
  와이드스쿼트: '하체 근력 강화',
  '와이드 스쿼트': '하체 근력 강화',
  런지: '하체 근력 강화',
  푸시업: '상체 근력 강화',
  벤치프레스: '가슴 근력 강화',
  랫풀다운: '등 근력 강화',
  '바벨 로우': '등 근력 강화',
  플랭크: '코어 근력 강화',
  '사이드 플랭크': '코어 근력 강화',
  스트레칭: '유연성 향상',
  러닝머신: '유산소 운동',
  사이클: '유산소 운동',
  '제자리 뛰기': '유산소 운동',
  점핑잭: '유산소 운동',
  '캣카우 스트레칭': '척추 안정성 향상',
};

const REASON_KEYWORD_PATTERNS: { keyword: string; tag: string }[] = [
  { keyword: '코어', tag: '코어 근력 강화' },
  { keyword: '하체', tag: '하체 근력 강화' },
  { keyword: '상체', tag: '상체 근력 강화' },
  { keyword: '가슴', tag: '가슴 근력 강화' },
  { keyword: '등', tag: '등 근력 강화' },
  { keyword: '어깨', tag: '어깨 근력 강화' },
  { keyword: '척추', tag: '척추 안정성 향상' },
  { keyword: '유산소', tag: '유산소 운동' },
  { keyword: '유연성', tag: '유연성 향상' },
  { keyword: '전신', tag: '전신 근력 강화' },
];

export function resolveStepTag(
  name: string,
  tag?: string,
  reason?: string,
): string | undefined {
  if (tag && tag.length <= 12) {
    return tag;
  }

  const mappedTag =
    EXERCISE_TAG_MAP[name] ?? EXERCISE_TAG_MAP[name.replace(/\s/g, '')];

  if (mappedTag) {
    return mappedTag;
  }

  if (!reason) {
    return undefined;
  }

  return REASON_KEYWORD_PATTERNS.find(({ keyword }) => reason.includes(keyword))
    ?.tag;
}
