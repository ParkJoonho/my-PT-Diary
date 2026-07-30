import { useNavigation } from '@granite-js/react-native';
import { useBodyAnalysisEntryStore } from 'features/body-analysis/stores/use-body-analysis-entry-store';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  OriginalAppIcon,
  type OriginalAppIconName,
} from 'shared/components/icons/pt-diary-icons';
import { RowActionCard } from 'shared/components/row-action-card';
import { TabPageLayout } from 'shared/components/tab-page-layout';
import Colors from 'shared/constants/colors';

const AI_FEATURES: Array<{
  accent: string;
  icon: OriginalAppIconName;
  iconBackground: string;
  route: '/ai-analysis' | '/meal-analysis' | null;
  subtitle: string;
  title: string;
}> = [
  {
    accent: Colors.accent,
    icon: 'bodyOutline',
    iconBackground: '#FFF0EA',
    route: '/ai-analysis',
    subtitle: '체형 타입 분석 및 체성분 예측',
    title: 'AI 체형 분석',
  },
  {
    accent: '#D4AF37',
    icon: 'chatbubbleEllipsesOutline',
    iconBackground: '#FFF8E1',
    route: null,
    subtitle: '맞춤형 운동·식단·동기부여 코칭',
    title: 'AI 트레이너 아테나',
  },
  {
    accent: Colors.success,
    icon: 'restaurantOutline',
    iconBackground: '#E8F8EE',
    route: '/meal-analysis',
    subtitle: '사진으로 칼로리·영양소 분석',
    title: 'AI 식단 분석',
  },
  {
    accent: Colors.info,
    icon: 'accessibilityOutline',
    iconBackground: '#E5F0FF',
    route: null,
    subtitle: '운동 자세 교정 및 피드백',
    title: 'AI 자세 분석',
  },
  {
    accent: Colors.warning,
    icon: 'footstepsOutline',
    iconBackground: '#FFF3E0',
    route: '/ai-analysis',
    subtitle: '보행 분석 기반 맞춤 신발 추천',
    title: 'AI 신발 추천',
  },
  {
    accent: Colors.accent,
    icon: 'analyticsOutline',
    iconBackground: '#FFF0EA',
    route: null,
    subtitle: '종합 점수·부상 위험도·체형 예측',
    title: 'AI 통합 피트니스 분석',
  },
] as const;

export function AiHubScreen() {
  const navigation = useNavigation();
  const setEntryPoint = useBodyAnalysisEntryStore(
    (state) => state.setEntryPoint,
  );

  return (
    <TabPageLayout activeKey="ai-hub">
      {({ contentBottomInset }) => (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: contentBottomInset },
          ]}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          {AI_FEATURES.map((feature) => {
            const leading = (
              <View
                style={[
                  styles.featureCircle,
                  { backgroundColor: feature.iconBackground },
                ]}
              >
                <OriginalAppIcon
                  color={feature.accent}
                  name={feature.icon}
                  size={22}
                />
              </View>
            );

            return (
              <RowActionCard
                key={feature.title}
                leading={leading}
                onPress={() => {
                  if (!feature.route) {
                    return;
                  }

                  setEntryPoint(
                    feature.title === 'AI 신발 추천' ? 'shoe' : 'default',
                  );
                  navigation.navigate({ name: feature.route, params: {} });
                }}
                subtitle={feature.subtitle}
                title={feature.title}
                variant="aiFeature"
              />
            );
          })}
        </ScrollView>
      )}
    </TabPageLayout>
  );
}

const styles = StyleSheet.create({
  featureCircle: {
    alignItems: 'center',
    borderRadius: 999,
    flexShrink: 0,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  scrollContent: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
  },
});
