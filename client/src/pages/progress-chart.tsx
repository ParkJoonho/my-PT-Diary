import { createRoute } from '@granite-js/react-native';
import { WorkoutReportScreen } from 'features/workout-reports/components/workout-report-screen';
import { TabPageLayout } from 'shared/components/tab-page-layout';

export const Route = createRoute('/progress-chart', {
  component: WorkoutReportRoute,
});

function WorkoutReportRoute() {
  return (
    <TabPageLayout activeKey={null} contentBottomSpacing={20}>
      {({ contentBottomInset }) => (
        <WorkoutReportScreen contentBottomInset={contentBottomInset} />
      )}
    </TabPageLayout>
  );
}
