import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  slug: 'cafe-cozy',
  templateKey: 'cafe',
  globalStyles: {
    primaryColor: '#8D5B3E', // Brown
    secondaryColor: '#3D2B1F', // Dark Brown
  },
  composition: [
    {
      id: 'nav-1',
      componentKey: 'nav',
      data: {
        brandName: { value: 'COZY CORNER', type: 'text', label: '브랜드 이름' },
        brandSubtext: { value: 'Warmth in a Cup', type: 'text', label: '보조 텍스트' },
      },
    },
    {
      id: 'hero-1',
      componentKey: 'hero-split',
      data: {
        label: { value: 'Homemade & Fresh', type: 'text', label: '상단 라벨' },
        title1: { value: 'Find Your', type: 'text', label: '타이틀 1행' },
        titleAccent: { value: 'Cozy Spot', type: 'text', label: '강조 타이틀' },
        description: { value: 'Relax and enjoy our hand-picked beans and freshly baked pastries.', type: 'textarea', label: '설명' },
        image: { value: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1100&q=80', type: 'image', label: '이미지' },
      },
    },
    {
      id: 'story-1',
      componentKey: 'story',
      data: {
        title1: { value: 'Our Humble', type: 'text', label: '타이틀 1행' },
        titleAccent: { value: 'Beginnings', type: 'text', label: '강조 타이틀' },
        quote: { value: 'Started in a small kitchen, now sharing the warmth with everyone.', type: 'textarea', label: '인용구' },
      },
    },
    {
      id: 'visit-1',
      componentKey: 'visit',
      data: {
        title: { value: 'Come Visit', type: 'textarea', label: '섹션 타이틀' },
        address: { value: '123 Cozy Lane, Seoul', type: 'text', label: '주소' },
      },
    },
    {
      id: 'footer-1',
      componentKey: 'footer',
      data: {
        brandName: { value: 'COZY CORNER', type: 'text', label: '브랜드 이름' },
      },
    },
  ],
  thumbnailPath: 'public/thumbnails/template-cafe.webp', // Reuse for now
  version: '1.0.0',
  defaults: {
    name: 'Cafe Cozy',
    description: '편안하고 따뜻한 분위기의 카페 템플릿. 스토리와 방문 안내 중심.',
    category: 'food',
  },
};

export default preset;
