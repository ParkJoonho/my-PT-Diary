import { beforeEach, describe, expect, it } from '@jest/globals';
import { useMealAnalysisStore } from '../use-meal-analysis-store';

describe('식단 분석 화면 상태', () => {
  beforeEach(() => {
    useMealAnalysisStore.setState({
      activeTab: 'analysis',
      afterPhoto: undefined,
      analysisResult: undefined,
      beforePhoto: undefined,
      dietGuide: undefined,
      mealType: 'lunch',
    });
  });

  it('사진을 바꾸면 이전 분석 결과를 버린다', () => {
    useMealAnalysisStore.setState({
      analysisResult: {
        dietaryAdvice: ['조언'],
        exerciseToOffset: {
          cycling: 10,
          running: 10,
          walking: 10,
        },
        foods: [],
        mealBalance: {
          carbRatio: 40,
          fatRatio: 20,
          feedback: '피드백',
          grade: 'A',
          proteinRatio: 40,
          score: 90,
        },
        summary: '요약',
        totalCalories: 100,
        totalCarbs: 10,
        totalFat: 10,
        totalFiber: 1,
        totalProtein: 10,
        totalSodium: 10,
      },
    });

    useMealAnalysisStore.getState().setPhoto('before', {
      base64: 'base64',
      uri: 'data:image/jpeg;base64,base64',
    });

    expect(useMealAnalysisStore.getState().beforePhoto?.base64).toBe('base64');
    expect(useMealAnalysisStore.getState().analysisResult).toBeUndefined();
  });

  it('저장 후 초기화해도 선택한 식사 유형은 유지한다', () => {
    useMealAnalysisStore.getState().setPhoto('before', {
      base64: 'base64',
      uri: 'data:image/jpeg;base64,base64',
    });
    useMealAnalysisStore.getState().resetAnalysis();

    expect(useMealAnalysisStore.getState().beforePhoto).toBeUndefined();
    expect(useMealAnalysisStore.getState().mealType).toBe('lunch');
  });
});
