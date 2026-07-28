import { createRoute } from '@granite-js/react-native';
import { AiHubScreen } from 'features/ai-hub/components/ai-hub-screen';

export const Route = createRoute('/ai-hub', {
  component: AiHubScreen,
});
