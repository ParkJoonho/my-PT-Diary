import { createRoute } from '@granite-js/react-native';
import { TrainerMatchScreen } from 'features/trainer-match/components/trainer-match-screen';

export const Route = createRoute('/ai-trainer-match', {
  component: TrainerMatchScreen,
});
