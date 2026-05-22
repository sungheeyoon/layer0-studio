# Layer0 Studio

A no-code website builder. Users pick a **Template**, edit it visually, and publish it to a custom subdomain as a **Site**.

## Language

**Site**:
A user's own editable, publishable website — created from a Template and owned by one User. (Admins may also create Sites with no Template — `templateId: null` — but this is rare and not a user-facing flow.)
_Avoid_: UserSite (internal/DB name only), user-site, project, page (a Site contains Pages).

**Template**:
A designer-built (or **Generate**d) blueprint that Users instantiate into Sites. Each Template is self-contained in code (its own design tokens, section components, renderer) and lives as a row in the `templates` table; has a status of `draft | active | archived`. Produced by **Sync**'ing its **Preset**. Currently 9 Templates across 7 **Categories**.
_Avoid_: Theme (deprecated — see Flagged ambiguities). Preset (the source, not the row).

**Category**:
A catalog bucket that groups Templates by domain — currently `cafe`, `corporate`, `fitness`, `interior`, `legal`, `medical`, `wedding` (7 total). A Template's category is reflected in its directory path and (today) in its `templateKey`. Code-shared across a Category is **nothing** under the β model — Templates inside the same Category own independent copies of every component, token, and style (see [ADR-0001](./docs/adr/0001-beta-model-template-isolation.md)).
_Avoid_: Theme (the old name for this bucket — see Flagged ambiguities), tag, group.

**Preset**:
A code-side seed configuration — Sections, design tokens, and global styles — for one Template, written as a `.preset.ts` (or `template.ts`) file. The source of truth: `pnpm template:sync` reads Presets and upserts matching Template rows (see [ADR-0002](./docs/adr/0002-templates-source-of-truth-is-code.md)). A Preset and its Template are 1:1 but live in different layers (code vs DB).
_Avoid_: Template (the row, not the source). Seed, fixture, default.

**Design Tokens**:
A Template's complete visual identity expressed as a typed object — `colors`, `fonts`, `spacing`, `radius`, `shadows`, `typography`. Code-fixed (defined alongside the Template's other source), never user-editable. Injected at the template root as CSS custom properties (`--color-primary`, `--font-base`, `--spacing-md`, …) so Section components reference them via `var(...)`. Generate's *propose design tokens* stage emits this shape directly. Currently the rich pattern is fully wired in **cafe-default** only — the other 8 Templates still ship legacy per-Template CSS variables ([ADR-0005](./docs/adr/0005-design-tokens-gradual-migration.md): intentional gradual migration).
_Avoid_: theme tokens, palette, design system (broader concept), CSS variables (the mechanism, not the concept).

**Global Styles**:
A small set of user-editable visual knobs carried inside a Template — `primaryColor`, `secondaryColor`, `fontFamily`, `fontSize`, `layout`. Editing them in the **Editor** overlays specific **Design Tokens** entries via the `OVERLAY_MAP` (`primaryColor → --color-primary`, etc.). The User-facing surface for branding a **Site** without code.
_Avoid_: globalStyles (the literal field name, fine in code), theme overrides, brand settings.

**Page**:
A unit within a Site (or Template) with its own slug and ordered list of Sections.

**Section**:
A single placed unit on a Page — typically a horizontal band like a hero, feature list, FAQ, or footer. Each Section has a `type` that points at a Section component by `componentKey`, plus a `data` payload of editable Fields.
_Avoid_: block, widget, module.

