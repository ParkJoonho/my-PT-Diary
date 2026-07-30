import { createRoute } from '@granite-js/react-native';
import { WorkoutRecordListScreen } from 'features/workout-records/components/workout-record-list-screen';
import { Platform } from 'react-native';
import { TabPageLayout } from 'shared/components/tab-page-layout';

export const Route = createRoute('/exercise-list', {
  component: ExerciseListRoute,
});

function ExerciseListRoute() {
  return (
    <TabPageLayout
      activeKey={null}
      contentBottomSpacing={Platform.OS === 'web' ? 16 : 40}
    >
      {({ contentBottomInset, tabBarHeight }) => (
        <WorkoutRecordListScreen
          contentBottomInset={contentBottomInset}
          floatingActionBottomInset={tabBarHeight + 16}
        />
      )}
    </TabPageLayout>
  );
}
