import { SectionComponentMeta } from '../../../types';

export const navigationMeta: SectionComponentMeta = {
  componentKey: 'nav',
  category: 'navigation',
  label: 'Navigation',
  dataSchema: {
    brandName: { type: 'text', label: '브랜드 이름', required: true },
    brandSubtext: { type: 'text', label: '보조 텍스트' },
    menu1: { type: 'text', label: '메뉴 1' },
    menu2: { type: 'text', label: '메뉴 2' },
    menu3: { type: 'text', label: '메뉴 3' },
    menu4: { type: 'text', label: '메뉴 4' },
    ctaText: { type: 'text', label: 'CTA 텍스트' },
  },
  previewImage: '/component-previews/cafe/nav.webp',
};
