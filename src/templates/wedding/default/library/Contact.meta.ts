import { BlockComponentMeta } from '../../../types';
import type { FieldsSchema } from '@/domain/entities/template.entity';

/**
 * Declared here, not in the .tsx: that is a client component, whose module
 * body never runs server-side, so `Component.meta` would be undefined (see
 * `libEntry`). The renderer imports this back for its `ValuesOf` — still one
 * declaration, one source of truth.
 */
export const contactSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  title: { type: 'textarea', label: '타이틀', required: true },
  body: { type: 'textarea', label: '본문' },
  phone: { type: 'text', label: '전화번호' },
  hours: { type: 'text', label: '운영 시간' },
  location: { type: 'text', label: '쇼룸 위치' },
  backgroundImage: { type: 'image', label: '배경 이미지' },
  formTitle: { type: 'text', label: '폼 제목' },
  formNote: { type: 'text', label: '폼 안내 문구' },
} as const satisfies FieldsSchema;

export const contactMeta: BlockComponentMeta = {
  componentKey: 'contact',
  category: 'contact',
  label: 'Wedding Contact',
  fieldsSchema: contactSchema,
  previewImage: '/component-previews/wedding/contact.webp',
};
