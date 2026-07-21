import { AppTabBar } from 'features/app-shell/components/app-tab-bar';
import { WEEKLY_DAYS } from 'features/workout-records/data/mock-weekly-workouts';
import { RoutineCard } from 'features/workout-routines/components/routine-card';
import { ScrollView, StyleSheet, View } from 'react-native';
import Colors from 'shared/constants/colors';
import { HOME_QUICK_ACTIONS } from '../data/quick-actions';
import { QuickActionCard } from './quick-action-card';
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
        {HOME_QUICK_ACTIONS.map((action) => (
          <QuickActionCard key={action.kind} {...action} />
        ))}
      </ScrollView>
      <AppTabBar />
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
