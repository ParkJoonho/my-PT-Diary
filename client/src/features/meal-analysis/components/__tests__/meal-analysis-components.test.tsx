import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import type {
  DietGuideResponseDto,
  MealAnalysisResultDto,
} from 'shared/api/generated/models';
import { DietGuideTab } from '../diet-guide-tab';
import { MealAnalysisResult } from '../meal-analysis-result';
import { MealDurationCard, MealPhotoSection } from '../meal-photo-section';

jest.mock('lucide-react-native', () => {
  const { Text } = require('react-native');

  return new Proxy(
    {},
    {
      get: (_target, key) => {
        return function MockIcon() {
          return <Text>{String(key)}</Text>;
        };
      },
    },
  );
});

const 분석결과: MealAnalysisResultDto = {
  dietaryAdvice: ['채소를 한 접시 추가해요.'],
  eatingSpeedAnalysis: {
    advice: '조금 더 천천히 먹어요.',
    durationMinutes: 12,
    grade: 'fast',
    healthRisks: ['포만감을 늦게 느낄 수 있어요.'],
    tips: ['한입마다 수저를 내려놓아요.'],
  },
  exerciseToOffset: {
    cycling: 25,
    running: 20,
    walking: 45,
  },
  foods: [
    {
      calories: 310,
      carbs: 55,
      category: '밥',
      consumptionRate: 80,
      estimatedWeight: '180g',
      fat: 2,
      fiber: 1,
      name: '쌀밥',
      protein: 6,
      sodium: 5,
    },
  ],
  mealBalance: {
    carbRatio: 55,
    fatRatio: 20,
    feedback: '단백질과 채소를 조금 더 보충해요.',
    grade: 'B',
    proteinRatio: 25,
    score: 78,
  },
  summary: '탄수화물 비중이 높은 한 끼예요.',
  totalCalories: 550,
  totalCarbs: 80,
  totalFat: 13,
  totalFiber: 4,
  totalProtein: 31,
  totalSodium: 655,
};

const 식단가이드: DietGuideResponseDto = {
  guide: {
    macroTargets: {
      calories: 2000,
      carbs: 250,
      fat: 55,
      protein: 120,
    },
    mealPlan: [
      {
        calories: 500,
        foods: ['현미밥', '닭가슴살', '나물'],
        mealName: '점심',
      },
    ],
    overallAssessment: '오늘은 단백질을 조금 더 보충해요.',
    tips: ['물을 충분히 마셔요.'],
  },
  sourceMealCount: 1,
};

describe('식단 분석 원본 UI 구성', () => {
  it('분석 결과 섹션을 원본 순서와 정보로 표시한다', () => {
    render(
      <MealAnalysisResult
        isSaving={false}
        onReset={jest.fn()}
        onSave={jest.fn()}
        result={분석결과}
      />,
    );

    expect(screen.getByText('분석 결과')).toBeTruthy();
    expect(screen.getByText('550')).toBeTruthy();
    expect(screen.getByText('영양 균형')).toBeTruthy();
    expect(screen.getByText('인식된 음식')).toBeTruthy();
    expect(screen.getByText('쌀밥')).toBeTruthy();
    expect(screen.getByText('칼로리 소모 시간')).toBeTruthy();
    expect(screen.getByText('식단 개선 조언')).toBeTruthy();
    expect(screen.getByText('식사 속도 분석')).toBeTruthy();
    expect(screen.getByText('기록 저장')).toBeTruthy();
    expect(screen.getByText('다시 분석')).toBeTruthy();
  });

  it('가이드 평가·목표·식사 구성·팁을 모두 표시한다', () => {
    render(
      <DietGuideTab
        guide={식단가이드}
        isLoading={false}
        onGenerate={jest.fn()}
        recordCount={1}
      />,
    );

    expect(screen.getByText('오늘 식단 평가')).toBeTruthy();
    expect(screen.getByText('목표 영양소')).toBeTruthy();
    expect(screen.getByText('추천 식사 구성')).toBeTruthy();
    expect(screen.getByText('오늘의 식단 팁')).toBeTruthy();
    expect(screen.getByText('다시 생성')).toBeTruthy();
  });

  it('사진 입력은 원본의 전/후 촬영 구조를 유지한다', () => {
    const onPick = jest.fn();

    render(<MealPhotoSection onPick={onPick} onRemove={jest.fn()} />);

    expect(screen.getByText('식사 전')).toBeTruthy();
    expect(screen.getByText('식사 후')).toBeTruthy();
    expect(screen.getByText('필수')).toBeTruthy();
    expect(screen.getByText('선택')).toBeTruthy();
    expect(screen.queryByText('미구현')).toBeNull();

    const addPhotoButton = screen.getAllByText('사진 추가').at(0);

    if (!addPhotoButton) {
      throw new Error('식사 전 사진 추가 버튼이 없어요.');
    }

    fireEvent.press(addPhotoButton);
    expect(onPick).toHaveBeenCalledWith('before', false);
  });

  it('카메라 촬영 시각 차이가 있으면 원본 식사 소요 시간 card를 표시한다', () => {
    render(<MealDurationCard durationMinutes={12} />);

    expect(screen.getByText('식사 소요 시간')).toBeTruthy();
    expect(screen.getByText('12분')).toBeTruthy();
    expect(screen.getByText('조금 빠름')).toBeTruthy();
  });
});
