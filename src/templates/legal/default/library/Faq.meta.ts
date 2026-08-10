import { BlockComponentMeta } from '../../../types';
import type { FieldsSchema } from '@/domain/entities/template.entity';

/**
 * Declared here, not in the .tsx: that is a client component, whose module
 * body never runs server-side, so `Component.meta` would be undefined (see
 * `libEntry`). The renderer imports this back for its `ValuesOf` — still one
 * declaration, one source of truth.
 */
export const faqSchema = {
  title: { type: 'text', label: '섹션 타이틀', required: true },
  q1: { type: 'text', label: '질문 1' },
  a1: { type: 'textarea', label: '답변 1' },
  q2: { type: 'text', label: '질문 2' },
  a2: { type: 'textarea', label: '답변 2' },
  q3: { type: 'text', label: '질문 3' },
  a3: { type: 'textarea', label: '답변 3' },
} as const satisfies FieldsSchema;

export const faqMeta: BlockComponentMeta = {
  componentKey: 'faq',
  category: 'content',
  label: 'Legal FAQ',
  fieldsSchema: faqSchema,
  previewImage: '/component-previews/legal/faq.webp',
};
