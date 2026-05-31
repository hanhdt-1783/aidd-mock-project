# Unit Testing Setup: Vitest Added as First Application Test Framework

**Date**: 2026-05-31  
**Severity**: Low  
**Component**: Testing Infrastructure  
**Status**: Resolved

## What Shipped

First unit test suite for application code. Previously only `.claude/hooks/` had tests. Added Vitest 4.1.7 with a `node` environment config (`vitest.config.ts`). 4 test files, 29 passing tests covering pure-logic modules: `lib/kudos/sanitize-tag`, `lib/i18n/dictionary`, `lib/i18n/get-lang`, and `app/_components/kudos/kudos-hero-badge`.

New scripts: `npm run test` (watch mode), `npm run test:run` (single-pass, CI-friendly).

## Scope Boundaries

Tests are intentionally limited to pure-logic functions — no component rendering (React Testing Library), no Supabase integration, no E2E. This keeps the suite fast and dependency-free.

## What Triggered This

The `sanitize-tag` divergence caught during the Viết Kudo review (see `2026-05-27-viet-kudo-modal.md`) — each layer applied slightly different hashtag rules. A unit test against the shared lib would have caught this before code review. The test suite closes that gap.

## Decisions Worth Remembering

- **Node env, not jsdom**: `vitest.config.ts` sets `environment: 'node'`. Pure-logic tests don't need a DOM. Switching to `jsdom` only when component rendering tests are added.
- **Scope is additive**: component/Supabase/E2E tests are deferred, not excluded. Add them when the surface area justifies the setup cost.
