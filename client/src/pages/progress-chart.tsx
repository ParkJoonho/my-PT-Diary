import { createRoute } from '@granite-js/react-native';
import { WorkoutReportScreen } from 'features/workout-reports/components/workout-report-screen';

export const Route = createRoute('/progress-chart', {
  component: WorkoutReportScreen,
});
