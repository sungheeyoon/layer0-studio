// ─────────────────────────────────────────────────────────────────────────────
// ADR-0016 — schema-first Field/Value split.
//
// The schema is the single source of truth. A `FieldDescriptor` says how a
// field is edited; the *type* of the data it holds (its Value) is derived from
// it via `ValuesOf`, never written by hand. That is what makes schema/content
// drift structurally impossible rather than merely validated.
//
// The legacy `Field` union (`{ type, label, value }` objects stored *beside*
// the data) and its `getFieldValue` accessor are gone as of #136. The only
// place that shape still appears is `scripts/lib/migrate-single-site.ts`, which
// describes it locally because it transforms rows written before this split.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * An uploaded image. `url` is what the renderer puts in `src`; `assetId` is
 * the reference-counting handle ADR-0003's orphan sweep reads. Two different
 * jobs, deliberately not merged into one string.
 */
export interface ImageValue {
  url: string;
  assetId?: string | null;
}

/** Schema-side descriptor for one editable field. */
export type FieldDescriptor =
  | { type: 'text' | 'textarea' | 'url' | 'color'; label: string; required?: boolean; editable?: boolean }
  | { type: 'select'; label: string; required?: boolean; editable?: boolean; options: readonly string[] }
  /** `default` is required: it is what the editor resets an emptied input to. */
  | { type: 'number'; label: string; required?: boolean; editable?: boolean; default: number }
  | { type: 'image'; label: string; required?: boolean; editable?: boolean }
  | {
      type: 'array';
      label: string;
      required?: boolean;
      editable?: boolean;
      itemSchema: FieldsSchema;
      minItems?: number;
      maxItems?: number;
    };

/** A Block component's full field schema. Declare it with `as const satisfies FieldsSchema`. */
export type FieldsSchema = Readonly<Record<string, FieldDescriptor>>;

/** The Value type one descriptor implies. */
type ValueOfDescriptor<D> =
  D extends { type: 'image' } ? ImageValue
  : D extends { type: 'number' } ? number
  : D extends { type: 'select'; options: readonly (infer O)[] } ? O
  : D extends { type: 'array'; itemSchema: infer S } ? Array<ArrayItem<S>>
  : string;

/**
 * One repeating item. `id` is a sibling of `fields`, exactly as a Block carries
 * its own `id` beside its `fields` — so `itemSchema` only ever describes keys a
 * user actually edits, and no "system key" exclusion is needed (ADR-0016 §4-3).
 */
export interface ArrayItem<S> {
  id: string;
  fields: ValuesOf<S>;
}

type RequiredFieldKeys<S> = {
  [K in keyof S]-?: S[K] extends { required: true } ? K : never;
}[keyof S];

type OptionalFieldKeys<S> = Exclude<keyof S, RequiredFieldKeys<S>>;

/** Flattens the required/optional intersection so hovers stay readable. */
type Prettify<T> = { [K in keyof T]: T[K] } & {};

/**
 * The Content type a schema implies — `required: true` becomes a mandatory
 * key, everything else optional. Use as `type XContent = ValuesOf<typeof xSchema>`.
 */
export type ValuesOf<S> = Prettify<
  { [K in RequiredFieldKeys<S>]: ValueOfDescriptor<S[K]> } &
  { [K in OptionalFieldKeys<S>]?: ValueOfDescriptor<S[K]> }
>;

/**
 * Navigation projection source — carried by the unit that drives the nav.
 * `visible` = nav-eligibility (independent of the unit's own `visible`),
 * `label` = the nav text (and, for a Page, the page's name in the editor tab).
 * See ADR-0007 and CONTEXT.md "nav projection".
 */
export interface NavMeta {
  visible: boolean;
  label: string;
}

/**
 * Base section — the "content shape" of a section, shared by Single and Multi
 * so section renderers are reused. No `title` (the name lives in the nav source's
 * `nav.label`) and no `editable` (it was always `true` — dead field). Field-level
 * `Field.editable` is kept.
 */
export interface Section {
  id: string;
  type: string;
  visible: boolean;
  /**
   * The Block's data, as Values (ADR-0016 §4). Deliberately loose: a Block is
   * dispatched by a string `type` into `library[type]`, so the domain cannot know
   * statically which Value shape any given Block holds. The schema does, and the
   * typed view is taken once at the component boundary
   * (`section.fields as XContent`, §4-2) after the save path has validated it.
   */
  fields: Record<string, unknown>;
}

/**
 * Single-mode section — the section itself drives the nav (anchor scroll),
 * so it carries the unified `nav` projection source.
 */
export interface SingleSection extends Section {
  nav: NavMeta;
}

