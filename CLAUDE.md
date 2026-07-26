# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Read first

Rules live here; the reasoning lives in the ADRs. When a rule below surprises you, open the linked ADR rather than working around it.

| Before you touch… | Read |
|---|---|
| Domain vocabulary, naming, "what do we call this" | `CONTEXT.md` |
| Any architectural decision's rationale | `docs/adr/` (0001–0015) |
| Studio chrome UI — page, component, color, icon, font, `globals.css` | `docs/DESIGN_SYSTEM.md` |
| Templates, presets, sync, validate, thumbnail capture | `docs/TEMPLATE_SYSTEM.md` |

## Commands

```bash
pnpm dev                # Dev server (predev runs generate:templates)
pnpm build              # Production build (prebuild runs generate:templates)
pnpm start              # Start production server
pnpm lint               # ESLint (eslint-config-next + local rules)
pnpm test               # Vitest run
pnpm test:watch         # Vitest watch mode

pnpm generate:templates # Regenerate src/templates/_generated.ts from template dirs
pnpm template:verify    # Full authoring gate for one template (tsc/eslint/validate/consistency/capture)
pnpm template:verify:ci # Blocking CI gate across every template (skips capture)
pnpm template:sync      # Reflect code presets → DB (dry-run by default; --apply to commit)
pnpm template:capture   # Playwright thumbnail capture
pnpm template:scaffold  # Scaffold an empty template directory skeleton
pnpm template:delete    # Remove a template's source + DB/storage residue
pnpm template:image     # Fetch/host an image for a template preset

pnpm performance:verify # Check initial CSS/font assets — local only, run against `pnpm start`
pnpm reconcile:orphaned-assets  # Find/clear pre-existing storage leaks (dry-run by default)
```

TypeScript checking: `pnpm tsc --noEmit`. Tests use in-memory fakes — no DB required.

**CI gate before merge** (`.github/workflows/ci.yml`): `generate:templates` → `tsc --noEmit` → `lint` → `test` → `template:verify:ci`. `performance:verify` is **not** in CI (it needs a running server).

## Architecture

A no-code website builder on **Next.js 16** (App Router), **Supabase** (auth + DB + storage), **Tailwind CSS v4**. Users pick a Template, edit it visually, and publish it. Published Sites are served at the path-based `/site/<slug>` — Subdomain serving is designed but **not implemented** ([ADR-0009](./docs/adr/0009-subdomain-public-serving.md): blocked on domain setup, not code).

### Layer structure

Clean Architecture. Work flows inward — never outward:

```
src/domain/       ← Pure business logic (entities, repository interfaces, use cases, errors)
src/domain/__tests__/  ← vitest unit tests (in-memory fakes)
src/data/         ← Supabase repository implementations
src/lib/di/       ← DI: factory functions wiring repos → use cases
src/lib/errors/   ← Domain error code → display string registry (ko/en)
src/lib/i18n/     ← Typed ko/en dictionaries (ko canonical), cookie-based locale (ADR-0010)
src/lib/seo/      ← SITE_URL helper (origin only, trailing slash trimmed)
src/lib/editor/   ← Autosave schedule + write queue (ADR-0015)
src/lib/template/ ← Registry-aware validate, design-token → CSS var expansion, sync
src/app/          ← App Router pages and Server Actions (call use cases via DI)
  (authenticated)/          ← Route group: single auth guard in layout.tsx
    dashboard/
      (with-sidebar)/       ← Route group: dashboard pages that render the sidebar
      editor/               ← NO sidebar, full-viewport layout
src/components/   ← UI components (src/components/ui/ = shadcn primitives)
src/templates/    ← Self-contained Template renderers (src/templates/<category>/<leaf>/)
src/middleware.ts ← Supabase session refresh only (4 lines; no host branch — see ADR-0009)
src/types/database.ts ← Generated Supabase DB types
```

**DI:** call a `create*UseCase(supabase)` factory from the responsibility-specific module in `src/lib/di/`. No singleton container — a fresh Supabase client per request. Keep the per-use-case factories explicit; do **not** collapse them behind a generic resolver. **Read paths must not import the Template registry or `LibraryAwareSiteContentValidator`** — only `site-content-write.ts` / `template-content-write.ts` may ([ADR-0008](./docs/adr/0008-keep-explicit-di-factories.md)).

