# Layer0 Studio

A no-code website builder. Users pick a **Template**, edit it visually, and publish it to a public URL as a **Site**.

This file is the vocabulary only — one or two sentences per term, plus the words to avoid. Reasoning lives in `docs/adr/`; operational detail lives in `CLAUDE.md` and `docs/TEMPLATE_SYSTEM.md`.

## Language

### Sites and Templates

**Site**:
A User's own editable, publishable website, created from a Template. Its `content` is deep-copied at creation, so it is decoupled from its Template from that moment on.
_Avoid_: UserSite (DB name only), user-site, project, page.

**Site Type (Single / Multi)**:
Whether a Site is one continuous scroll (**Single**) or a set of routable **Pages** (**Multi**). Fixed at creation — a Single never *evolves* into a Multi ([ADR-0007](./docs/adr/0007-single-multi-site-type-structural-union.md)).
_Avoid_: mode (the literal discriminator — fine in code, not in conversation).

**Template**:
A designer-built blueprint that Users instantiate into Sites. Self-contained in code (its own design tokens, Section components, Renderer) and a row in the `templates` table, with status `draft | active | archived`.
_Avoid_: Theme (deprecated). Preset (the source, not the row).

**Category**:
A catalog bucket grouping Templates by domain (`cafe`, `medical`, `legal`, …). Nothing is code-shared within a Category — Templates own independent copies of everything ([ADR-0001](./docs/adr/0001-beta-model-template-isolation.md)).
_Avoid_: Theme, tag, group.

**Preset**:
The code-side seed configuration for one Template — its Sections, design tokens, and global styles — written as a `template.ts`. A Preset and its Template are 1:1 but live in different layers (code vs DB).
_Avoid_: Template (the row, not the source). Seed, fixture, default.

### Content structure

**Page**:
A routable unit within a **Multi** Site — its own `slug`, an ordered list of Sections, and a `nav`. **Single Sites have no Pages.**
_Avoid_: tab, screen; for a Single Site, don't say Page at all.

**Section**:
A single placed unit — typically a horizontal band like a hero, feature list, or footer — living directly on a Single Site or inside a Multi Page. Carries a `type` pointing at a Section component and a `fields` payload.
_Avoid_: block, widget, module.

**Section component**:
The React renderer that turns a Section's `fields` into UI. Lives inside its Template's directory and declares its own `fieldsSchema`. Only say this when distinguishing the renderer from the placed instance.
_Avoid_: library component.

**Field**:
A single typed editable property inside a Section's `fields` — `text`, `textarea`, `image`, `url`, `color`, `number`, `select`, or `array`. An **array Field** holds an ordered list of repeating items validated against an `itemSchema`.
_Avoid_: input, property, attribute, prop.

**Shared sections**:
A Multi Site's `shared.header` and `shared.footer` — Section lists rendered above and below **every** Page. Single Sites have none; their nav and footer live inline in `sections[]`.

**nav projection**:
The navigation menu is **not stored** — it is derived on each render from its source (Single: the Sections, as anchors; Multi: the Pages, as slugs). Reordering the source reorders the nav.
_Avoid_: nav config, menu data (there is no stored nav object).

**`visible` vs `nav.visible`**:
Two **independent** axes. `visible` = whether it is served at all (a Multi Page with `visible:false` 404s). `nav.visible` = whether it appears in the menu. So an item can be present yet hidden from nav — a privacy-policy Page reachable only from the footer, for instance.

### Design

**Design Tokens**:
A Template's complete visual identity as a typed object — `colors`, `fonts`, `spacing`, `radius`, `shadows`, `typography`. Code-owned, never user-editable, injected at the template root as CSS custom properties. **Not copied per Site** — the renderer imports them at serve time, so an edit here restyles every existing Site on that Template. That is the intended fleet-wide repair channel; a redesign forks to a new leaf instead.
_Avoid_: theme tokens, palette, design system, CSS variables (the mechanism, not the concept).

