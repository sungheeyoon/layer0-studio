# Layer0 Studio

A no-code website builder. Users pick a **Template**, edit it visually, and publish it to a public URL as a **Site**.

## Language

**Site**:
A user's own editable, publishable website — created from a Template and owned by one User. (Admins may also create Sites with no Template — `templateId: null` — but this is rare and not a user-facing flow.) **Instantiation semantics (axis B — see Flagged ambiguities):** at creation the Template's `content` (a `ContentModel`) is **deep-copied** (`structuredClone`) into the Site's own `content`, so a Site is decoupled from its Template the moment it is made — later edits to the Template do not flow into existing Sites. The Site keeps a `templateId` (provenance reference) and an immutable `snapshot` (the original at creation, reserved for future reset/diff features). What is **not** copied is the **Renderer code** — that is shared and loaded at serve time by `templateKey`. So a Site copies *data*, never *code*.
_Avoid_: UserSite (internal/DB name only), user-site, project, page (a Multi Site contains Pages; a Single Site contains Sections directly).

**Site Type (Single / Multi)**:
Whether a Site is one continuous scroll (**Single**) or a set of routable **Pages** (**Multi**). Fixed at creation from the Template's `mode` discriminator — a Single never *evolves* into a Multi (see [ADR-0007](./docs/adr/0007-single-multi-site-type-structural-union.md)). The two are **structurally different**: a Single carries `sections[]` directly (no Page) with anchor-scroll **nav projection** from those Sections; a Multi carries `pages[]` plus **Shared sections** (header/footer) with page-link nav projection from those Pages.
_Avoid_: mode (the literal `ContentModel` discriminator / `SiteMode` — fine in code, not in conversation).

**Template**:
A designer-built (or **Generate**d) blueprint that Users instantiate into Sites. Each Template is self-contained in code (its own design tokens, section components, renderer) and lives as a row in the `templates` table; has a status of `draft | active | archived`. Produced by **Sync**'ing its **Preset**. Currently 10 Templates across 8 **Categories**; `outdoor-default` (능선) is Multi Site Type, the other 9 Single (the earlier `corporate-multipage` minimal Multi example was removed — `outdoor-default` is the shipping Multi template).
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
A routable unit within a **Multi** Site (or Multi Template) — its own `slug`, an ordered list of Sections, and a `nav: { visible, label }`. Page order = the array order of `pages[]` (no `order` field). **Single Sites have no Pages** — they hold `sections[]` directly (one scroll).
_Avoid_: tab, screen; for a Single Site, don't say Page at all.

**Section**:
A single placed unit — typically a horizontal band like a hero, feature list, FAQ, or footer — living directly on a **Single** Site or inside a **Multi** Page. Each Section has a `type` that points at a Section component by `componentKey`, plus a `fields` payload of editable Fields. A Single Site's Sections additionally carry `nav: { visible, label }` (they are the **nav projection** source); Sections inside a Multi Page do not.
_Avoid_: block, widget, module.

**Section component**:
The React renderer that turns a Section's `fields` into UI. Lives **inside its Template's directory** and declares its own `fieldsSchema`. Not shared across Templates (β model). Only used when distinguishing the renderer from the placed instance — in normal conversation, say **Section**.
_Avoid_: library component (it's *a* library component, but the canonical name is Section component).

**nav projection**:
The site navigation menu is **not stored** — it is derived (projected) from its source on each render. **Single**: from the Site's `sections` (label = `nav.label`, href = `#section-<id>` anchor). **Multi**: from the Site's `pages` (label = `nav.label`, href = page `slug`). Reordering the source reorders the nav; a single `deriveNav(source, hrefOf)` covers both modes, differing only in the href scheme (anchor vs slug). See [ADR-0007](./docs/adr/0007-single-multi-site-type-structural-union.md).
_Avoid_: nav config, menu data (there is no stored nav object).

**Shared sections**:
A Multi Site's `shared.header` and `shared.footer` — Section lists rendered above and below **every** Page (render order: header → the Page's Sections → footer). Edited once, applied to all Pages. Single Sites have no Shared sections (their nav/footer live inline in `sections[]`, pinned top/bottom in the Editor).

