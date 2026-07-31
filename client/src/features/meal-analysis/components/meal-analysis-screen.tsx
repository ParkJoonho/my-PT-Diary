import { useNavigation } from '@granite-js/react-native';
import { pickSingleImage } from 'features/body-analysis/lib/pick-image';
import { Suspense, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AsyncErrorBoundary } from 'shared/components/async-state';
import {
  OriginalAppIcon,
  type OriginalAppIconName,
  SemanticIcon,
} from 'shared/components/icons/pt-diary-icons';
import Colors, { iosShadow } from 'shared/constants/colors';
import { getClientTodayDate } from 'shared/lib/date';
import {
  useAnalyzeMeal,
  useCreateMealRecord,
  useDailyMealSummary,
  useGenerateDietGuide,
  useMealRecords,
} from '../api/meal-analysis';
import { useMealAnalysisStore } from '../stores/use-meal-analysis-store';
import {
  MEAL_LABELS,
  MEAL_TYPES,
  type MealPhotoTarget,
  type MealType,
} from '../types/meal-analysis';
import { DietGuideTab } from './diet-guide-tab';
import { MealAnalysisResult } from './meal-analysis-result';
import { MealDurationCard, MealPhotoSection } from './meal-photo-section';
import { DailyMealSummary, TodayMealRecords } from './meal-today-sections';

const MEAL_TYPE_ICONS = {
  breakfast: 'sunnyOutline',
  dinner: 'moonOutline',
  lunch: 'restaurantOutline',
  snack: 'cafeOutline',
} satisfies Record<MealType, OriginalAppIconName>;

export function MealAnalysisScreen({
  contentBottomInset,
}: {
  contentBottomInset: number;
}) {
  const navigation = useNavigation();
  const activeTab = useMealAnalysisStore((state) => state.activeTab);
  const setActiveTab = useMealAnalysisStore((state) => state.setActiveTab);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.headerSide}
        >
          <SemanticIcon color={Colors.text} name="chevronLeft" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>AI 식단 분석</Text>
        <View style={styles.headerSide} />
      </View>

      <View style={[styles.tabBar, iosShadow]}>
        <TabButton
          active={activeTab === 'analysis'}
          activeIcon="camera"
          inactiveIcon="cameraOutline"
          label="식단 분석"
          onPress={() => setActiveTab('analysis')}
        />
        <TabButton
          active={activeTab === 'guide'}
          activeIcon="foodApple"
          inactiveIcon="foodAppleOutline"
          label="식단 가이드"
          onPress={() => setActiveTab('guide')}
        />
      </View>

      <View style={styles.content}>
        <MealAnalysisScreenData contentBottomInset={contentBottomInset} />
      </View>
    </View>
  );
}

