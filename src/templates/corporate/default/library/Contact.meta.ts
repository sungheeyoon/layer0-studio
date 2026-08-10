import { BlockComponentMeta } from '../../../types';
import type { FieldsSchema } from '@/domain/entities/template.entity';

/**
 * Lives here rather than in `Contact.tsx` because that is a client component:
 * a server-side import of it is a client reference whose module body never
 * runs, so `Component.meta` would be undefined (see `libEntry`). The renderer
 * imports this schema back for its `ValuesOf` — still one declaration.
 */
export const contactSchema = {
  title: { type: 'text', label: 'Block Title', required: true },
  email: { type: 'text', label: 'Email' },
  phone: { type: 'text', label: 'Phone' },
  address: { type: 'text', label: 'Address' },
} as const satisfies FieldsSchema;

export const contactMeta: BlockComponentMeta = {
  componentKey: 'contact',
  category: 'contact',
  label: 'Corporate Contact',
  fieldsSchema: contactSchema,
  previewImage: '/component-previews/corporate/contact.webp',
};
