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
    "sections": [
      {
        "id": "hero-001",
        "type": "hero",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "히어로"
        },
        "fields": {
          "title": {
            "value": "We Build Digital Experiences",
            "type": "text",
            "label": "Main Title",
            "editable": true
          },
          "subtitle": {
            "value": "Strategy · Design · Technology",
            "type": "text",
            "label": "Subtitle",
            "editable": true
          },
          "backgroundImage": {
            "value": "https://images.unsplash.com/photo-1497366216548-37526070297c",
            "type": "image",
            "label": "Background Image",
            "editable": true
          },
          "ctaText": {
            "value": "Explore Our Work",
            "type": "text",
            "label": "CTA Button Text",
            "editable": true
          },
          "ctaUrl": {
            "value": "#contact",
            "type": "url",
            "label": "CTA Button Link",
            "editable": true
          }
        }
      },
      {
        "id": "about-001",
        "type": "about",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "about"
        },
        "fields": {
          "title": {
            "value": "Our Philosophy",
            "type": "text",
            "label": "Section Title",
            "editable": true
          },
          "subtitle": {
            "value": "Crafting the future",
            "type": "text",
            "label": "Subtitle",
            "editable": true
          },
          "body": {
            "value": "We believe in the power of design to transform businesses...",
            "type": "textarea",
            "label": "Description",
            "editable": true
          },
          "image": {
            "value": "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
            "type": "image",
            "label": "Section Image",
            "editable": true
          }
        }
      },
      {
        "id": "features-001",
        "type": "features",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "features"
        },
        "fields": {
          "title": {
            "value": "Core Capabilities",
            "type": "text",
            "label": "Section Title",
            "editable": true
          },
          "subtitle": {
            "value": "What we do best",
            "type": "text",
            "label": "Subtitle",
            "editable": true
          },
          "strategy": {
            "value": "Data-driven approach to digital transformation",
            "type": "text",
            "label": "Strategy",
            "editable": true
          },
          "design": {
            "value": "Human-centered design that drives engagement",
            "type": "text",
            "label": "Design",
            "editable": true
          },
          "development": {
            "value": "Scalable solutions built on modern architecture",
            "type": "text",
            "label": "Development",
            "editable": true
          },
          "analytics": {
            "value": "Continuous optimization through real-time insights",
            "type": "text",
            "label": "Analytics",
            "editable": true
          }
        }
      },
      {
        "id": "contact-001",
        "type": "contact",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "contact"
        },
        "fields": {
          "title": {
            "value": "Get in Touch",
            "type": "text",
            "label": "Section Title",
            "editable": true
          },
          "email": {
            "value": "hello@company.com",
            "type": "text",
            "label": "Email",
            "editable": true
          },
          "phone": {
            "value": "+82 02-1234-5678",
            "type": "text",
            "label": "Phone",
            "editable": true
          },
          "address": {
            "value": "Seoul, South Korea",
            "type": "text",
            "label": "Address",
            "editable": true
          }
        }
      },
      {
        "id": "footer-001",
        "type": "footer",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "푸터"
        },
        "fields": {
          "companyName": {
            "value": "ACME Corp",
            "type": "text",
            "label": "Company Name",
            "editable": true
          },
          "copyright": {
            "value": "© 2026 ACME Corp. All rights reserved.",
            "type": "text",
            "label": "Copyright Text",
            "editable": true
          }
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
