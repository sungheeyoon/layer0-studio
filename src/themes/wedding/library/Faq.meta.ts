import { SectionComponentMeta } from '../../types';

export const faqMeta: SectionComponentMeta = {
  componentKey: 'faq',
  category: 'content',
  label: 'Wedding FAQ',
  dataSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    title: { type: 'text', label: '타이틀', required: true },
    q1: { type: 'text', label: '질문 1' },
    a1: { type: 'textarea', label: '답변 1' },
    q2: { type: 'text', label: '질문 2' },
    a2: { type: 'textarea', label: '답변 2' },
    q3: { type: 'text', label: '질문 3' },
    a3: { type: 'textarea', label: '답변 3' },
    q4: { type: 'text', label: '질문 4' },
    a4: { type: 'textarea', label: '답변 4' },
  },
  previewImage: '/component-previews/wedding/faq.webp',
};
