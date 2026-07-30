import { createRoute } from '@granite-js/react-native';
import { PtLessonFormScreen } from 'features/pt-logs/components/pt-lesson-form-screen';
import { TabPageLayout } from 'shared/components/tab-page-layout';

type PtLessonFormRouteParams = {
  lessonId?: string;
};

export const Route = createRoute('/pt-lesson-form', {
  component: PtLessonFormRoute,
  validateParams: (params): PtLessonFormRouteParams => {
    const routeParams = params as Partial<PtLessonFormRouteParams> | undefined;

    return {
      lessonId:
        typeof routeParams?.lessonId === 'string'
          ? routeParams.lessonId
          : undefined,
    };
  },
});

function PtLessonFormRoute() {
  const { lessonId } = Route.useParams();

  return (
    <TabPageLayout activeKey={null} contentBottomSpacing={20}>
      {({ contentBottomInset }) => (
        <PtLessonFormScreen
          contentBottomInset={contentBottomInset}
          lessonId={lessonId}
        />
      )}
    </TabPageLayout>
  );
}
