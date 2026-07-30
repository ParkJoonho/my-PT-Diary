import { createRoute } from '@granite-js/react-native';
import { ManualWorkoutFormScreen } from 'features/workout-records/components/manual-workout-form-screen';
import { TabPageLayout } from 'shared/components/tab-page-layout';

type ExerciseFormRouteParams = {
  recordId?: string;
};

export const Route = createRoute('/exercise-form', {
  component: ExerciseFormRoute,
  validateParams: (params): ExerciseFormRouteParams => {
    const routeParams = params as Partial<ExerciseFormRouteParams> | undefined;

    return {
      recordId:
        typeof routeParams?.recordId === 'string'
          ? routeParams.recordId
          : undefined,
    };
  },
});

function ExerciseFormRoute() {
  const { recordId } = Route.useParams();

  return (
    <TabPageLayout activeKey={null} contentBottomSpacing={20}>
      {({ contentBottomInset }) => (
        <ManualWorkoutFormScreen
          contentBottomInset={contentBottomInset}
          recordId={recordId}
        />
      )}
    </TabPageLayout>
  );
}