**`visible` vs `nav.visible`** (the two axes):
Two **independent** axes on a Section (Single) or Page (Multi). `visible` = whether it exists on the served site (a Single Section is rendered; a Multi Page is routable — `false` → 404). `nav.visible` = whether it appears in the nav menu. `visible:false` removes it from the nav too (one-way), but `visible:true` does **not** force nav presence — so an item can be **present yet hidden from nav**: a Single Section shown in the scroll but not in the menu, or a Multi Page reachable by URL/footer but absent from the top nav (e.g. a privacy-policy page).

**Field**:
A single typed editable property inside a Section's `fields` — e.g. a heading text Field, a hero image Field, a brand color Field. Each Field has a type (`text`, `textarea`, `image`, `url`, `color`, `number`, `select`, `array`). An **array Field** holds an ordered list of repeating items (e.g. menu entries, FAQ rows), each item itself a dictionary of Fields validated against an `itemSchema`.
_Avoid_: input, property, attribute, prop.

**Asset**:
A user-uploaded image used inside a Site. Every Asset is **two things at once** — a metadata record and a stored binary — and the lifecycle covers both: `pending` (reserved) → `active` (confirmed in use) → **erased**, at which point a **Tombstone** carries the stored binary's fate independently of the record. The Reserve-Confirm pattern exists to handle uploads that abort mid-flight (see [ADR-0003](./docs/adr/0003-asset-upload-two-phase-cleanup.md)); the terminal state exists because a record that vanishes without a Tombstone strands its binary forever (see [ADR-0014](./docs/adr/0014-account-erasure-tombstone-pipeline.md)).
_Avoid_: file, upload, image (in domain talk). Also avoid calling an Asset "deleted" while its binary still exists — that is the confusion the Tombstone exists to prevent.

**Tombstone**:
A durable record that a stored binary **must be destroyed**, holding the storage path and nothing else. Its defining property is that it **outlives the Asset record that referenced it** — the Asset can be gone while its Tombstone remains, which is exactly the case the old model could not express. Tombstones are what makes destruction resumable: they are written in the same transaction that removes the Asset record, then drained against storage afterwards.
_Avoid_: orphan (an *orphan* is an Asset record that still exists but has no usage — the opposite situation), cleanup task, pending delete.

**Account Erasure**:
The irreversible operation that destroys everything a **User** owns — Sites, Assets, stored binaries, and the auth principal itself. Deliberately **not** called "deletion": deleting removes one row, Erasure removes a person's entire footprint across DB, storage, and auth, and therefore cannot be a single statement. It has one **commit point** (a transaction that records the request, removes the rows, and emits **Tombstones**) followed by resumable steps (drain Tombstones, destroy the auth principal). Once the commit point passes, the User is locked out and their Sites are dark, whether or not the later steps have run. See [ADR-0014](./docs/adr/0014-account-erasure-tombstone-pipeline.md).
_Avoid_: account deletion, account removal, deactivation (nothing is retained), GDPR delete (Erasure is the model, compliance is a consequence).

**User**:
An authenticated principal. Role is either `user` (the default) or `admin`.

**Subdomain**:
The slug a User picks to publish their Site under — the `myshop` in `myshop.layer0.studio`. Stored in `user_sites.domain`; validated by `validateDomainSlug`; rejects entries in `RESERVED_DOMAINS`. Lowercase letters, digits, hyphens; 3–50 chars; no leading/trailing hyphen. **Required to Publish** (a Site without a Subdomain cannot go Live — `DOMAIN_REQUIRED`). **Subdomain serving is designed but NOT implemented** — a published Site is currently served at the path-based `/site/<slug>` URL, and `src/middleware.ts` has no host branch. Everything that follows describes the *intended* behaviour, not today's: the Subdomain is the Site's **read-only public origin**, serving the published result and never the editor — editing happens only on the apex dashboard (where the login session lives, host-only), so a Subdomain is sessionless. A request to `<slug>.layer0.studio` is internally **rewritten** by middleware to the shared `/site/[domain]` renderer (the path is internal, never the public URL); platform paths (`/api`, `/dashboard`, …) on a Subdomain — and apex `/site/*` direct access — 404. See [ADR-0009](./docs/adr/0009-subdomain-public-serving.md).
_Avoid_: domain (overloaded — see Flagged ambiguities), slug, hostname, URL.

**Publish** (verb):
The User action that takes a Site from not-yet-served to **Live** for the first time. One-way for Users — there is no user-level un-publish. Re-publishing (e.g. after admin suspension) re-stamps `publishedAt`.
_Avoid_: deploy, release, go-live (the noun phrase).

