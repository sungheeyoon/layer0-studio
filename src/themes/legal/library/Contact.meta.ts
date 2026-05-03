import { SectionComponentMeta } from '../../types';

export const contactMeta: SectionComponentMeta = {
  componentKey: 'contact',
  category: 'contact',
  label: 'Legal Contact',
  dataSchema: {
    title: { type: 'textarea', label: '타이틀', required: true },
    body: { type: 'textarea', label: '본문' },
    phone: { type: 'text', label: '전화번호' },
    hours: { type: 'text', label: '운영 시간' },
    location: { type: 'text', label: '위치' },
  },
  previewImage: '/component-previews/legal/contact.webp',
};
