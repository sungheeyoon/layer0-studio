import { ThemeSlotDefinition } from '../types';

export const slots: ThemeSlotDefinition[] = [
  { type: 'hero',     label: 'Hero',           required: true  },
  { type: 'about',    label: 'About',          required: false },
  { type: 'features', label: 'Features',       required: false },
  { type: 'contact',  label: 'Contact',        required: false },
  { type: 'footer',   label: 'Footer',         required: false },
];
