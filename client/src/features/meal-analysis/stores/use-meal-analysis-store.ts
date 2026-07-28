import type {
  DietGuideResponseDto,
  MealAnalysisResultDto,
} from 'shared/api/generated/models';
import { create } from 'zustand';
import {
  type MealAnalysisTab,
  type MealPhoto,
  type MealPhotoTarget,
  type MealType,
  getDefaultMealType,
} from '../types/meal-analysis';

type MealAnalysisState = {
  activeTab: MealAnalysisTab;
  afterPhoto?: MealPhoto;
  analysisResult?: MealAnalysisResultDto;
  beforePhoto?: MealPhoto;
  dietGuide?: DietGuideResponseDto;
  mealType: MealType;
  removePhoto: (target: MealPhotoTarget) => void;
  resetAnalysis: () => void;
  setActiveTab: (tab: MealAnalysisTab) => void;
  setAnalysisResult: (result: MealAnalysisResultDto) => void;
  setDietGuide: (guide?: DietGuideResponseDto) => void;
  setMealType: (mealType: MealType) => void;
  setPhoto: (target: MealPhotoTarget, photo: MealPhoto) => void;
};

export const useMealAnalysisStore = create<MealAnalysisState>((set) => ({
  activeTab: 'analysis',
  afterPhoto: undefined,
  analysisResult: undefined,
  beforePhoto: undefined,
  dietGuide: undefined,
  mealType: getDefaultMealType(),
  removePhoto: (target) =>
    set(
      target === 'before'
        ? { analysisResult: undefined, beforePhoto: undefined }
        : { afterPhoto: undefined, analysisResult: undefined },
    ),
  resetAnalysis: () =>
    set({
      afterPhoto: undefined,
      analysisResult: undefined,
      beforePhoto: undefined,
    }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setAnalysisResult: (analysisResult) => set({ analysisResult }),
  setDietGuide: (dietGuide) => set({ dietGuide }),
  setMealType: (mealType) => set({ analysisResult: undefined, mealType }),
  setPhoto: (target, photo) =>
    set(
      target === 'before'
        ? { analysisResult: undefined, beforePhoto: photo }
        : { afterPhoto: photo, analysisResult: undefined },
    ),
}));
