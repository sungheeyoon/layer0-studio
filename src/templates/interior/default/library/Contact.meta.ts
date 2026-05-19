import { SectionComponentMeta } from '../../../types';

export const contactMeta: SectionComponentMeta = {
  componentKey: 'contact',
  category: 'contact',
  label: 'Interior Contact',
  dataSchema: {
    label: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀', required: true },
    description: { type: 'textarea', label: '설명' },
    phone: { type: 'text', label: '전화번호' },
    email: { type: 'text', label: '이메일' },
    address: { type: 'text', label: '주소' },
  },
  previewImage: '/component-previews/interior/contact.webp',
};
