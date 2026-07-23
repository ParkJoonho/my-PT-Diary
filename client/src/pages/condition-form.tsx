import { createRoute } from '@granite-js/react-native';
import { ConditionFormScreen } from 'features/condition-records/components/condition-form-screen';

type ConditionFormRouteParams = {
  conditionId?: string;
};

export const Route = createRoute('/condition-form', {
  component: ConditionFormRoute,
  validateParams: (params): ConditionFormRouteParams => {
    const routeParams = params as Partial<ConditionFormRouteParams> | undefined;

    return {
      conditionId:
        typeof routeParams?.conditionId === 'string'
          ? routeParams.conditionId
          : undefined,
    };
  },
});

function ConditionFormRoute() {
  const { conditionId } = Route.useParams();

  return <ConditionFormScreen conditionId={conditionId} />;
}
