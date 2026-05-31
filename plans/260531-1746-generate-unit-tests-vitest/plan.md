# Plan: Generate Unit Tests (Vitest) — Pure Logic

**Created:** 2026-05-31 17:46 | **Branch:** master | **Discipline:** interactive

## Goal
Project hiện CHƯA có unit test cho code ứng dụng (chỉ có test cho `.claude/hooks`).
Setup Vitest + viết unit test cho các module pure-logic. Không ép ngưỡng coverage cứng.

## Decisions (confirmed by user)
- Framework: **Vitest** (+ minimal config, ESM/TS native)
- Scope: **Pure logic only**
- Depth: **Nền tảng vững** (happy-path + edge cases), không hard threshold

## Test Targets
| Module | Export | Test focus |
|--------|--------|------------|
| `lib/kudos/sanitize-tag.ts` | `sanitizeTag`, `MAX_TAG_LEN` | strip `#`, bỏ dấu tiếng Việt (đ/Đ + combining marks), xoá whitespace, cap 64 ký tự, empty/trim |
| `lib/i18n/dictionary.ts` | `t`, `dictionary`, `LANGUAGES` | tra cứu đúng vi/en, fallback default-lang, fallback key, parity key giữa vi & en |
| `app/_components/kudos/kudos-hero-badge.ts` | `HERO_BADGE` | mapping rank→ảnh đầy đủ & đúng path |
| `lib/i18n/get-lang.ts` | `getLang` | cookie hợp lệ → đúng lang; cookie thiếu/sai → default (mock `next/headers`) |

## Files to Create
- `vitest.config.ts` — root config (environment: node, globals)
- `lib/kudos/sanitize-tag.test.ts`
- `lib/i18n/dictionary.test.ts`
- `app/_components/kudos/kudos-hero-badge.test.ts`
- `lib/i18n/get-lang.test.ts`
- Update `package.json`: add `vitest` devDep + scripts `test`, `test:run`

## Out of Scope (this round)
- React component tests (testing-library)
- Supabase queries/actions (cần mock client)
- E2E / Playwright

## Workflow
| Phase | Owner | Status |
|-------|-------|--------|
| 1. Forge: install vitest, config + 4 test files | implementer | ✓ DONE |
| 2. Temper: tester runs `npm run test:run` → 100% pass | tester | ✓ DONE (29 tests) |
| 3. Inspect: reviewer | reviewer | ✓ DONE (8.5/10, issues fixed) |
| 4. Deliver: status reconciliation | project-manager | ✓ DONE |

## Success Criteria (All Met)
- ✓ `npm run test:run`: 4 files, 29 tests, 100% pass
- ✓ Happy-path + edge cases for 4 pure-logic modules
- ✓ No regressions to `npm run build` / lint

## Completion Note
All phases complete. Vitest 4.1.7 installed, config + 4 test files created, all tests passing, code reviewed and issues resolved. Ready for merge.
