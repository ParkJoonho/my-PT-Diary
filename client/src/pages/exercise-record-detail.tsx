import { createRoute } from '@granite-js/react-native';
import { WorkoutRecordDetailScreen } from 'features/workout-records/components/workout-record-detail-screen';
import { StyleSheet, Text, View } from 'react-native';
import Colors from 'shared/constants/colors';

type WorkoutRecordDetailRouteParams = {
  recordId: string;
};

export const Route = createRoute('/exercise-record-detail', {
  component: WorkoutRecordDetailRoute,
  validateParams: (params): WorkoutRecordDetailRouteParams => {
    const routeParams = params as
      | Partial<WorkoutRecordDetailRouteParams>
      | undefined;

    return {
      recordId:
        typeof routeParams?.recordId === 'string' ? routeParams.recordId : '',
    };
  },
});

function WorkoutRecordDetailRoute() {
  const navigation = Route.useNavigation();
  const { recordId } = Route.useParams();

  if (!recordId) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>운동 기록을 찾지 못했어요.</Text>
        <Text style={styles.emptyAction} onPress={() => navigation.goBack()}>
          돌아가기
        </Text>
      </View>
    );
  }

  return <WorkoutRecordDetailScreen recordId={recordId} />;
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
