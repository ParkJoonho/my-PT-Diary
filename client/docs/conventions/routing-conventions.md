# 라우팅 컨벤션

이 앱은 Expo Router가 아니라 Granite 라우팅을 사용한다.

## 페이지 등록

실제 페이지 구현은 `src/pages` 아래에 둔다.

예시:

```ts
import { createRoute } from '@granite-js/react-native';

export const Route = createRoute('/', {
  component: HomePage,
});
```

루트의 `pages` 디렉터리는 `src/pages`의 라우트를 다시 export하는 역할만 한다.

예시:

```ts
export { Route } from 'pages/index';
```

## 라우트 이름

`my-PT-Diary 프로젝트`의 Expo 탭 그룹 경로는 Granite에서는 평평하게 펼친다.

사용할 경로:

```text
/              홈
/exercise      기록 탭
/pt-log        PT 탭
/ai-hub        AI 탭
/condition     내 정보 탭
```

아래 같은 Expo 라우트 그룹 이름은 사용하지 않는다.

```text
/(tabs)
/(trainer-tabs)
```

## 홈에서 이어질 예정 라우트

기능을 순차적으로 옮기면서 아래 라우트 이름을 사용한다.

```text
/active-workout
/outdoor-workout
/outdoor-workout-result
/exercise-guide
/exercise-video-viewer
/fitness-state
/exercise-list
/exercise-form
/condition-list
/condition-form
/pt-lesson-form
/ai-analysis
/meal-analysis
/posture-tracking
/athena
/ai-trainer-match
```

라우팅 테스트 때문에 꼭 필요한 경우가 아니라면 빈 대체 화면만 만들지 않는다. 원래 UI를 화면에 유지하고, 해당 컨트롤에 `미구현` 뱃지를 붙이는 방식을 우선한다.

## 스케폴딩 중 네비게이션

아직 구현하지 않은 컨트롤은 아래 기준을 따른다.

- 디자인상 눌리는 버튼/카드라면 pressable 상태는 유지한다.
- 대상 라우트가 준비되기 전까지 실제 이동은 연결하지 않는다.
- 컨트롤에 작은 `미구현` 뱃지를 붙인다.
- `onPress`는 빈 함수나 이후 연결을 위한 지역 handler로 둔다.
