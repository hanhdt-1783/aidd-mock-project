# Next.js 16 Middleware Renamed — Discovered at Runtime

**Date:** 2026-05-22 15:40  
**Severity:** High (discovery, not criticality)  
**Component:** Authentication / Session Management  
**Status:** Resolved

## What Happened

Built and deployed Login + Supabase OAuth flow with language switching. Reviewer flagged missing session-refresh middleware (M1). Added `middleware.ts` with standard Next.js middleware pattern — build passed locally. Dev server threw cryptic error at startup: `Could not parse module '[project]/proxy.ts', file not found`. Investigated, renamed file to `proxy.ts` — next error: `Proxy is missing expected function export name … you are migrating from middleware to proxy`. Final fix: renamed export from `middleware()` to `proxy()`. Runtime success.

## The Brutal Truth

This was infuriating because the project's own AGENTS.md **warned explicitly**: "This is NOT the Next.js you know. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."

I ignored it. Assumed familiar middleware patterns would work. Cost: 15 minutes of debug thrashing and a silent "why is nothing working?" discovery at test time instead of planning time.

## Technical Details

**Error progression:**
```
# Step 1: Added middleware.ts
export async function middleware(req: NextRequest) { ... }

# Error: Could not parse module '[project]/proxy.ts', file not found
# (Next.js 16 uses proxy.ts, not middleware.ts)

# Step 2: Renamed to proxy.ts
export async function middleware(req: NextRequest) { ... }

# Error: Proxy is missing expected function export name 'proxy'
# (Next.js 16 requires named export 'proxy', not 'middleware')

# Step 3: Renamed function
export async function proxy(req: NextRequest) { ... }

# Success: server started, middleware applied to all requests
```

**Migration doc:** https://nextjs.org/docs/messages/middleware-to-proxy

## What We Tried

1. Added `middleware.ts` with standard pattern → build green, dev broken
2. Checked `node_modules/next/dist/docs/` after second error → found migration message
3. Renamed file and function → success

## Root Cause Analysis

I relied on pattern memory instead of **reading the project's own warnings first**. The AGENTS.md file explicitly flagged that this is Next.js 16 with breaking changes. The error messages were clear ("migrating from middleware to proxy") but only after failing twice. A 30-second check of the docs before writing code would have eliminated both failures.

## Lessons Learned

1. **Read the codebase warnings before assuming familiarity.** AGENTS.md, CLAUDE.md, and development-rules.md exist for a reason. Next.js 16 is not Next.js 13–15 you trained on.
2. **When a new error surfaces, check `node_modules/docs/` immediately.** Don't debug in circles; frameworks document breaking changes there.
3. **"It compiled" ≠ "it's correct."** Dev server and build are different; breaking changes often hide until runtime.

## Next Steps

None for this issue — resolved and shipped. But: **document this lesson in contributing guidelines or a FAQ.** Future Claudes will hit this exact wall without a visible warning.

## Wins

- Two-track MoMorph workflow (parallel UI + backend) finished both tracks efficiently
- All 3 Major reviewer issues fixed: middleware + OAuth origin hardening + defensive redirect fallback
- Cookie-based i18n with 2-key dictionary proved sufficient (KISS over `next-intl` library)
- Reviewer score: 7.5/10 → issues fixed → production-ready
- Plan and reality perfectly aligned (zero scope creep)

**Status:** Shipped, all tests pass, ready for main branch.
