import { BlockComponentMeta } from '../../../types';
import type { FieldsSchema } from '@/domain/entities/template.entity';

/**
 * Declared here, not in the .tsx: that is a client component, whose module
 * body never runs server-side, so `Component.meta` would be undefined (see
 * `libEntry`). The renderer imports this back for its `ValuesOf` — still one
 * declaration, one source of truth.
 */
export const contactSchema = {
  eyebrow: { type: 'text', label: '섹션 라벨' },
  title: { type: 'textarea', label: '섹션 타이틀', required: true },
  description: { type: 'textarea', label: '설명' },
  phone: { type: 'text', label: '전화번호' },
  email: { type: 'text', label: '이메일' },
  address: { type: 'text', label: '주소' },
} as const satisfies FieldsSchema;

export const contactMeta: BlockComponentMeta = {
  componentKey: 'contact',
  category: 'contact',
  label: 'Interior Contact',
  fieldsSchema: contactSchema,
  previewImage: '/component-previews/interior/contact.webp',
};
