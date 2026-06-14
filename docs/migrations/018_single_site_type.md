# Migration 018 — Single Site Type (`pages` → `mode:single`)

Converts existing **Single** `user_sites` rows from the legacy `{ pages: [home] }`
shape to the new `{ mode:'single', sections }` structural union introduced in
#37 / ADR-0007. Without this, rows written before #37 lack `mode`, so
`isSingleTemplate()` returns false and the renderer/editor/validation/save paths
(all now `mode`-branched, no legacy fallback) treat them as empty — i.e. existing
Single sites render blank until migrated.

> **Numbering:** the issue (#39) called this "015", but `015`–`017` were already
> taken (`realign_template_key_to_slug`, …). It ships as **018**.
>
> **Form:** this is a **TypeScript dry-run script**, not raw SQL. The transform
> flattens a nested page wrapper, rebuilds every section (renaming a `data` key,
> dropping fields, injecting a `nav` object cross-referenced from the code seeds,
> and order-zipping preserved menu labels). That is impractical to express — and
> impossible to dry-run with real diffs — in a single SQL statement. The runner
> follows the same dry-run/`--apply` convention as `pnpm template:sync`.

## What it does (per row, on `site_json` AND `template_snapshot`)

1. Flatten `pages[0].sections` → top-level `sections`; set `mode:'single'`; drop
   the page wrapper. Keep `templateKey` + `globalStyles`.
2. Rename each section's `data.label` key → `data.eyebrow` (the on-screen kicker).
3. Strip `menu1~N` / `menuNUrl` from the nav section's `data`.
4. Inject per-section `nav:{visible,label}` from the **authoritative code seed**
   (matched by `templateKey` + section `id`; code is source of truth — ADR-0002).
   Drop section-level `editable` / `title`.
   - **User menu renames are preserved**: the old nav section's ordered `menuN`
     values are zipped onto the nav-target sections in document order (Phase 0
     seeded `nav.visible:true` on exactly those sections, in order). For an
     unedited site this is a no-op (seed label already equals the old `menuN`).
   - Sections not present in the seed (custom/novel) get
     `nav:{visible:false, label: eyebrow||type}`.

**Not touched here:** the asset `slot_key` namespace
(`${page.id}.${section.id}.${key}` → `${section.id}.${key}`). It lives on asset
rows, not in `site_json`, and self-heals on the next editor save via the lock RPC
(the recomputed `slot_key` keeps the same `asset_id`, so no orphan is mis-swept).

## Idempotency & safety

- **Idempotent.** A payload already carrying `mode` is skipped (`skipped-already`).
- **Pure & tested.** The transform lives in `scripts/lib/migrate-single-site.ts`
  with unit tests in `scripts/lib/__tests__/migrate-single-site.test.ts`.
- **Dry-run by default.** Nothing is written without `--apply`.

## Procedure

1. **Back up `user_sites` first** (Supabase dashboard → Database → Backups, or):
   ```sql
   create table user_sites_backup_018 as table user_sites;
   ```
2. **Dry-run** (needs `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`):
   ```bash
   pnpm tsx scripts/migrate-018-single-site-type.ts
   ```
   Review the per-row `before → after` section counts and notes; confirm the
   `migrated / already / unrecognised` summary matches expectations.
3. **Apply**:
   ```bash
   pnpm tsx scripts/migrate-018-single-site-type.ts --apply        # 5s countdown
   pnpm tsx scripts/migrate-018-single-site-type.ts --apply --yes  # no countdown
   ```
4. **Verify**: an existing Single site renders unchanged at its public URL and is
   editable; migrated rows validate against the new Single schema.
5. Drop `user_sites_backup_018` once confident.

`templates.template_json` is **not** in scope — code is the source of truth, so
re-running `pnpm template:sync --apply` reflects the new shape into the
`templates` table.
