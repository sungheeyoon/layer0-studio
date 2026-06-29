# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev                # Start dev server (predev runs generate:templates)
pnpm build              # Production build (prebuild runs generate:templates)
pnpm start              # Start production server
pnpm lint               # Run ESLint (eslint config: eslint-config-next)
pnpm test               # Vitest run (domain layer only)
pnpm test:watch         # Vitest watch mode

pnpm generate:templates # Regenerate src/templates/_generated.ts from template dirs
pnpm template:sync      # Reflect code presets → DB (dry-run by default; pass --apply to commit)
pnpm template:capture   # Playwright thumbnail capture for templates
pnpm template:scaffold  # Scaffold a new template directory skeleton
```

TypeScript checking: `pnpm tsc --noEmit`. Tests live in `src/domain/__tests__/` and use in-memory fakes — no DB required.

## Architecture

Layer0 Studio is a no-code website builder built on **Next.js 16** (App Router), **Supabase** (auth + DB + storage), and **Tailwind CSS v4**. Users pick a Template, edit it visually, and publish it to a Subdomain (see `CONTEXT.md` for the canonical glossary; `docs/adr/` for architectural decisions worth remembering).

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
src/templates/    ← Template renderers (β model: src/templates/<category>/<leaf>/, self-contained)
src/middleware.ts ← Supabase session refresh on every request (excludes static assets)
src/types/database.ts ← Generated Supabase DB types
```

**DI pattern:** Every Server Action or Server Component calls a `create*UseCase(supabase)` factory from `src/lib/di/container.ts`, which builds the repository and injects it into the use case. There is no singleton container; a fresh Supabase client is passed in per request. The per-use-case factories are kept explicit **on purpose** — not collapsed behind a generic resolver (see [ADR-0008](./docs/adr/0008-keep-explicit-di-factories.md)).

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
| `/api/admin/sync-templates` | **POST** — template registration ([ADR-0012](./docs/adr/0012-template-publishing-pipeline.md)). Runs `syncTemplates --apply` (creates new rows as `active`, fetches thumbnails from `<SITE_URL>/thumbnails/`). Bearer `TEMPLATE_SYNC_SECRET`. Invoked after a successful **production** deploy — never before (renderer code must be live first) |

### Studio UI / design system

> **Any work touching Studio chrome UI (a page, component, color, button, icon, font, or `globals.css`): read `docs/DESIGN_SYSTEM.md` FIRST.** That doc is the single source of truth for the visual layer (ADR-0011) — semantic token vocabulary, the shadcn primitives in `src/components/ui/`, lucide icons, Pretendard, light/dark rules, and how to add a token. Color is enforced: ESLint `local/no-raw-color-classes` is at **error** severity, so raw Tailwind palette classes (`text-zinc-400`, `bg-red-500`, …) and legacy MD3/font utilities **fail the build** in chrome.
>
> Scope: "chrome" = landing/auth/dashboard/editor/settings/admin/legal/error. It does **NOT** include the published-Site renderers in `src/templates/**` — those keep their own per-Template design tokens ([ADR-0005](./docs/adr/0005-design-tokens-gradual-migration.md)) and are exempt from the chrome system. Don't cross the streams.

### Template system

> **Any work touching templates / presets / sync / validate / thumbnail capture: read `docs/TEMPLATE_SYSTEM.md` FIRST.** That doc is the single source of truth — concepts, data model, sync pipeline, validate rules, extension scenarios, gotchas, and code map. The summary here is just a pointer.
>
> Note: "theme" is a historical term — visual identity is now per-**Template** (Design Tokens), grouping is **Category**. See `CONTEXT.md` Flagged ambiguities.

