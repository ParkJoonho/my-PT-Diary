import { createRoute } from '@granite-js/react-native';
import { OutdoorWorkoutResultScreen } from 'features/outdoor-workout/components/outdoor-workout-result-screen';
import { TabPageLayout } from 'shared/components/tab-page-layout';

export const Route = createRoute('/outdoor-workout-result', {
  component: OutdoorWorkoutResultRoute,
});

function OutdoorWorkoutResultRoute() {
  return (
    <TabPageLayout activeKey={null} contentBottomSpacing={100}>
      {({ contentBottomInset, tabBarHeight }) => (
        <OutdoorWorkoutResultScreen
          contentBottomInset={contentBottomInset}
          tabBarHeight={tabBarHeight}
        />
      )}
    </TabPageLayout>
  );
}