**Section component**:
The React renderer that turns a Section's `data` into UI. Lives **inside its Template's directory** and declares its own `dataSchema`. Not shared across Templates (β model). Only used when distinguishing the renderer from the placed instance — in normal conversation, say **Section**.
_Avoid_: library component (it's *a* library component, but the canonical name is Section component).

**Field**:
A single typed editable property inside a Section's `data` — e.g. a heading text Field, a hero image Field, a brand color Field. Each Field has a type (`text`, `textarea`, `image`, `url`, `color`, `number`, `select`, `array`). An **array Field** holds an ordered list of repeating items (e.g. menu entries, FAQ rows), each item itself a dictionary of Fields validated against an `itemSchema`.
_Avoid_: input, property, attribute, prop.

**Asset**:
A user-uploaded image used inside a Site. Has a lifecycle: `pending` (reserved) → `active` (confirmed in use). The Reserve-Confirm pattern exists to handle uploads that abort mid-flight (see [ADR-0003](./docs/adr/0003-asset-upload-two-phase-cleanup.md)).
_Avoid_: file, upload, image (in domain talk).

**User**:
An authenticated principal. Role is either `user` (the default) or `admin`.

**Subdomain**:
The slug a User picks to publish their Site under — the `myshop` in `myshop.layer0.studio`. Stored in `user_sites.domain`; validated by `validateDomainSlug`; rejects entries in `RESERVED_DOMAINS`. Lowercase letters, digits, hyphens; 3–50 chars; no leading/trailing hyphen.
_Avoid_: domain (overloaded — see Flagged ambiguities), slug, hostname, URL.

**Publish** (verb):
The User action that takes a Site from not-yet-served to **Live** for the first time. One-way for Users — there is no user-level un-publish. Re-publishing (e.g. after admin suspension) re-stamps `publishedAt`.
_Avoid_: deploy, release, go-live (the noun phrase).

**Live** (adjective):
A Site is Live when it is currently being served at its Subdomain. Equivalent to `status === 'active'`. The two non-Live states are *draft* (never Published) and **Suspended** (admin-disabled).
_Avoid_: active (the literal status string, fine in code; "Live" in conversation), published (overloaded with `publishedAt`).

**Suspended**:
A state an admin can put a Site into to take it down. Distinct from draft — a Suspended Site has been Published at least once, evidenced by a non-null `publishedAt`. While Suspended, the Site is not Live.

**Sync** (verb):
The operation that reconciles Presets (code) into Templates (DB). Reads every Preset file, validates each Section against its Section component's `dataSchema`, and upserts matching Template rows. Dry-run by default; commits only with `--apply`. The admin UI mirrors this as a 2-step Preview → Apply flow, gated on the `canPublishTemplates` capability — *not* the admin role (see [ADR-0006](./docs/adr/0006-canpublishtemplates-separate-from-admin.md)). Logged to the `template_sync_audit` table.
_Avoid_: deploy, apply (a single phase, not the whole operation), reconcile, promote.

**Generate** (verb):
The operation that synthesizes a new **Preset** from a natural-language brief via an LLM pipeline. CLI: `pnpm template:generate "<brief>"`. Runs four stages — *propose composition* → *propose design tokens* → *generate sections* → *validate & capture thumbnail* — plus a new-category approval gate, then writes six files under `src/templates/<category>/<leaf>/`. Produces code (a Preset), not a DB row — **Sync** is still required afterwards to reflect the result into the `templates` table.
_Avoid_: Tracer (an internal PR-series label, not a product term), scaffold (the lower-level `pnpm template:scaffold` skeleton-only command), AI gen.

**Editor**:
The authenticated visual editing surface a User uses to modify their Site. Loads the Site's Template at runtime; lets the User edit each Section's Fields and reorder Sections within a Page. Persists edits through an optimistic-concurrency RPC that rejects stale writes (see [ADR-0004](./docs/adr/0004-optimistic-concurrency-via-rpc.md)). Distinct from the **Renderer**.
_Avoid_: builder, designer, dashboard.

**Renderer**:
The runtime code path that turns a Site's content into served HTML — both for Live Sites and for the in-editor preview. Each Template ships its own Renderer. Distinct from the **Editor**: the Renderer never mutates Site state, the Editor never serves to the public.
_Avoid_: theme runtime, view.

## Relationships

- Each **Template** defines its own **Design Tokens** in code; a **Template** carries a **Global Styles** overlay that the **User** can edit in the **Editor** to override a small subset of those tokens.
- Each **Template** owns its **Section components** and its single **Preset** (β model — no cross-Template sharing).
- A **Preset** is either hand-authored or **Generate**d from a brief; either way it is then **Sync**'d into exactly one **Template** row. A **Template** belongs to exactly one **Category**.
- A **User** owns many **Sites**; each **Site** is created from at most one **Template** (or none, admin-only).
- A **Site** has many **Pages**; a **Page** has many ordered **Sections**; a **Section** has many **Fields**.
- A **Site** owns many **Assets**, referenced from its **Section** image Fields.
- A **Site** becomes **Live** when its **User** **Publish**es it; an admin can **Suspend** a Live Site.
- The **Editor** writes to a Site's content; the **Renderer** reads it (both in-editor preview and when serving the Live Site).

## Example dialogue

> **Dev:** "Customer's confused — they updated their menu but their **Site** still shows the old items."
> **PM:** "Did they hit save in the **Editor**? Auto-save fires after a few seconds of idle, so a hard refresh while typing could lose the in-flight edit."
> **Dev:** "They saved. But the **Site** is **Live** — does the **Renderer** cache?"
> **PM:** "The Live **Renderer** reads fresh **Site** content per request. Different question — is this a **Site** they made from the **cafe Template**, or a custom one?"
> **Dev:** "From the cafe **Template**. The menu's an **array Field** on the menu **Section**."
> **PM:** "Then check whether they were editing a **Page** that's actually in the published version. The menu **Section** might be on a different **Page** than the one they think."

## Flagged ambiguities

- "site" was used loosely to mean both the user's editable instance and the published artifact — resolved: the entity is always a **Site**; "publishing" is a state change, not a different thing.
- "domain" is overloaded three ways: (1) the **Subdomain** product concept (`user_sites.domain` column, the slug a User publishes under), (2) the Clean Architecture layer (`src/domain/`), (3) reserved for the future "bring-your-own custom hostname" feature. The product concept is always called **Subdomain** in conversation. The architecture layer is implementation jargon, not a domain term. The full custom hostname has no canonical word yet — pin one when that feature is on the table.
- "publish" is overloaded two ways: (1) a User **Publish**es their own Site (draft → Live); (2) an admin "publishes" a Template into the catalog by running Sync — this is what the `canPublishTemplates` capability gates. The User action is called **Publish**; the admin action is called **Sync**. The capability name `canPublishTemplates` predates this distinction and is kept as-is in code.
- "composition" appears throughout the code (`RenderComposition`, `propose_composition`, the legacy `composition: PresetSection[]` field) but is **not** a separate domain concept — it is the ordered **Section** list of a **Page**. In conversation always say "the Page's Sections", never "the composition".
- "theme" is a **historical** term. The visual identity is now per-Template (**Design Tokens**); the catalog grouping is now **Category**. Code residue: `themeKey` was renamed to `templateKey` in migration 013 (PR #18); `src/themes/` was migrated to `src/templates/<category>/<leaf>/` in PR #19 (β model). When reading old PRs or docs, mentally translate "theme" → either Template or Category depending on which job it was doing.
- `templateKey` (= `${category}-${leaf}`, e.g. `cafe-default`) is a code identifier, not a domain term. "leaf" is similarly internal — it just means the directory name under a Category. Don't promote either to conversation; say "the cafe-default Template" instead.
