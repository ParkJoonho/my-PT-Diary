# PT Diary Home Migration Notes

This folder keeps source design references from `my-PT-Diary` so the Granite app can migrate the home screen without pulling in Expo app/runtime code.

## Source References

- `DESIGN.md`: original product-wide design notes.
- `home-design-spec.md`: focused home screen spec.
- `source-snapshots/home-screen.tsx`: original Expo home screen for visual/reference only.
- `source-snapshots/TabIcons.tsx`: original SVG icon components.
- `source-snapshots/colors.ts`: original color and shadow tokens.
- `source-snapshots/routines.ts`: original static routine data.

## Granite Migration Rules

- Keep the Apps in Toss native header. Do not migrate `AppHeader` or `GlobalHeader`.
- Keep the original home UI shape, but mark not-yet-wired controls with a small `미구현` badge.
- Do not migrate Expo Router. Granite pages should use `createRoute`.
- Do not add Expo dependencies for home scaffolding.
- Use mock/static data until the backend contract is ready.
- Prefer `src/features/home` for home-specific UI and `src/shared` for reusable design tokens/components.

## First-Pass Target

- Real route: `/`
- Real page file: `src/pages/index.tsx`
- Home-specific modules: `src/features/home`
- Shared design tokens/assets: `src/shared`, `src/assets`
