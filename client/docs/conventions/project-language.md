# 프로젝트 지칭 규칙

마이그레이션 문서, 코드 주석, 할 일 메모에는 로컬 절대경로를 쓰지 않는다.

대신 아래 이름만 사용한다.

- `어디가기 프로젝트`: 기능 단위 구조를 참고한 프로젝트
- `my-PT-Diary 프로젝트`: 디자인과 React Native 화면을 옮겨오는 원본 PT Diary 앱
- `Apps in Toss Granite 앱`: 현재 마이그레이션 대상 앱

좋은 예:

- `my-PT-Diary 프로젝트의 홈 디자인을 기준으로 작업한다.`
- `어디가기 프로젝트의 기능 단위 구조를 참고한다.`

피해야 할 예:

- 로컬 절대경로를 붙여넣지 않는다.
- 복사한 원본 파일을 원래 로컬 위치로 지칭하지 않는다.

이 저장소 안의 파일을 언급해야 할 때는 저장소 기준 상대경로를 사용한다.

- `src/features/workout-routines/components/routine-card.tsx`
- `docs/migration/home-design-spec.md`