Templates live in `src/templates/<category>/<leaf>/` (β model since #6). Each Template is **self-contained**: own visual tokens (`tokens.ts`), own library of section components (`library/*.tsx` with `.meta.dataSchema`), own `template.ts` (the seed), own `index.tsx` renderer. Components are NOT shared across Templates — every Template owns its copies. This is deliberate (isolation > DRY — see [ADR-0001](./docs/adr/0001-beta-model-template-isolation.md)). The registry is auto-generated (`src/templates/_generated.ts` via `pnpm generate:templates`, hooked into predev/prebuild) — adding a directory is enough to register. **templateKey = `<category>-<leaf>` (concat, lowercase)**. Category is derived from the parent dir name, **Capitalized** (e.g. `corporate` → `Corporate`) — the canonical catalog form generated into `templateCategories`; `categoryLabel()` lowercases before the i18n lookup and `syncTemplates` reconciles the DB `category` to this value on UPDATE (so a slug renamed in code propagates). Currently 10 Templates ship across 8 Categories: `cafe-{cozy,default,modern}`, `corporate-default`, `fitness-default`, `interior-default`, `legal-default`, `medical-default`, `outdoor-default`, `wedding-default`. **`outdoor-default` (능선) is a Multi Site Type template; the other 9 are Single.** (The earlier minimal Multi example `corporate-multipage` was removed — `outdoor-default` is now the shipping Multi template; the Multi rendering infrastructure `renderMultiSite` / `[[...slug]]` routing is in active use.) See "Site Types (Single / Multi)" below and [ADR-0007](./docs/adr/0007-single-multi-site-type-structural-union.md).

The `TemplateJson` type (in `src/domain/entities/template.entity.ts`) is the core data model — it flows from DB → editor → renderer. **Two axes of copy/share (don't conflate — see `CONTEXT.md` Flagged ambiguities):** when a User instantiates a Site, the Template's `TemplateJson` is deep-copied (`structuredClone` in `create-site-from-template.usecase.ts`) into the Site's own `siteJson` (per-Site **data** copy, ~KB); the **renderer code** is never copied — it is shared and loaded at serve time by `templateKey` via `loadTemplate()`. So template edits do not propagate to existing Sites, and "a Site is a copy" means its data, not its code.
- `templateKey`: selects the renderer (shared across all Sites of that key)
- `globalStyles`: CSS custom properties applied at the root
- sections: each section's `type` matches a `componentKey` in the Template's library; **array order = render order** (the deprecated `section.order` field was removed in Phase 6d / migration 012). Location depends on the Site Type (below): Single → `sections[]` at the root; Multi → `shared.header`/`shared.footer` + `pages[].sections[]`.

**Site Types (Single / Multi)** (see [ADR-0007](./docs/adr/0007-single-multi-site-type-structural-union.md), implemented): `TemplateJson` is a **structural union discriminated on `mode`**, fixed at creation (a Single never *evolves* into a Multi). Narrow with `isSingleTemplate` / `isMultiTemplate`; iterate every section regardless of mode with `allSections()` (all in `template.entity.ts`).
- **Single** (`mode:'single'`): one continuous scroll — `sections: SingleSection[]` (each carries `nav:{visible,label}`). Rendered by `renderSingleSite.tsx`; nav is an anchor-scroll projection (`#section-<id>`). Editor pins the nav section top / footer bottom, reorders the middle.
- **Multi** (`mode:'multi'`): routable `pages: TemplatePage[]` (each carries `nav:{visible,label}` + `slug`) plus `shared:{header,footer}`. Rendered by `renderMultiSite.tsx` (`header → page.sections → footer`); served at `/site/[domain]/[[...slug]]` (empty slug = first/home page; `visible:false` → 404). Editor manages pages (tabs/reorder/toggles/label), no create/delete.
- **nav is projected, not stored** — `deriveNav(source, hrefOf)` filters `visible && nav.visible` (Single = sections/anchors, Multi = pages/slugs); `deriveFooterNav` projects the complement (`visible && !nav.visible`) for the Multi footer. `visible` and `nav.visible` are independent axes.
- **Per-page/site SEO**: `resolveActivePageSeo()` (Multi per-page `seo`, Single Site-level) feeds `generateMetadata`; the sitemap enumerates every routable Page.

**`array` field type** (Phase 1, merged): components can declare repeating-item fields in their `dataSchema` (e.g. menu items, FAQ entries). The editor renders add/remove/reorder UI and recursively validates each item against its `itemSchema`. Phase 2 (Collections — separate table + RLS for blogs/notices) is intentionally deferred — see `docs/plans/PLAN_crud_array_field.md` for trigger conditions before opening that work.

**Rich design tokens** (Issue #9): `tokens.ts` exports BOTH `defaultGlobalStyles` (thin, user-editable) AND `designTokens` (rich, code-fixed: `colors`/`fonts`/`spacing`/`radius`/`shadows`/`typography`). The site renderers (`renderSingleSite.tsx` / `renderMultiSite.tsx`) accept a `designTokens` prop and inject CSS custom properties (`--color-primary`, `--font-base`, ...) on the template root via `tokensToCssVars()` (`src/lib/template/design-tokens.ts`). The thin globalStyles overlay specific tokens via `OVERLAY_MAP` (primaryColor → `--color-primary`, etc.). Currently only **cafe-default** uses the rich pattern; the legacy Templates keep their `--{prefix}-{name}` defs in `.module.css` — this is an *intentional* gradual migration (see [ADR-0005](./docs/adr/0005-design-tokens-gradual-migration.md)). See TEMPLATE_SYSTEM.md §2.5.

**Code is source of truth, sync reflects to DB** (see [ADR-0002](./docs/adr/0002-templates-source-of-truth-is-code.md)). `pnpm template:sync` (default dry-run, `--apply` to commit) reads presets, validates against each component's `dataSchema`, and upserts `templates` rows. **Registration is automated post-deploy** ([ADR-0012](./docs/adr/0012-template-publishing-pipeline.md)): a successful production deploy triggers `register-templates.yml` → `POST /api/admin/sync-templates` → `syncTemplates --apply` (new rows land as `active`, merge = publish approval). The admin UI's manual sync is now an emergency **Force re-sync** only. `app_metadata.canPublishTemplates` (separate from the admin role, [ADR-0006](./docs/adr/0006-canpublishtemplates-separate-from-admin.md)) no longer gates registration — it gates the **live status toggle** (Activate/Archive). CI gate before merge: `.github/workflows/ci.yml` (tsc + lint + test + `template:verify:ci`).

The editor (`src/components/editor/DynamicEditor.tsx`) dynamically imports the Template renderer at runtime via `loadTemplate()`. Clicking a section in the preview panel selects it in the left panel for inline editing.

**Auto-save + optimistic concurrency** (see [ADR-0004](./docs/adr/0004-optimistic-concurrency-via-rpc.md)): Edits debounce-save after 4s idle, with a `beforeunload` guard for in-flight changes. Saves carry the row's `expectedUpdatedAt`; the `save_site_template_with_lock` RPC (migration 010) returns `'STALE_VERSION'` if another tab/device wrote in the meantime, which surfaces a Conflict modal in the editor. **When adding new save paths, always thread `expectedUpdatedAt` through — never bypass the RPC** (silent overwrites are the failure mode this prevents).

### Asset upload flow

Image uploads in the editor use a Reserve-Confirm pattern to avoid orphaned storage files (see [ADR-0003](./docs/adr/0003-asset-upload-two-phase-cleanup.md)):
1. `initUploadAction` — creates a `pending` DB record and returns an upload path
2. Client uploads directly to Supabase Storage (`user_assets` bucket)
3. `confirmUploadAction` — marks the DB record `active` and returns the public CDN URL

Orphan cleanup runs via the cron endpoint using `sweep_orphaned_assets` and `claim_cleanup_task` Supabase RPC functions. Daily (not hourly) due to the Hobby plan's 1-cron/day limit — see the ADR for migration path when this changes.

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
TEMPLATE_SYNC_SECRET=       # Bearer token validated by POST /api/admin/sync-templates (template registration, ADR-0012). Mirror the SAME value as a GitHub Actions secret — .github/workflows/register-templates.yml uses it to call the endpoint after a production deploy.
```

Production builds **hard-fail** if `NEXT_PUBLIC_SITE_URL` is missing (`next.config.ts:3-8`). In dev, `src/lib/seo/base-url.ts` falls back to `http://localhost:3000`.

### Database migrations

Migrations live in `docs/migrations/` (001–019; `.sql` files, plus `.md` runbooks for the data backfills 018/019). Apply manually via the Supabase dashboard SQL editor or `supabase db push`. All migrations through 019 are applied to production. Notable:
- `009_storage_bucket_hardening.sql` — bucket-level MIME/size on `user_assets` and admin-only writes on `template-thumbnails`
- `010_optimistic_concurrency.sql` — replaces `save_site_template_with_lock` to accept `p_expected_updated_at` and return `'OK' | 'STALE_VERSION'` (powers editor Conflict modal)
- `011_template_sync_audit.sql` — `template_sync_audit` table for `pnpm template:sync` audit trail
- `012_remove_section_order.sql` — strips deprecated `section.order` from `templates.template_json`, `user_sites.site_json`, and `user_sites.template_snapshot` JSONB (Phase 6d cleanup)
- `013_rename_theme_key_to_template_key.sql` — renames the legacy `themeKey` JSONB field to `templateKey`
- `014_template_assets_bucket.sql` — `template_assets` public storage bucket for AI-generated/stock images; public read, `canPublishTemplates` admins write. Helper: `uploadTemplateAsset()` in `src/lib/template/template-assets.ts`; verify with `pnpm tsx scripts/verify-template-assets-bucket.ts`
- `015`–`017` — realign `templateKey` JSONB values to the post-#6 β `<category>-<leaf>` concat slugs (`015` initial, `016`/`017` repairs)
- `018_single_site_type.md` — backfill existing Single `user_sites` to the `mode:'single'` union shape (flatten `{pages:[home]}` → `{mode:'single', sections}`, `data.label` → `data.eyebrow`, inject `nav:{visible,label}`, drop `editable`); see [ADR-0007](./docs/adr/0007-single-multi-site-type-structural-union.md). **Applied to prod.**
- `019_templates_realign_to_union.md` — realign the `templates` table rows to the same union shape. **Applied to prod.**

### Deployment

Production: https://layer0-studio.vercel.app (Vercel).

## Agent skills

### Issue tracker

GitHub Issues in `sungheeyoon/layer0-studio`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical defaults (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`CONTEXT.md` + `docs/adr/` at the repo root). See `docs/agents/domain.md`.
