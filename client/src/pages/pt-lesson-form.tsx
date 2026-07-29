import { createRoute } from '@granite-js/react-native';
import { PtLessonFormScreen } from 'features/pt-logs/components/pt-lesson-form-screen';

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

  return <PtLessonFormScreen lessonId={lessonId} />;
}
