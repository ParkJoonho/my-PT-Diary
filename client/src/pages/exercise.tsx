import { createRoute } from '@granite-js/react-native';
import { ExerciseScreen } from 'features/exercise-dashboard/components/exercise-screen';

export const Route = createRoute('/exercise', {
  component: ExerciseScreen,
});
