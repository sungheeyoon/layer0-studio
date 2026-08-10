import { SectionComponentMeta } from '../../../types';
import type { FieldsSchema } from '@/domain/entities/template.entity';

/**
 * Declared here, not in the .tsx: that is a client component, whose module
 * body never runs server-side, so `Component.meta` would be undefined (see
 * `libEntry`). The renderer imports this back for its `ValuesOf` — still one
 * declaration, one source of truth.
 */
export const navSchema = {
  brandName: { type: 'text', label: '브랜드 이름' },
  ctaText: { type: 'text', label: 'CTA 텍스트' },
} as const satisfies FieldsSchema;

export const navMeta: SectionComponentMeta = {
  componentKey: 'nav',
  category: 'navigation',
  label: 'Interior Navigation',
  fieldsSchema: navSchema,
  previewImage: '/component-previews/interior/nav.webp',
};
