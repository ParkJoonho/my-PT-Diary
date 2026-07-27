import { createRoute } from '@granite-js/react-native';
import { OutdoorWorkoutScreen } from 'features/outdoor-workout/components/outdoor-workout-screen';

export const Route = createRoute('/outdoor-workout', {
  component: OutdoorWorkoutScreen,
});