**Global Styles**:
The small set of user-editable visual knobs carried inside a Template — `primaryColor`, `secondaryColor`, `backgroundColor`, `fontFamily`, `fontSize`. Editing them in the Editor overlays specific Design Tokens. Unlike Design Tokens they are **copied per Site**, so changing a Template's defaults never reaches a Site that already exists.
_Avoid_: globalStyles (the field name, fine in code), theme overrides, brand settings.

### Editing and serving

**Editor**:
The authenticated visual surface a User uses to modify their Site — edit Fields, reorder Sections or Pages, toggle `visible` / `nav.visible`. Users **cannot create or delete** Pages or Sections; the information architecture is template-author-defined.
_Avoid_: builder, designer, dashboard.

**Renderer**:
The runtime code path that turns a Site's content into served HTML, for both Live Sites and the in-editor preview. Per-**Template**, never per-Site — every Site of one `templateKey` shares it.
_Avoid_: theme runtime, view.

**Blocking rule / Warning rule**:
The two kinds of content-validation rule, separated by whether a rule has standing to **stop a save**. Blocking = saving would break the Renderer or corrupt the content; Warning = the result merely looks wrong ([ADR-0015](./docs/adr/0015-edit-loss-paths-exhaustive-defense.md)).
_Avoid_: error/warn (the field names — fine in code), strict/loose, hard/soft.

**Publish** (verb):
The User action taking a Site from not-yet-served to **Live** for the first time. One-way for Users — there is no user-level un-publish.
_Avoid_: deploy, release, go-live.

**Live** (adjective):
A Site is Live when it is currently served at its public URL. The two non-Live states are *draft* (never Published) and **Suspended**.
_Avoid_: active (the status string — fine in code), published (overloaded with `publishedAt`).

**Suspended**:
A state an admin can put a Site into to take it down. Distinct from draft — a Suspended Site has been Published at least once.
_Note_: reachable at the use-case level only; the admin UI that triggered it was removed.

**Subdomain**:
The slug a User picks to publish their Site under — the `myshop` in `myshop.layer0.studio`. **Required to Publish.** Subdomain serving is designed but **not implemented** — Sites are served at the path-based `/site/<slug>` today ([ADR-0009](./docs/adr/0009-subdomain-public-serving.md)).
_Avoid_: domain (overloaded — see below), slug, hostname, URL.

**Sync** (verb):
The operation reconciling Presets (code) into Template rows (DB). Dry-run by default; runs automatically after a successful production deploy ([ADR-0012](./docs/adr/0012-template-publishing-pipeline.md)).
_Avoid_: deploy, apply (one phase, not the operation), reconcile, promote.

### Assets and accounts

**User**:
An authenticated principal. Role is either `user` (the default) or `admin`.

**Asset**:
A user-uploaded image used inside a Site. Every Asset is **two things at once** — a metadata record and a stored binary — and its lifecycle covers both: `pending` → `active` → erased.
_Avoid_: file, upload, image (in domain talk). Never call an Asset "deleted" while its binary still exists.

**Tombstone**:
A durable record that a stored binary **must be destroyed**, holding the storage path and nothing else. Its defining property is that it **outlives the Asset record that referenced it** ([ADR-0014](./docs/adr/0014-account-erasure-tombstone-pipeline.md)).
_Avoid_: orphan (an orphan record still *exists* but is unused — the opposite case), cleanup task, pending delete.

**Account Erasure**:
The irreversible operation destroying everything a User owns — Sites, Assets, stored binaries, and the auth principal. Deliberately not "deletion": it spans DB, storage, and auth, so it cannot be one statement ([ADR-0014](./docs/adr/0014-account-erasure-tombstone-pipeline.md)).
_Avoid_: account deletion, account removal, deactivation, GDPR delete.

## Relationships

