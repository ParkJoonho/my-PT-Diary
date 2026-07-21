export interface RoutineStep {
  name: string;
  detail: string;
  type: "cardio" | "strength" | "stretch" | "rest";
  restAfter?: string;
  sets?: number;
  tag?: string;
}

export interface WorkoutRoutine {
  id: string;
  label: string;
  duration: string;
  location: "gym" | "home";
  pattern?: "general" | "crossfit";
  steps: RoutineStep[];
}

export const RECOMMENDED_ROUTINES: WorkoutRoutine[] = [
  {
    id: "gym_60",
    label: "1시간 루틴",
    duration: "60분",
    location: "gym",
    pattern: "general",
    steps: [
      { name: "러닝머신", detail: "20분, 6km", type: "cardio", restAfter: "5분 (물 마시기)", tag: "유산소 운동" },
      { name: "푸시업", detail: "10회 x 3세트", type: "strength", sets: 3, restAfter: "1분 30초", tag: "상체 근력 강화" },
      { name: "랫풀다운", detail: "12회 x 3세트", type: "strength", sets: 3, restAfter: "1분 30초", tag: "등 근력 강화" },
      { name: "스쿼트", detail: "10회 x 3세트", type: "strength", sets: 3, restAfter: "1분 30초", tag: "하체 근력 강화" },
      { name: "스트레칭", detail: "5분", type: "stretch", tag: "유연성 향상" },
    ],
  },
  {
    id: "gym_90",
    label: "1시간 30분 루틴",
    duration: "90분",
    location: "gym",
    pattern: "general",
    steps: [
      { name: "러닝머신", detail: "20분, 6km", type: "cardio", restAfter: "5분 (물 마시기)", tag: "유산소 운동" },
      { name: "벤치프레스", detail: "8회 x 4세트", type: "strength", sets: 4, restAfter: "2분", tag: "가슴 근력 강화" },
      { name: "덤벨 숄더프레스", detail: "10회 x 3세트", type: "strength", sets: 3, restAfter: "1분 30초", tag: "어깨 근력 강화" },
      { name: "바벨 로우", detail: "10회 x 4세트", type: "strength", sets: 4, restAfter: "2분", tag: "등 근력 강화" },
      { name: "레그프레스", detail: "12회 x 3세트", type: "strength", sets: 3, restAfter: "1분 30초", tag: "하체 근력 강화" },
      { name: "플랭크", detail: "45초 x 3세트", type: "strength", sets: 3, restAfter: "1분", tag: "코어 근력 강화" },
      { name: "스트레칭", detail: "10분", type: "stretch", tag: "유연성 향상" },
    ],
  },
  {
    id: "gym_120",
    label: "2시간 루틴",
    duration: "120분",
    location: "gym",
    pattern: "general",
    steps: [
      { name: "러닝머신", detail: "30분, 8km", type: "cardio", restAfter: "5분 (물 마시기)", tag: "유산소 운동" },
      { name: "사이클", detail: "10분", type: "cardio", restAfter: "3분 (물 마시기)", tag: "유산소 운동" },
      { name: "벤치프레스", detail: "8회 x 4세트", type: "strength", sets: 4, restAfter: "2분", tag: "가슴 근력 강화" },
      { name: "인클라인 덤벨프레스", detail: "10회 x 3세트", type: "strength", sets: 3, restAfter: "1분 30초", tag: "가슴 근력 강화" },
      { name: "랫풀다운", detail: "12회 x 4세트", type: "strength", sets: 4, restAfter: "2분", tag: "등 근력 강화" },
      { name: "시티드 로우", detail: "10회 x 3세트", type: "strength", sets: 3, restAfter: "1분 30초", tag: "등 근력 강화" },
      { name: "레그프레스", detail: "12회 x 4세트", type: "strength", sets: 4, restAfter: "2분", tag: "하체 근력 강화" },
      { name: "레그컬", detail: "12회 x 3세트", type: "strength", sets: 3, restAfter: "1분 30초", tag: "하체 근력 강화" },
      { name: "플랭크", detail: "60초 x 3세트", type: "strength", sets: 3, restAfter: "1분", tag: "코어 근력 강화" },
      { name: "스트레칭", detail: "10분", type: "stretch", tag: "유연성 향상" },
    ],
  },
  {
    id: "cf_30",
    label: "30분 WOD 루틴",
    duration: "30분",
    location: "gym",
    pattern: "crossfit",
    steps: [
      { name: "로잉머신", detail: "3분 워밍업", type: "cardio", restAfter: "1분", tag: "유산소 워밍업" },
      { name: "버피", detail: "10회 x 3세트", type: "strength", sets: 3, restAfter: "30초", tag: "전신 근력 강화" },
      { name: "케틀벨 스윙", detail: "15회 x 3세트", type: "strength", sets: 3, restAfter: "30초", tag: "힙·등 근력" },
      { name: "박스점프", detail: "10회 x 3세트", type: "strength", sets: 3, restAfter: "30초", tag: "하체 폭발력" },
      { name: "월볼 스로우", detail: "12회 x 3세트", type: "strength", sets: 3, restAfter: "30초", tag: "전신 협응력" },
      { name: "폼롤러 릴리즈", detail: "3분", type: "stretch", tag: "근막 이완" },
    ],
  },
  {
    id: "cf_45",
    label: "45분 WOD 루틴",
    duration: "45분",
    location: "gym",
    pattern: "crossfit",
    steps: [
      { name: "로잉머신", detail: "5분 워밍업", type: "cardio", restAfter: "1분", tag: "유산소 워밍업" },
      { name: "클린 앤 저크", detail: "5회 x 5세트", type: "strength", sets: 5, restAfter: "1분", tag: "전신 파워" },
      { name: "더블언더 줄넘기", detail: "50회 x 3세트", type: "cardio", restAfter: "30초", tag: "유산소 지구력" },
      { name: "풀업", detail: "8회 x 4세트", type: "strength", sets: 4, restAfter: "1분", tag: "상체 근력 강화" },
      { name: "쓰러스터", detail: "10회 x 3세트", type: "strength", sets: 3, restAfter: "1분", tag: "전신 근력 강화" },
      { name: "버피 오버 바", detail: "10회 x 3세트", type: "strength", sets: 3, restAfter: "30초", tag: "전신 지구력" },
      { name: "폼롤러 릴리즈", detail: "5분", type: "stretch", tag: "근막 이완" },
    ],
  },
  {
    id: "cf_60",
    label: "1시간 WOD 루틴",
    duration: "60분",
    location: "gym",
    pattern: "crossfit",
    steps: [
      { name: "로잉머신", detail: "5분 워밍업", type: "cardio", restAfter: "2분", tag: "유산소 워밍업" },
      { name: "스내치", detail: "3회 x 5세트", type: "strength", sets: 5, restAfter: "1분 30초", tag: "전신 파워" },
      { name: "클린 앤 저크", detail: "3회 x 5세트", type: "strength", sets: 5, restAfter: "1분 30초", tag: "전신 파워" },
      { name: "토즈투바 (Toes-to-Bar)", detail: "10회 x 4세트", type: "strength", sets: 4, restAfter: "1분", tag: "코어 근력 강화" },
      { name: "핸드스탠드 푸시업", detail: "5회 x 4세트", type: "strength", sets: 4, restAfter: "1분", tag: "어깨·코어 강화" },
      { name: "머슬업", detail: "3회 x 3세트", type: "strength", sets: 3, restAfter: "1분 30초", tag: "상체 근력 강화" },
      { name: "월볼 스로우", detail: "15회 x 3세트", type: "strength", sets: 3, restAfter: "1분", tag: "전신 협응력" },
      { name: "더블언더 줄넘기", detail: "100회", type: "cardio", restAfter: "1분", tag: "유산소 지구력" },
      { name: "폼롤러 릴리즈", detail: "5분", type: "stretch", tag: "근막 이완" },
    ],
  },
  {
    id: "home_30",
    label: "30분 루틴",
    duration: "30분",
    location: "home",
    steps: [
      { name: "제자리 뛰기", detail: "3분", type: "cardio", restAfter: "1분", tag: "유산소 운동" },
      { name: "푸시업", detail: "15회 x 3세트", type: "strength", sets: 3, restAfter: "1분", tag: "상체 근력 강화" },
      { name: "스쿼트", detail: "20회 x 3세트", type: "strength", sets: 3, restAfter: "1분", tag: "하체 근력 강화" },
      { name: "플랭크", detail: "30초 x 3세트", type: "strength", sets: 3, restAfter: "30초", tag: "코어 근력 강화" },
      { name: "버피", detail: "10회 x 2세트", type: "strength", sets: 2, restAfter: "1분", tag: "전신 근력 강화" },
      { name: "스트레칭", detail: "3분", type: "stretch", tag: "유연성 향상" },
    ],
  },
  {
    id: "home_45",
    label: "45분 루틴",
    duration: "45분",
    location: "home",
    steps: [
      { name: "점핑잭", detail: "5분", type: "cardio", restAfter: "1분", tag: "유산소 운동" },
      { name: "푸시업", detail: "15회 x 4세트", type: "strength", sets: 4, restAfter: "1분", tag: "상체 근력 강화" },
      { name: "런지", detail: "12회 x 3세트 (양쪽)", type: "strength", sets: 3, restAfter: "1분", tag: "하체 근력 강화" },
      { name: "다이아몬드 푸시업", detail: "10회 x 3세트", type: "strength", sets: 3, restAfter: "1분", tag: "삼두 근력 강화" },
      { name: "글루트 브릿지", detail: "15회 x 3세트", type: "strength", sets: 3, restAfter: "1분", tag: "엉덩이 근력 강화" },
      { name: "마운틴 클라이머", detail: "20회 x 3세트", type: "strength", sets: 3, restAfter: "1분", tag: "코어·유산소" },
      { name: "플랭크", detail: "45초 x 3세트", type: "strength", sets: 3, restAfter: "30초", tag: "코어 근력 강화" },
      { name: "스트레칭", detail: "5분", type: "stretch", tag: "유연성 향상" },
    ],
  },
  {
    id: "home_60",
    label: "1시간 루틴",
    duration: "60분",
    location: "home",
    steps: [
      { name: "제자리 뛰기", detail: "5분", type: "cardio", restAfter: "1분", tag: "유산소 운동" },
      { name: "버피", detail: "10회 x 3세트", type: "strength", sets: 3, restAfter: "1분 30초", tag: "전신 근력 강화" },
      { name: "푸시업", detail: "20회 x 4세트", type: "strength", sets: 4, restAfter: "1분", tag: "상체 근력 강화" },
      { name: "와이드 스쿼트", detail: "20회 x 4세트", type: "strength", sets: 4, restAfter: "1분 30초", tag: "하체 근력 강화" },
      { name: "런지", detail: "12회 x 4세트 (양쪽)", type: "strength", sets: 4, restAfter: "1분", tag: "하체 근력 강화" },
      { name: "파이크 푸시업", detail: "10회 x 3세트", type: "strength", sets: 3, restAfter: "1분", tag: "어깨 근력 강화" },
      { name: "슈퍼맨", detail: "15회 x 3세트", type: "strength", sets: 3, restAfter: "1분", tag: "등·코어 강화" },
      { name: "사이드 플랭크", detail: "30초 x 3세트 (양쪽)", type: "strength", sets: 3, restAfter: "30초", tag: "코어 근력 강화" },
      { name: "플랭크", detail: "60초 x 3세트", type: "strength", sets: 3, restAfter: "1분", tag: "코어 근력 강화" },
      { name: "스트레칭", detail: "5분", type: "stretch", tag: "유연성 향상" },
    ],
  },
];
