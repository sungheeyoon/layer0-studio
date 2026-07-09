import { SectionComponentMeta } from '../../../types';

export const contactMeta: SectionComponentMeta = {
  componentKey: 'contact',
  category: 'contact',
  label: 'Corporate Contact',
  fieldsSchema: {
    title: { type: 'text', label: 'Section Title', required: true },
    email: { type: 'text', label: 'Email' },
    phone: { type: 'text', label: 'Phone' },
    address: { type: 'text', label: 'Address' },
  },
  previewImage: '/component-previews/corporate/contact.webp',
};
