# aidd-mock-project

A [Next.js 16](https://nextjs.org) (App Router) app with Supabase authentication
(Google OAuth), a pre-launch countdown page, an awards homepage, and a live kudos
board. Styling uses Tailwind CSS v4; data and auth are backed by Supabase.

## Tech Stack

| Layer    | Choice                                   |
| -------- | ---------------------------------------- |
| Framework| Next.js 16.2 (App Router, RSC)           |
| UI       | React 19, Tailwind CSS v4                |
| Backend  | Supabase (Postgres, Auth, RLS)           |
| Auth     | Google OAuth via `@supabase/ssr`         |
| Language | TypeScript 5                             |

> **Heads up:** this repo pins Next.js 16, which renamed `middleware.ts` →
> `proxy.ts` (the exported function is `proxy`, not `middleware`). See `proxy.ts`.

## Prerequisites

- **Node.js 20+** and npm
- **Docker** — required by the Supabase CLI to run the local stack
- **Supabase CLI** — no global install needed; the commands below run it via
  `npx supabase` (<https://supabase.com/docs/guides/cli>)
- A **Google OAuth client** (only needed to exercise login locally — see below)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

`.env.local` (consumed by Next.js — values are public to the browser):

| Variable                        | Required | Notes                                                                 |
| ------------------------------- | -------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅       | `http://127.0.0.1:54321` for local; the project URL when hosted.      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅       | Local default is prefilled; use the real anon key when hosted.        |
| `NEXT_PUBLIC_AUTH_REDIRECT`     | ✅       | Path to land on after login (default `/`).                            |
| `NEXT_PUBLIC_SITE_URL`          | prod     | Public origin for the OAuth redirect. Optional locally (falls back to request origin); **required in production**. |

### 3. Start the Supabase local stack

```bash
npx supabase start
```

This boots Postgres + Auth in Docker, applies every migration in
`supabase/migrations/`, and runs `supabase/seed.sql`. After it finishes, the CLI
prints the local API URL and `anon` key — confirm they match `.env.local`.

Local stack settings live in `supabase/config.toml` (ports, auth providers). The
Google provider there reads its credentials from `supabase/.env` (next step).

### 4. Configure Google OAuth (for login)

The only sign-in method is Google. The Supabase local Auth server reads the
Google credentials from `supabase/.env` via `env()` substitution in
`config.toml`.

1. Create a **Web application** OAuth client at
   <https://console.cloud.google.com/apis/credentials>.
2. Add the authorized redirect URI:
   `http://127.0.0.1:54321/auth/v1/callback`
3. Copy the template and fill in real values:

   ```bash
   cp supabase/.env.example supabase/.env
   # edit supabase/.env:
   #   GOOGLE_CLIENT_ID=...
   #   SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=...
   ```

4. Restart the stack so Auth picks up the credentials: `npx supabase stop && npx supabase start`.

> `.env.local` and `supabase/.env` are gitignored — never commit real secrets.
> Only the `*.example` templates are tracked.

### 5. Run the dev server

```bash
npm run dev
```

Open <http://localhost:3000>. Editing files under `app/` hot-reloads the page.

## NPM Scripts

| Script                          | Purpose                                          |
| ------------------------------- | ------------------------------------------------ |
| `npm run dev`                   | Start the Next.js dev server.                    |
| `npm run build`                 | Production build.                                |
| `npm run start`                 | Serve the production build.                      |
| `npm run lint`                  | Run ESLint.                                      |
| `npm run test`                  | Run unit tests in watch mode (Vitest).           |
| `npm run test:run`              | Run unit tests once and exit (CI-friendly).      |
| `npm run test:e2e`              | Run Playwright E2E tests (headless, Chromium).   |
| `npm run test:e2e:ui`           | Run Playwright E2E tests with the interactive UI.|
| `npm run download-assets:home`  | One-shot fetch of Figma-exported home assets.\*  |
| `npm run download-assets:prelaunch` | One-shot fetch of pre-launch assets.\*       |

> \* The asset images already live in `public/`. These scripts use **expired,
> signed Figma export URLs** and are kept only for historical reference — you do
> **not** need to run them for setup.

## Project Structure

```
app/            Next.js App Router routes (home, login, prelaunch, kudos, auth callback)
lib/            Shared utilities, incl. lib/supabase/ (browser/server/middleware clients)
proxy.ts        Next.js 16 middleware (session refresh) — formerly middleware.ts
public/         Static assets (images, fonts, icons) — committed
supabase/       migrations/ + seed.sql for the local stack
scripts/        One-shot asset download helpers
e2e/            Playwright E2E tests (support/, unauth/, authed/)
docs/           Architecture, standards, changelog, journals
plans/          Implementation plans, phase files, and agent reports
```

## End-to-end Tests

E2E tests use [Playwright](https://playwright.dev/) (Chromium). A global setup
seeds a dedicated Supabase test user via the service-role admin API and writes a
`@supabase/ssr` session cookie — no real Google OAuth is involved.

**Prerequisites before running:**

1. Local Supabase stack running (`npx supabase start`).
2. `SUPABASE_SERVICE_ROLE_KEY` available to the test process. The easiest way is
   a `.env.test.local` file (gitignored) at the repo root:

   ```bash
   SUPABASE_SERVICE_ROLE_KEY=<value printed by `npx supabase start`>
   ```

**Run:**

```bash
npm run test:e2e          # headless
npm run test:e2e:ui       # interactive Playwright UI
```

The dev server (`npm run dev`) is started automatically by `playwright.config.ts`
before tests run. Tests are in `e2e/unauth/` (anonymous paths) and
`e2e/authed/` (authenticated paths).

## Deployment

Designed to deploy on [Vercel](https://vercel.com/new). When hosting:

- Set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the hosted
  Supabase project values.
- Set `NEXT_PUBLIC_SITE_URL` to the deployed origin.
- Configure the Google provider and redirect URI in the hosted Supabase project's
  Auth settings (the local `supabase/.env` flow is for local dev only).

See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
