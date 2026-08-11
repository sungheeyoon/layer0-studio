# Studio Design System

Single source of truth for the **Studio chrome** visual layer — landing, auth,
dashboard, editor, settings, admin, legal, error/404. Decided in
[ADR-0011](./adr/0011-studio-ui-redesign-shadcn-pretendard.md). If you are
adding or changing any chrome UI (a page, a component, a color, a button), read
this first. The lint guard will **fail your build** if you reach for raw colors.

> **Scope.** "Chrome" = everything the operator sees while using Studio. It does
> **NOT** include the published-Site renderers in `src/templates/**` — those have
> their own per-Template design tokens (see [ADR-0005](./adr/0005-design-tokens-gradual-migration.md))
> and are deliberately exempt from this system. Never apply shadcn tokens inside
> `src/templates/**`, and never apply template tokens to chrome.

---

## The rules (must follow)

1. **Color only through semantic tokens.** Never write a raw Tailwind palette
   class (`text-zinc-400`, `bg-red-500`, `border-blue-300`, …) or an arbitrary
   value (`bg-[#7d000c]`) in chrome. Use a token (table below). This is enforced
   by ESLint `local/no-raw-color-classes` at **error** severity.
2. **Icons = lucide-react only.** The `material-symbols` font was removed — using
   it renders broken literal text. `import { X } from "lucide-react"`.
3. **Font = Pretendard** (Korean-first), wired from the official package's
   unicode-range dynamic subset CSS → `--font-sans`. Never preload a single full
   Hangul font or import Pretendard from an external CDN. Never reintroduce Inter
   or the legacy `font-body` / `font-headline` / `font-label` utilities (also
   guard-blocked).
4. **Build UI from the shadcn primitives** in `src/components/ui/` (Button,
   Input, Label, Select, Card, Badge, Dialog, AlertDialog, Tabs, …). Don't
   hand-roll `<button>`/`<input>`/`<select>` with bespoke styling.
5. **Light + dark are both first-class.** Every token is defined for both. Test
   both themes (toggle is in the top nav). Never hardcode a color that only works
   in one theme.
6. **Verify before commit:** `pnpm tsc --noEmit` + `pnpm lint` (0 errors) +
   `pnpm build`.

---

## Token vocabulary

Defined in `src/app/globals.css` (`:root` = light, `.dark` = dark, exposed via
`@theme inline`). Use the Tailwind utility form: `bg-card`, `text-muted-foreground`,
`border-border`, etc.

| Token | Use for |
|---|---|
| `background` / `foreground` | Page base surface + default text |
| `card` / `card-foreground` | Raised panels, list items, modals |
| `popover` / `popover-foreground` | Floating menus, dropdowns |
| `muted` / `muted-foreground` | Subtle fills; **secondary text** (AA-safe) |
| `accent` / `accent-foreground` | Hover/active fills |
| `primary` / `primary-foreground` | Brand **Indigo** — actions only (CTAs, active nav) |
| `secondary` / `secondary-foreground` | Low-emphasis buttons/badges |
| `border`, `input`, `ring` | Hairlines, field borders, focus ring |
| `destructive` / `-foreground` | **Error / danger / delete** (red) |
| `success` / `-foreground` | **Saved / healthy / OK** (green) |
| `warning` / `-foreground` | **Caution / non-blocking warning** (amber) |
| `sidebar*` | Sidebar surface family (`bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-accent`, `border-sidebar-border`) |
| `chart-1..5` | Data-viz series |

**Status color contract** — the only three status hues, all token-based:
`destructive` (red), `success` (green), `warning` (amber). There is no fourth.
Opacity modifiers are fine for tints: `bg-warning/10`, `border-destructive/30`.

---

## How to…

### Choose a type role

Studio chrome has two density bands. Marketing surfaces may use
`text-display`/`text-heading`; working surfaces such as Dashboard, Editor,
forms, tables, and metadata use `text-title`/`text-body`/`text-caption`.
The `.studio-chrome` boundary supplies a compact Tailwind scale to chrome only.
Published Site and Template Preview routes intentionally stay outside that
boundary so a chrome typography change cannot restyle Template renderers.

Do not use `text-title` for a compact navigation brand or metadata label. A
smaller text utility with a 44px interaction target is preferred; readable text
size and touch target size are separate contracts.

### Add a shadcn component
```bash
npx shadcn@latest add <name>      # style: new-york, base: neutral, lucide icons
```
Lands in `src/components/ui/` (config: `components.json`). That dir is **exempt**
from the color guard (generated code), so primitives keep their internal classes.

### Add a brand-new token (only if no existing token fits)
Add it in **all three** places, or dark mode breaks:
1. `:root { --foo: oklch(...); }` in `globals.css`
2. `.dark { --foo: oklch(...); }` in `globals.css`
3. `@theme inline { --color-foo: var(--foo); }`

Then use `bg-foo` / `text-foo`. Prefer extending the existing vocabulary over
inventing tokens — most needs are already covered.

### Use radius / fonts
`rounded-sm|md|lg|xl` map to `--radius` (0.625rem). `font-mono` for code/IDs;
everything else inherits `--font-sans` (Pretendard).

---

## The guard: `eslint-rules/no-raw-color-classes.mjs`

Severity **error**. Scope: `src/app/**/*.tsx` + `src/components/**/*.tsx`,
excluding `src/components/ui/**` and `src/templates/**`.

**Blocks:** every Tailwind palette with a numeric scale — grays
(`zinc/neutral/gray/slate/stone`) **and** chromatics
(`red/orange/amber/…/blue/indigo/…/rose`) — across `text|bg|border|ring|fill|…`
utilities; legacy MD3 stems (`text-outline`, `bg-surface`, `*-container`, …);
legacy fonts (`font-body|headline|label`). Semantic tokens carry no numeric
scale, so they never trip it.

**Known gaps (denylist — catch these in review, the linter won't):**
- Arbitrary values: `bg-[#7d000c]`, `text-[#777]`
- Inline `style={{ color: … }}`
- Non-`.tsx` files (`.ts`, `.css`)
- `src/components/ui/**` and `src/templates/**` (intentionally exempt)

To run just the burn-down check: `pnpm lint | grep -c no-raw-color-classes`
(should stay **0**).

---

## Anti-patterns (do not)

- `className="text-gray-500"` → use `text-muted-foreground`
- `className="text-red-600"` for an error → `text-destructive`
- `className="text-green-600"` for success → `text-success`
- `style={{ background: '#fff' }}` → `bg-background` / `bg-card`
- `<button className="px-4 py-2 bg-black text-white rounded">` → `<Button>`
- material-symbols `<span>icon</span>` → `<IconName className="h-4 w-4" />` (lucide)
- Adding a color that only looks right in light mode

---

## Reference

- [ADR-0011](./adr/0011-studio-ui-redesign-shadcn-pretendard.md) — the decision + rationale
- `src/app/globals.css` — token definitions
- `src/components/ui/` — primitives · `components.json` — shadcn config
- `src/app/globals.css` — Pretendard dynamic subset wiring · `src/components/ThemeProvider.tsx` — next-themes
- `eslint-rules/no-raw-color-classes.mjs` — the guard