**Errors:** the domain throws typed errors (`src/domain/errors/*.ts`) with stable `code` strings; Server Actions return `{ success: false, code }`; the client maps the code via `src/lib/errors/messages.ts`. **Never hard-code user-facing strings** in Server Actions or use cases.

### Route map

Route groups make URLs non-obvious from the file tree, so this table is authoritative.

| Path | Purpose |
|---|---|
| `/` | Marketing landing |
| `/templates` | **Public** template catalog (unauthenticated). Selecting redirects through auth to `/dashboard/projects/create` |
| `/login`, `/signup`, `/forgot-password`, `/update-password` | Auth pages (Server Actions in `actions.ts`) |
| `/auth/confirm`, `/auth/callback` | OTP verification / OAuth callback handlers |
| `/legal/privacy`, `/legal/terms` | Static legal pages |
| `/dashboard` | Redirects to `/dashboard/projects`. Auth guard in `(authenticated)/layout.tsx` |
| `/dashboard/projects` | Home of the authenticated area — site list + per-site settings (rename/domain/publish/delete) |
| `/dashboard/projects/create?templateId=<id>` | Provision a new Site from a Template |
| `/dashboard/templates` | Authenticated template catalog |
| `/dashboard/editor?siteId=<id>` | Visual editor — full-viewport, no sidebar |
| `/dashboard/settings` | Account settings — change password, Account Erasure |
| `/admin`, `/admin/templates` | Admin area (**Templates only**) — requires `app_metadata.role === 'admin'`. `/admin` redirects to `/admin/templates` |
| `/site/[domain]/[[...slug]]` | Public published Site renderer (empty slug = home page) |
| `/preview/[id]/[[...slug]]` | Preview a Site before publishing |
| `/preview/preset/[...key]` | Preview a Template preset straight from code (used by the authoring loop) |
| `/sitemap.xml`, `/robots.txt` | `src/app/sitemap.ts`, `src/app/robots.ts` |
| `/api/cron/cleanup-assets` | Orphan asset cleanup cron. Bearer `CRON_SECRET`. `0 3 * * *` (Hobby plan = 1 cron/day) |
| `/api/admin/sync-templates` | **POST** — Template registration. Bearer `TEMPLATE_SYNC_SECRET`. Runs after a successful **production** deploy only — renderer code must be live before the catalog row exists ([ADR-0012](./docs/adr/0012-template-publishing-pipeline.md)) |

### Studio UI / design system

**Read `docs/DESIGN_SYSTEM.md` before any chrome UI work.** Raw Tailwind palette classes (`text-zinc-400`, `bg-red-500`, …), legacy MD3 tokens, and `text-outline` **fail the build** — ESLint `local/no-raw-color-classes` is at **error** severity ([ADR-0011](./docs/adr/0011-studio-ui-redesign-shadcn-pretendard.md)).

"Chrome" = landing/auth/dashboard/editor/settings/admin/legal/error. It does **not** include `src/templates/**`, which keeps its own per-Template design tokens ([ADR-0005](./docs/adr/0005-design-tokens-gradual-migration.md)). Don't cross the streams.

### Template system

**Read `docs/TEMPLATE_SYSTEM.md` before any template work.** The rules that bite:

- Each Template is **self-contained** in `src/templates/<category>/<leaf>/` — its own `tokens.ts`, `library/*.tsx` (each with `.meta.fieldsSchema`), `template.ts` seed, `index.tsx` renderer. Components are **not** shared across Templates. Duplication is deliberate; do not extract a shared component library ([ADR-0001](./docs/adr/0001-beta-model-template-isolation.md)).
- **`templateKey = <category>-<leaf>`** (concat, lowercase) and is **permanent**. Category is the parent dir name, **Capitalized** for the catalog. Adding a directory is enough to register — `src/templates/_generated.ts` is codegen (`pnpm generate:templates`, hooked into predev/prebuild).
- **Code is source of truth; sync reflects to DB** ([ADR-0002](./docs/adr/0002-templates-source-of-truth-is-code.md)). Registration is automated post-deploy and new rows land as `active` — **merge is the publish approval** ([ADR-0012](./docs/adr/0012-template-publishing-pipeline.md)). The admin UI's manual sync is an emergency Force re-sync only. `app_metadata.canPublishTemplates` gates the **live status toggle** (activate/archive), not registration, and is separate from the admin role ([ADR-0006](./docs/adr/0006-canpublishtemplates-separate-from-admin.md)).
- New Templates are authored with the `new-template` skill (see `.claude/skills/new-template/`), which drives the `template:verify` gate. There is no `template:generate` command.

