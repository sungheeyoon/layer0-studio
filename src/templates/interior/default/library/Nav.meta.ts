import { SectionComponentMeta } from '../../../types';

export const navMeta: SectionComponentMeta = {
  componentKey: 'nav',
  category: 'navigation',
  label: 'Interior Navigation',
  dataSchema: {
    brandName: { type: 'text', label: '브랜드 이름' },
    ctaText: { type: 'text', label: 'CTA 텍스트' },
  },
  previewImage: '/component-previews/interior/nav.webp',
};
