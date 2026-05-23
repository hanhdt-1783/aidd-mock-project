# Code Review — Unify Language Dropdown
**Date:** 2026-05-23  
**Reviewer:** reviewer agent  
**Commit scope:** unstaged working-tree changes (language dropdown unification)

---

## Scope
- NEW: `app/_components/shared/language-switcher.tsx` + `language-dropdown.tsx`
- DELETED: `app/login/_components/language-switcher.tsx` + `language-dropdown.tsx`
- MODIFIED: `app/login/_components/login-header.tsx`, `app/_components/home/home-header.tsx` (import paths)
- MODIFIED: `app/kudos/page.tsx`, `app/standards/page.tsx`, `app/profile/page.tsx` (wrapped in HomeHeader)

---

## Overall Assessment

Clean extraction. Single source of truth achieved, no orphan refs, SSR boundary respected. Three issues worth fixing before merge: one medium (click-outside race — pre-existing but now in shared code), one minor (trigger button width 108 vs spec 110), one minor (onClose re-subscription churn). Everything else is correct.

---

## Critical Issues

None.

---

## High Priority

None.

---

## Medium Priority

### M1 — Click-outside handler re-opens dropdown when trigger is clicked to close

**File:** `app/_components/shared/language-dropdown.tsx:42-56` + `language-switcher.tsx:60`

**Root cause:** The `mousedown` listener on `document` fires before the button's `onClick`. When the dropdown is open and the user clicks the trigger button:
1. `mousedown` — `panelRef` does not contain the trigger → `onClose()` → `setIsOpen(false)`
2. `onClick` — `setIsOpen(prev => !prev)` — `prev` is now `false` → re-opens dropdown

The net result is the dropdown never closes when clicking the trigger a second time. This was present in the old `app/login/_components` files too (not a regression), but by moving to shared code it now affects every consumer.

**Fix:** Replace the toggle in the trigger with a guard that only opens, never toggles:
```tsx
// instead of:
onClick={() => setIsOpen((prev) => !prev)}
// use:
onMouseDown={(e) => { e.stopPropagation(); setIsOpen((prev) => !prev); }}
```
`stopPropagation()` on `mousedown` prevents the `document` listener from firing when the trigger is the target, so the subsequent click toggle works correctly. Alternatively, move the click-outside to a `mousedown` with `stopPropagation` on the panel wrapper in the parent.

---

## Minor

### m1 — Trigger button width 108px vs Figma/spec 110px

**File:** `language-switcher.tsx:66`

```tsx
style={{ width: 108, height: 56, padding: "16px" }}
```

Clarifications doc and dropdown panel both say 110px. The 2px discrepancy means the dropdown panel (110px) overflows the trigger by 1px on the left side. Visually negligible but inconsistent with the spec. Change `108` → `110`.

---

### m2 — `onClose` inline arrow re-subscribes `document` listener every render

**File:** `language-switcher.tsx:99`, `language-dropdown.tsx:56`

```tsx
onClose={() => setIsOpen(false)}  // new reference every render
```
`useEffect` in `LanguageDropdown` depends on `[onClose]`. Since a new arrow is created each render of `LanguageSwitcher`, the effect tears down and re-adds the `document.mousedown` listener on every render. Under rapid state changes (e.g. `isPending` transitions) this flickers the listener. Fix: wrap `onClose` in `useCallback` in `LanguageSwitcher`, or extract it as a stable `useRef`-based callback.

---

### m3 — `LanguageDropdown.handleSelect` calls `onClose()` redundantly

**File:** `language-dropdown.tsx:58-61`

```ts
function handleSelect(lang: Language) {
  onSelect(lang);  // parent's handleSelect already calls setIsOpen(false)
  onClose();       // redundant call
}
```

Not a bug (React batches the double `setState`), but it creates an implicit contract: callers must accept that `onClose` fires on every selection even when `onSelect` already handles close. Document this or remove `onClose()` from `handleSelect` and rely solely on `onSelect`'s side effect.

---

## Nits

### n1 — `role="option"` on `<button>` elements

**File:** `language-dropdown.tsx:75-79`

ARIA spec permits `role="option"` on any element but expects the interactive semantics to come from the `listbox` container, not the child. Screen readers will announce these as "option" but users pressing Enter/Space on focused options won't get the native button click without explicit `onKeyDown`. Not a regression (old code was identical), but worth noting since it's now in shared code that will be audited. Consider `role="menuitem"` + `role="menu"` pattern if keyboard nav is needed, or add `onKeyDown` handler.

### n2 — `language.vi.label` / `language.en.label` i18n keys unused

The dictionary (`lib/i18n/dictionary.ts:18-19, 151-152`) defines `language.vi.label: 'VN'` etc., but both components hardcode the labels as string constants (`LABEL = { vi: "VN", en: "EN" }`). Minor inconsistency — not a bug since content is identical.

---

## Focus-area Verdicts

| Area | Verdict |
|------|---------|
| Orphan refs to old paths | PASS — zero refs found to `app/login/_components/language-*` |
| Design conformity | PASS with nit — `rounded-lg` on panel correct; border dropped; trigger width 108 vs 110 (m1) |
| SSR safety | PASS — `LoginHeader` is a server component importing a `"use client"` component; valid boundary |
| SSR safety (kudos/standards) | PASS — pattern matches `awards/page.tsx` exactly; unauthenticated users see `isAuthenticated={false}` path of HomeHeader which renders Sign-In CTA |
| Accessibility | PASS with nit — `aria-expanded`, `aria-haspopup="listbox"`, `aria-label` on trigger; `role="listbox"` + `role="option"` on panel (n1) |
| Duplication | PASS — single source of truth, no duplicates |
| Side effects on /kudos /standards | PASS — consistent with awards pattern; unauthenticated renders gracefully (`!!user` → false) |
| paddingTop:80 on placeholder content | PASS — all three pages apply `paddingTop: 80`, matching 80px fixed header |
| N+1 queries | PASS — 2 sequential DB calls per page (getUser + profiles), consistent with awards/page.tsx, not looped |

---

## Recommended Actions

1. **Fix M1** (click-outside re-open bug) — add `stopPropagation` on trigger `mousedown` or restructure parent ref
2. **Fix m1** — change trigger width from `108` to `110`
3. **Fix m2** — `useCallback` on `onClose` in `LanguageSwitcher`
4. **Consider m3** — remove redundant `onClose()` from `LanguageDropdown.handleSelect`

---

## Unresolved Questions

- Is the `language.vi.label` / `language.en.label` i18n key intentionally unused (kept for future server-side rendering of label), or dead code?