function TabButton({
  active,
  activeIcon,
  inactiveIcon,
  label,
  onPress,
}: {
  active: boolean;
  activeIcon: OriginalAppIconName;
  inactiveIcon: OriginalAppIconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <OriginalAppIcon
        color={active ? Colors.accent : Colors.textMuted}
        name={active ? activeIcon : inactiveIcon}
        size={16}
      />
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function MealAnalysisScreenData({
  contentBottomInset,
}: {
  contentBottomInset: number;
}) {
  const today = getClientTodayDate();
  const analyzeMeal = useAnalyzeMeal();
  const createMealRecord = useCreateMealRecord(today);
  const generateDietGuide = useGenerateDietGuide();
  const activeTab = useMealAnalysisStore((state) => state.activeTab);
  const afterPhoto = useMealAnalysisStore((state) => state.afterPhoto);
  const analysisResult = useMealAnalysisStore((state) => state.analysisResult);
  const beforePhoto = useMealAnalysisStore((state) => state.beforePhoto);
  const dietGuide = useMealAnalysisStore((state) => state.dietGuide);
  const mealType = useMealAnalysisStore((state) => state.mealType);
  const removePhoto = useMealAnalysisStore((state) => state.removePhoto);
  const resetAnalysis = useMealAnalysisStore((state) => state.resetAnalysis);
  const setAnalysisResult = useMealAnalysisStore(
    (state) => state.setAnalysisResult,
  );
  const setDietGuide = useMealAnalysisStore((state) => state.setDietGuide);
  const setMealType = useMealAnalysisStore((state) => state.setMealType);
  const setPhoto = useMealAnalysisStore((state) => state.setPhoto);
  // Apps in Toss에서는 EXIF 촬영 시각을 받을 수 없어 원본 카드 UI를 유지한 직접 입력값을 사용해요.
  const [eatingDurationMinutes, setEatingDurationMinutes] = useState(20);

  const handlePickPhoto = async (
    target: MealPhotoTarget,
    useCamera: boolean,
  ) => {
    try {
      const photo = await pickSingleImage({ useCamera });

      if (photo) {
        setPhoto(target, photo);
      }
    } catch {
      Alert.alert('오류', '사진을 가져오는 중 문제가 발생했어요.');
    }
  };

  const handleAnalyze = async () => {
    if (!beforePhoto) {
      Alert.alert('알림', '식사 전 사진을 선택해 주세요.');
      return;
    }

    try {
      const response = await analyzeMeal.mutateAsync({
        afterImageBase64: afterPhoto?.base64,
        eatingDurationMinutes,
        imageBase64: beforePhoto.base64,
        mealType,
      });
      setAnalysisResult(response.analysis);
    } catch (error) {
      Alert.alert(
        '분석 실패',
        error instanceof Error
          ? error.message
          : 'AI 식단 분석 중 오류가 발생했어요.',
      );
    }
  };

  const handleSave = async () => {
    if (!analysisResult) {
      return;
    }

    try {
      await createMealRecord.mutateAsync({
        analysisResult,
        mealDate: today,
        mealType,
      });
      Alert.alert('저장 완료', '식단 기록이 저장되었습니다.');
      setDietGuide(undefined);
      resetAnalysis();
    } catch (error) {
      Alert.alert(
        '오류',
        error instanceof Error ? error.message : '저장에 실패했어요.',
      );
    }
  };

  const handleGenerateGuide = async () => {
    setDietGuide(undefined);

    try {
      const response = await generateDietGuide.mutateAsync({ date: today });
      setDietGuide(response);
    } catch (error) {
      Alert.alert(
        '오류',
        error instanceof Error
          ? error.message
          : 'AI 식단 가이드 생성 중 오류가 발생했어요.',
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: contentBottomInset },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {activeTab === 'analysis' ? (
        <>
          <AsyncErrorBoundary message="오늘의 영양 섭취를 불러오지 못했어요.">
            <Suspense fallback={null}>
              <DailyMealSummaryData date={today} />
            </Suspense>
          </AsyncErrorBoundary>
          <MealTypeSelector
            mealType={mealType}
            onSelectMealType={setMealType}
          />

          {analysisResult ? (
            <MealAnalysisResult
              isSaving={createMealRecord.isPending}
              onReset={resetAnalysis}
              onSave={handleSave}
              result={analysisResult}
            />
          ) : (
            <>
              <MealPhotoSection
                afterPhoto={afterPhoto}
                beforePhoto={beforePhoto}
                onPick={handlePickPhoto}
                onRemove={removePhoto}
              />
              <MealDurationCard
                durationMinutes={eatingDurationMinutes}
                onChangeDuration={setEatingDurationMinutes}
              />
              <Pressable
                disabled={!beforePhoto || analyzeMeal.isPending}
                onPress={handleAnalyze}
                style={[
                  styles.analyzeButton,
                  (!beforePhoto || analyzeMeal.isPending) &&
                    styles.disabledButton,
                ]}
              >
                {analyzeMeal.isPending ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <OriginalAppIcon
                    color={Colors.white}
                    name="foodApple"
                    size={20}
                  />
                )}
                <Text style={styles.analyzeButtonText}>
                  {analyzeMeal.isPending
                    ? 'AI 분석 중...'
                    : afterPhoto
                      ? 'AI 전/후 비교 분석'
                      : 'AI 식단 분석'}
                </Text>
              </Pressable>
            </>
          )}

          <AsyncErrorBoundary message="오늘의 식단 기록을 불러오지 못했어요.">
            <Suspense fallback={null}>
              <TodayMealRecordsData date={today} />
            </Suspense>
          </AsyncErrorBoundary>
        </>
      ) : (
        <AsyncErrorBoundary message="오늘의 식단 기록을 불러오지 못했어요.">
          <Suspense
            fallback={
              <DietGuideTab
                guide={dietGuide}
                isLoading={generateDietGuide.isPending}
                onGenerate={handleGenerateGuide}
                recordCount={0}
              />
            }
          >
            <DietGuideTabData
              date={today}
              guide={dietGuide}
              isLoading={generateDietGuide.isPending}
              onGenerate={handleGenerateGuide}
            />
          </Suspense>
        </AsyncErrorBoundary>
      )}
    </ScrollView>
  );
}

function DailyMealSummaryData({ date }: { date: string }) {
  const { data } = useDailyMealSummary(date);

  return <DailyMealSummary summary={data} />;
}

function TodayMealRecordsData({ date }: { date: string }) {
  const { data } = useMealRecords(date);

  return <TodayMealRecords records={data} />;
}

function DietGuideTabData({
  date,
  guide,
  isLoading,
  onGenerate,
}: {
  date: string;
  guide: ReturnType<typeof useMealAnalysisStore.getState>['dietGuide'];
  isLoading: boolean;
  onGenerate: () => void;
}) {
  const { data } = useMealRecords(date);

  return (
    <DietGuideTab
      guide={guide}
      isLoading={isLoading}
      onGenerate={onGenerate}
      recordCount={data.length}
    />
  );
}

function MealTypeSelector({
  mealType,
  onSelectMealType,
}: {
  mealType: MealType;
  onSelectMealType: (mealType: MealType) => void;
}) {
  return (
    <View style={styles.mealTypeRow}>
      {MEAL_TYPES.map((type) => {
        const icon = MEAL_TYPE_ICONS[type];
        const selected = mealType === type;

        return (
          <Pressable
            key={type}
            onPress={() => onSelectMealType(type)}
            style={[
              styles.mealTypeButton,
              iosShadow,
              selected && styles.mealTypeButtonActive,
            ]}
          >
            <OriginalAppIcon
              color={selected ? Colors.white : Colors.textSecondary}
              name={icon}
              size={18}
            />
            <Text
              style={[
                styles.mealTypeText,
                selected && styles.mealTypeTextActive,
              ]}
            >
              {MEAL_LABELS[type]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  analyzeButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
    paddingVertical: 16,
  },
  analyzeButtonText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSide: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-Medium',
    fontSize: 18,
  },
  mealTypeButton: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  mealTypeButtonActive: {
    backgroundColor: Colors.accent,
  },
  mealTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  mealTypeText: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  mealTypeTextActive: {
    color: Colors.white,
  },
  scrollContent: {
    paddingTop: 4,
  },
  tabBar: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    flexDirection: 'row',
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 4,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
  },
  tabTextActive: {
    color: Colors.accent,
  },
});
