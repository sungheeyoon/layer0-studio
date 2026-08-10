---
name: new-template
description: Author a new website Template for layer0-studio (self-contained dir = tokens + section library + preset + renderer), then drive it through the verify gate. Use when asked to "새 템플릿 만들어줘", build a "[category] 페이지", add a Template, or do commissioned custom-page work. Dev-time code-PR workflow — end users never create Templates.
---

# new-template

Authoring a new Template is a **dev-time** task (you/admin stock the catalog or build a commissioned page). Users never create Templates. A Template is a self-contained directory under `src/templates/<category>/<leaf>/`; nothing is shared across Templates (ADR-0001).

## Read first (knowledge lives in the repo, not here)

- **`docs/TEMPLATE_SYSTEM.md`** is the single source of truth. Read **§9** (extension scenarios A/C/D), **§2.3** (schema-first fields), **§6** (validate rules + §6.4 compatibility), **§2.5** (rich design tokens). Don't duplicate it — follow it.
- **`gotchas-checklist.md`** (this dir) — the §10 landmines. Re-read it before writing any section component. These are the things that silently break.
- Reference Templates: `src/templates/cafe/default/` (rich tokens + array + client-component meta), `src/templates/outdoor/default/` (the shipping Multi).

## The one thing that changed (ADR-0016)

**You write a schema. You do not write a Content interface, and there is no `getFieldValue`.** The schema is the single source of truth; the Content type is *derived* from it, so schema/renderer drift is impossible rather than merely validated.

```tsx
const heroSchema = {
  eyebrow: { type: 'text',     label: '상단 라벨' },
  title:   { type: 'textarea', label: '메인 타이틀', required: true },
  tone:    { type: 'select',   label: '톤', options: ['light', 'dark'], required: true },
  columns: { type: 'number',   label: '열 수', default: 3 },   // `default` is mandatory on number
  image:   { type: 'image',    label: '배경 이미지' },
  items:   { type: 'array',    label: '항목', minItems: 1, maxItems: 6,
             itemSchema: { title: { type: 'text', label: '제목', required: true } } },
} as const satisfies FieldsSchema;      // `as const` is load-bearing

type HeroContent = ValuesOf<typeof heroSchema>;

const Hero: SectionComponent = function Hero({ section }: TemplateSectionProps) {
  const content = section.fields as HeroContent;   // the one cast, at the boundary
  const eyebrow = content.eyebrow ?? '';           // optional Value → always fall back
  const imageUrl = content.image?.url;             // an image Value is { url, assetId? }
  const items = content.items ?? [];               // array Value may be absent
  // items.map(item => <li key={item.id}>{item.fields.title}</li>)  ← item.id, never idx
};
```

`required: true` → the key is mandatory in `HeroContent`; anything else → optional. `select` narrows to its `options` literals. Reading a key the schema does not declare is a **compile error** — that direction needs no gate. The reverse (declaring a field the JSX never reads) is caught by `template:verify`.

Both types come from `@/domain/entities/template.entity` (`FieldsSchema`, `ValuesOf`).

## Workflow

1. **Pick the Site Type first — Single or Multi** (this decides how `template.ts` is written; ADR-0007, TEMPLATE_SYSTEM.md §9-H):
   - **Single** (default — one continuous scroll, e.g. a self-intro / landing page): `content` is the `{ mode:'single', templateKey, globalStyles, sections:[ { id, type, visible, nav:{visible,label}, fields:{…} } ] }` union.
   - **Multi** (routable pages, e.g. "outdoor brand with Home / Story / Products / Stores"): `content` is `{ mode:'multi', templateKey, globalStyles, shared:{ header, footer }, pages:[ { id, slug, visible, nav:{visible,label}, sections:[…] } ] }`. **Clone `src/templates/outdoor/default`** (능선 — the shipping Multi example). Nav is projected by `deriveNav`; never store it as a section. Served at `/site/[domain]/[[...slug]]`.
2. **Create the directory** (TEMPLATE_SYSTEM.md §9):
   - New concept/category → **`pnpm template:scaffold <category>/<leaf>`**. It writes a Single skeleton (hero + array section + footer) that already passes the gate, in the shapes below — edit design, not wiring.
   - New variant of an existing category → clone the closest Template: `cp -r src/templates/<cat>/<src> src/templates/<cat>/<leaf>`, then change `slug` + `templateKey` in `template.ts` (both, to `<category>-<leaf>`).
   - New category slug must match `^[a-z][a-z0-9-]{0,39}$`, and a brand-new top-level category is a structural change — get explicit sign-off, then add a **lowercase** i18n label key to *both* `src/lib/i18n/messages/ko.ts` and `en.ts` under `templatesCatalog.categoryLabels`.
3. **Fill the files** — `tokens.ts`, `library/*.tsx` (+ `library/index.ts`), `template.ts` (the preset), `thumbnail.config.ts`, `index.tsx` (Single → `RenderSingleSite`, Multi → `RenderMultiSite`). Use the **rich token pattern** (`tokens.ts` exports `defaultGlobalStyles` + `designTokens`); do **not** add a `.module.css` declaring tokens (gotchas #6, #7).
4. **Hard rules** (the rest are in the doc):
   - `templateKey = <category>-<leaf>`, and it is **permanent**. So is every `componentKey`.
   - Section array order = render order. Only the **first** section (hero) is full-viewport height.
   - `fields` holds **Values**, not `{ type, label, value }` wrappers: `'MONO'`, `42`, `{ url: '…' }`, `[{ id, fields }]`. The schema says which.
   - Colour/font only via `var(--*)` — never an inline hex (ESLint **error**).
5. **Images** — for `type:'image'` fields, decide a query and host it:
   `pnpm template:image <templateKey> "<query>" [wide|square|portrait]` → prints the public URL to paste into the preset as `{ url: '<that>' }`.
6. **Verify loop** — run in order; **fix failures and re-run until all green**:
   ```
   pnpm generate:templates                        # register the new dir into _generated.ts (never edit it)
   pnpm template:verify <key> --skip-capture      # the fast inner loop (7 steps, capture skipped)
   pnpm template:verify <key>                     # once it's green: adds the Playwright thumbnail
   pnpm test                                      # only if you touched anything outside the template dir
   ```
   `template:verify` runs `tsc` → `eslint` → `validateContent` → inline-token file scan → **fieldsSchema↔JSX consistency** → `capture` → `thumbnailPath` match. It covers the `tsc`/`lint` steps for the template dir, so a separate full `pnpm lint` is only needed for chrome changes.
7. **Visual check** — the captured `.webp` *is* the design screen (1600×900). Look at it. For more than the hero, open `/preview/preset/<templateKey>` in a browser — `curl` shows no sections by design (the preview mounts the renderer client-side).
8. **Reflect to DB** — `pnpm template:sync` (dry-run, review the diff) → commit/PR. Registration is automatic post-deploy and **merge is the publish approval** (ADR-0012); the local sync is a preview, not a gate, and needs `.env.local`.

## Editing a Template that is already deployed

A renderer edit is a **fleet-wide** edit — every live Site on that `templateKey` loads the code at serve time. Schema changes must be **additive**: adding an optional field (with a renderer fallback), relaxing `required`, changing a `label`, *widening* `select options`. Renaming a field, adding a required one, changing a value type, narrowing `options`, or restructuring an `itemSchema` is **destructive** and needs a data migration in the same deploy. Full table: TEMPLATE_SYSTEM.md §6.4.

## Done criteria

`pnpm template:verify <key>` green (all 7 steps) + the thumbnail looks right + `pnpm template:sync` dry-run shows the expected diff. Then it's ready to PR.
