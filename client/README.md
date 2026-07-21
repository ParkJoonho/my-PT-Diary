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

## 명령어

```bash
npm run dev
npm run lint
npm run typecheck
npm test -- --runInBand
```
