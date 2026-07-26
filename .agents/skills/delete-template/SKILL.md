---
name: delete-template
description: Remove a website Template from layer0-studio and clean up everything it owns (DB row, storage assets, thumbnails, `_generated.ts`), then git-rm the source. The reverse of `new-template`. Use when asked to "템플릿 삭제해줘", "delete/remove the <X> template", or to clean up a template's leftover DB/storage residue after its code was deleted. Dev-time code-PR workflow — end users never delete Templates.
---

# delete-template

Deleting a Template is the mirror image of `new-template` (dev-time; users never do this). A Template's residue is spread across DB + storage + generated code, and **all of it is derivable from the `templateKey` alone** — so this skill drives one CLI, `pnpm template:delete <key>`, then removes the source with `git rm`.

**This is NOT the runtime admin takedown.** Hiding a live template from the catalog is Archive in `/admin/templates` (status → archived). Use *that* for a template real users are on. `delete-template` is for **removing a template from the codebase** — a mistake, a throwaway, or cleaning up an already-orphaned row.

## The one hard rule

**A template that real user sites are built on cannot be deleted.** User sites keep only a data copy; they load the renderer **code** at serve time by `templateKey` (`loadTemplate`), so deleting the code 500s every live site. The CLI hard-blocks when any `user_sites` row references the template. `--force` overrides it — only reach for that when you have confirmed those sites are throwaway/dead.

## Workflow

1. **Get the `templateKey`** — `<category>-<leaf>` (e.g. `cafe-sunlit`). If unsure, it's the dir name joined: `src/templates/<category>/<leaf>/` → `<category>-<leaf>`.

2. **Dry-run first — always.** Show the user exactly what will be removed:
   ```
   pnpm template:delete <key>
   ```
   This prints the plan (db row, `template_assets` file count, storage thumbnail, public webp, `user_sites` refs, source dir, **code references**). It deletes nothing. Two ways it stops here:
   - **Empty match** → the key matches nothing (likely a typo). Fix the key.
   - **user_sites block** → real sites depend on it. Stop and tell the user; do **not** reach for `--force` without their explicit go-ahead.

   **Watch the `code references` line.** If it's > 0, the CLI lists files that import the template's source (e.g. a test doing `import … '@/templates/<cat>/<leaf>/template'`). Those dangle and break `tsc` the moment the source is removed — you must update (repoint or remove) them in the same change. Step 5's `tsc` gate is the hard catch, but note them now.

3. **Confirm with the user** before applying — deletion removes DB rows and storage permanently (only the source dir is git-recoverable). Surface the dry-run plan and get a yes.

4. **Apply:**
   ```
   pnpm template:delete <key> --apply
   ```
   (Add `--force` only if the user confirmed overriding a user_sites block.) The CLI deletes the DB row (its FK RESTRICT is the final gate), then `template_assets/<key>/`, the storage thumbnail, the public webp, regenerates `_generated.ts`, and writes a `template_sync_audit` entry. Every step is idempotent — if it dies partway, just re-run.

5. **Remove the source (this skill's job).** If the CLI reports a source dir still on disk, git-rm it and regenerate:
   ```
   git rm -r src/templates/<category>/<leaf>
   pnpm generate:templates
   ```
   Resolve `<category>/<leaf>` by the **actual directory**, not by splitting the key on `-` (a hyphenated leaf is ambiguous). The CLI's hint prints the correct path.

6. **Typecheck gate — run `pnpm tsc --noEmit` after the source is removed.** This is the hard catch for dangling references (the exact gate CI uses). If it fails, some code still imports the deleted template — fix each (repoint to another template, or delete the now-obsolete test case / import), then re-run until clean. Do this **before** handing off, so a broken build never reaches CI.

7. **Hand off to the human.** Stage is done; the human reviews the diff (`git status` will show: removed source dir, regenerated `_generated.ts`, deleted `public/thumbnails/template-<key>.webp`, plus any reference fixes) and commits / opens the PR. **Do not commit for them** unless asked.

## Orphan cleanup (source already gone)

If someone already `rm`'d a template dir and left DB/storage residue behind, run the same command with just the key — the CLI detects the missing source, skips the `git rm` step, and cleans DB + storage + public + `_generated.ts`. Same tool, no special mode.

## Done criteria

`pnpm template:delete <key> --apply` reports all residue removed + (if source existed) `git rm` staged and `pnpm generate:templates` run + `git status` shows a clean, reviewable diff. Then it's ready to commit / PR.
