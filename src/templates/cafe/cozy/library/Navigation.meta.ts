import { SectionComponentMeta } from '../../../types';

export const navigationMeta: SectionComponentMeta = {
  componentKey: 'nav',
  category: 'navigation',
  label: 'Navigation',
  dataSchema: {
    brandName: { type: 'text', label: '브랜드 이름', required: true },
    brandSubtext: { type: 'text', label: '보조 텍스트' },
    ctaText: { type: 'text', label: 'CTA 텍스트' },
  },
  previewImage: '/component-previews/cafe/nav.webp',
};
