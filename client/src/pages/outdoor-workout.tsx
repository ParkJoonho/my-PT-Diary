import { createRoute } from '@granite-js/react-native';
import { OutdoorWorkoutScreen } from 'features/outdoor-workout/components/outdoor-workout-screen';
import { Platform } from 'react-native';
import { TabPageLayout } from 'shared/components/tab-page-layout';

export const Route = createRoute('/outdoor-workout', {
  component: OutdoorWorkoutRoute,
});

function OutdoorWorkoutRoute() {
  return (
    <TabPageLayout
      activeKey={null}
      contentBottomSpacing={Platform.OS === 'web' ? 60 : 40}
    >
      {({ contentBottomInset }) => (
        <OutdoorWorkoutScreen contentBottomInset={contentBottomInset} />
      )}
    </TabPageLayout>
  );
}
