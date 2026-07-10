import { SectionComponentMeta } from '../../../types';

export const navigationMeta: SectionComponentMeta = {
  componentKey: 'nav',
  category: 'navigation',
  label: '네비게이션',
  fieldsSchema: {
    brandName: { type: 'text', label: '학원 이름', required: true },
    brandSubtext: { type: 'text', label: '보조 텍스트' },
    ctaText: { type: 'text', label: 'CTA 문구' },
    ctaUrl: { type: 'url', label: 'CTA 링크' },
  },
  previewImage: '/component-previews/academy/nav.webp',
};
