import { createRoute } from '@granite-js/react-native';
import { PtLogScreen } from 'features/pt-logs/components/pt-log-screen';

export const Route = createRoute('/pt-log', {
  component: PtLogScreen,
});
