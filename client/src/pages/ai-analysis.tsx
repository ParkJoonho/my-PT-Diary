import { createRoute } from '@granite-js/react-native';
import { BodyAnalysisScreen } from 'features/body-analysis/components/body-analysis-screen';
import { TabPageLayout } from 'shared/components/tab-page-layout';

export const Route = createRoute('/ai-analysis', {
  component: BodyAnalysisRoute,
});

function BodyAnalysisRoute() {
  return (
    <TabPageLayout activeKey={null} contentBottomSpacing={20}>
      {({ contentBottomInset }) => (
        <BodyAnalysisScreen contentBottomInset={contentBottomInset} />
      )}
    </TabPageLayout>
  );
}
