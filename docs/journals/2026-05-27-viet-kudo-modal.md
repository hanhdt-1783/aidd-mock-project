# Viết Kudo Modal: Two-Track Implementation & Clarification Discipline

**Date**: 2026-05-27 03:30  
**Severity**: Medium  
**Component**: Kudos/Create  
**Status**: Resolved

## What Shipped

Viết Kudo form implementation complete: 7 React components (7 files, ~1155 LOC) with full backend integration. New DB migration adds `title`, `is_anonymous`, `anonymous_alias` columns + INSERT RLS + Storage bucket + atomic `create_kudo()` RPC. Commit: `08810e3` (28 files).

## Decisions Worth Remembering

- **Clarification Protocol First**: Spent 15 min asking 8 questions (4 initial + 4 follow-ups) before any code. Gaps: Danh hiệu field missing from spec but in design → added as column; anonymous data model; image upload bucket location; hashtag source. User answered all. Wrote decisions to `clarifications.md`. This prevented rework.
- **Two-Track Parallelism Works**: UI subagent built components with mock data while backend was wired. No blocking handoff. Both tracks shipped simultaneously.
- **Sanitization as Single Source of Truth**: Reviewer caught that hashtag rules diverged across UI validation → server action → RPC. Extracted `lib/kudos/sanitize-tag.ts` and aligned all layers. Verified with dirty input against DB output.
- **Anonymous Columns Upstream**: Added `is_anonymous` + `anonymous_alias` to schema instead of application-level indirection. Cleaner audit trail.

## What Surprised

- **Design ≠ Spec**: Danh hiệu field present in Figma but not in requirements CSV. Spec rot caught at clarification gate, not in code review.
- **Sanitization Drift**: Each layer (UI regex, server action trim, RPC `regexp_replace`) applied different rules. Discovered only during reviewer audit. No unit test had caught the mismatch.

## What I'd Do Differently

- **Dev Auth Bypass for Local E2E**: OAuth-only login blocked browser testing. Implemented RPC verification with HS256 JWT instead, but a dev auth middleware (e.g., `?__dev_token=...`) would have enabled full stack visual validation locally without mocking.
- **Test Sanitization Earlier**: Write property-based tests for `sanitize-tag` before code — fuzz it against real hashtag inputs and verify DB output matches lib output. Catches divergence before reviewer.

---

*Key lesson: Clarification first, then parallelize. Single sources of truth (sanitize-tag, RPC as schema owner) prevent late-stage corrections.*
