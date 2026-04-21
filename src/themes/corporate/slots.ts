// src/themes/corporate/slots.ts
import { ThemeSlotDefinition } from '../types';
import { TemplateJson } from '@/domain/entities/template.entity';

// 기존 슬롯 정의 유지
export const slots: ThemeSlotDefinition[] = [
  { type: 'hero', label: 'Hero', required: true },
  { type: 'about', label: 'About', required: false },
  { type: 'features', label: 'Features', required: false },
  { type: 'contact', label: 'Contact', required: false },
  { type: 'footer', label: 'Footer', required: false },
];

// ✨ 새롭게 추가: 해당 테마(Corporate)의 완벽한 초기 JSON 형태 내장
export const defaultTemplateJson: TemplateJson = {
  themeKey: "corporate",
  globalStyles: {
    primaryColor: "#1a1a2e",
    secondaryColor: "#e94560",
    fontFamily: "'Inter', sans-serif",
    fontSize: "16px",
    layout: "wide"
  },
  sections: [
    {
      id: "hero-001",
      type: "hero",
      order: 1,
      visible: true,
      editable: true,
      data: {
        title: { value: "We Build Digital Experiences", type: "text", label: "Main Title", editable: true },
        subtitle: { value: "Strategy · Design · Technology", type: "text", label: "Subtitle", editable: true },
        backgroundImage: { value: "https://images.unsplash.com/photo-1497366216548-37526070297c", type: "image", label: "Background Image", editable: true },
        ctaText: { value: "Explore Our Work", type: "text", label: "CTA Button Text", editable: true },
        ctaUrl: { value: "#contact", type: "url", label: "CTA Button Link", editable: true }
      }
    },
    {
      id: "about-001",
      type: "about",
      order: 2,
      visible: true,
      editable: true,
      data: {
        title: { value: "Our Philosophy", type: "text", label: "Section Title", editable: true },
        subtitle: { value: "Crafting the future", type: "text", label: "Subtitle", editable: true },
        body: { value: "We believe in the power of design to transform businesses...", type: "textarea", label: "Description", editable: true },
        image: { value: "https://images.unsplash.com/photo-1522071820081-009f0129c71c", type: "image", label: "Section Image", editable: true }
      }
    },
    {
      id: "features-001",
      type: "features",
      order: 3,
      visible: true,
      editable: true,
      data: {
        title: { value: "Core Capabilities", type: "text", label: "Section Title", editable: true },
        subtitle: { value: "What we do best", type: "text", label: "Subtitle", editable: true },
        strategy: { value: "Data-driven approach to digital transformation", type: "text", label: "Strategy", editable: true },
        design: { value: "Human-centered design that drives engagement", type: "text", label: "Design", editable: true },
        development: { value: "Scalable solutions built on modern architecture", type: "text", label: "Development", editable: true },
        analytics: { value: "Continuous optimization through real-time insights", type: "text", label: "Analytics", editable: true }
      }
    },
    {
      id: "contact-001",
      type: "contact",
      order: 4,
      visible: true,
      editable: true,
      data: {
        title: { value: "Get in Touch", type: "text", label: "Section Title", editable: true },
        email: { value: "hello@company.com", type: "text", label: "Email", editable: true },
        phone: { value: "+82 02-1234-5678", type: "text", label: "Phone", editable: true },
        address: { value: "Seoul, South Korea", type: "text", label: "Address", editable: true }
      }
    },
    {
      id: "footer-001",
      type: "footer",
      order: 5,
      visible: true,
      editable: true,
      data: {
        companyName: { value: "ACME Corp", type: "text", label: "Company Name", editable: true },
        copyright: { value: "© 2026 ACME Corp. All rights reserved.", type: "text", label: "Copyright Text", editable: true }
      }
    }
  ]
};