**`ContentModel`** (`src/domain/entities/template.entity.ts`) is the core data model, flowing DB → editor → renderer. Section `type` matches a `componentKey` in the Template's library; **array order = render order** (no `order` field).

**Two axes of copy/share — don't conflate them:**
- *Template ↔ Template (code):* nothing is shared. Each Template owns its copies.
- *Site ↔ Template (runtime):* instantiating a Site deep-copies the Template's `content` (`structuredClone`), but the **renderer code is shared** — loaded at serve time by `templateKey` via `loadTemplate()`. So Template edits never reach existing Sites, and "a Site is a copy" means its data, not its code.

**Site Types (Single / Multi)** ([ADR-0007](./docs/adr/0007-single-multi-site-type-structural-union.md)): `ContentModel` is a structural union on `mode` (`SiteMode = 'single' | 'multi'`), **fixed at creation** — a Single never evolves into a Multi. Narrow with `isSingleContent` / `isMultiContent`; iterate every section regardless of mode with `allSections()`.
- **Single**: `sections: SingleSection[]` at the root, each carrying `nav:{visible,label}`. `renderSingleSite.tsx`; nav is anchor-scroll (`#section-<id>`). Editor pins nav top / footer bottom.
- **Multi**: `pages: Page[]` (each with `slug` + `nav:{visible,label}`) plus `shared:{header,footer}`. `renderMultiSite.tsx` renders header → page.sections → footer; served at `/site/[domain]/[[...slug]]` (`visible:false` → 404). Editor reorders/toggles pages but cannot create or delete them.
- **nav is projected, not stored** — `deriveNav(source, hrefOf)` filters `visible && nav.visible`; `deriveFooterNav` projects the complement for the Multi footer. `visible` and `nav.visible` are **independent axes**.
- Per-page SEO via `resolveActivePageSeo()` feeds `generateMetadata`; the sitemap enumerates every routable Page.

**Design tokens:** `tokens.ts` may export `defaultGlobalStyles` (thin, user-editable) alone, or additionally `designTokens` (rich, code-fixed: `colors`/`fonts`/`spacing`/`radius`/`shadows`/`typography`) which the renderer receives as a prop and expands to CSS custom properties via `tokensToCssVars()`. **The rich pattern is the target for new Templates**; legacy ones still define `--{prefix}-{name}` in `.module.css`. Migration is deliberately gradual, one Template at a time, and "partial" is the decision — not a defect to finish ([ADR-0005](./docs/adr/0005-design-tokens-gradual-migration.md)). To see which Templates have migrated: `grep -l designTokens src/templates/*/*/tokens.ts`.

**`array` field type:** components can declare repeating-item fields in `fieldsSchema` (menu items, FAQ rows); the editor renders add/remove/reorder and validates each item against its `itemSchema`. Phase 2 (Collections — separate table + RLS) is deferred; see `docs/plans/PLAN_crud_array_field.md` for the trigger conditions.

### Editor persistence

The editor (`src/components/editor/DynamicEditor.tsx`) dynamically imports the Template renderer via `loadTemplate()`. Clicking a section in the preview selects it for inline editing.

Edit loss was a **set of paths**, not one concurrency bug ([ADR-0015](./docs/adr/0015-edit-loss-paths-exhaustive-defense.md)). Four defences, all load-bearing:

1. **Never bypass the save RPC.** Every write goes through `save_site_template_with_lock` (migration 010) carrying `expectedUpdatedAt`; `'STALE_VERSION'` surfaces a Conflict modal. A plain `update` silently destroys another tab's work ([ADR-0004](./docs/adr/0004-optimistic-concurrency-via-rpc.md)). **New save paths must thread `expectedUpdatedAt` through.**
2. **Every write goes through the single queue** (`src/lib/editor/write-queue.ts`) so a Site's writes are always ordered — this is what stops a tab colliding with *itself*.
3. **The debounce has a ceiling:** `AUTOSAVE_MAX_WAIT_MS = 15_000` (`src/lib/editor/autosave-schedule.ts`), plus an unmount flush so SPA/browser Back cannot drop pending edits.
4. **A rule may block a save only when saving would break the renderer.** Anything that merely *looks* wrong is a warning the editor flags inline. Don't promote a warning to blocking — the whole `ContentModel` is validated and saved as a unit, so one bad field would hold every other edit hostage.

