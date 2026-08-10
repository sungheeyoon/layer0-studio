# Migration 026 — Field → Value (ADR-0016 §8-1)

Converts every stored Block `fields` record from the legacy **`Field` object**
(schema metadata carried beside each value, *in the data*) to the ADR-0016
**Value**, and gives every array item a permanent `id`.

```jsonc
// before                                      // after
"fields": {                                    "fields": {
  "title": { "type": "text",  "label": "제목",    "title": "안녕",
             "value": "안녕" },                  "photo": { "url": "https://…",
  "photo": { "type": "image", "label": "사진",              "assetId": "…" },
             "value": "https://…",              "items": [ { "id": "…",
             "assetId": "…" },                               "fields": { "name": "…" } } ]
  "items": { "type": "array", "label": "항목",  }
             "items": [ { "name": {…} } ] }
}
```

**Columns:** `templates.content` · `user_sites.content` · `user_sites.snapshot`
(the current names — migration 021 renamed them from `template_json` /
`site_json` / `template_snapshot`).

**Form:** a TypeScript dry-run runner plus one SQL function, not raw SQL alone.
The transform has to consult each Template's `fieldsSchema` (for `number`
defaults and `itemSchema` recursion) and the result has to be validated against
the live Template libraries before anything is written — neither is expressible
in a SQL statement. The write itself *is* SQL, because it must be one
transaction (see below).

| File | Role |
|---|---|
| `scripts/lib/migrate-field-to-value.ts` | Pure transform + plan. No DB, no registry. Unit-tested. |
| `scripts/lib/__tests__/migrate-field-to-value.test.ts` | Fixture contracts: Single · Multi · nested arrays · `assetId` preservation · idempotency · "one bad row writes nothing". |
| `scripts/migrate-026-field-to-value.ts` | The runner: read → transform → reconcile → validate → (only then) write. |
| `docs/migrations/026_field_to_value.sql` | `apply_field_value_migration()` — the single-transaction write. |

## What the transform does

| Legacy | Value |
|---|---|
| `{ type:'text'\|'textarea'\|'url'\|'color'\|'select', value }` | the `value` string |
| `{ type:'number', value:'42' }` | `42` — and an **empty** string falls back to the schema's `default`, not to `0` (`Number('')` is `0`, which would have written a real, wrong zero) |
| `{ type:'image', value, assetId? }` | `{ url, assetId? }` — **`assetId` is carried through unchanged** |
| `{ type:'array', items:[ {k: Field} ] }` | `[ { id, fields:{ k: Value } } ]`, recursing into nested arrays |
| an item's editor-only `_key` pseudo-field | becomes that item's `id` (it *was* its identity) and stops being a field |

**Array item `id`.** Missing or duplicate ids are a *blocking* validation rule
(`ARRAY_ITEM_ID_MISSING` / `_DUPLICATE`), and the id is the asset `slot_key`
(ADR-0016 §4-4), so the migration mints one (`crypto.randomUUID()`) for every
item that lacks one. **Re-running preserves the ids already there** — the
transform is idempotent, and content that is already Value-shaped comes back
`unchanged`.

**Keys the schema no longer declares are converted, never dropped.** They become
a non-blocking `UNKNOWN_DATA_FIELD` warning; deciding to delete them is a
separate, human call.

**Not touched:** `globalStyles`, `nav`, page slugs, SEO — anything outside a
Block's `fields`. The nav → menu rename is #130, a separate migration.

## Why the write is a SQL function

`supabase-js` has no transaction: N `update()` calls are N transactions, so a
failure halfway leaves the table in a shape **no deployed version of the code can
read** — old code cannot read migrated rows, new code cannot read legacy ones.
`apply_field_value_migration(p_templates, p_user_sites)` takes the whole payload
and updates every row inside one plpgsql body, which is one transaction. It also
asserts that the number of rows updated equals the number sent; a row deleted
between the read and the write raises and rolls the whole thing back.

The function is **service-role only** (`REVOKE` from anon/authenticated) — it
overwrites arbitrary rows' content — and is dropped after the migration.

## Why validation runs before the write

The pre-revision procedure was "transform → write → validate → abort on error",
which cannot abort: by then the write happened. So the runner plans the entire
migration in memory, validates **every** transformed column against the live
Template libraries, and calls the writer only if all of them pass. One failing
column writes nothing at all — including the rows that were fine.

`executeFieldValueMigration` is the only path to the writer, and it returns
`written: false` without calling it when the plan failed. That is covered by a
test, not just by reading the code.

## Procedure

> **`updated_at` is bumped by the write** (the `user_sites_updated_at` trigger
> from migration 001). That is deliberate: `updated_at` is the optimistic
> concurrency token (ADR-0004), so any editor tab still holding a pre-migration
> token gets `STALE_VERSION` and a Conflict modal instead of silently writing
> legacy-shaped content back over a migrated row.

1. **Apply the SQL function** — paste `docs/migrations/026_field_to_value.sql`
   into the Supabase SQL editor (or `supabase db push`).
2. **Write freeze.** Stop editor saves for the window. The safest form is to
   take the deployment down / put it in maintenance; a quiet period is not a
   freeze.
3. **Backup.** `pg_dump` (or a Supabase point-in-time snapshot) — **this is the
   rollback path**, there is no reverse transform.
4. **Dry-run** and read the whole report:
   ```bash
   pnpm tsx --env-file=.env.local scripts/migrate-026-field-to-value.ts
   ```
   It prints row counts, a per-column before/after digest (sha256, 16 chars),
   every note the transform emitted, and any validation failure with its code
   and path. Nothing is written; the dry-run never reaches the writer.
5. **Reconcile.** Row counts match what you expect; every column you expected to
   change shows `~` (before ≠ after) and every one you did not shows `=`. An
   `unrecognised shape` line means a column was not a `mode`-discriminated
   `ContentModel` and was left untouched — investigate before continuing.
6. **Apply**:
   ```bash
   pnpm tsx --env-file=.env.local scripts/migrate-026-field-to-value.ts --apply
   ```
   (`--yes` skips the confirmation prompt. Do not use it the first time.)
7. **Deploy the code in the same window** — coordinated deploy. The renderers,
   the editor and `validateContent` on `main` read Values only; the migrated DB
   holds Values only. Neither half works with the other half's data.
8. **Lift the write freeze**, then spot-check: open a Site in the editor, save it
   (the RPC must accept it), and load a published Site.
9. **Cleanup**: `DROP FUNCTION public.apply_field_value_migration(JSONB, JSONB);`

## Rollback

`git revert` of the code does **not** bring the JSONB back. The recovery path is
restoring the backup from step 3, in the same window as reverting the deploy.

No reverse transform is provided — 021 and 022 set the precedent (coordinated
deploy + backup), and with zero users there is nothing to gain from maintaining
a downgrade path that would itself need testing.

## Order relative to #130

#137 is sequenced **after** #130 (nav → menu). The two changes are independent
in meaning and in failure mode, and this transform does not touch `nav`, so
running them in either order is *correct* — it just means writing the same JSONB
twice. Keep the documented order unless there is a reason not to.
