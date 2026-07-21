import { ScrollView, StyleSheet, View } from 'react-native';
import Colors from 'shared/constants/colors';
import { WEEKLY_DAYS } from '../data/mock-home-data';
import { HomeTabBar } from './home-tab-bar';
import { QuickActionCard } from './quick-action-card';
import { RoutineCard } from './routine-card';
import { WeeklyTrackerCard } from './weekly-tracker-card';

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <WeeklyTrackerCard days={WEEKLY_DAYS} streakCount={2} />
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