**Live** (adjective):
A Site is Live when it is currently being served at its public URL (today `/site/<slug>` — see **Subdomain**). Equivalent to `status === 'active'`. The two non-Live states are *draft* (never Published) and **Suspended** (admin-disabled).
_Avoid_: active (the literal status string, fine in code; "Live" in conversation), published (overloaded with `publishedAt`).

**Suspended**:
A state an admin can put a Site into to take it down. Distinct from draft — a Suspended Site has been Published at least once, evidenced by a non-null `publishedAt`. While Suspended, the Site is not Live.
_Note_: the state and its use case (`AdminUpdateSiteUseCase.updateStatus`) still exist, but the in-app admin surface that triggered it (the global site-moderation table at `/admin`) was **removed** — `/admin` is now Templates-only. Suspension is currently only reachable at the data/use-case level, not through any UI.

**Sync** (verb):
The operation that reconciles Presets (code) into Templates (DB). Reads every Preset file, validates each Section against its Section component's `fieldsSchema`, and upserts matching Template rows. Dry-run by default; commits only with `--apply`. **Runs automatically after a production deploy** — registration is no longer a manual admin step ([ADR-0012](./docs/adr/0012-template-publishing-pipeline.md)): a successful deploy triggers `POST /api/admin/sync-templates`, new rows land as `active` (merge = publish approval). The admin UI keeps an emergency **Force re-sync** only. Logged to the `template_sync_audit` table.
_Avoid_: deploy, apply (a single phase, not the whole operation), reconcile, promote.

**Generate** (verb):
The operation that synthesizes a new **Preset** from a natural-language brief via an LLM pipeline. CLI: `pnpm template:generate "<brief>"`. Runs four stages — *propose composition* → *propose design tokens* → *generate sections* → *validate & capture thumbnail* — plus a new-category approval gate, then writes six files under `src/templates/<category>/<leaf>/`. Produces code (a Preset), not a DB row — **Sync** is still required afterwards to reflect the result into the `templates` table.
_Avoid_: Tracer (an internal PR-series label, not a product term), scaffold (the lower-level `pnpm template:scaffold` skeleton-only command), AI gen.

**Editor**:
The authenticated visual editing surface a User uses to modify their Site. Loads the Site's Template at runtime; lets the User edit each Section's Fields, reorder Sections (Single — with the nav/footer Sections pinned), reorder Pages (Multi), and toggle `visible` / `nav.visible`. Users **cannot create or delete** Pages or Sections — the information architecture is template-author-defined (see [ADR-0007](./docs/adr/0007-single-multi-site-type-structural-union.md)). Persists edits on three independent defences, because an edit can go missing three unrelated ways (see [ADR-0015](./docs/adr/0015-edit-loss-paths-exhaustive-defense.md)): an optimistic-concurrency RPC rejects a write that would overwrite another tab's (see [ADR-0004](./docs/adr/0004-optimistic-concurrency-via-rpc.md)); leaving the Editor flushes whatever the debounce is still holding, and no edit is held past a fixed ceiling however long the User keeps typing; and a validation rule may stop a save only when saving would break the **Renderer**, never merely because a value would look wrong (see **Blocking rule / Warning rule**). Distinct from the **Renderer**.
_Avoid_: builder, designer, dashboard.

**Blocking rule / Warning rule**:
The two kinds of content-validation rule, separated by whether a rule has standing to **stop a save**. A **Blocking rule** fires only when saving would break the **Renderer** or corrupt the content itself (an unknown component key, a duplicate Section id, a mistyped Field) — these are reachable from an authoring bug, never from an **Editor** input. A **Warning rule** fires when the result would merely look wrong (a non-hex colour, a fontSize with no unit) — the save still goes through and the **Editor** flags the field inline. The distinction exists because a `ContentModel` is validated and saved whole, so a Blocking rule turns one bad Field into a hostage-taking of every other edit in the Site; that trade is only justified when the alternative is a broken Site (see [ADR-0015](./docs/adr/0015-edit-loss-paths-exhaustive-defense.md)). Both kinds come from the same rule set, evaluated identically on client and server.
_Avoid_: error/warn (the `ValidationIssue` field names — fine in code, ambiguous in conversation), strict/loose, hard/soft.

