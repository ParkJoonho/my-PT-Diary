import { createRoute } from '@granite-js/react-native';
import { ExerciseVideoViewerScreen } from 'features/exercise-guide/components/exercise-video-viewer-screen';
import { StyleSheet, Text, View } from 'react-native';
import { TabPageLayout } from 'shared/components/tab-page-layout';
import Colors from 'shared/constants/colors';

type ExerciseVideoViewerRouteParams = {
  guideId: string;
};

export const Route = createRoute('/exercise-video-viewer', {
  component: ExerciseVideoViewerRoute,
  validateParams: (params: unknown): ExerciseVideoViewerRouteParams => {
    const routeParams = params as
      | Partial<ExerciseVideoViewerRouteParams>
      | undefined;

    return {
      guideId:
        typeof routeParams?.guideId === 'string' ? routeParams.guideId : '',
    };
  },
});

function ExerciseVideoViewerRoute() {
  const navigation = Route.useNavigation();
  const { guideId } = Route.useParams();

  return (
    <TabPageLayout activeKey={null} contentBottomSpacing={20}>
      {({ contentBottomInset }) =>
        guideId ? (
          <ExerciseVideoViewerScreen
            contentBottomInset={contentBottomInset}
            guideId={guideId}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>운동 가이드를 찾지 못했어요.</Text>
            <Text
              style={styles.emptyAction}
              onPress={() => navigation.goBack()}
            >
              돌아가기
            </Text>
          </View>
        )
      }
    </TabPageLayout>
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
