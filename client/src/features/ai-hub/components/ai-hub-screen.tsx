import { useNavigation } from '@granite-js/react-native';
import {
  Brain,
  ChevronRight,
  Footprints,
  History,
  ScanFace,
  Shirt,
} from 'lucide-react-native';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeTabBar } from 'features/home/components/home-tab-bar';
import { UnimplementedBadge } from 'shared/components/unimplemented-badge';
import Colors, { iosShadow } from 'shared/constants/colors';

const AI_FEATURES = [
  {
    accent: Colors.accent,
    icon: ScanFace,
    implemented: true,
    route: '/ai-analysis',
    subtitle: '체형 타입 분석 및 체형 변화 예측',
    title: 'AI 체형 분석',
  },
  {
    accent: Colors.info,
    icon: History,
    implemented: true,
    route: '/analysis-history',
    subtitle: '저장된 분석 기록 조회 및 체형 변화 비교',
    title: 'AI 분석 기록',
  },
  {
    accent: '#007AFF',
    icon: Brain,
    implemented: false,
    subtitle: '운동 자세 교정 및 피드백',
    title: 'AI 자세 분석',
  },
  {
    accent: '#FF9500',
    icon: Footprints,
    implemented: false,
    subtitle: '보행 분석 기반 맞춤 신발 추천',
    title: 'AI 신발 추천',
  },
  {
    accent: '#8B5CF6',
    icon: Shirt,
    implemented: false,
    subtitle: '몸매 예측 및 스타일 추천',
    title: '나의 몸매 & 스타일',
  },
] as const;

export function AiHubScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          gap: 12,
          paddingBottom: 110 + insets.bottom,
          paddingHorizontal: 16,
          paddingTop: 16 + insets.top,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>AI Hub</Text>
          <Text style={styles.headerSubtitle}>
            원본 앱처럼 AI 기능 카드를 한곳에 모아두고, 구현된 기능은 바로
            진입하고 나머지는 미구현 배지로 남겨둬요.
          </Text>
        </View>

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
            style={[styles.featureCard, iosShadow]}
          >
            <View
              style={[
                styles.featureCircle,
                { backgroundColor: `${feature.accent}18` },
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
    borderRadius: 16,
    flexDirection: 'row',
    gap: 14,
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  featureCircle: {
    alignItems: 'center',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  featureSubtitle: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  featureTextWrap: {
    flex: 1,
    gap: 4,
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
  headerCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    gap: 8,
    padding: 16,
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
  },
});
