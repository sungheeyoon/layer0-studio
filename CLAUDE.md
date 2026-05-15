# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev                # Start dev server (predev runs generate:themes)
pnpm build              # Production build (prebuild runs generate:themes)
pnpm start              # Start production server
pnpm lint               # Run ESLint (eslint config: eslint-config-next)
pnpm test               # Vitest run (domain layer only)
pnpm test:watch         # Vitest watch mode

pnpm generate:themes    # Regenerate src/themes/_generated.ts from theme dirs
pnpm template:sync      # Reflect code presets → DB (dry-run by default; pass --apply to commit)
pnpm template:capture   # Playwright thumbnail capture for templates
pnpm template:scaffold  # Scaffold a new theme directory skeleton
```

TypeScript checking: `pnpm tsc --noEmit`. Tests live in `src/domain/__tests__/` and use in-memory fakes — no DB required.

## Architecture

Layer0 Studio is a no-code website builder built on **Next.js 16** (App Router), **Supabase** (auth + DB + storage), and **Tailwind CSS v4**. Users pick a template, edit it visually, and publish it to a custom domain.

### Layer structure

The codebase follows Clean Architecture. Work flows inward — never outward:

```
src/domain/       ← Pure business logic (entities, repository interfaces, use cases, errors)
src/domain/__tests__/  ← vitest unit tests (entities + use cases with in-memory fakes)
src/data/         ← Supabase repository implementations
src/lib/di/       ← Dependency injection: factory functions that wire repos → use cases
src/lib/errors/   ← User-facing error message registry (Korean i18n) — map domain error codes → display strings
src/lib/seo/      ← SITE_URL helper (origin only, trailing slash trimmed)
src/app/          ← Next.js App Router pages and Server Actions (call use cases via DI)
  (authenticated)/          ← Route group: auth guard (session check in layout.tsx)
    layout.tsx              ← Single auth guard for all authenticated routes
    dashboard/
      (with-sidebar)/       ← Route group: dashboard pages that render the sidebar
        layout.tsx          ← Sidebar layout
        page.tsx            ← /dashboard
        projects/           ← /dashboard/projects, /dashboard/projects/create
        templates/          ← /dashboard/templates
        domains/            ← /dashboard/domains
        settings/           ← /dashboard/settings
      editor/               ← /dashboard/editor — NO sidebar, full-viewport layout
