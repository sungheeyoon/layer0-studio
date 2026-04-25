# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint (eslint config: eslint-config-next)
```

No test runner is configured. TypeScript checking: `pnpm tsc --noEmit`.

## Architecture

Layer0 Studio is a no-code website builder built on **Next.js 16** (App Router), **Supabase** (auth + DB + storage), and **Tailwind CSS v4**. Users pick a template, edit it visually, and publish it to a custom domain.

### Layer structure

The codebase follows Clean Architecture. Work flows inward — never outward:

```
src/domain/       ← Pure business logic (entities, repository interfaces, use cases)
src/data/         ← Supabase repository implementations
src/lib/di/       ← Dependency injection: factory functions that wire repos → use cases
src/app/          ← Next.js App Router pages and Server Actions (call use cases via DI)
src/components/   ← UI components
src/themes/       ← Theme renderers (pluggable)
```

**DI pattern:** Every Server Action or Server Component calls a `create*UseCase(supabase)` factory from `src/lib/di/container.ts`, which builds the repository and injects it into the use case. There is no singleton container; a fresh Supabase client is passed in per request.

### Route map

| Path | Purpose |
|---|---|
| `/` | Marketing landing page |
| `/login`, `/signup` | Auth pages (Server Actions in `actions.ts`) |
| `/dashboard/*` | Authenticated user area (protected in `dashboard/layout.tsx`) |
| `/dashboard/editor?siteId=<id>` | Visual editor |
| `/admin/*` | Admin area — requires `app_metadata.role === 'admin'` |
| `/site/[domain]` | Public published site renderer |
| `/preview/[id]` | Preview before publishing |
| `/api/cron/cleanup-assets` | Cron job: orphan asset cleanup via Supabase RPCs |

### Theme system

Themes live in `src/themes/`. Each theme directory exports a default renderer component, a `slots` array (section definitions), and a `defaultTemplateJson`. The registry (`src/themes/registry.ts`) maps theme keys to dynamic imports; add new themes there.

The `TemplateJson` type (in `src/domain/entities/template.entity.ts`) is the core data model — it flows from DB → editor → renderer. It has:
- `themeKey`: selects the renderer
- `globalStyles`: CSS custom properties (`--theme-primary`, etc.) applied at the root
- `pages`: array of pages, each with `sections` — always use `pages[].sections`; top-level `sections` was removed (2026-04-24, `scripts/migrate-sections-to-pages.sql`)

The editor (`src/components/editor/DynamicEditor.tsx`) dynamically imports the theme renderer at runtime via `loadTheme()`. Clicking a section in the preview panel selects it in the left panel for inline editing.

### Asset upload flow

Image uploads in the editor use a two-phase commit pattern to avoid orphaned storage files:
1. `initUploadAction` — creates a `pending` DB record and returns an upload path
2. Client uploads directly to Supabase Storage (`user_assets` bucket)
3. `confirmUploadAction` — marks the DB record `active` and returns the public CDN URL

Orphan cleanup runs via the cron endpoint using `sweep_orphaned_assets` and `claim_cleanup_task` Supabase RPC functions.

### Supabase clients

- `src/utils/supabase/server.ts` — `createClient()` (anon key, cookie-based session) and `createAdminClient()` (service role key, no cookies)
- `src/utils/supabase/client.ts` — browser client for client components

### Environment variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
