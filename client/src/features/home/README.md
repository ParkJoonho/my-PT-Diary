# Home Feature

This feature is reserved for the PT Diary home migration.

The first pass should preserve the source home design while avoiding backend/API work. Unwired controls should remain visually present with a small `미구현` badge.

Suggested component split:

- `weekly-tracker-card.tsx`
- `routine-card.tsx`
- `routine-accordion.tsx`
- `quick-action-card.tsx`

공통 탭 shell은 [`../../shared/components/tab-page-layout.tsx`](../../shared/components/tab-page-layout.tsx)와
[`../../shared/components/member-tab-bar.tsx`](../../shared/components/member-tab-bar.tsx)에서
관리한다.

Suggested supporting files:

- `data/routines.ts`
- `lib/resolve-step-tag.ts`
- `types/routine.ts`
