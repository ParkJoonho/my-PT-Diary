# Home Feature

This feature is reserved for the PT Diary home migration.

The first pass should preserve the source home design while avoiding backend/API work. Unwired controls should remain visually present with a small `미구현` badge.

Suggested component split:

- `weekly-tracker-card.tsx`
- `routine-card.tsx`
- `routine-accordion.tsx`
- `quick-action-card.tsx`
- `home-tab-bar.tsx`

Suggested supporting files:

- `data/routines.ts`
- `lib/resolve-step-tag.ts`
- `types/routine.ts`
