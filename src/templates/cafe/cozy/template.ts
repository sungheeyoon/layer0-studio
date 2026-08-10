import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  "slug": "cafe-cozy",
  "content": {
    "mode": "single",
    "templateKey": "cafe-cozy",
    "globalStyles": {
      "primaryColor": "#8D5B3E",
      "secondaryColor": "#3D2B1F",
      "backgroundColor": "#F5F0E8",
      "fontFamily": "'Playfair Display', 'Pretendard Variable', 'Pretendard', sans-serif",
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
          "brandName": "COZY CORNER",
          "brandSubtext": "Warmth in a Cup"
        }
      },
      {
        "id": "hero-1",
        "type": "hero-split",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "Homemade & Fresh"
        },
        "fields": {
          "eyebrow": "Homemade & Fresh",
          "title1": "Find Your",
          "titleAccent": "Cozy Spot",
          "description": "Relax and enjoy our hand-picked beans and freshly baked pastries.",
          "image": { "url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1100&q=80" }
        }
      },
      {
        "id": "story-1",
        "type": "story",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "story"
        },
        "fields": {
          "title1": "Our Humble",
          "titleAccent": "Beginnings",
          "quote": "Started in a small kitchen, now sharing the warmth with everyone."
        }
      },
      {
        "id": "visit-1",
        "type": "visit",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "visit"
        },
        "fields": {
          "title": "Come Visit",
          "address": "123 Cozy Lane, Seoul"
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
          "brandName": "COZY CORNER"
        }
      }
    ]
  },
  "thumbnailPath": "public/thumbnails/template-cafe-cozy.webp",
  "version": "1.0.0",
  "defaults": {
    "name": "Cafe Cozy",
    "description": "편안하고 따뜻한 분위기의 카페 템플릿. 스토리와 방문 안내 중심.",
    "category": "cafe"
  }
};

export default preset;
