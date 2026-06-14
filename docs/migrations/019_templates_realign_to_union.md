# Migration 019 — `templates` realign to the union (slug == templateKey)

Brings the `templates` table to the ADR-0007 union shape **and** finishes the
slug realignment that 015–017 started. Companion to #39 / migration 018, which
did the same shape conversion for `user_sites`.

## The state this fixes

Before #37 the `templates` table accumulated **two rows per templateKey**:

| kind | slug | status | FK'd by user_sites? | shape |
|---|---|---|---|---|
| curated original | brand name (`mono-cafe`, `arrc-clinic`, …) | `active` | ✅ yes | old `{pages}` |
| sync-created dup | preset slug (`cafe-default`, …) | `draft` | no | old `{pages}` |

All rows were still in the pre-#37 `{ pages:[home] }` shape, so the deployed
(`mode`-branched) public catalog — which shows `status='active'` rows — rendered
the active brand-slug rows **blank** (preview white screen, "use template" error).
`pnpm template:sync` couldn't help: it matches by `preset.slug` (`cafe-default`),
so it only ever updated the hidden draft duplicates, never the live rows.

## What it does (`scripts/migrate-019-templates-realign.ts`)

Per templateKey (grouped on `template_json.templateKey`, which was already
correct on every row):

1. **Canonical = the active row** (keeps its `id` → user_sites FK intact, plus
   its curated name/thumbnail/status). For `cafe-cozy` / `cafe-modern` (no active
   row) the lone draft is canonical.
2. Canonical row → `slug = templateKey`, `template_json = code preset's
   templateJson` (new shape; code is source of truth — ADR-0002),
   `version = code preset version`.
3. **Duplicate draft rows → deleted**, guarded: skipped if any `user_sites`
   FK references them. Deletes run **before** the slug renames so the unique
   `slug` constraint never collides.

Dry-run by default; `--apply` (`--yes` skips the countdown).

## Result (verified on apply)

- 16 rows → **9 rows**, one per templateKey, all `slug == templateKey`, all new
  shape: **7 active** with curated names (모노 커피, 아르크 클리닉, …) + **2 draft**
  (`cafe-cozy`, `cafe-modern`).
- `user_sites` FK integrity: **0 broken**.
- `status` left as-is — publishing `cafe-cozy` / `cafe-modern` is a product
  decision, intentionally out of scope.
- Slugs now aligned, so `pnpm template:sync` targets the correct rows going
  forward (015–017 finished).

## Procedure

```sql
-- 1. back up (Supabase SQL editor, prod)
create table templates_backup_019 as table templates;
```
```bash
# 2. dry-run  (needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
pnpm tsx --env-file=.env.local scripts/migrate-019-templates-realign.ts
# 3. apply
pnpm tsx --env-file=.env.local scripts/migrate-019-templates-realign.ts --apply
```
4. Verify: `/templates` catalog renders, "use template" creates a site, existing
   sites (e.g. COFF) still render. Drop `templates_backup_019` once confident.

## Known separate issue (not blocking)

`pnpm template:sync` run via raw `tsx` throws `Invalid or unexpected token`
because it loads template modules for library validation and those modules
`import` `*.module.css`, which Node can't parse. This is a pre-existing tooling
gap unrelated to the data; the slug realignment above means sync will target the
right rows once it's runnable. Track separately.