**Renderer**:
The runtime code path that turns a Site's content into served HTML — both for Live Sites and for the in-editor preview. Each Template ships its own Renderer, and Renderers are **not shared across Templates** (axis A — β model). But along axis B they *are* shared: **every Site built from the same `templateKey` shares that one Renderer at serve time** — it is loaded via `loadTemplate(templateKey)` (`src/templates/registry.ts`) and the Site's own `content` is injected into it. So the Renderer is per-Template, never per-Site. Distinct from the **Editor**: the Renderer never mutates Site state, the Editor never serves to the public.
_Avoid_: theme runtime, view.

## Relationships

- Each **Template** defines its own **Design Tokens** in code; a **Template** carries a **Global Styles** overlay that the **User** can edit in the **Editor** to override a small subset of those tokens.
- Each **Template** owns its **Section components** and its single **Preset** (β model — no cross-Template sharing).
- A **Preset** is either hand-authored or **Generate**d from a brief; either way it is then **Sync**'d into exactly one **Template** row. A **Template** belongs to exactly one **Category**.
- A **User** owns many **Sites**; each **Site** is created from at most one **Template** (or none, admin-only).
- A **Single** Site has many ordered **Sections** directly (no Pages). A **Multi** Site has many **Pages** plus **Shared sections** (header / footer); each **Page** has many ordered **Sections**. A **Section** has many **Fields**.
- A **Site** owns many **Assets**, referenced from its **Section** image Fields.
- Removing an **Asset** record emits a **Tombstone**; the Tombstone outlives it and is drained against storage later. A **User** can end their own account through **Account Erasure**, which removes their **Sites** and **Assets** and emits Tombstones for every stored binary they owned.
- A **Site** becomes **Live** when its **User** **Publish**es it; an admin can **Suspend** a Live Site.
- The **Editor** writes to a Site's content; the **Renderer** reads it (both in-editor preview and when serving the Live Site).

## Example dialogue

> **Dev:** "Customer's confused — they updated their menu but their **Site** still shows the old items."
> **PM:** "Did they hit save in the **Editor**? Auto-save fires a few seconds after they stop typing, and leaving the editor flushes whatever is still pending — so an edit only goes missing if the save itself failed. Did they see an error?"
> **Dev:** "They saved. But the **Site** is **Live** — does the **Renderer** cache?"
> **PM:** "The Live **Renderer** reads fresh **Site** content per request. Different question — is this a **Site** they made from the **cafe Template**, or a custom one?"
> **Dev:** "From the cafe **Template**. The menu's an **array Field** on the menu **Section**."
> **PM:** "A cafe is a **Single** Site — no **Pages**, all its Sections in one scroll. So check the menu **Section**'s `visible`, and that they edited the right one. (If this were a **Multi** Site, I'd also check the menu Section is on the **Page** they think.)"

## Flagged ambiguities

