# Migration 027 — Section/nav → Block/menu

This is the coordinated data half of ADR-0016 §2–§3 and issue #130. It changes
all three JSONB columns atomically: `templates.content`, `user_sites.content`,
and `user_sites.snapshot`.

| Before | After |
|---|---|
| Single `sections` | `blocks` |
| Multi `shared` | `chrome` |
| Page `sections` | `blocks` |
| Single `nav.visible: true` | `menu: { label }` |
| Single `nav.visible: false` | no `menu` |
| Page `nav.visible: true` | `name` + header `menu` |
| Page `nav.visible: false` | `name` + footer `menu` |

The pure transform is idempotent. The runner transforms every stored column in
memory, reconciles digests, validates all results against the new Template
libraries, and only then can call the service-role-only SQL function. One bad
column means zero writes.

## Procedure

1. Apply [`027_block_menu.sql`](./027_block_menu.sql).
2. Start a write freeze and take a database backup/PITR checkpoint.
3. Run and review the dry-run:
   `pnpm tsx --env-file=.env.local scripts/migrate-027-block-menu.ts`
4. Investigate every skipped shape or validation error. Confirm the three
   expected column counts and before/after digests.
5. In the coordinated deployment window run the runner with `--apply`, deploy
   the new code, then lift the freeze.
6. Open, save and publish a Single and Multi Site; verify header/footer menus.
7. Drop `apply_block_menu_migration(JSONB, JSONB)` after verification.

Rollback is database restore plus code rollback in the same window. There is no
reverse transform because menu absence and the old boolean encoding are not a
safe long-term dual-write contract.
