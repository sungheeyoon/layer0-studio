import { SectionComponentMeta } from '../../types';

export const navMeta: SectionComponentMeta = {
  componentKey: 'nav',
  category: 'navigation',
  label: 'Fitness Navigation',
  dataSchema: {
    brandName: { type: 'text', label: '브랜드 이름' },
    ctaText: { type: 'text', label: 'CTA 텍스트' },
    menu1: { type: 'text', label: '메뉴 1' },
    menu2: { type: 'text', label: '메뉴 2' },
    menu3: { type: 'text', label: '메뉴 3' },
    menu4: { type: 'text', label: '메뉴 4' },
  },
  previewImage: '/component-previews/fitness/nav.webp',
};
