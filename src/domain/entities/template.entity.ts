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

/** Multi Page menu entry. Omitted placement means the header menu. */
export interface MenuEntry {
  label: string;
  placement?: 'header' | 'footer';
}

/** Single Block menu entry. Its type deliberately cannot express footer placement. */
export interface SingleMenuEntry {
  label: string;
}

/** Base Block shared by Single and Multi so Block renderers are reused. */
export interface Block {
  id: string;
  type: string;
  visible: boolean;
  /**
   * The Block's data, as Values (ADR-0016 §4). Deliberately loose: a Block is
   * dispatched by a string `type` into `library[type]`, so the domain cannot know
   * statically which Value shape any given Block holds. The schema does, and the
   * typed view is taken once at the component boundary
   * (`block.fields as XContent`, §4-2) after the save path has validated it.
   */
  fields: Record<string, unknown>;
}

/**
 * Single-mode Block — the Block itself drives the anchor menu. Menu presence
 * means inclusion; absence means the visible Block is not listed.
 */
export interface SingleBlock extends Block {
  menu?: SingleMenuEntry;
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
 * Multi-mode page — `name` is the editor/page identity; optional `menu` is a
 * separate projection source. Inner Blocks use base `Block` (no menu).
 */
export interface Page {
  id: string;
  slug: string;
  visible: boolean; // routable? false → 404 (data preserved)
  name: string;
  menu?: MenuEntry;
  blocks: Block[];
  seo?: PageSeo; // 🔮 Phase 6
}

interface ContentModelBase {
  templateKey: string; // selects the (shared) renderer
  globalStyles: GlobalStyles;
}

export interface SingleContent extends ContentModelBase {
  mode: 'single';
  blocks: SingleBlock[]; // nav/footer Blocks inline, pinned in the editor
  seo?: PageSeo; // 🔮 Phase 6 (single has one page → site-level)
}

export interface MultiContent extends ContentModelBase {
  mode: 'multi';
  chrome: { header: Block[]; footer: Block[] };
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
 * Every Block in a ContentModel, regardless of mode — Single's `blocks`, or
 * Multi's `chrome.header` + `chrome.footer` + each page's `blocks`.
 * Returns live references (safe to mutate after a structuredClone).
 */
export function allBlocks(json: ContentModel): Block[] {
  if (json.mode === 'single') return json.blocks;
  return [
    ...json.chrome.header,
    ...json.chrome.footer,
    ...json.pages.flatMap((p) => p.blocks),
  ];
}

/**
 * Project the header menu from Blocks (Single) or Pages (Multi). Presence is
 * eligibility; a footer placement is excluded explicitly rather than by negation.
 */
export function deriveNav<T extends { visible: boolean; menu?: MenuEntry | SingleMenuEntry }>(
  source: T[],
  hrefOf: (x: T) => string,
): Array<{ label: string; href: string }> {
  return source
    .filter((x) => x.visible && x.menu && !('placement' in x.menu && x.menu.placement === 'footer'))
    .map((x) => ({ label: x.menu!.label, href: hrefOf(x) }));
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
 * Multi footer page links — only Pages explicitly placed in the footer menu.
 */
export function deriveFooterNav(
  pages: Page[],
  hrefOf: (p: Page) => string,
): Array<{ label: string; href: string }> {
  return pages
    .filter((p) => p.visible && p.menu?.placement === 'footer')
    .map((p) => ({ label: p.menu!.label, href: hrefOf(p) }));
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
