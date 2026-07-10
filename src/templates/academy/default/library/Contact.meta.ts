import { SectionComponentMeta } from '../../../types';

export const contactMeta: SectionComponentMeta = {
  componentKey: 'contact',
  category: 'contact',
  label: '상담 신청 CTA',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    title: { type: 'text', label: '섹션 제목', required: true },
    subtitle: { type: 'textarea', label: '섹션 설명' },
    phone: { type: 'text', label: '전화번호' },
    kakaoText: { type: 'text', label: '카카오톡 안내' },
  },
  previewImage: '/component-previews/academy/contact.webp',
};
