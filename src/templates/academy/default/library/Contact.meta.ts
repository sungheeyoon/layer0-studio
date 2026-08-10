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
  title: { type: 'text', label: '섹션 제목', required: true },
  subtitle: { type: 'textarea', label: '섹션 설명' },
  phone: { type: 'text', label: '전화번호' },
  kakaoText: { type: 'text', label: '카카오톡 안내' },
} as const satisfies FieldsSchema;

export const contactMeta: BlockComponentMeta = {
  componentKey: 'contact',
  category: 'contact',
  label: '상담 신청 CTA',
  fieldsSchema: contactSchema,
  previewImage: '/component-previews/academy/contact.webp',
};
