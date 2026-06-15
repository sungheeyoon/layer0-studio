export type TemplateFieldType =
  | 'text'
  | 'textarea'
  | 'image'
  | 'url'
  | 'color'
  | 'number'
  | 'select'
  | 'array';

interface BaseTemplateField {
  label: string;
  editable?: boolean; // Basic true, hidden in editor if false
}

export interface TextTemplateField extends BaseTemplateField {
  type: 'text' | 'textarea' | 'url' | 'color' | 'number';
  value: string;
}

export interface SelectTemplateField extends BaseTemplateField {
  type: 'select';
  value: string;
  options: string[]; // for 'select' type
}

export interface ImageTemplateField extends BaseTemplateField {
  type: 'image';
  value: string; // CDN URL
  assetId?: string | null; // UUID of physical asset for reference counting
}

export interface ArrayTemplateField extends BaseTemplateField {
  type: 'array';
  items: Array<Record<string, TemplateField>>;
}

export type TemplateField =
  | TextTemplateField
  | SelectTemplateField
  | ImageTemplateField
  | ArrayTemplateField;

/**
 * Safely get the string value of a field.
 * Returns empty string for 'array' type or missing value.
 * 
 * Usage:
 * 1. getFieldValue(field)
 * 2. getFieldValue(data, 'key')
 */
export function getFieldValue(fieldOrData: TemplateField | Record<string, TemplateField> | undefined, key?: string): string {
  if (!fieldOrData) return '';

  if (key !== undefined) {
    const data = fieldOrData as Record<string, TemplateField>;
    const field = data[key];
    if (!field || field.type === 'array') return '';
    return field.value ?? '';
  }

  const field = fieldOrData as TemplateField;
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
 * `TemplateField.editable` is kept.
 */
export interface TemplateSection {
  id: string;
  type: string;
  visible: boolean;
  data: Record<string, TemplateField>;
}

/**
 * Single-mode section — the section itself drives the nav (anchor scroll),
 * so it carries the unified `nav` projection source.
 */
export interface SingleSection extends TemplateSection {
  nav: NavMeta;
}

export interface TemplateGlobalStyles {
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
 * unified `nav` projection source. Inner sections use base `TemplateSection`
 * (no nav). No `title` (name = `nav.label`); no `order` (array order = render order).
 */
export interface TemplatePage {
  id: string;
  slug: string;
  visible: boolean; // routable? false → 404 (data preserved)
  nav: NavMeta;
  sections: TemplateSection[];
  seo?: PageSeo; // 🔮 Phase 6
}

interface TemplateBase {
  templateKey: string; // selects the (shared) renderer
  globalStyles: TemplateGlobalStyles;
}

export interface SinglePageTemplate extends TemplateBase {
  mode: 'single';
  sections: SingleSection[]; // nav/footer inline, pinned in the editor
  seo?: PageSeo; // 🔮 Phase 6 (single has one page → site-level)
}

export interface MultiPageTemplate extends TemplateBase {
  mode: 'multi';
  shared: { header: TemplateSection[]; footer: TemplateSection[] };
  pages: TemplatePage[];
}

/** Structural union discriminated on `mode`. See ADR-0007. */
export type TemplateJson = SinglePageTemplate | MultiPageTemplate;

/** Narrow a TemplateJson to the Single shape. */
export function isSingleTemplate(json: TemplateJson): json is SinglePageTemplate {
  return json.mode === 'single';
}

/** Narrow a TemplateJson to the Multi shape. */
export function isMultiTemplate(json: TemplateJson): json is MultiPageTemplate {
  return json.mode === 'multi';
}

/**
 * Every section in a TemplateJson, regardless of mode — Single's `sections`,
 * or Multi's `shared.header` + `shared.footer` + each page's `sections`.
 * Returns live references (safe to mutate after a structuredClone).
 */
export function allSections(json: TemplateJson): TemplateSection[] {
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
  json: TemplateJson,
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
  pages: TemplatePage[],
  hrefOf: (p: TemplatePage) => string,
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
  templateJson: TemplateJson;
  version: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTemplateDto = Omit<Template, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTemplateDto = Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>;
