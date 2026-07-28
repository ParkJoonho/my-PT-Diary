export const 식단분석예시 = {
  dietaryAdvice: [
    '채소 반찬을 조금 더 추가해 보세요.',
    '나트륨 섭취를 줄이기 위해 국물은 적게 먹어보세요.',
  ],
  eatingSpeedAnalysis: {
    advice: '적정한 속도로 식사했어요.',
    durationMinutes: 20,
    grade: 'good' as const,
    healthRisks: [],
    tips: ['한 입마다 충분히 씹어보세요.'],
  },
  exerciseToOffset: {
    cycling: 25,
    running: 20,
    walking: 45,
  },
  foods: [
    {
      calories: 300,
      carbs: 65,
      category: '밥류',
      consumptionRate: 100,
      estimatedWeight: '약 210g',
      fat: 1,
      fiber: 1,
      name: '쌀밥',
      protein: 6,
      sodium: 5,
    },
    {
      calories: 250,
      carbs: 15,
      category: '고기류',
      consumptionRate: 80,
      estimatedWeight: '약 120g',
      fat: 12,
      fiber: 0,
      name: '불고기',
      protein: 25,
      sodium: 650,
    },
  ],
  mealBalance: {
    carbRatio: 55,
    fatRatio: 20,
    feedback: '탄수화물과 단백질 구성이 비교적 균형 잡혀 있어요.',
    grade: 'A' as const,
    proteinRatio: 25,
    score: 85,
  },
  summary: '밥과 불고기를 중심으로 구성된 한식 식사예요.',
  totalCalories: 550,
  totalCarbs: 80,
  totalFat: 13,
  totalFiber: 1,
  totalProtein: 31,
  totalSodium: 655,
};

export const 식단가이드예시 = {
  macroTargets: {
    calories: 2000,
    carbs: 250,
    fat: 55,
    protein: 120,
  },
  mealPlan: [
    {
      calories: 450,
      foods: ['현미밥', '달걀', '나물'],
      mealName: '아침',
    },
    {
      calories: 650,
      foods: ['잡곡밥', '닭가슴살', '된장국'],
      mealName: '점심',
    },
    {
      calories: 650,
      foods: ['밥', '생선구이', '샐러드'],
      mealName: '저녁',
    },
    {
      calories: 250,
      foods: ['그릭요거트', '견과류'],
      mealName: '간식',
    },
  ],
  overallAssessment: '오늘 기록은 단백질을 조금 더 보완하면 좋아요.',
  tips: ['매 끼니에 단백질 식품을 하나씩 포함해 보세요.'],
};
