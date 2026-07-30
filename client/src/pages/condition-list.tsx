import { createRoute } from '@granite-js/react-native';
import { ConditionRecordListScreen } from 'features/condition-records/components/condition-record-list-screen';
import { Platform } from 'react-native';
import { TabPageLayout } from 'shared/components/tab-page-layout';

export const Route = createRoute('/condition-list', {
  component: ConditionListRoute,
});

function ConditionListRoute() {
  return (
    <TabPageLayout
      activeKey={null}
      contentBottomSpacing={Platform.OS === 'web' ? 16 : 40}
    >
      {({ contentBottomInset, tabBarHeight }) => (
        <ConditionRecordListScreen
          contentBottomInset={contentBottomInset}
          floatingActionBottomInset={tabBarHeight + 16}
        />
      )}
    </TabPageLayout>
  );
}