- A **Template** defines its own **Design Tokens** and carries a **Global Styles** overlay the **User** can edit.
- A **Template** owns its **Section components** and its single **Preset**, and belongs to exactly one **Category**. Nothing is shared across Templates.
- A **User** owns many **Sites**; each **Site** comes from at most one **Template**.
- A **Single** Site has ordered **Sections** directly. A **Multi** Site has **Pages** plus **Shared sections**; each **Page** has ordered **Sections**. A **Section** has many **Fields**.
- A **Site** owns many **Assets**. Removing an Asset record emits a **Tombstone** that outlives it.
- A **Site** becomes **Live** when its User **Publish**es it; an admin can **Suspend** it.
- The **Editor** writes a Site's content; the **Renderer** reads it.

## Example dialogue

> **Dev:** "Customer's confused — they updated their menu but their **Site** still shows the old items."
> **PM:** "Did they save in the **Editor**? Auto-save fires a few seconds after they stop typing, and leaving flushes whatever is pending — so an edit only goes missing if the save itself failed. Did they see an error?"
> **Dev:** "They saved. But the **Site** is **Live** — does the **Renderer** cache?"
> **PM:** "The Live **Renderer** reads fresh **Site** content per request. Different question — is this a **Site** from the cafe **Template**, or a custom one?"
> **Dev:** "From the cafe **Template**. The menu's an **array Field** on the menu **Section**."
> **PM:** "A cafe is a **Single** Site — no **Pages**, all Sections in one scroll. So check that Section's `visible`, and that they edited the right one."

## Flagged ambiguities

- **"copy" / "shared" span two independent axes.** *Template ↔ Template (code):* nothing is shared; each Template owns independent copies ([ADR-0001](./docs/adr/0001-beta-model-template-isolation.md)). *Site ↔ Template (runtime):* the content **data** is deep-copied per Site, but the **Renderer code** is shared by every Site of that `templateKey`. Net: a Site duplicates a few KB of JSON, never components. Name the axis before discussing storage cost or update propagation.
- **"domain" is overloaded three ways:** the **Subdomain** product concept (`user_sites.domain`), the Clean Architecture layer (`src/domain/`), and the future bring-your-own-hostname feature (no canonical word yet — pin one when it's on the table).
- **"publish" is overloaded two ways:** a User **Publish**es their Site (draft → Live), and a Template becomes catalog-visible (`status = active`). The code→DB reconcile is **Sync**, never "publish". The capability name `canPublishTemplates` predates the distinction and stays as-is ([ADR-0006](./docs/adr/0006-canpublishtemplates-separate-from-admin.md)).
- **"delete" is overloaded three ways, and the collision caused a real defect:** a User ending their account is **Account Erasure**; removing an **Asset** record is not the same as destroying its binary (that half is the **Tombstone**); `pnpm template:delete` is a dev-time CLI. Before [ADR-0014](./docs/adr/0014-account-erasure-tombstone-pipeline.md) the model had no word for the second half, so "deleted the asset" meant either thing — and account erasure did only the first.
- **"theme" is historical.** Visual identity is per-Template (**Design Tokens**); catalog grouping is **Category**. Reading old PRs, translate "theme" to whichever job it was doing. Code residue was cleared in migration 013 (`themeKey` → `templateKey`) and PR #19 (`src/themes/` → `src/templates/`).
- **"composition" was never a separate concept** — it is the ordered **Section** list of a Site or Page. Say "the Site's Sections", never "the composition".
- **Code identifiers that are not domain terms:** `templateKey` (= `<category>-<leaf>`) and "leaf" are internal — say "the cafe-default Template". `ContentModel` (formerly `TemplateJson`, [ADR-0013](./docs/adr/0013-content-model-rename.md)) is the entity-neutral name for the content shape both a Template and a Site hold; that rename changed **type names only** — Section, Field, Page, nav, Shared sections all kept theirs. A Section's `fields` container was `data` until migration 022, and its eyebrow Field was `data.label` until migration 018; both appear in old PRs.
