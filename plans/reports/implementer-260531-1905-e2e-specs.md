# E2E Playwright Specs — Phase 03 + Phase 04 Implementation Report

## Task
Phase 03 (unauthenticated specs) and Phase 04 (authenticated specs) of the Playwright E2E plan.

---

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `e2e/unauth/protected-routes-redirect.spec.ts` | 14 | 5 protected routes → /login redirect |
| `e2e/unauth/login-page.spec.ts` | 14 | Google sign-in button visible |
| `e2e/unauth/prelaunch-page.spec.ts` | 14 | Prelaunch countdown page renders |
| `e2e/authed/kudos-board.spec.ts` | 25 | Board loads, spotlight heading, seeded kudo visible |
| `e2e/authed/give-kudos-modal.spec.ts` | 40 | FAB → Viết KUDOS → modal fields → ESC close |
| `e2e/authed/profile-secret-awards.spec.ts` | 37 | /profile, /secret-box, /awards authed pages render |

---

## Selectors Used

### Unauth specs
- `page.getByRole('button', { name: /google/i })` — login button. See deviation note below.
- `page.getByRole('heading', { level: 1 })` — prelaunch countdown h1.
- `expect(page).toHaveURL(/\/login/)` — redirect assertion for 5 protected routes.

### Authed specs
- `page.locator('#spotlight-board-heading')` — `<h2 id="spotlight-board-heading">` in `kudos-spotlight-board.tsx`.
- `page.getByText(/IDOL GIỚI TRẺ|NGƯỜI TRUYỀN CẢM HỨNG|NGƯỜI THẦY TẬN TÂM/).first()` — seeded kudo titles from `kudos.title` column. See deviation note below.
- `page.getByRole('button', { name: 'Viết Kudos' })` — closed FAB (`aria-label="Viết Kudos"`).
- `page.getByRole('button', { name: 'Viết KUDOS' })` — expanded panel write button (visible text).
- `page.getByRole('heading', { name: /Gửi lời cám ơn/ })` — modal form h2. See deviation note below.
- `page.getByRole('textbox', { name: 'Danh hiệu' })` — title input in create form.
- `page.getByRole('textbox', { name: 'Nội dung Kudo' })` — content textarea in create form.
- `page.getByRole('heading', { name: 'Profile' })` + `getByText('Sắp ra mắt')` — profile placeholder.
- `page.getByRole('heading', { name: 'Secret Box' })` — secret-box placeholder.
- `page.getByRole('heading', { level: 1 })` — awards page h1.

---

## Full Suite Result

```
Running 13 tests using 8 workers

  13 passed (9.9s)
```

Breakdown:
- **1** setup test (global.setup.ts — authenticate test user)
- **5** unauth tests (redirect ×5 routes, login button, prelaunch)
- **7** authed tests (kudos board, give-kudos modal, profile, secret-box, awards ×1 each)

`npx tsc --noEmit`: **passes clean (zero errors)**.

---

## Deviations from Plan

### 1. Login button selector changed (login-page.spec.ts)
**Plan said:** `aria-label="LOGIN With Google"` → `getByRole('button', { name: /login with google/i })`
**Reality:** `login-actions.tsx` passes `t(lang, 'login.button.google')` = "ĐĂNG NHẬP Bằng Google" (vi) as the `label` prop to `GoogleLoginButton`. The English default (`"LOGIN With Google"`) is never rendered in production — only when the component is used standalone without a `lang` prop.
**Fix:** `getByRole('button', { name: /google/i })` matches both locales and is stable.

### 2. Seeded kudo title assertion changed (kudos-board.spec.ts)
**Plan said:** "Legend Hero" / "Rising Hero" / "New Hero" visible in feed.
**Reality:** Those strings are `profiles.title` (badge rank), rendered only as `<Image alt="Legend Hero">` in `kudos-hero-tag.tsx` — NOT as visible text findable by `getByText`. The actual kudo titles stored in `public.kudos.title` are Vietnamese ("IDOL GIỚI TRẺ", etc.).
**Fix:** Assert on seeded kudo titles from `kudos.title` column (first 3 entries in `seed.sql`).

### 3. Dialog visibility assertion changed (give-kudos-modal.spec.ts)
**Plan said:** `getByRole('dialog', { name: 'Viết Kudo' })` → `toBeVisible()`.
**Reality:** `kudos-create-modal.tsx` renders the `<dialog>` with `background: transparent`, `padding: 0`, `overflow: visible` — a CSS workaround for the scrollable-card layout. Playwright resolved the locator correctly (`<dialog open aria-modal="true" aria-label="Viết Kudo">`) but reported `hidden` because the element has no painted pixels at dialog-level. The visible content is inside the card div.
**Fix:** Assert on the form heading `<h2>` inside the modal: `getByRole('heading', { name: /Gửi lời cám ơn/ })`. This is a meaningful assertion (proves the form rendered) and survives the CSS layout workaround. ESC close is confirmed by asserting the heading is no longer visible.

---

**Status:** DONE
**Summary:** All 6 spec files created (3 unauth + 3 authed), 13/13 tests pass on first full run after fixing 3 selector mismatches found during initial execution. `npx tsc --noEmit` passes clean.
**Concerns/Blockers:** None. All deviations documented above — they represent corrections to plan assumptions, not weakened assertions.
