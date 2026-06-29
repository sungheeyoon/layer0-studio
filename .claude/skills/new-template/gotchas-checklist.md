# Template authoring — landmines checklist

The §10 traps from `docs/TEMPLATE_SYSTEM.md`, condensed for authoring. Re-read before writing section components. Each one fails **silently** or breaks the build / live sites.

## Component & library

- [ ] **`'use client'` component → meta goes in a sibling `<Name>.meta.ts`** (named export), registered as `libEntry(Component, meta)`. Server components (no `'use client'`) keep `Component.meta = {...}` inline + `libEntry(Component)`. Reason: client modules don't run their body on the server, so `Component.meta` is invisible to sync/validate → `Cannot read 'dataSchema' of undefined`. (§10.12)
- [ ] **`componentKey` is permanent.** Changing it breaks every live Site using it (renderer console.warn + blank section). New behavior = new key, never rename. (§10.2)
- [ ] **Don't edit `src/templates/_generated.ts`** — it's codegen. Adding a directory + `pnpm generate:templates` registers it. (§10.10)

## Fields & data

- [ ] **Every field `value` is a string** — numbers too (`value: '42'`; component does `Number(...)`). (§10.3)
- [ ] **`required: true` must be declared in `dataSchema`** or it's silently optional → empty at runtime. (§10.6)
- [ ] **`array` fields need `itemSchema`**; the component must guard `data.x?.items ?? []` (lazy migration — old Sites lack the array). Don't style by index (`idx === 0`) — order changes in the editor leave design stuck to the slot; put per-item style in `itemSchema` as a `select`. (§10.4, §10.5, §10.14)
- [ ] **`dataSchema` ↔ JSX must match both ways**: every declared field is read via `getFieldValue`, and every referenced field is declared. `pnpm template:verify` enforces this. (#16 / schema-jsx-consistency)

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

- [ ] **Single vs Multi changes how `template.ts` is authored.** `TemplateJson` is a discriminated union (`mode`) — narrow with `isSingleTemplate` / `isMultiTemplate`, iterate with `allSections()`. (ADR-0007)
  - **Single** (`mode:'single'`, `sections[]`): preset uses `composition: PresetSection[]`; sync converts it.
  - **Multi** (`mode:'multi'`, `shared:{header,footer}` + `pages[]`): **`composition` does NOT work** — `deriveTemplateJsonFromPreset` only ever emits one page (§9-H). Write `template.ts`'s `templateJson` union by hand; clone `src/templates/corporate/multipage` as the template. Each page carries `slug` + `nav:{visible,label}`; `visible` and `nav.visible` are independent axes; nav is **projected** by `deriveNav` / `deriveFooterNav`, never stored as a section. `index.tsx` uses `RenderMultiSite`.
