import { createRoute } from '@granite-js/react-native';
import { AccountScreen } from 'features/account/components/account-screen';

export const Route = createRoute('/condition', {
  component: AccountScreen,
});
