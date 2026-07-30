# 폴더 구조 컨벤션

## 목표 구조

`어디가기 프로젝트`의 기능 단위 구조를 참고하되, Granite 앱에 맞게 조정한다.

```text
src
├── pages
├── features
│   ├── app-shell
│   ├── auth
│   ├── home
│   ├── workout-routines
│   ├── active-workout
│   ├── outdoor-workout
│   ├── exercise-guide
│   ├── equipment-recognition
│   ├── workout-records
│   ├── condition-records
│   ├── pt-logs
│   ├── trainer-match
│   ├── ai-hub
│   ├── body-analysis
│   ├── food-analysis
│   ├── posture-analysis
│   ├── fitness-analysis
│   ├── athena-coach
│   └── shoe-recommendation
├── shared
│   ├── components
│   ├── constants
│   ├── lib
│   ├── styles
│   └── types
└── assets
    └── fonts
```

## 페이지

`src/pages`는 얇게 유지한다. 페이지 파일은 아래 역할만 맡는다.

- `createRoute`로 Granite 라우트를 등록한다.
- 기능 컴포넌트를 조립한다.
- 페이지 수준의 상태만 가진다.
- 큰 UI 섹션을 길게 인라인으로 넣지 않는다.

마이그레이션된 홈 전체를 거대한 `src/pages/index.tsx` 하나에 넣지 않는다.

## 기능 영역

도메인별 UI와 로직은 `src/features/[feature-name]` 아래에 둔다.

홈 화면은 대시보드 조립만 맡긴다.

```text
src/features/home
├── components
│   ├── weekly-tracker-card.tsx
│   ├── quick-action-card.tsx
│   └── home-screen.tsx
├── data
│   └── quick-actions.ts
└── types
    └── home.ts
```

홈에서 보이는 기능이라도 아래처럼 독립적으로 커지는 것은 별도 feature로 분리한다.

- `app-shell`: 하단 탭바, 앱 공통 네비게이션 껍데기
- `workout-routines`: AI추천·헬스장·크로스핏·홈트 루틴 선택
- `active-workout`: 카운트다운, 타이머, 운동 항목 체크, 운동 완료 저장
- `outdoor-workout`: 야외운동 코스 입력, 계획 결과, 야외운동 기록 저장
- `exercise-guide`: 운동 배우기, 부위별·기구별 가이드, 영상 뷰어
- `equipment-recognition`: 사진으로 기구 찾기
- `workout-records`: 개인 운동 기록, 주간 완료 계산, 기록 동기화
- `condition-records`: 컨디션 기록
- `pt-logs`: PT 수업일지
- `trainer-match`: AI 트레이너 추천과 매칭
- `ai-hub`: AI 기능 허브
- `body-analysis`, `food-analysis`, `posture-analysis`, `fitness-analysis`, `athena-coach`, `shoe-recommendation`: AI 세부 기능

기능 모듈끼리 필요한 참조는 허용한다. 단, `src/shared`는 기능 모듈을 가져오면 안 된다.

## 공용 영역

재사용 가능한 코드는 `src/shared` 아래에 둔다.

- `components`: `UnimplementedBadge` 같은 공용 UI
- `constants`: 색상 같은 디자인 토큰
- `styles`: 그림자, 간격 도우미 등 작은 스타일 헬퍼
- `lib`: 공용 유틸리티
- `types`: 여러 기능에서 공유하는 타입

## 에셋 영역

Apps in Toss 런타임에서 URI로 불러오는 공개 이미지·아이콘은 저장소 루트의
`infra/minio/seed/pt-diary-assets/v1` 아래에 둔다. 디렉터리는 MinIO object key와
동일한 `icons`, `images`, `muscles` 구조를 사용한다.

클라이언트는 `shared/lib/asset-url.ts`가 생성하는 원격 URI를 React Native 기본
`Image`에 전달한다. MinIO credential이나 내부 서비스 주소는 클라이언트에 넣지 않는다.

폰트는 번들 등록이 필요하므로 `src/assets/fonts`에 유지하고 `react-native.config.js`를
통해 등록한다.
