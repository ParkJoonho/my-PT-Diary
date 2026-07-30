import { createRoute } from '@granite-js/react-native';
import { ExerciseGuideScreen } from 'features/exercise-guide/components/exercise-guide-screen';
import { Platform } from 'react-native';
import { TabPageLayout } from 'shared/components/tab-page-layout';

export const Route = createRoute('/exercise-guide', {
  component: ExerciseGuideRoute,
});

function ExerciseGuideRoute() {
  return (
    <TabPageLayout
      activeKey={null}
      contentBottomSpacing={Platform.OS === 'web' ? 0 : 24}
    >
      {({ contentBottomInset }) => (
        <ExerciseGuideScreen contentBottomInset={contentBottomInset} />
      )}
    </TabPageLayout>
  );
}
