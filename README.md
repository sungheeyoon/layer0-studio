# Layer0 Studio

A no-code website builder — pick a template, edit visually, publish to a custom domain.

Built on **Next.js 16** (App Router), **Supabase** (auth + DB + storage), and **Tailwind CSS v4**.

## Quick start

```bash
cp .env.local.example .env.local   # fill in Supabase credentials
pnpm install
pnpm dev                           # http://localhost:3000
```

### Required environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=          # e.g. https://layer0.studio — sitemap, robots, metadataBase, OG canonical
CRON_SECRET=                   # Bearer token for /api/cron/cleanup-assets
```

> `NEXT_PUBLIC_SITE_URL` falls back to `http://localhost:3000` if unset. Set it in Vercel before the first production build or crawlers will index localhost URLs.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm tsc --noEmit` | Type-check without emitting |

## Architecture

The codebase follows **Clean Architecture** — dependencies flow inward only:

```
src/domain/       ← Pure business logic (entities, repository interfaces, use cases)
src/data/         ← Supabase repository implementations
src/lib/di/       ← DI factory functions (wire repos → use cases per request)
src/app/          ← Next.js App Router pages and Server Actions
src/components/   ← UI components
src/themes/       ← Pluggable theme renderers
```

Server Actions call `create*UseCase(supabase)` factories from `src/lib/di/container.ts`. No singletons — a fresh Supabase client is passed per request.

## Route map

| Path | Purpose |
|---|---|
| `/` | Marketing landing page |
| `/templates` | **Public** template catalog — visitors can browse without signing in (think shop-style product list). Selecting a template gates through auth into `/dashboard/projects/create` |
| `/login`, `/signup` | Auth (Server Actions) |
| `/dashboard/*` | Authenticated user area |
| `/dashboard/templates` | Authenticated catalog (same data, different chrome) |
| `/dashboard/projects/create?templateId=<id>` | Provision a new site from a template |
| `/dashboard/editor?siteId=<id>` | Visual editor |
| `/admin/*` | Admin area (`app_metadata.role === 'admin'`) |
| `/site/[domain]` | Published site renderer |
| `/preview/[id]` | Preview before publishing |
| `/api/cron/cleanup-assets` | Orphan asset cleanup cron (Bearer `CRON_SECRET`) |

## Theme system

Themes live in `src/themes/`. Each exports a renderer component, a `slots` array, and a `defaultTemplateJson`. Register new themes in `src/themes/registry.ts`.

The core data model is `TemplateJson` (`src/domain/entities/template.entity.ts`):
- `themeKey` — selects the renderer
- `globalStyles` — CSS custom properties applied at the root
- `pages[].sections` — page content (top-level `sections` was removed 2026-04-24)

## Asset uploads

Two-phase commit to avoid orphaned storage files:

1. `initUploadAction` — creates a `pending` DB record, returns upload path
2. Client uploads directly to Supabase Storage (`user_assets` bucket)
3. `confirmUploadAction` — marks record `active`, returns CDN URL

Orphan cleanup runs via the cron endpoint using `sweep_orphaned_assets` and `claim_cleanup_task` Supabase RPCs.

## Database migrations

Migration SQL lives in `docs/migrations/` (001–009). Apply manually via the Supabase dashboard SQL editor or `supabase db push`. Migration 009 (`009_storage_bucket_hardening.sql`) enforces bucket-level MIME/size on `user_assets` and admin-only writes on `template-thumbnails` — apply it before launch.
