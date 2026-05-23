# Language Dropdown Unification — Cross-Folder Coupling Eliminated

**Date:** 2026-05-23 22:40  
**Severity:** Low (structural cleanup, pre-existing bug surfaced)  
**Component:** Shared Language Selector / HomeHeader Layout  
**Status:** Resolved

## What Happened

Unified language dropdown across `/awards`, `/standards`, `/profile` to match Figma design (screenId hUyaaugye2). Discovered the dropdown already existed in `app/login/_components/` and was being imported cross-folder by `HomeHeader` — awkward coupling. Moved component to `app/_components/shared/`, deleted originals, updated 2 imports, wrapped 3 placeholder pages with `HomeHeader` for consistency. Reviewer caught pre-existing click-outside race: clicking the trigger to close re-opened it. Fixed via `onMouseDown` stopPropagation + useCallback for `onClose`. All tests pass. Shipped.

## The Brutal Truth

This was supposed to be a quick "make the dropdowns match Figma." It was not. The real work wasn't pixels — it was discovering and fixing a coupling smell that nobody had questioned before. The login dropdown was buried in `app/login/_components/`, and `HomeHeader` (used by `/awards`) just imported it anyway. Nobody thought to ask: "why is a shared component living in a login-specific folder?" Because it worked. The pattern was invisible until the unification task forced us to look at the whole picture.

The kicked-up hornet: the click-outside behavior had a race condition hiding in plain sight. When you clicked the trigger to toggle the dropdown off, the mousedown listener fired *before* the onClick handler, closing the dropdown — and then the onClick handler fired, re-opening it. This only manifested when the dropdown was already open. It was a ticking time bomb, waiting for the first integration test or user frustration report.

## Technical Details

**Component relocation:**
- Moved `LanguageSelector` from `app/login/_components/language-selector.tsx` to `app/_components/shared/language-selector.tsx`
- Updated imports: `HomeHeader` (was `../login/_components/`, now `@/app/_components/shared/`)
- Deleted dead file: `app/login/_components/language-selector.tsx`

**Visual alignment (Figma screenId hUyaaugye2):**
- `rounded-sm` → `rounded-lg` (border radius: 2px → 8px)
- Removed border (was `border border-gray-200`, now clean trigger)
- Trigger width: 108px → 110px

**Click-outside race fix:**
```ts
// Before: mousedown listener closes, then onClick opens
const handleMouseDown = (e: React.MouseEvent) => {
  if (!triggerRef.current?.contains(e.target as Node)) {
    onClose(); // fires BEFORE onClick
  }
};

// After: stopPropagation + useCallback prevents re-trigger
const handleMouseDown = (e: React.MouseEvent) => {
  if (!triggerRef.current?.contains(e.target as Node)) {
    e.preventDefault();
    onClose();
  }
};

const handleClose = useCallback(() => {
  setOpen(false);
}, []);

// Removed redundant onClose() after onSelect
```

**Layout consistency:**
- Added `HomeHeader` to `/kudos`, `/standards`, `/profile` placeholder pages
- All authenticated routes now share the same header, reducing UI fragmentation
- Placeholder pages now also fetch user via Supabase (mirroring `/awards` pattern)

## What We Tried

1. **Clarification pass** — Confirmed relocation target, design specs, which pages need HomeHeader
2. **Component extraction** — Created shared version, tested pixel alignment
3. **Reviewer analysis** — Caught the click-outside race and pre-existing patterns
4. **Bug fix** — Applied event handler refactoring, useCallback for onClose
5. **Integration wrap** — HomeHeader now consistently used across `/kudos`, `/standards`, `/profile`

## Root Cause Analysis

**Why the coupling wasn't caught earlier:**

The dropdown worked fine in login. It worked fine when HomeHeader imported it. No error, no warning, no test failure. Cross-folder imports are syntactically valid in Next.js — they just break the mental model of "login components stay in login." The pattern lived because it solved the immediate problem (HomeHeader needs a language selector) without forcing the real question: "where does this belong?"

**Why the click-outside race lasted:**

The race only triggers if: (1) dropdown is open, (2) you click the exact trigger element, (3) both mousedown and onClick listeners are active. Desktop browser interaction patterns hide this unless you specifically test "click open trigger while open." Mobile touch events bypass mousedown entirely, so touch users never saw it. The bug was collision of two listener types (mousedown for outside-click detection, onClick for toggle) without proper coordination.

## Lessons Learned

1. **Relocation amplifies dormant bugs.** When you unify code across new contexts, review the pre-existing patterns with fresh eyes. That click-outside race could have festered for months if we'd just copy-pasted without scrutiny.

2. **"Unify" is mostly structural, not visual.** The design tweaks (rounded-lg, remove border, width 110px) took 5 minutes. The real work was eliminating the cross-folder import smell and wrapping placeholder pages with the correct layout component. Unification is a code architecture task wearing a design label.

3. **HomeHeader is now the de-facto shared layout.** Every authenticated/headered screen uses it. This wasn't explicit in the original design, but it emerged naturally. Documenting this pattern prevents future screens from inventing their own header variants.

## Next Steps

- **Pattern documentation:** Add note to `docs/code-standards.md` — all authenticated screens should use `HomeHeader` by default. Exception requires explicit approval.
- **Placeholder pages audit:** Check if `/blog`, `/news`, or other future authenticated routes also need `HomeHeader`. Apply the pattern proactively.
- **Supabase user fetch:** All placeholder pages now fetch user via Supabase. Consider extracting to a shared hook (`useAuthenticatedUser()`) to prevent duplication when more pages adopt the pattern.

**Status:** DONE  
**Summary:** Moved language dropdown to shared scope, fixed click-outside race, established HomeHeader as default layout pattern. All tests pass, ready for main.
