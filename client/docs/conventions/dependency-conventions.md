# 의존성 컨벤션

## 현재 런타임

이 앱은 Apps in Toss Granite React Native 앱이다.

현재 Granite와 Apps in Toss 패키지 구성을 기준으로 유지한다. 명시적인 작업 지시가 없다면 프레임워크 버전을 바꾸지 않는다.

## 스케폴딩 단계에서 허용된 의존성

`react-native-svg`는 Granite가 사용하는 버전과 동일한 버전 한 벌만 사용한다. PT Diary에서 옮겨온 아이콘 컴포넌트가 SVG 기반이기 때문이다.

기존 아이콘의 시각 디자인을 유지할 때 이 패키지를 사용하되, 중복 설치가 생기지 않게 `npm ls react-native-svg --all`로 확인한다.

## 홈 스케폴딩 단계에서 피할 의존성

홈 스케폴딩을 위해 Expo 패키지를 추가하지 않는다.

- `expo-router`
- `expo-image`
- `expo-font`
- `expo-haptics`
- `expo-location`
- `expo-camera`
- `expo-image-picker`
- `@expo/vector-icons`

백엔드 계약이 준비되기 전에는 데이터/백엔드 관련 라이브러리도 추가하지 않는다.

- 쿼리 클라이언트
- API 생성기
- 인증 클라이언트
- 영구 저장 계층

## 저장소

AsyncStorage를 직접 사용하지 않는다.

영구 저장이 필요해지면 Apps in Toss 런타임에서 지원하는 저장소 방식을 사용한다.

## 세이프 에어리어

세이프 에어리어 처리가 필요하면 Granite/Apps in Toss와 호환되는 세이프 에어리어 API를 사용한다. 원본 Expo 앱의 import 구문을 그대로 가져오지 않는다.

## 설치 기준

패키지를 설치하기 전에 아래를 확인한다.

1. 현재 마이그레이션 단계에 정말 필요한가?
2. Expo 런타임 전제를 끌고 오지 않는가?
3. 새 의존성을 추가하기 전에 기존 React Native 코드 조정으로 해결할 수 없는가?
4. 설치 후 `npm run typecheck`를 통과하는가?

설치 중 Apps in Toss 내부 의존성의 peer 경고가 나올 수 있다. 명시적인 작업이 아니라면 이를 해결하려고 핵심 프레임워크 패키지를 임의로 업그레이드하지 않는다.
