# 컨벤션

이 폴더는 PT Diary 마이그레이션을 이어서 작업할 때 지켜야 할 규칙을 정리한 곳이다.

마이그레이션 코드를 수정하기 전에 아래 문서를 먼저 확인한다.

- `project-language.md`: 참조 프로젝트를 부르는 방식
- `migration-conventions.md`: 마이그레이션 원칙과 아직 하지 않을 일
- `folder-structure.md`: 목표 폴더 구조와 책임 범위
- `routing-conventions.md`: Granite 라우트 이름과 페이지 프록시 규칙
- `ui-conventions.md`: UI, 디자인, `미구현` 뱃지 규칙
- `dependency-conventions.md`: 패키지 설치와 런타임 제약

현재 1차 목표는 홈 화면 디자인을 보존하면서 QA 기준으로 드러난 기능 단위 스캐폴딩을 잡는 것이다. 백엔드/API 연동은 백엔드 계약이 정해진 뒤 진행한다.
