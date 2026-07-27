import { createRoute } from "@granite-js/react-native";
import { ExerciseGuideScreen } from "features/exercise-guide/components/exercise-guide-screen";

export const Route = createRoute("/exercise-guide", {
  component: ExerciseGuideScreen,
});