export interface GlobalStyles {
  primaryColor: string;
  secondaryColor: string;
  /**
   * Page background. Overlays the template's `colors.surface` token — every
   * Template names its background `surface`, so the mapping is uniform.
   *
   * A Template's card / border tones derive from this via `color-mix`, so they
   * follow whatever the user picks. Text colours do **not** derive from it;
   * a background that leaves body text unreadable is surfaced as a warning
   * (`GLOBAL_STYLE_LOW_CONTRAST`) and still saves — see ADR-0015 rule 4.
   */
  backgroundColor: string;
  fontFamily: string;
  fontSize: string;
  layout: string;
}

/** 🔮 Phase 6 placeholder — per-page (Multi) / top-level (Single) SEO. */
export interface PageSeo {
  title: string;
  description: string;
}

/**
 * Multi-mode page — the page drives the nav (page link), so it carries the
 * unified `nav` projection source. Inner sections use base `Section`
 * (no nav). No `title` (name = `nav.label`); no `order` (array order = render order).
 */
export interface Page {
  id: string;
  slug: string;
  visible: boolean; // routable? false → 404 (data preserved)
  nav: NavMeta;
  sections: Section[];
  seo?: PageSeo; // 🔮 Phase 6
}

interface ContentModelBase {
  templateKey: string; // selects the (shared) renderer
  globalStyles: GlobalStyles;
}

export interface SingleContent extends ContentModelBase {
  mode: 'single';
  sections: SingleSection[]; // nav/footer inline, pinned in the editor
  seo?: PageSeo; // 🔮 Phase 6 (single has one page → site-level)
}

export interface MultiContent extends ContentModelBase {
  mode: 'multi';
  shared: { header: Section[]; footer: Section[] };
  pages: Page[];
}

/** Structural union discriminated on `mode`. See ADR-0007. */
export type ContentModel = SingleContent | MultiContent;

/** The Site Type discriminator shared by both content variants. See ADR-0007 / ADR-0013. */
export type SiteMode = ContentModel['mode']; // 'single' | 'multi'

/** Narrow a ContentModel to the Single shape. */
export function isSingleContent(json: ContentModel): json is SingleContent {
  return json.mode === 'single';
}

/** Narrow a ContentModel to the Multi shape. */
export function isMultiContent(json: ContentModel): json is MultiContent {
  return json.mode === 'multi';
}

/**
 * Every section in a ContentModel, regardless of mode — Single's `sections`,
 * or Multi's `shared.header` + `shared.footer` + each page's `sections`.
 * Returns live references (safe to mutate after a structuredClone).
 */
export function allSections(json: ContentModel): Section[] {
  if (json.mode === 'single') return json.sections;
  return [
    ...json.shared.header,
    ...json.shared.footer,
    ...json.pages.flatMap((p) => p.sections),
  ];
}

/**
 * Project a nav menu from its source (sections for Single, pages for Multi).
 * The object shape, filter rule (`visible && nav.visible`) and label source
 * (`nav.label`) are identical across modes; only the href scheme differs.
 */
export function deriveNav<T extends { visible: boolean; nav: NavMeta }>(
  source: T[],
  hrefOf: (x: T) => string,
): Array<{ label: string; href: string }> {
  return source
    .filter((x) => x.visible && x.nav.visible)
    .map((x) => ({ label: x.nav.label, href: hrefOf(x) }));
}

/**
 * The explicit SEO for the page being served: Multi → the active page's `seo`
 * (falls back to the first/home page), Single → the Site-level `seo`. Returns
 * `undefined` when none is authored, so callers can fall back to extraction.
 * See ADR-0007.
 */
export function resolveActivePageSeo(
  json: ContentModel,
  activePageId?: string,
): PageSeo | undefined {
  if (json.mode === 'single') return json.seo;
  const page = json.pages.find((p) => p.id === activePageId) ?? json.pages[0];
  return page?.seo;
}

/**
 * Multi footer page links — the complement of the top nav: pages that are
 * reachable (`visible`) but deliberately kept out of the top nav
 * (`!nav.visible`), e.g. privacy / terms. Same shape as `deriveNav`.
 * See ADR-0007 ("nav 는 저장하지 않는다 — projection").
 */
export function deriveFooterNav(
  pages: Page[],
  hrefOf: (p: Page) => string,
): Array<{ label: string; href: string }> {
  return pages
    .filter((p) => p.visible && !p.nav.visible)
    .map((p) => ({ label: p.nav.label, href: hrefOf(p) }));
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  category: string;
  status: 'draft' | 'active' | 'archived';
  thumbnailUrl: string | null;
  content: ContentModel;
  version: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTemplateDto = Omit<Template, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTemplateDto = Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>;
