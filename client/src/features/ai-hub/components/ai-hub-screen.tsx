import { useNavigation } from '@granite-js/react-native';
import {
  Accessibility,
  ChartColumnBig,
  ChevronRight,
  Footprints,
  MessageCircleMore,
  ScanFace,
  Shirt,
  Utensils,
} from 'lucide-react-native';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeTabBar } from 'features/home/components/home-tab-bar';
import { UnimplementedBadge } from 'shared/components/unimplemented-badge';
import Colors, { iosShadow } from 'shared/constants/colors';

const AI_FEATURES = [
  {
    accent: Colors.accent,
    icon: ScanFace,
    iconBackground: '#FFF0EA',
    implemented: true,
    route: '/ai-analysis',
    subtitle: '체형 타입 분석 및 체성분 예측',
    title: 'AI 체형 분석',
  },
  {
    accent: '#D4AF37',
    icon: MessageCircleMore,
    iconBackground: '#FFF8E1',
    implemented: false,
    subtitle: '맞춤형 운동·식단·동기부여 코칭',
    title: 'AI 트레이너 아테나',
  },
  {
    accent: Colors.success,
    icon: Utensils,
    iconBackground: '#E8F8EE',
    implemented: false,
    subtitle: '사진으로 칼로리·영양소 분석',
    title: 'AI 식단 분석',
  },
  {
    accent: Colors.info,
    icon: Accessibility,
    iconBackground: '#E5F0FF',
    implemented: false,
    subtitle: '운동 자세 교정 및 피드백',
    title: 'AI 자세 분석',
  },
  {
    accent: Colors.warning,
    icon: Footprints,
    iconBackground: '#FFF3E0',
    implemented: false,
    subtitle: '보행 분석 기반 맞춤 신발 추천',
    title: 'AI 신발 추천',
  },
  {
    accent: '#8B5CF6',
    icon: Shirt,
    iconBackground: '#F3E8FF',
    implemented: false,
    subtitle: '몸매 예측 및 스타일 추천',
    title: '나의 몸매 & 스타일',
  },
  {
    accent: Colors.accent,
    icon: ChartColumnBig,
    iconBackground: '#FFF0EA',
    implemented: false,
    subtitle: '종합 점수·부상 위험도·체형 예측',
    title: 'AI 통합 피트니스 분석',
  },
] as const;

export function AiHubScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <Text style={styles.headerTitle}>AI Hub</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          gap: 10,
          paddingBottom: 110 + insets.bottom,
          paddingHorizontal: 16,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {AI_FEATURES.map((feature) => (
          <Pressable
            key={feature.title}
            onPress={() => {
              if (!feature.implemented || !feature.route) {
                Alert.alert(feature.title, '준비 중입니다.');
                return;
              }

              navigation.navigate({ name: feature.route, params: {} });
            }}
            style={({ pressed }) => [
              styles.featureCard,
              iosShadow,
              pressed && styles.featureCardPressed,
            ]}
          >
            <View
              style={[
                styles.featureCircle,
                { backgroundColor: feature.iconBackground },
              ]}
            >
              <feature.icon color={feature.accent} size={20} strokeWidth={2.1} />
            </View>
            <View style={styles.featureTextWrap}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                {!feature.implemented ? <UnimplementedBadge compact /> : null}
              </View>
              <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
            </View>
            <ChevronRight color={Colors.iconMuted} size={18} strokeWidth={2.1} />
          </Pressable>
        ))}
      </ScrollView>

      <HomeTabBar activeKey="ai-hub" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  featureCard: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 14,
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 19,
  },
  featureCardPressed: {
    opacity: 0.78,
  },
  featureCircle: {
    alignItems: 'center',
    borderRadius: 999,
    flexShrink: 0,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  featureSubtitle: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  featureTextWrap: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
  },
  featureTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  header: {
    backgroundColor: Colors.card,
    borderBottomColor: Colors.cardBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
  },
  scrollView: {
    flex: 1,
  },
});
