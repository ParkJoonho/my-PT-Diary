import { createRoute } from '@granite-js/react-native';
import { BodyAnalysisScreen } from 'features/body-analysis/components/body-analysis-screen';

export const Route = createRoute('/ai-analysis', {
  component: BodyAnalysisScreen,
});
