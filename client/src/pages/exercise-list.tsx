import { createRoute } from '@granite-js/react-native';
import { WorkoutRecordListScreen } from 'features/workout-records/components/workout-record-list-screen';

export const Route = createRoute('/exercise-list', {
  component: WorkoutRecordListScreen,
});
