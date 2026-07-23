import { createRoute } from '@granite-js/react-native';
import { ConditionRecordListScreen } from 'features/condition-records/components/condition-record-list-screen';

export const Route = createRoute('/condition-list', {
  component: ConditionRecordListScreen,
});
