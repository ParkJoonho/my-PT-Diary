# Home Feature

홈은 첫 화면 대시보드와 빠른 진입 카드만 소유한다.

홈에서 보이는 기능이라도 독립 화면이나 도메인으로 커지는 것은 별도 feature에 둔다.

- 루틴 선택: `features/workout-routines`
- 주간 운동 기록 데이터와 계산: `features/workout-records`
- 하단 탭바: `features/app-shell`
- 야외운동: `features/outdoor-workout`
- 운동 배우기: `features/exercise-guide`
- 사진으로 기구 찾기: `features/equipment-recognition`

현재 홈 feature의 책임은 아래 정도로 제한한다.

- `components/home-screen.tsx`: 홈 화면 조립
- `components/weekly-tracker-card.tsx`: 홈 카드 UI
- `components/quick-action-card.tsx`: 홈 빠른 진입 카드 UI
- `data/quick-actions.ts`: 홈 빠른 진입 카드 목록
- `types/home.ts`: 홈 화면 전용 타입