### Asset upload flow

Reserve-Confirm, to avoid orphaned storage files ([ADR-0003](./docs/adr/0003-asset-upload-two-phase-cleanup.md)):

1. `initUploadAction` — creates a `pending` DB record, returns an upload path
2. Client uploads directly to Supabase Storage (`user_assets` bucket)
3. `confirmUploadAction` — marks the record `active`, returns the public CDN URL

Orphan cleanup runs from the cron endpoint via `sweep_orphaned_assets` + `claim_cleanup_task`, batched within a time budget (`MAX_QUEUE_ITEMS_PER_RUN`). Daily, not hourly — Hobby plan limit.

### Account Erasure (Tombstone-first)

`deleteAccountAction` calls `DeleteAccountUseCase`, which runs a **fixed, non-regressable order** against `IAccountErasureRepository` ([ADR-0014](./docs/adr/0014-account-erasure-tombstone-pipeline.md)):

1. **`requestErasure`** — the commit point. The `request_account_erasure(p_user_id)` RPC (migration 024) does one transaction: insert the `account_deletions` row, delete the user's `assets`/`user_sites`. A `BEFORE DELETE` trigger on `assets` copies each storage path into `asset_tombstones` *first* — that table has no FK to `assets` or `auth.users`, so it outlives both. **Trigger-then-CASCADE order is load-bearing**; CASCADE without the trigger recreates the leak.
2. **`markDeleted`** — sets `app_metadata.deletedAt`, read by the `(authenticated)` guard and `withUser` (`isAccountErased()`), locking the account out before the slower steps run.
3. **`drainStorage`** — best-effort inline removal; never throws. Leftovers stay `pending`/`failed` for the cron worker (`claim_asset_tombstones`, migration 025).
4. **`deleteAuthUser`** — always last.

Audit-flavoured FKs (`templates.created_by`, `template_sync_audit.performed_by`) are `ON DELETE SET NULL`, not CASCADE — the publish trail must survive the user (migration 023). Pre-existing leaks aren't retroactively fixed: run `pnpm reconcile:orphaned-assets`.

### Supabase clients

- `src/utils/supabase/server.ts` — `createClient()` (anon key, cookie session) and `createAdminClient()` (service role, no cookies)
- `src/utils/supabase/client.ts` — browser client for client components

**Session cookies stay host-only.** Never set `domain=.<root>` — that would leak the dashboard session into user Site origins ([ADR-0009](./docs/adr/0009-subdomain-public-serving.md) §1).

### Environment variables

Required in `.env.local` and in Vercel project env:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=       # e.g. https://layer0-studio.vercel.app — sitemap, robots, metadataBase, OG canonical
CRON_SECRET=                # Bearer for /api/cron/cleanup-assets
TEMPLATE_SYNC_SECRET=       # Bearer for POST /api/admin/sync-templates. Mirror the SAME value as a
                            # GitHub Actions secret — register-templates.yml calls the endpoint post-deploy.
```

Optional, for `pnpm template:image` only — without them `scripts/lib/image-fetch.ts` falls back to topic-agnostic picsum images:

```
UNSPLASH_ACCESS_KEY=
PEXELS_API_KEY=
```

Production builds **hard-fail** if `NEXT_PUBLIC_SITE_URL` is missing (`next.config.ts:3-8`). In dev, `src/lib/seo/base-url.ts` falls back to `http://localhost:3000`.

### Database migrations

`docs/migrations/` holds 001–025 (`.sql`, plus `.md` runbooks for the 018/019 data backfills). **All 25 are applied to production.** Apply new ones manually via the Supabase SQL editor or `supabase db push`; each file's header comment explains what it does and why — read the file rather than a summary.

When adding one: number sequentially, and if it renames a column, remember that function bodies reference columns by text and need a `CREATE OR REPLACE` in the same migration (this is what migration 021 had to do for `save_site_template_with_lock`).

### Deployment

Production: https://layer0-studio.vercel.app (Vercel).

## Agent skills

- **Issue tracker** — GitHub Issues in `sungheeyoon/layer0-studio` via `gh`. See `docs/agents/issue-tracker.md`.
- **Triage labels** — `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.
- **Domain docs** — single-context layout (`CONTEXT.md` + `docs/adr/`). See `docs/agents/domain.md`.
