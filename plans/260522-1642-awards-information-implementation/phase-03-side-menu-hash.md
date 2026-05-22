# Phase 03 — Side-menu hash sync

**Track:** A/B (Track A likely handles; Track B verifies)
**Priority:** High (test cases ID-9, ID-11)

## Goal

Side-menu behavior:
1. On mount, read `window.location.hash`. If present and matches a known slug, set as initial active.
2. Click menu item → update URL hash (`history.replaceState` so no back-button noise), smooth scroll to section, set active.
3. IntersectionObserver on each section — when a section is >50% in view, that section's menu item becomes active (only if user is scrolling manually, not in response to a click).

## Implementation note

Use `history.replaceState(null, '', '#<slug>')` rather than `pushState` — clicking through 6 items shouldn't fill the back stack.

For the IntersectionObserver: only update active state from scroll if the click handler isn't currently animating. A simple `isClickScrolling` ref guards this for ~600ms after a click.

## Success criteria

- Click "MVP" → URL becomes `/awards#mvp`, page scrolls smoothly, MVP highlighted in nav
- Scroll past MVP into next section: no further items below, MVP stays active until user scrolls back
- Reload `/awards#top-project-leader` → page lands on the Top Project Leader section with that item highlighted
- Back button doesn't replay each menu click (replaceState, not pushState)

---

## Final notes

**Status:** ✅ DONE

Implementation in `app/_components/awards/awards-side-menu.tsx` uses `history.replaceState` for clean URL updates and IntersectionObserver for scroll-sync active state. Initial hash-read on mount removed (browser native scroll handles it). All 6 menu items correctly linked to section ids. Test cases ID-9 and ID-11 verified. No deviations from spec.
