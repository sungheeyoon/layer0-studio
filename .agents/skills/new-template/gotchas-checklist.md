# Template authoring — landmines checklist

The §10 traps from `docs/TEMPLATE_SYSTEM.md`, condensed for authoring. Re-read before writing section components. Each one fails **silently** or breaks the build / live sites.

## Component & library

- [ ] **`'use client'` component → meta goes in a sibling `<Name>.meta.ts`** (named export), registered as `libEntry(Component, meta)`. Server components (no `'use client'`) keep `Component.meta = {...}` inline + `libEntry(Component)`. Reason: client modules don't run their body on the server, so `Component.meta` is invisible to sync/validate → `Cannot read 'fieldsSchema' of undefined`. (§10.12)
- [ ] **`componentKey` is permanent.** Changing it breaks every live Site using it (renderer console.warn + blank section). New behavior = new key, never rename. (§10.2)
- [ ] **Don't edit `src/templates/_generated.ts`** — it's codegen. Adding a directory + `pnpm generate:templates` registers it. (§10.10)

## Fields & data

- [ ] **Every field `value` is a string** — numbers too (`value: '42'`; component does `Number(...)`). (§10.3)
- [ ] **`required: true` must be declared in `fieldsSchema`** or it's silently optional → empty at runtime. (§10.6)
- [ ] **`array` fields need `itemSchema`**; the component must guard `data.x?.items ?? []` (lazy migration — old Sites lack the array). Don't style by index (`idx === 0`) — order changes in the editor leave design stuck to the slot; put per-item style in `itemSchema` as a `select`. (§10.4, §10.5, §10.14)
- [ ] **`fieldsSchema` ↔ JSX must match both ways**: every declared field is read via `getFieldValue`, and every referenced field is declared. `pnpm template:verify` enforces this. (#16 / schema-jsx-consistency)

## Tokens & styling

- [ ] **No inline color/font literals** — only `var(--color-primary)`, `var(--font-base)`, etc. Inline `#hex` / `rgb()` / `hsl()` / `font-family: '...'` are an ESLint **error** (build fails). Whitelist: `transparent`, `inherit`, `currentColor`, `none`. Source-of-truth files `tokens.ts` / `template.ts` are exempt. (§6.3)
- [ ] **New Templates use the rich token pattern** — `tokens.ts` exports `defaultGlobalStyles` (thin, 5 user-editable fields) + `designTokens` (rich: colors/fonts/spacing/radius/shadows/typography). Pass `designTokens` to the site renderer in `index.tsx`. Do **not** add a `.module.css` with `@import url(...)` — legacy Templates do this and it's a migration burden + breaks tsx module loading (already worked around in scripts via register-css-stub, but new Templates should just not need it). (§2.5, ADR-0005)

## Canvas size (viewport / hero / thumbnail)

- [ ] **Design for the canonical desktop viewport `1600 × 900`** — that's the `viewport` every `thumbnail.config.ts` captures at, so it's literally the screen the design is validated against. (§2.7)
- [ ] **Only the first section (hero) fills the screen** — use `min-h-[100dvh]` (or `min-h-[calc(100vh-4rem)]` if a 4rem nav sits above it), matching the shipped templates. At 900px tall that frames the hero at ~836px. **Subsequent sections are free-form height** (content-sized) — the full-screen rule is the first-impression only. (§2.7)
- [ ] **Leave `thumbnail.config.ts` at the standard `viewport 1600×900 → resize 800×450`** unless there's a reason. The editor live preview renders at 1440 desktop width (fill-to-panel, adaptive height); 1440 vs 1600 render the same layout (no `2xl:` breakpoints), so a full-viewport hero shows full-screen in the editor too. (§2.7)

## Files & sync

- [ ] **`thumbnailPath` ↔ `thumbnail.config.ts` `output` extension must match** (`.webp`/`.jpg`), or sync uploads the wrong/old file. (§10.1)
- [ ] **Sync only touches `templates`, never `user_sites`.** Existing Sites keep old data until the user next edits — write components with graceful fallbacks. (§10.9)

## Site type

- [ ] **Single vs Multi changes how `template.ts` is authored.** `ContentModel` is a discriminated union (`mode` / `SiteMode`) — narrow with `isSingleContent` / `isMultiContent`, iterate with `allSections()`. (ADR-0007 / ADR-0013)
  - **Single** (`mode:'single'`, `sections[]`): preset's `content` is the `{ mode:'single', ... }` union, written directly (the legacy `composition: PresetSection[]` short-hand was removed — ADR-0007).
  - **Multi** (`mode:'multi'`, `shared:{header,footer}` + `pages[]`): write `template.ts`'s `content` `{ mode:'multi', ... }` union by hand; clone `src/templates/outdoor/default` (능선) as the template. Each page carries `slug` + `nav:{visible,label}`; `visible` and `nav.visible` are independent axes; nav is **projected** by `deriveNav` / `deriveFooterNav`, never stored as a section. `index.tsx` uses `RenderMultiSite`.

## Verify loop & environment (learned the hard way)

- [ ] **New Category slug → add an i18n label** in **both** `src/lib/i18n/messages/ko.ts` and `en.ts` under `templatesCatalog.categoryLabels` (the `Messages` type derives from `ko.ts`, so a key missing in `en.ts` is a tsc error; a key missing entirely makes the catalog show the **raw slug** e.g. "Academy" instead of "학원"). `categoryLabel()` lowercases before lookup, so key it lowercase (`academy`).
- [ ] **Capture needs Chromium installed first** — `pnpm template:capture` (and the `capture` step of `template:verify`) launches Playwright. On a fresh machine it errors `Executable doesn't exist …chrome-headless-shell`. Run **`pnpm exec playwright install chromium`** once, then re-run.
- [ ] **Stale `.next/dev/types` can fake a tsc failure** — if `tsc`/verify reports route errors in files you never touched (e.g. `.next/dev/types/validator.ts: Cannot find module '…/page.js'`), it's a stale Next type artifact, not your template. `rm -rf .next` and re-run. (These never mention your template dir — a tell.)
- [ ] **Don't copy corporate/default's styling idiom** — that legacy template uses bare semantic Tailwind classes (`text-primary`, `bg-surface`, `border-outline-variant`) that resolve to **chrome** tokens, plus `--theme-*` vars. New Templates use the **rich token** pattern: reference the injected vars as Tailwind arbitrary values — `text-[var(--color-primary)]`, `bg-[var(--color-surface-soft)]` — and pass `designTokens` to the renderer in `index.tsx`. Clone cafe/default or outdoor/default for the idiom, not corporate. (§2.5)
- [ ] **`template:verify` on Windows** — the spawn steps must run pnpm through a shell (`spawnSync('pnpm', …, { shell: true })`); a bare `spawnSync('pnpm')` throws ENOENT and spawning `pnpm.cmd` throws EINVAL (Node CVE-2024-27980), both surfacing as a bogus "tsc failed but no diagnostic mentions the template dir". Fixed in `scripts/lib/validate-and-capture.ts` — don't reintroduce a bare-string pnpm spawn.
- [ ] **`template:sync` dry-run hits the DB** — it needs `.env.local` + network; failing locally (or crashing on Windows libuv teardown) does **not** mean the template is wrong. Registration is automated post-deploy anyway (ADR-0012); the local sync is optional preview, not a gate.
