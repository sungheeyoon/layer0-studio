import { TemplatePreset } from '../../types';

/**
 * First **Multi** Site Type preset (ADR-0007). A minimal two-page corporate
 * site: a shared header + footer, and Home / About pages. Exercises the whole
 * Multi stack — `[[...slug]]` routing, page-link nav, shared header on every
 * page. See PLAN_multipage §5 Phase 2 / §7 (tracer bullet).
 */
const preset: TemplatePreset = {
  slug: 'corporate-multipage',
  templateJson: {
    mode: 'multi',
    templateKey: 'corporate-multipage',
    globalStyles: {
      primaryColor: '#0f172a',
      secondaryColor: '#2563eb',
      fontFamily: "'Inter', sans-serif",
      fontSize: '16px',
      layout: 'wide',
    },
    shared: {
      header: [
        {
          id: 'nav-001',
          type: 'nav',
          visible: true,
          data: {
            brandName: { type: 'text', label: 'Brand Name', value: 'Acme' },
          },
        },
      ],
      footer: [
        {
          id: 'footer-001',
          type: 'footer',
          visible: true,
          data: {
            copyright: {
              type: 'text',
              label: 'Copyright',
              value: '© 2026 Acme Inc. All rights reserved.',
            },
          },
        },
      ],
    },
    pages: [
      {
        id: 'page-home',
        slug: 'home',
        visible: true,
        nav: { visible: true, label: 'Home' },
        sections: [
          {
            id: 'home-hero',
            type: 'content',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: 'Eyebrow', value: 'Acme Inc.' },
              heading: {
                type: 'text',
                label: 'Heading',
                value: 'We build dependable software.',
              },
              body: {
                type: 'textarea',
                label: 'Body',
                value:
                  'A small studio shipping web products for growing teams. Strategy, design and engineering under one roof.',
              },
            },
          },
        ],
      },
      {
        id: 'page-about',
        slug: 'about',
        visible: true,
        nav: { visible: true, label: 'About' },
        sections: [
          {
            id: 'about-intro',
            type: 'content',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: 'Eyebrow', value: 'About' },
              heading: {
                type: 'text',
                label: 'Heading',
                value: 'A team that sweats the details.',
              },
              body: {
                type: 'textarea',
                label: 'Body',
                value:
                  'Founded in 2026, we partner with founders to take ideas from sketch to production without the bloat.',
              },
            },
          },
        ],
      },
    ],
  },
  thumbnailPath: 'public/thumbnails/template-corporate-multipage.webp',
  version: '1.0.0',
  defaults: {
    name: 'Corporate Multipage',
    description:
      '여러 페이지(홈·소개)와 공유 헤더/푸터를 갖춘 멀티페이지 기업 사이트 템플릿.',
    category: 'business',
  },
};

export default preset;