src/components/   ← UI components
src/themes/       ← Theme renderers (pluggable)
src/middleware.ts ← Supabase session refresh on every request (excludes static assets)
src/types/database.ts ← Generated Supabase DB types
```

**DI pattern:** Every Server Action or Server Component calls a `create*UseCase(supabase)` factory from `src/lib/di/container.ts`, which builds the repository and injects it into the use case. There is no singleton container; a fresh Supabase client is passed in per request.

**Error pattern:** Domain layer throws typed errors (`src/domain/errors/*.ts`) with stable `code` strings. Server Actions return `{ success: false, code }` and the client maps the code to a Korean message via `src/lib/errors/messages.ts`. Never hard-code user-facing strings in Server Actions or use cases.

### Route map

| Path | Purpose |
|---|---|
| `/` | Marketing landing page |
| `/templates` | **Public** template catalog — unauthenticated browsing (shop-style product list). Selecting a template redirects through auth to `/dashboard/projects/create` |
| `/login`, `/signup` | Auth pages (Server Actions in `actions.ts`) |
| `/forgot-password` | Send password-reset email (Supabase `resetPasswordForEmail`, redirects to `/auth/confirm?next=/update-password`) |
| `/update-password` | Set new password after reset link verification |
| `/auth/confirm` | OTP verification handler — used by signup confirmation and password-reset flows |
| `/legal/privacy`, `/legal/terms` | Static legal pages |
| `/dashboard/*` | Authenticated user area (auth guard in `(authenticated)/layout.tsx`) |
| `/dashboard/templates` | Authenticated template catalog (same data, different chrome) |
| `/dashboard/projects/create?templateId=<id>` | Provision a new site from a template |
| `/dashboard/editor?siteId=<id>` | Visual editor — full-viewport, no sidebar (`(authenticated)/dashboard/editor/`) |
| `/dashboard/settings` | Account settings — change password, delete account |
| `/admin/*` | Admin area — requires `app_metadata.role === 'admin'` |
| `/site/[domain]` | Public published site renderer |
| `/preview/[id]` | Preview before publishing |
| `/api/cron/cleanup-assets` | Cron job: orphan asset cleanup via Supabase RPCs (Bearer `CRON_SECRET`). Schedule: `0 3 * * *` (daily 03:00 UTC) — free Vercel plan limit (1 cron/day) |

### Theme system

> **Any work touching templates / themes / presets / sync / validate / thumbnail capture: read `docs/TEMPLATE_SYSTEM.md` FIRST.** That doc is the single source of truth — concepts, data model, sync pipeline, validate rules, extension scenarios, gotchas, and code map. The summary here is just a pointer.

Themes live in `src/themes/<key>/`. Each theme is **visual tokens (`tokens.ts`) + a library of self-describing section components (`library/*.tsx` with `.meta.dataSchema`) + presets (`presets/*.preset.ts`)**. The registry is auto-generated (`src/themes/_generated.ts` via `pnpm generate:themes`, hooked into predev/prebuild) — adding a directory is enough to register. Currently 7 themes ship: `corporate`, `cafe`, `fitness`, `interior`, `legal`, `medical`, `wedding`.

The `TemplateJson` type (in `src/domain/entities/template.entity.ts`) is the core data model — it flows from DB → editor → renderer:
- `themeKey`: selects the renderer
- `globalStyles`: CSS custom properties applied at the root
- `pages[].sections[]`: each section's `type` matches a `componentKey` in the theme's library; **array order = render order** (the deprecated `section.order` field was removed in Phase 6d / migration 012)

**`array` field type** (Phase 1, merged): components can declare repeating-item fields in their `dataSchema` (e.g. menu items, FAQ entries). The editor renders add/remove/reorder UI and recursively validates each item against its `itemSchema`. Phase 2 (Collections — separate table + RLS for blogs/notices) is intentionally deferred — see `docs/plans/PLAN_crud_array_field.md` for trigger conditions before opening that work.

**Code is source of truth, sync reflects to DB.** `pnpm template:sync` (default dry-run, `--apply` to commit) reads presets, validates against each component's `dataSchema`, and upserts `templates` rows. Admin UI mirrors this with a 2-step Preview → Apply gated on `app_metadata.canPublishTemplates`.

The editor (`src/components/editor/DynamicEditor.tsx`) dynamically imports the theme renderer at runtime via `loadTheme()`. Clicking a section in the preview panel selects it in the left panel for inline editing.

**Auto-save + optimistic concurrency:** Edits debounce-save after 4s idle, with a `beforeunload` guard for in-flight changes. Saves carry the row's `expectedUpdatedAt`; the `save_site_template_with_lock` RPC (migration 010) returns `'STALE_VERSION'` if another tab/device wrote in the meantime, which surfaces a Conflict modal in the editor. When adding new save paths, always thread `expectedUpdatedAt` through — never bypass the RPC.

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

Required in `.env.local` (and in Vercel project env for deploys):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=       # e.g. https://layer0.studio — used by sitemap, robots, metadataBase, OG canonical
CRON_SECRET=                # Bearer token validated by /api/cron/cleanup-assets
```

Production builds **hard-fail** if `NEXT_PUBLIC_SITE_URL` is missing (`next.config.ts:3-8`). In dev, `src/lib/seo/base-url.ts` falls back to `http://localhost:3000`.

### Database migrations

SQL migrations live in `docs/migrations/` (001–012). Apply manually via the Supabase dashboard SQL editor or `supabase db push`. All migrations through 012 are applied to production. Notable:
- `009_storage_bucket_hardening.sql` — bucket-level MIME/size on `user_assets` and admin-only writes on `template-thumbnails`
- `010_optimistic_concurrency.sql` — replaces `save_site_template_with_lock` to accept `p_expected_updated_at` and return `'OK' | 'STALE_VERSION'` (powers editor Conflict modal)
- `011_template_sync_audit.sql` — `template_sync_audit` table for `pnpm template:sync` audit trail
- `012_remove_section_order.sql` — strips deprecated `section.order` from `templates.template_json`, `user_sites.site_json`, and `user_sites.template_snapshot` JSONB (Phase 6d cleanup)

### Deployment

Production: https://layer0-studio.vercel.app (Vercel).
