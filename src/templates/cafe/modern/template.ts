import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  "slug": "cafe-modern",
  "templateJson": {
    "mode": "single",
    "templateKey": "cafe-modern",
    "globalStyles": {
      "primaryColor": "#2A9D8F",
      "secondaryColor": "#264653",
      "fontFamily": "'Playfair Display', 'Pretendard', sans-serif",
      "fontSize": "16px",
      "layout": "wide"
    },
    "sections": [
      {
        "id": "nav-1",
        "type": "nav",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "네비게이션"
        },
        "fields": {
          "brandName": {
            "value": "MODERN CAFE",
            "type": "text",
            "label": "브랜드 이름"
          },
          "brandSubtext": {
            "value": "Espresso Bar",
            "type": "text",
            "label": "보조 텍스트"
          },
          "ctaText": {
            "value": "Find Us",
            "type": "text",
            "label": "CTA 텍스트"
          }
        }
      },
      {
        "id": "hero-1",
        "type": "hero-video",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "Urban Coffee Experience"
        },
        "fields": {
          "eyebrow": {
            "value": "Urban Coffee Experience",
            "type": "text",
            "label": "상단 라벨"
          },
          "title1": {
            "value": "City Lights,",
            "type": "text",
            "label": "타이틀 1행"
          },
          "titleAccent": {
            "value": "Better Coffee",
            "type": "text",
            "label": "강조 타이틀"
          },
          "subtitle": {
            "value": "— Modern Roastery",
            "type": "text",
            "label": "서브타이틀"
          },
          "description": {
            "value": "Sleek, fast, and high-quality. We bring the best specialty coffee to the heart of the city.",
            "type": "textarea",
            "label": "설명"
          },
          "videoUrl": {
            "value": "https://assets.mixkit.co/videos/preview/mixkit-coffee-being-poured-into-a-cup-2384-large.mp4",
            "type": "url",
            "label": "배경 비디오"
          },
          "ctaPrimary": {
            "value": "View Menu",
            "type": "text",
            "label": "기본 CTA"
          },
          "ctaSecondary": {
            "value": "Our Space",
            "type": "text",
            "label": "보조 CTA"
          }
        }
      },
      {
        "id": "marquee-1",
        "type": "marquee",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "마퀴"
        },
        "fields": {
          "item1": {
            "value": "Fast Brew",
            "type": "text",
            "label": "항목 1"
          },
          "item2": {
            "value": "Urban Vibe",
            "type": "text",
            "label": "항목 2"
          },
          "item3": {
            "value": "Tech-First",
            "type": "text",
            "label": "항목 3"
          },
          "item4": {
            "value": "Specialty",
            "type": "text",
            "label": "항목 4"
          }
        }
      },
      {
        "id": "menu-1",
        "type": "menu",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "Menu"
        },
        "fields": {
          "eyebrow": {
            "value": "Menu",
            "type": "text",
            "label": "섹션 라벨"
          },
          "title": {
            "value": "Crafted with\nPrecision",
            "type": "textarea",
            "label": "섹션 타이틀"
          },
          "description": {
            "value": "Modern techniques, traditional beans.",
            "type": "textarea",
            "label": "섹션 설명"
          },
          "p1Title": {
            "value": "Nitro Cold Brew",
            "type": "text",
            "label": "P1 제목"
          },
          "p1Price": {
            "value": "5,500",
            "type": "text",
            "label": "P1 가격"
          },
          "p2Title": {
            "value": "Flat White",
            "type": "text",
            "label": "P2 제목"
          },
          "p2Price": {
            "value": "5,000",
            "type": "text",
            "label": "P2 가격"
          }
        }
      },
      {
        "id": "footer-1",
        "type": "footer",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "푸터"
        },
        "fields": {
          "brandName": {
            "value": "MODERN CAFE",
            "type": "text",
            "label": "브랜드 이름"
          },
          "copyright": {
            "value": "© 2024 Modern Cafe. All rights reserved.",
            "type": "text",
            "label": "저작권"
          }
        }
      }
    ]
  },
  "thumbnailPath": "public/thumbnails/template-cafe-modern.webp",
  "version": "1.0.0",
  "defaults": {
    "name": "Cafe Modern",
    "description": "도시적인 분위기의 현대적인 카페 템플릿. 비디오 히어로와 깔끔한 레이아웃.",
    "category": "cafe"
  }
};

export default preset;
