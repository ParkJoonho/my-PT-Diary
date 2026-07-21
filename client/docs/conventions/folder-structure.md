# 폴더 구조 컨벤션

## 목표 구조

`어디가기 프로젝트`의 기능 단위 구조를 참고하되, Granite 앱에 맞게 조정한다.

```text
src
├── pages
├── features
│   └── home
│       ├── components
│       ├── data
│       ├── lib
│       └── types
├── shared
│   ├── components
│   ├── constants
│   ├── lib
│   ├── styles
│   └── types
└── assets
    ├── fonts
    ├── icons
    ├── images
    └── muscles
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

홈 화면은 아래 구조를 기준으로 한다.

```text
src/features/home
├── components
│   ├── weekly-tracker-card.tsx
│   ├── routine-card.tsx
│   ├── routine-accordion.tsx
│   ├── quick-action-card.tsx
│   └── home-tab-bar.tsx
├── data
│   └── routines.ts
├── lib
│   └── resolve-step-tag.ts
└── types
    └── routine.ts
```

기능 모듈은 `src/shared`를 가져올 수 있다. 반대로 `src/shared`가 기능 모듈을 가져오면 안 된다.

## 공용 영역

재사용 가능한 코드는 `src/shared` 아래에 둔다.

- `components`: `UnimplementedBadge` 같은 공용 UI
- `constants`: 색상 같은 디자인 토큰
- `styles`: 그림자, 간격 도우미 등 작은 스타일 헬퍼
- `lib`: 공용 유틸리티
- `types`: 여러 기능에서 공유하는 타입

## 에셋 영역

마이그레이션한 에셋은 `src/assets` 아래에 둔다.

스케폴딩 단계의 PNG 에셋은 React Native 기본 `Image`로 사용한다. `expo-image`는 사용하지 않는다.

폰트는 `src/assets/fonts`에 두고 `react-native.config.js`를 통해 등록한다.
