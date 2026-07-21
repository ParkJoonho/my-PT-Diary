# A2T PT Diary

Apps in Toss Granite 기반 PT Diary 마이그레이션 앱이다.

현재는 홈 화면 스케폴딩과 디자인 마이그레이션 1차 작업이 들어가 있다. 백엔드/API 연동은 아직 하지 않았고, 연결되지 않은 UI에는 작은 `미구현` 뱃지를 붙여둔다.

## 먼저 볼 문서

- `docs/conventions/README.md`: 이어서 작업할 때 지킬 컨벤션
- `docs/tasks/home-migration-scaffold.md`: 홈 마이그레이션 진행 내역
- `docs/migration/home-design-spec.md`: 홈 화면 디자인 기준
- `docs/migration/README.md`: 원본 참고 파일 설명

## 주요 구조

```text
src/pages                 Granite 라우트 진입점
src/features/home         홈 화면 컴포넌트, mock 데이터, 타입, 유틸
src/shared                공용 컴포넌트와 디자인 토큰
src/assets                마이그레이션한 폰트/이미지/아이콘
docs                      컨벤션, 작업 내역, 원본 디자인 참고 문서
```

## 작업 원칙

- Apps in Toss 기본 상단 헤더를 사용한다.
- Expo Router, Expo 패키지, 자체 로그인 화면은 옮기지 않는다.
- 백엔드 계약 전에는 mock/static 데이터로 디자인만 잡는다.
- 원본 UI를 숨기지 말고, 미연결 기능에는 `미구현` 뱃지를 붙인다.

## 실행법

이 프로젝트는 Apps in Toss Granite React Native 앱이다. 패키지 매니저는 `package-lock.json` 기준으로 `npm`을 사용한다.

### 1. 의존성 설치

```bash
cd pt-ait/client
npm install
```

### 2. Granite 개발 서버 실행

```bash
npm run dev
```

`npm run dev`는 `granite dev`를 실행해서 Metro 개발 서버를 띄운다. 서버가 켜진 터미널은 샌드박스 앱으로 확인하는 동안 계속 열어둔다.

현재 `granite.config.ts` 기준 앱 스킴은 아래와 같다.

```text
intoss://a2t-ptdiary
```

앱인토스 콘솔에 등록된 `appName`이 다르면 `granite.config.ts`의 `appName`을 콘솔 값과 맞춘 뒤 다시 실행한다.

### 3. 샌드박스 앱에서 열기

앱인토스 공식 문서 기준으로 로컬 테스트는 전용 샌드박스 앱에서 진행한다. 샌드박스 앱 설치 후 토스 비즈니스 계정으로 로그인하고, 워크스페이스의 테스트할 앱을 선택한 뒤 스킴 입력 화면에서 `intoss://a2t-ptdiary`를 연다.

- iOS 시뮬레이터: 샌드박스 앱 실행 후 스킴을 입력해 연다.
- iOS 실기기: Mac과 같은 Wi-Fi에 연결하고, 샌드박스 앱의 로컬 네트워크 권한을 허용한다. 서버 주소가 필요하면 `ipconfig getifaddr en0`로 Mac IP를 확인해서 입력한다.
- Android 실기기/에뮬레이터: USB 연결 후 아래 포트를 reverse로 열고 샌드박스 앱에서 스킴을 실행한다.

```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5173 tcp:5173
adb reverse --list
```

### 4. 빌드와 배포 테스트

```bash
npm run build
```

빌드가 성공하면 프로젝트 루트에 `.ait` 번들이 생성된다. 이 프로젝트에는 현재 `a2t-ptdiary.ait`가 있다. 콘솔에서 직접 업로드해 토스앱 QR 테스트를 하거나, API 키/토큰 설정 후 CLI 배포를 실행한다.

```bash
npm run deploy
```

### 5. 검증 명령어

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
```

`npm run lint`는 현재 `biome check --write`라서 포맷/린트 자동 수정이 같이 들어간다.

### 참고 문서

- Apps in Toss React Native 시작하기: https://developers-apps-in-toss.toss.im/tutorials/react-native.html
- Apps in Toss 테스트앱(샌드박스): https://developers-apps-in-toss.toss.im/development/test/sandbox.html
- Apps in Toss 토스앱 테스트하기: https://developers-apps-in-toss.toss.im/development/test/toss.html
