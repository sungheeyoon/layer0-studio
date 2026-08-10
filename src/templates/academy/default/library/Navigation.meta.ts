import { SectionComponentMeta } from '../../../types';
import type { FieldsSchema } from '@/domain/entities/template.entity';

/**
 * Declared here, not in the .tsx: that is a client component, whose module
 * body never runs server-side, so `Component.meta` would be undefined (see
 * `libEntry`). The renderer imports this back for its `ValuesOf` — still one
 * declaration, one source of truth.
 */
export const navigationSchema = {
  brandName: { type: 'text', label: '학원 이름', required: true },
  brandSubtext: { type: 'text', label: '보조 텍스트' },
  ctaText: { type: 'text', label: 'CTA 문구' },
  ctaUrl: { type: 'url', label: 'CTA 링크' },
} as const satisfies FieldsSchema;

export const navigationMeta: SectionComponentMeta = {
  componentKey: 'nav',
  category: 'navigation',
  label: '네비게이션',
  fieldsSchema: navigationSchema,
  previewImage: '/component-previews/academy/nav.webp',
};
