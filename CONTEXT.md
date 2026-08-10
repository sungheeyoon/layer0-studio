# Layer0 Studio

A no-code website builder. Users pick a **Template**, edit it visually, and publish it to a public URL as a **Site**.

This file is the vocabulary only — one or two sentences per term, plus the words to avoid. Reasoning lives in `docs/adr/`; operational detail lives in `CLAUDE.md` and `docs/TEMPLATE_SYSTEM.md`.

> ⚠️ **이 문서는 일부가 TO-BE(구현 대기)다 — 코드와 다르다.** **Block**, **Chrome**, **Menu**/`MenuEntry`, **Field**(스키마 서술자) / **Value**(인스턴스 데이터) 는 [ADR-0016](./docs/adr/0016-block-rename-and-field-value-split.md) 이 확정했지만 **아직 구현되지 않았다**. 코드는 여전히 `Section` / `SingleSection` / `shared` / `NavMeta` / `{type,label,value}` 를 함께 든 `Field` 다(`SingleContent.sections`, `Page.sections`, `MultiContent.shared`). 단일 빅뱅 마이그레이션 + codemod 로 일괄 전환 예정.
>
> **코드를 읽을 때는 ADR-0016 §2 의 AS-IS 열이 현재 진실이다.** 이 문서는 목표 어휘다. 나머지 항(Site/Template/Design Tokens/Asset/Account Erasure 등)은 코드와 일치한다.

## Language

### Sites and Templates

**Site**:
A User's own editable, publishable website, created from a Template. Its `content` is deep-copied at creation, so it is decoupled from its Template from that moment on.
_Avoid_: UserSite (DB name only), user-site, project, page.

**Site Type (Single / Multi)**:
Whether a Site is one continuous scroll (**Single**) or a set of routable **Pages** (**Multi**). Fixed at creation — a Single never *evolves* into a Multi ([ADR-0007](./docs/adr/0007-single-multi-site-type-structural-union.md)).
_Avoid_: mode (the literal discriminator — fine in code, not in conversation).

**Template**:
A designer-built blueprint that Users instantiate into Sites. Self-contained in code (its own design tokens, Block components, Renderer) and a row in the `templates` table, with status `draft | active | archived`.
_Avoid_: Theme (deprecated). Preset (the source, not the row).

**Category**:
A catalog bucket grouping Templates by domain (`cafe`, `medical`, `legal`, …). Nothing is code-shared within a Category — Templates own independent copies of everything ([ADR-0001](./docs/adr/0001-beta-model-template-isolation.md)).
_Avoid_: Theme, tag, group.

**Preset**:
The code-side seed configuration for one Template — its Blocks, design tokens, and global styles — written as a `template.ts`. A Preset and its Template are 1:1 but live in different layers (code vs DB).
_Avoid_: Template (the row, not the source). Seed, fixture, default.

### Content structure

> ⚠️ 이 절 **전체가 TO-BE** 다 — 문서 상단 배너 참조([ADR-0016](./docs/adr/0016-block-rename-and-field-value-split.md), 미구현).

**Page**:
A routable unit within a **Multi** Site — its own `slug`, a `name` (editor tab / page name, independent of nav), an ordered list of Blocks, and an optional `menu` (nav membership). **Single Sites have no Pages.**
_Avoid_: tab, screen; for a Single Site, don't say Page at all.

**Block**:
A single placed unit — typically a horizontal band like a hero, feature list, or footer — living directly on a Single Site or inside a Multi Page. Carries a `type` pointing at a Block component and a `fields` payload. The sole minimal content unit — "Section" is retired.
_Avoid_: section, widget, module.

**Block component**:
The React renderer that turns a Block's `fields` into UI. Lives inside its Template's directory and declares its own `fieldsSchema`. Only say this when distinguishing the renderer from the placed instance.
_Avoid_: library component, section component.

