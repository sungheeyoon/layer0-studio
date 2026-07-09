export type FieldType =
  | 'text'
  | 'textarea'
  | 'image'
  | 'url'
  | 'color'
  | 'number'
  | 'select'
  | 'array';

interface BaseField {
  label: string;
  editable?: boolean; // Basic true, hidden in editor if false
}

export interface TextField extends BaseField {
  type: 'text' | 'textarea' | 'url' | 'color' | 'number';
  value: string;
}

export interface SelectField extends BaseField {
  type: 'select';
  value: string;
  options: string[]; // for 'select' type
}

export interface ImageField extends BaseField {
  type: 'image';
  value: string; // CDN URL
  assetId?: string | null; // UUID of physical asset for reference counting
}

export interface ArrayField extends BaseField {
  type: 'array';
  items: Array<Record<string, Field>>;
}

export type Field =
  | TextField
  | SelectField
  | ImageField
  | ArrayField;

/**
 * Safely get the string value of a field.
 * Returns empty string for 'array' type or missing value.
 * 
 * Usage:
 * 1. getFieldValue(field)
 * 2. getFieldValue(data, 'key')
 */
export function getFieldValue(fieldOrData: Field | Record<string, Field> | undefined, key?: string): string {
  if (!fieldOrData) return '';

  if (key !== undefined) {
    const data = fieldOrData as Record<string, Field>;
    const field = data[key];
    if (!field || field.type === 'array') return '';
    return field.value ?? '';
  }

  const field = fieldOrData as Field;
  if (field.type === 'array') return '';
  return field.value ?? '';
}

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
  data: Record<string, Field>;
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
 * See ADR-0007 / PLAN_multipage §5 Phase 3.
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
 * See PLAN_multipage §6 (E).
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
