import { SectionComponentMeta } from '../../../types';

export const contactMeta: SectionComponentMeta = {
  componentKey: 'contact',
  category: 'contact',
  label: 'Wedding Contact',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    title: { type: 'textarea', label: '타이틀', required: true },
    body: { type: 'textarea', label: '본문' },
    phone: { type: 'text', label: '전화번호' },
    hours: { type: 'text', label: '운영 시간' },
    location: { type: 'text', label: '쇼룸 위치' },
    backgroundImage: { type: 'image', label: '배경 이미지' },
    formTitle: { type: 'text', label: '폼 제목' },
    formNote: { type: 'text', label: '폼 안내 문구' },
  },
  previewImage: '/component-previews/wedding/contact.webp',
};