**Field**:
A schema-side descriptor, declared once in a Block component's `fieldsSchema` (code, developer-authored, rarely changes) — its `type`, `label`, `required`, `options`, and (for `array`) `itemSchema`. A Field never holds an instance's actual data; that is a **Value**.
_Avoid_: input, property, attribute, prop — and don't call an instance's data a "Field" (see **Value**).

**Value**:
The actual data a Block instance holds for one of its Fields — user-authored, stored per Site, changes often (a user adding a menu item is a Value change, not a schema change). Shaped by its Field's `type`: a scalar for `text`/`number`/`select`, `{ url, assetId? }` for `image` (an **ImageValue**), an ordered list of items for `array` — each item being `{ id, fields }`, mirroring how a Block carries its own `id` beside its `fields`. Never duplicates its Field's `type`/`label` — those live only in the schema.
_Avoid_: field value (conflates the two), data, content (too generic — say "a Block's Values").

**Chrome**:
A Multi Site's `chrome.header` and `chrome.footer` — Block lists rendered above and below **every** Page. Single Sites have none; their nav and footer live inline in `blocks[]`.
_Avoid_: shared (the old name — describes the mechanism, not the meaning: chrome = the site's fixed frame).

**Menu** (formerly nav projection):
The navigation menu is **not stored** — it is derived on each render from its source's `menu?: MenuEntry` (`{ label, placement? }`). A Single Block's **presence of `menu`** means "appears in nav" (no `placement` — Single nav is header-anchor only). A Multi Page's `menu` is independent of its `name`: `name` is the editor-tab/page name, `menu.label` is the nav text — a page can have a long `name` and a short nav `label`, and `placement` (`'header' | 'footer'`, default header) says which nav it lands in.
_Avoid_: nav config, menu data, `nav.visible` (retired — see below).

**`visible` vs `menu` (presence)**:
Two **independent** axes. `visible` = whether the Block/Page is served at all (a Multi Page with `visible:false` 404s, data preserved). **Presence of `menu`** = whether it appears in *some* nav; its absence means "reachable (if `visible`) but not in any menu" — a privacy-policy Page linked only from a footer link authored elsewhere, for instance. Replaces the old `nav.visible` boolean, which conflated "in the footer" with "in no nav at all" (couldn't tell them apart without a negation).

### Design

**Design Tokens**:
A Template's complete visual identity as a typed object — `colors`, `fonts`, `spacing`, `radius`, `shadows`, `typography`. Code-owned, never user-editable, injected at the template root as CSS custom properties. **Not copied per Site** — the renderer imports them at serve time, so an edit here restyles every existing Site on that Template. That is the intended fleet-wide repair channel; a redesign forks to a new leaf instead.
_Avoid_: theme tokens, palette, design system, CSS variables (the mechanism, not the concept).

**Global Styles**:
The small set of user-editable visual knobs carried inside a Template — `primaryColor`, `secondaryColor`, `backgroundColor`, `fontFamily`, `fontSize`. Editing them in the Editor overlays specific Design Tokens. Unlike Design Tokens they are **copied per Site**, so changing a Template's defaults never reaches a Site that already exists.
_Avoid_: globalStyles (the field name, fine in code), theme overrides, brand settings.

### Editing and serving

**Editor**:
The authenticated visual surface a User uses to modify their Site — edit Values, reorder Blocks or Pages, toggle `visible` / menu membership. Users **cannot create or delete** Pages or Blocks; the information architecture is template-author-defined.
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
- A **Template** owns its **Block components** and its single **Preset**, and belongs to exactly one **Category**. Nothing is shared across Templates.
- A **User** owns many **Sites**; each **Site** comes from at most one **Template**.
- A **Single** Site has ordered **Blocks** directly. A **Multi** Site has **Pages** plus **Chrome**; each **Page** has ordered **Blocks**. A **Block component** declares **Fields**; a placed **Block** holds a **Value** for each.
- A **Site** owns many **Assets**. Removing an Asset record emits a **Tombstone** that outlives it.
- A **Site** becomes **Live** when its User **Publish**es it; an admin can **Suspend** it.
- The **Editor** writes a Site's content; the **Renderer** reads it.

## Example dialogue

> **Dev:** "Customer's confused — they updated their menu but their **Site** still shows the old items."
> **PM:** "Did they save in the **Editor**? Auto-save fires a few seconds after they stop typing, and leaving flushes whatever is pending — so an edit only goes missing if the save itself failed. Did they see an error?"
> **Dev:** "They saved. But the **Site** is **Live** — does the **Renderer** cache?"
> **PM:** "The Live **Renderer** reads fresh **Site** content per request. Different question — is this a **Site** from the cafe **Template**, or a custom one?"
> **Dev:** "From the cafe **Template**. The menu's an `array`-typed **Field**, so the items live in that Field's **Value** on the menu **Block**."
> **PM:** "A cafe is a **Single** Site — no **Pages**, all Blocks in one scroll. So check that Block's `visible`, and that they edited the right one."

## Flagged ambiguities

- **"copy" / "shared" span two independent axes.** *Template ↔ Template (code):* nothing is shared; each Template owns independent copies ([ADR-0001](./docs/adr/0001-beta-model-template-isolation.md)). *Site ↔ Template (runtime):* the content **data** is deep-copied per Site, but the **Renderer code** is shared by every Site of that `templateKey`. Net: a Site duplicates a few KB of JSON, never components. Name the axis before discussing storage cost or update propagation.
- **"domain" is overloaded three ways:** the **Subdomain** product concept (`user_sites.domain`), the Clean Architecture layer (`src/domain/`), and the future bring-your-own-hostname feature (no canonical word yet — pin one when it's on the table).
- **"publish" is overloaded two ways:** a User **Publish**es their Site (draft → Live), and a Template becomes catalog-visible (`status = active`). The code→DB reconcile is **Sync**, never "publish". The capability name `canPublishTemplates` predates the distinction and stays as-is ([ADR-0006](./docs/adr/0006-canpublishtemplates-separate-from-admin.md)).
- **"delete" is overloaded three ways, and the collision caused a real defect:** a User ending their account is **Account Erasure**; removing an **Asset** record is not the same as destroying its binary (that half is the **Tombstone**); `pnpm template:delete` is a dev-time CLI. Before [ADR-0014](./docs/adr/0014-account-erasure-tombstone-pipeline.md) the model had no word for the second half, so "deleted the asset" meant either thing — and account erasure did only the first.
- **"theme" is historical.** Visual identity is per-Template (**Design Tokens**); catalog grouping is **Category**. Reading old PRs, translate "theme" to whichever job it was doing. Code residue was cleared in migration 013 (`themeKey` → `templateKey`) and PR #19 (`src/themes/` → `src/templates/`).
- **"composition" was never a separate concept** — it is the ordered **Block** list of a Site or Page. Say "the Site's Blocks", never "the composition".
- **Code identifiers that are not domain terms:** `templateKey` (= `<category>-<leaf>`) and "leaf" are internal — say "the cafe-default Template". `ContentModel` (formerly `TemplateJson`, [ADR-0013](./docs/adr/0013-content-model-rename.md)) is the entity-neutral name for the content shape both a Template and a Site hold; that rename changed **type names only** — at the time, Section, Field, Page, nav, Shared sections all kept theirs. A Section's `fields` container was `data` until migration 022, and its eyebrow Field was `data.label` until migration 018; both appear in old PRs. [ADR-0016](./docs/adr/0016-block-rename-and-field-value-split.md) later renamed Section→Block, `shared`→Chrome, `NavMeta`→`MenuEntry`, and split Field into Field (schema descriptor) + Value (instance data) — TO-BE, not yet implemented (see banner above).
