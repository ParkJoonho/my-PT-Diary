import { createRoute } from '@granite-js/react-native';
import { MealAnalysisScreen } from 'features/meal-analysis/components/meal-analysis-screen';
import { TabPageLayout } from 'shared/components/tab-page-layout';

export const Route = createRoute('/meal-analysis', {
  component: MealAnalysisRoute,
});

function MealAnalysisRoute() {
  return (
    <TabPageLayout activeKey={null} contentBottomSpacing={20}>
      {({ contentBottomInset }) => (
        <MealAnalysisScreen contentBottomInset={contentBottomInset} />
      )}
    </TabPageLayout>
  );
}
