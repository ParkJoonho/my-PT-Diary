import { Component, Suspense, type PropsWithChildren } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from 'shared/constants/colors';
import { useWeeklyTrackerSummary } from 'shared/api/weekly-tracker';
import { HomeTabBar } from './home-tab-bar';
import { QuickActionCard } from './quick-action-card';
import { RoutineCard } from './routine-card';
import { WeeklyTrackerCard } from './weekly-tracker-card';

function WeeklyTrackerLoading() {
  return (
    <View style={styles.loadingCard}>
      <ActivityIndicator color={Colors.accent} />
    </View>
  );
}

function WeeklyTrackerError() {
  return (
    <View style={styles.loadingCard}>
      <Text style={styles.errorText}>주간 데이터를 불러오지 못했어요.</Text>
    </View>
  );
}

class WeeklyTrackerErrorBoundary extends Component<
  PropsWithChildren,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? <WeeklyTrackerError /> : this.props.children;
  }
}

function WeeklyTrackerSection() {
  const { data } = useWeeklyTrackerSummary();

  return <WeeklyTrackerCard days={data.days} streakCount={data.streakCount} />;
}

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <WeeklyTrackerErrorBoundary>
          <Suspense fallback={<WeeklyTrackerLoading />}>
            <WeeklyTrackerSection />
          </Suspense>
        </WeeklyTrackerErrorBoundary>
        <RoutineCard />
        <QuickActionCard
          kind="outdoor"
          subtitle="러닝·등산 코스 추천"
          title="야외운동"
        />
        <QuickActionCard
          kind="guide"
          subtitle="부위별·기구별 운동 학습"
          title="운동배우기"
        />
      </ScrollView>
      <HomeTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  errorText: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 144,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 104,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
  },
});
