import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  "slug": "corporate-default",
  "content": {
    "mode": "single",
    "templateKey": "corporate-default",
    "globalStyles": {
      "primaryColor": "#1a1a2e",
      "secondaryColor": "#e94560",
      "backgroundColor": "#ffffff",
      "fontFamily": "'Inter', sans-serif",
      "fontSize": "16px",
      "layout": "wide"
    },
    "blocks": [
      {
        "id": "hero-001",
        "type": "hero",
        "visible": true,
        "fields": {
          "title": "We Build Digital Experiences",
          "subtitle": "Strategy · Design · Technology",
          "backgroundImage": { "url": "https://images.unsplash.com/photo-1497366216548-37526070297c" },
          "ctaText": "Explore Our Work",
          "ctaUrl": "#contact"
        }
      },
      {
        "id": "about-001",
        "type": "about",
        "visible": true,
        "fields": {
          "title": "Our Philosophy",
          "subtitle": "Crafting the future",
          "body": "We believe in the power of design to transform businesses...",
          "image": { "url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c" }
        }
      },
      {
        "id": "features-001",
        "type": "features",
        "visible": true,
        "fields": {
          "title": "Core Capabilities",
          "subtitle": "What we do best",
          "strategy": "Data-driven approach to digital transformation",
          "design": "Human-centered design that drives engagement",
          "development": "Scalable solutions built on modern architecture",
          "analytics": "Continuous optimization through real-time insights"
        }
      },
      {
        "id": "contact-001",
        "type": "contact",
        "visible": true,
        "fields": {
          "title": "Get in Touch",
          "email": "hello@company.com",
          "phone": "+82 02-1234-5678",
          "address": "Seoul, South Korea"
        }
      },
      {
        "id": "footer-001",
        "type": "footer",
        "visible": true,
        "fields": {
          "companyName": "ACME Corp",
          "copyright": "© 2026 ACME Corp. All rights reserved."
        }
      }
    ]
  },
  "thumbnailPath": "public/thumbnails/template-corporate-default.webp",
  "version": "1.1.0",
  "defaults": {
    "name": "Corporate",
    "description": "전문적인 기업 웹사이트 템플릿. 브랜드 스토리, 서비스 소개, 연락처 섹션 포함.",
    "category": "business"
  }
};

export default preset;
