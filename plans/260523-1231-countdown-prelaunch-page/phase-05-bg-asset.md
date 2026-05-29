# Phase 05 — Background Image Asset ✅ Done

## Overview

Track A coded `app/_components/prelaunch/*` to reference `public/prelaunch/bg-image.png` but couldn't download the file due to session permission restrictions.

## Actual Outcome

- Asset downloaded: `public/prelaunch/bg-image.png` (3.0 MB, valid PNG 1512×1077, 8-bit RGBA).
- Script: `scripts/download-prelaunch-assets.mjs` created with idempotent logic (download + save with retry).
- npm script: `"download-assets:prelaunch"` registered in `package.json`.
- URL handling: MoMorph-generated signed URL (originally in script) expired within 10 minutes. Replaced with sentinel `"REPLACE_WITH_FRESH_URL"` (M1 security fix, see reviewer report).
- Page rendering: `/prelaunch` loads background image correctly; CSS `background-image: url(/prelaunch/bg-image.png)` works.

## Acceptance

✅ File `public/prelaunch/bg-image.png` present and non-empty.
✅ Page renders with visible background image at `/prelaunch`.
✅ Script secured: live presigned URL replaced with sentinel; refresh procedure documented in comment.
