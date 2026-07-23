import { createRoute } from '@granite-js/react-native';
import { ActiveWorkoutScreen } from 'features/active-workout/components/active-workout-screen';
import { findRoutineById } from 'features/workout-routines/lib/find-routine';
import { StyleSheet, Text, View } from 'react-native';
import Colors from 'shared/constants/colors';

type ActiveWorkoutRouteParams = {
  routineId: string;
};

export const Route = createRoute('/active-workout', {
  component: ActiveWorkoutRoute,
  validateParams: (params): ActiveWorkoutRouteParams => {
    const routeParams = params as Partial<ActiveWorkoutRouteParams> | undefined;

    return {
      routineId:
        typeof routeParams?.routineId === 'string' ? routeParams.routineId : '',
    };
  },
});

function ActiveWorkoutRoute() {
  const navigation = Route.useNavigation();
  const { routineId } = Route.useParams();
  const routine = findRoutineById(routineId);

  if (!routine) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>루틴을 찾지 못했어요.</Text>
        <Text style={styles.emptyAction} onPress={() => navigation.goBack()}>
          돌아가기
        </Text>
      </View>
    );
  }

  return (
    <ActiveWorkoutScreen
      onCancel={() => navigation.goBack()}
      onCompleted={() => navigation.navigate('/')}
      routine={routine}
    />
  );
}

const styles = StyleSheet.create({
  emptyAction: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
});
