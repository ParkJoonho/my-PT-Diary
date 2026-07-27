import { createRoute } from '@granite-js/react-native';
import { OutdoorWorkoutResultScreen } from 'features/outdoor-workout/components/outdoor-workout-result-screen';

export const Route = createRoute('/outdoor-workout-result', {
  component: OutdoorWorkoutResultScreen,
});
