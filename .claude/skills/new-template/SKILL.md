---
name: new-template
description: Author a new website Template for layer0-studio (self-contained dir = tokens + section library + preset + renderer), then drive it through the verify gate. Use when asked to "새 템플릿 만들어줘", build a "[category] 페이지", add a Template, or do commissioned custom-page work. Dev-time code-PR workflow — end users never create Templates.
---

# new-template

Authoring a new Template is a **dev-time** task (you/admin stock the catalog or build a commissioned page). Users never create Templates. A Template is a self-contained directory under `src/templates/<category>/<leaf>/` with 6 files; nothing is shared across Templates (ADR-0001).

## Read first (knowledge lives in the repo, not here)

- **`docs/TEMPLATE_SYSTEM.md`** is the single source of truth. Read **§9** (extension scenarios A/C/D), **§6** (validate rules), **§2.5** (rich design tokens). Don't duplicate it — follow it.
- **`gotchas-checklist.md`** (this dir) — the §10 landmines. Re-read it before writing any section component. These are the things that silently break.
- Reference Templates: `src/templates/cafe/default/` (rich tokens demo), `src/templates/corporate/default/` (simplest).

## Workflow

1. **Pick the Site Type first — Single or Multi** (this decides how `template.ts` is written; ADR-0007, TEMPLATE_SYSTEM.md §9-H):
   - **Single** (default — one continuous scroll, e.g. a self-intro / landing page): the preset uses a **`composition: PresetSection[]`** array; sync's `deriveTemplateJsonFromPreset` turns it into the Single union. Clone the closest single Template (`src/templates/<cat>/default`).
   - **Multi** (routable pages, e.g. "outdoor brand with Home / Story / Products / Stores"): **do NOT use `composition`** — composition only ever emits one page. Instead **clone `src/templates/corporate/multipage`** (the only Multi example) and hand-write `template.ts`'s `templateJson: { mode:'multi', shared:{ header, footer }, pages:[ { slug, nav:{visible,label}, sections:[...] } ] }` union directly. Nav is projected by `deriveNav` (don't store it as a section). Served at `/site/[domain]/[[...slug]]`; renderer is `renderMultiSite`.
2. **Pick the directory path** (TEMPLATE_SYSTEM.md §9):
   - New variant of an existing category → clone the closest Template: `cp -r src/templates/<cat>/<src> src/templates/<cat>/<leaf>` then edit.
   - New concept/category → `pnpm template:scaffold` for an empty skeleton (Single shape).
   - New category slug must match `^[a-z][a-z0-9-]{0,39}$`.
3. **Fill the files** — `tokens.ts`, `library/*.tsx` (+ `library/index.ts`), `template.ts` (preset: `composition` for Single / `templateJson` union for Multi), `thumbnail.config.ts`, `index.tsx` (Single → `RenderSingleSite`, Multi → `RenderMultiSite`). Use the **rich token pattern** (`tokens.ts` exports `defaultGlobalStyles` + `designTokens`); do **not** add a `.module.css` with `@import` (see gotchas #6, #7).
4. **Hard rules** (the rest are in the doc): `templateKey = <category>-<leaf>` and is permanent; section array order = render order; every field `value` is a string. Color/font only via `var(--*)` — never inline hex (ESLint **error**).
5. **Images** — for `type:'image'` fields, decide a query string and host it:
   `pnpm template:image <templateKey> "<query>" [wide|square|portrait]` → prints the public URL to paste into the preset.
6. **Verify loop** — run in order; **fix failures and re-run until all green**:
   ```
   pnpm generate:templates        # register the new dir into _generated.ts (never edit that file)
   pnpm tsc --noEmit              # types
   pnpm lint                      # inline-token rule (error) + chrome rules
   pnpm test                      # validate rules (vitest)
   pnpm template:verify <key>     # full gate incl. dataSchema↔JSX consistency (the unique check)
   pnpm template:capture <key>    # thumbnail
   ```
7. **Visual check** — open `/preview/preset/<templateKey>` and confirm it renders (Multi: check each page route).
8. **Reflect to DB** — `pnpm template:sync` (dry-run, review the diff) → commit/PR → admin Apply (gated on `canPublishTemplates`). Never bypass sync for the `templates` table.

## Done criteria

All verify-loop commands green + `/preview/preset/<key>` looks right + `pnpm template:sync` dry-run shows the expected diff. Then it's ready to PR.
