import { createRoute } from '@granite-js/react-native';
import { AnalysisHistoryScreen } from 'features/body-analysis/components/analysis-history-screen';

export const Route = createRoute('/analysis-history', {
  component: AnalysisHistoryScreen,
});
