import { createRoute } from '@granite-js/react-native';
import { AnalysisHistoryScreen } from 'features/body-analysis/components/analysis-history-screen';
import { TabPageLayout } from 'shared/components/tab-page-layout';

export const Route = createRoute('/analysis-history', {
  component: AnalysisHistoryRoute,
});

function AnalysisHistoryRoute() {
  return (
    <TabPageLayout activeKey={null} contentBottomSpacing={20}>
      {({ contentBottomInset }) => (
        <AnalysisHistoryScreen contentBottomInset={contentBottomInset} />
      )}
    </TabPageLayout>
  );
}
