import { createRoute } from '@granite-js/react-native';
import { MealAnalysisScreen } from 'features/meal-analysis/components/meal-analysis-screen';

export const Route = createRoute('/meal-analysis', {
  component: MealAnalysisScreen,
});
