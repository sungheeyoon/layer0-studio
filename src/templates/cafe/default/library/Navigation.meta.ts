import { BlockComponentMeta } from '../../../types';
import type { FieldsSchema } from '@/domain/entities/template.entity';

/**
 * Declared here, not in the .tsx: that is a client component, whose module
 * body never runs server-side, so `Component.meta` would be undefined (see
 * `libEntry`). The renderer imports this back for its `ValuesOf` — still one
 * declaration, one source of truth.
 */
export const navigationSchema = {
  brandName: { type: 'text', label: '브랜드 이름', required: true },
  brandSubtext: { type: 'text', label: '보조 텍스트' },
  ctaText: { type: 'text', label: 'CTA 텍스트' },
} as const satisfies FieldsSchema;

export const navigationMeta: BlockComponentMeta = {
  componentKey: 'nav',
  category: 'navigation',
  label: 'Navigation',
  fieldsSchema: navigationSchema,
  previewImage: '/component-previews/cafe/nav.webp',
};
