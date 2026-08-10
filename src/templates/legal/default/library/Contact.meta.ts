import { BlockComponentMeta } from '../../../types';
import type { FieldsSchema } from '@/domain/entities/template.entity';

/**
 * Declared here, not in the .tsx: that is a client component, whose module
 * body never runs server-side, so `Component.meta` would be undefined (see
 * `libEntry`). The renderer imports this back for its `ValuesOf` — still one
 * declaration, one source of truth.
 */
export const contactSchema = {
  title: { type: 'textarea', label: '타이틀', required: true },
  body: { type: 'textarea', label: '본문' },
  phone: { type: 'text', label: '전화번호' },
  hours: { type: 'text', label: '운영 시간' },
  location: { type: 'text', label: '위치' },
} as const satisfies FieldsSchema;

export const contactMeta: BlockComponentMeta = {
  componentKey: 'contact',
  category: 'contact',
  label: 'Legal Contact',
  fieldsSchema: contactSchema,
  previewImage: '/component-previews/legal/contact.webp',
};