- "site" was used loosely to mean both the user's editable instance and the published artifact — resolved: the entity is always a **Site**; "publishing" is a state change, not a different thing.
- "domain" is overloaded three ways: (1) the **Subdomain** product concept (`user_sites.domain` column, the slug a User publishes under), (2) the Clean Architecture layer (`src/domain/`), (3) reserved for the future "bring-your-own custom hostname" feature. The product concept is always called **Subdomain** in conversation. The architecture layer is implementation jargon, not a domain term. The full custom hostname has no canonical word yet — pin one when that feature is on the table.
- "publish" is overloaded two ways: (1) a User **Publish**es their own Site (draft → Live); (2) a Template becomes publicly visible in the catalog (`status = active`). Template (2) registration is now automated post-deploy (merge = publish approval, [ADR-0012](./docs/adr/0012-template-publishing-pipeline.md)); the `canPublishTemplates` capability gates the **live status toggle** (Activate/Archive/takedown), *not* Sync — and is *not* the admin role (see [ADR-0006](./docs/adr/0006-canpublishtemplates-separate-from-admin.md)). The User action is called **Publish**; the code→DB reconcile is called **Sync**. The capability name `canPublishTemplates` predates this distinction and is kept as-is in code.
- "delete" is overloaded three ways and the collision caused a real defect: (1) a **User** ending their account — always **Account Erasure**, never "account deletion"; (2) removing an **Asset** record, which is *not* the same as destroying its stored binary — that half is carried by a **Tombstone**; (3) `pnpm template:delete`, a dev-time CLI that removes a Template's source and DB/storage residue (no end-user equivalent — Users never delete Templates). Before [ADR-0014](./docs/adr/0014-account-erasure-tombstone-pipeline.md) the model had no word for (2)'s second half, so "deleted the asset" ambiguously meant "removed the row" *or* "destroyed the file" — and account erasure did only the former.
- "composition" was never a separate domain concept — it is the ordered **Section** list of the **Site** itself (Single) or of a **Page** (Multi). The legacy `composition: PresetSection[]` short-hand and `RenderComposition` renderer were **removed** when the Multi-page work landed (Presets now carry a full `content` / `ContentModel`; rendering is `renderSingleSite` / `renderMultiSite`). In conversation say "the Site's / Page's Sections", never "the composition".
- `data.label` — a Section's on-screen **eyebrow / kicker** Field — was **renamed to `data.eyebrow`** (migration 018) to stop colliding with every Field's own `.label` (its editor display name, e.g. `fields.eyebrow.label`). Not a domain term; only noted here so old PRs/JSON reading `data.label` make sense. (The Section's Field container `data` itself was later renamed `fields` in migration 022 — see the `ContentModel` note below — so the current path is `fields.eyebrow`.)
- "theme" is a **historical** term. The visual identity is now per-Template (**Design Tokens**); the catalog grouping is now **Category**. Code residue: `themeKey` was renamed to `templateKey` in migration 013 (PR #18); `src/themes/` was migrated to `src/templates/<category>/<leaf>/` in PR #19 (β model). When reading old PRs or docs, mentally translate "theme" → either Template or Category depending on which job it was doing.
- `templateKey` (= `${category}-${leaf}`, e.g. `cafe-default`) is a code identifier, not a domain term. "leaf" is similarly internal — it just means the directory name under a Category. Don't promote either to conversation; say "the cafe-default Template" instead.
- **`TemplateJson` was renamed to `ContentModel` in code** ([ADR-0013](./docs/adr/0013-content-model-rename.md)) — a code-identifier change, **not** a glossary change. The type is the *shared content shape* held by both a **Template** (`Template.content`, was `templateJson`) and a **Site** (`UserSite.content`/`snapshot`, was `siteJson`/`templateSnapshot`), so its name is deliberately entity-**neutral** (not `SiteContent` — a Template isn't a Site). Single/Multi variants are `SingleContent`/`MultiContent` (was `SinglePageTemplate`/`MultiPageTemplate`), derived from the union's head-noun so narrowing never leaks "Site". DB columns follow: `template_json`/`site_json`/`template_snapshot` → `content`/`content`/`snapshot` (migration 021, + `save_site_template_with_lock` RPC rewrite), and the section JSONB key `data` → `fields` with the component's `.meta.dataSchema` → `.meta.fieldsSchema` (migration 022). Both applied to prod. **The domain terms themselves are unchanged** — **Section**, **Field**, **Page**, **nav**/nav projection, **Shared sections** all keep their names; only the `Template*` *type prefixes* were dropped (`TemplateSection→Section`, `TemplateField→Field`, `TemplatePage→Page`, `TemplateGlobalStyles→GlobalStyles`). Things genuinely owned by one entity were **not** renamed to `Site*`: the **Renderer** stays per-Template (`TemplateRenderer`), the admin Template editor stays `TemplateEditorPanel`, and `template_assets` (template-side stock/AI images) stays distinct from a Site's **Asset** (`user_assets`). `SiteMode` (`'single'|'multi'`) is a new name for the previously-anonymous discriminator union.
- "copy" / "self-contained" / "shared" are overloaded across **two independent axes** — confusing them leads to wrong conclusions about both efficiency and update propagation:
  - **Axis A — Template ↔ Template (code, design-time):** the β model. Each Template owns *independent copies* of every component, token, and style; nothing is shared across Templates. This is what "self-contained", "own copies", "not shared across Templates" refer to ([ADR-0001](./docs/adr/0001-beta-model-template-isolation.md)).
  - **Axis B — Site ↔ Template (runtime):** when a User instantiates a Site, the **content data** (the Site's `content`) is deep-copied per Site (`structuredClone`), but the **Renderer code** is *shared* — all Sites of one `templateKey` load the same Renderer at serve time. So "a Site is a copy" means *its data*, not *its code*.
  - Net: a Site duplicates a few KB of JSON, never the components/renderer. The β-model "copies" (axis A) say nothing about per-Site cost (axis B). When discussing storage efficiency or "does a template change reach existing Sites", name the axis first.
