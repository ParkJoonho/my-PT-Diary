import { createRoute } from '@granite-js/react-native';
import { HomeScreen } from 'features/home/components/home-screen';

export const Route = createRoute('/', {
  component: HomeScreen,
});
