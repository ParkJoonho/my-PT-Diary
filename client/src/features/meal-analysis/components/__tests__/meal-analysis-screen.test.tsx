import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import {
  useAnalyzeMeal,
  useCreateMealRecord,
  useDailyMealSummary,
  useGenerateDietGuide,
  useMealRecords,
} from '../../api/meal-analysis';
import { useMealAnalysisStore } from '../../stores/use-meal-analysis-store';
import { MealAnalysisScreen } from '../meal-analysis-screen';

const mockGoBack = jest.fn();
const mockAnalyze = jest.fn<() => Promise<unknown>>();
const mockCreateRecord = jest.fn();
const mockGenerateGuide = jest.fn();

jest.mock('@granite-js/react-native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

jest.mock('features/body-analysis/lib/pick-image', () => ({
  pickSingleImage: jest.fn(),
}));

jest.mock('../../api/meal-analysis', () => ({
  useAnalyzeMeal: jest.fn(),
  useCreateMealRecord: jest.fn(),
  useDailyMealSummary: jest.fn(),
  useGenerateDietGuide: jest.fn(),
  useMealRecords: jest.fn(),
}));

jest.mock('shared/components/icons/pt-diary-icons', () => {
  const { Text } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    OriginalAppIcon: ({ name }: { name: string }) => (
      <Text>{`icon:${name}`}</Text>
    ),
    SemanticIcon: ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text>,
  };
});

describe('AI 식단 분석 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAnalyzeMeal).mockReturnValue({
      isPending: false,
      mutateAsync: mockAnalyze,
    } as never);
    jest.mocked(useCreateMealRecord).mockReturnValue({
      isPending: false,
      mutateAsync: mockCreateRecord,
    } as never);
    jest.mocked(useGenerateDietGuide).mockReturnValue({
      isPending: false,
      mutateAsync: mockGenerateGuide,
    } as never);
    jest.mocked(useDailyMealSummary).mockReturnValue({
      data: {
        mealCount: 0,
        totalCalories: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        totalProtein: 0,
        totalSodium: 0,
      },
    } as never);
    jest.mocked(useMealRecords).mockReturnValue({ data: [] } as never);
    useMealAnalysisStore.setState({
      activeTab: 'analysis',
      afterPhoto: undefined,
      analysisResult: undefined,
      beforePhoto: undefined,
      dietGuide: undefined,
      mealType: 'breakfast',
    });
  });

  it('원본 고정 header와 tab, 식사 타입 순서를 표시한다', () => {
    render(<MealAnalysisScreen contentBottomInset={80} />);

    expect(screen.getByText('icon:chevronLeft')).toBeTruthy();
    expect(screen.getAllByText('icon:camera').length).toBeGreaterThan(0);
    expect(screen.getByText('icon:foodAppleOutline')).toBeTruthy();
    expect(screen.getByText('icon:sunnyOutline')).toBeTruthy();
    expect(screen.getByText('icon:restaurantOutline')).toBeTruthy();
    expect(screen.getByText('icon:moonOutline')).toBeTruthy();
    expect(screen.getByText('icon:cafeOutline')).toBeTruthy();

    const labels = screen.getAllByText(/^(아침|점심|저녁|간식)$/);
    expect(labels.map((label) => label.props.children)).toEqual([
      '아침',
      '점심',
      '저녁',
      '간식',
    ]);
  });

  it('가이드 tab을 누르면 원본 active icon과 CTA를 표시한다', () => {
    render(<MealAnalysisScreen contentBottomInset={80} />);

    fireEvent.press(screen.getByText('식단 가이드'));

    expect(screen.getAllByText('icon:foodApple').length).toBeGreaterThan(0);
    expect(screen.getByText('AI 식단 가이드')).toBeTruthy();
    expect(screen.getByText('AI 가이드 미리 보기')).toBeTruthy();
  });

  it('EXIF 없이 입력한 식사 시간을 원본 전후 분석 payload에 반영한다', async () => {
    mockAnalyze.mockResolvedValue({
      analysis: {
        dietaryAdvice: [],
        exerciseToOffset: { cycling: 0, running: 0, walking: 0 },
        foods: [],
        mealBalance: {
          carbRatio: 0,
          fatRatio: 0,
          feedback: '',
          grade: 'B',
          proteinRatio: 0,
          score: 0,
        },
        summary: '',
        totalCalories: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        totalProtein: 0,
        totalSodium: 0,
      },
    });
    useMealAnalysisStore.setState({
      afterPhoto: {
        base64: 'after',
        uri: 'after-uri',
      },
      beforePhoto: {
        base64: 'before',
        uri: 'before-uri',
      },
    });

    render(<MealAnalysisScreen contentBottomInset={80} />);

    expect(screen.getByText('20분')).toBeTruthy();
    expect(screen.getByText('적정')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('식사 시간 5분 늘리기'));
    fireEvent.press(screen.getByLabelText('식사 시간 1분 늘리기'));
    fireEvent.press(screen.getByText('AI 전/후 비교 분석'));

    await waitFor(() => {
      expect(mockAnalyze).toHaveBeenCalledWith({
        afterImageBase64: 'after',
        eatingDurationMinutes: 26,
        imageBase64: 'before',
        mealType: 'breakfast',
      });
    });
  });

  it('분석 중에는 원본 CTA 위치에서 spinner 문구를 표시한다', () => {
    jest.mocked(useAnalyzeMeal).mockReturnValue({
      isPending: true,
      mutateAsync: mockAnalyze,
    } as never);
    useMealAnalysisStore.setState({
      beforePhoto: {
        base64: 'before',
        uri: 'before-uri',
      },
    });

    render(<MealAnalysisScreen contentBottomInset={80} />);

    expect(screen.getByText('AI 분석 중...')).toBeTruthy();
    expect(screen.queryByText('icon:foodApple')).toBeNull();
  });
});
