import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  "slug": "academy-default",
  "content": {
    "mode": "single",
    "templateKey": "academy-default",
    "globalStyles": {
      "primaryColor": "#1B2A4A",
      "secondaryColor": "#1F7A5C",
      "backgroundColor": "#FFFFFF",
      "fontFamily": "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', sans-serif",
      "fontSize": "16px",
      "layout": "wide"
    },
    "blocks": [
      {
        "id": "nav-001",
        "type": "nav",
        "visible": true,
        "fields": {
          "brandName": "우리입시학원",
          "brandSubtext": "ACADEMY",
          "ctaText": "상담 신청",
          "ctaUrl": "#section-contact-001"
        }
      },
      {
        "id": "hero-001",
        "type": "hero",
        "visible": true,
        "fields": {
          "eyebrow": "대치·목동 20년 입시 노하우",
          "title": "성적으로 증명하는\n맞춤 입시 전략",
          "subtitle": "학생 한 명의 목표에서 시작합니다. 진단 → 반 편성 → 주간 관리로 이어지는 체계적인 커리큘럼이 결과를 만듭니다.",
          "ctaText": "무료 레벨테스트 신청",
          "ctaUrl": "#section-contact-001",
          "phoneText": "대표전화 02-123-4567",
          "backgroundImage": { "url": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80" }
        }
      },
      {
        "id": "features-001",
        "type": "features",
        "visible": true,
        "menu": { "label": "특장점" },
        "fields": {
          "eyebrow": "WHY US",
          "title": "우리 학원만의 강점",
          "subtitle": "실력 향상은 시스템에서 나옵니다.",
          "items": [
            {
              "id": "items-1",
              "fields": {
                "title": "1:1 수준별 반 편성",
                "desc": "입학 진단고사로 정확한 현재 위치를 파악하고, 목표 대학에 맞춘 반으로 배정합니다."
              }
            },
            {
              "id": "items-2",
              "fields": {
                "title": "주간 학습 리포트",
                "desc": "매주 학습량·오답·태도를 학부모님께 문자로 공유합니다."
              }
            },
            {
              "id": "items-3",
              "fields": {
                "title": "전담 담임제",
                "desc": "과목 강사와 별도로 담임이 출결·멘탈·진로까지 관리합니다."
              }
            }
          ]
        }
      },
      {
        "id": "curriculum-001",
        "type": "curriculum",
        "visible": true,
        "menu": { "label": "커리큘럼" },
        "fields": {
          "eyebrow": "CURRICULUM",
          "title": "커리큘럼 · 반 편성",
          "subtitle": "학년과 목표에 맞춘 단계별 과정을 운영합니다.",
          "items": [
            {
              "id": "items-1",
              "fields": {
                "name": "중등 내신 완성반",
                "target": "중1~중3",
                "desc": "학교별 시험 범위에 맞춘 내신 대비. 개념 정리 후 실전 문제풀이로 마무리합니다."
              }
            },
            {
              "id": "items-2",
              "fields": {
                "name": "고등 수능 정규반",
                "target": "고1~고3",
                "desc": "수능 유형별 전략과 EBS 연계 분석. 매월 모의고사로 실력을 점검합니다."
              }
            },
            {
              "id": "items-3",
              "fields": {
                "name": "예비 고1 선행반",
                "target": "중3 겨울",
                "desc": "고등 진학 전 핵심 개념을 미리 다지는 집중 과정입니다."
              }
            }
          ]
        }
      },
      {
        "id": "teachers-001",
        "type": "teachers",
        "visible": true,
        "menu": { "label": "강사진" },
        "fields": {
          "eyebrow": "TEACHERS",
          "title": "검증된 강사진",
          "subtitle": "각 과목 전문 강사가 책임지고 지도합니다.",
          "items": [
            {
              "id": "items-1",
              "fields": {
                "name": "김민석 원장",
                "subject": "수학",
                "bio": "서울대 수리과학부 졸업. 15년 경력의 수능 수학 전문.",
                "image": { "url": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80" }
              }
            },
            {
              "id": "items-2",
              "fields": {
                "name": "이서연 강사",
                "subject": "영어",
                "bio": "연세대 영문학과 졸업. 내신·수능 영어 1등급 다수 배출.",
                "image": { "url": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80" }
              }
            },
            {
              "id": "items-3",
              "fields": {
                "name": "박준호 강사",
                "subject": "국어",
                "bio": "고려대 국어교육과 졸업. 비문학 독해 전략 특화.",
                "image": { "url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80" }
              }
            }
          ]
        }
      },
      {
        "id": "tuition-001",
        "type": "tuition",
        "visible": true,
        "menu": { "label": "수강료" },
        "fields": {
          "eyebrow": "TUITION",
          "title": "시간표 · 수강료",
          "note": "※ 교재비 별도. 형제·자매 등록 시 10% 할인됩니다.",
          "items": [
            {
              "id": "items-1",
              "fields": {
                "name": "중등 내신반",
                "schedule": "월·수·금 17:00–19:00",
                "price": "월 32만원"
              }
            },
            {
              "id": "items-2",
              "fields": {
                "name": "고등 정규반",
                "schedule": "화·목·토 19:00–22:00",
                "price": "월 45만원"
              }
            },
            {
              "id": "items-3",
              "fields": {
                "name": "주말 단과 특강",
                "schedule": "토·일 10:00–13:00",
                "price": "월 28만원"
              }
            }
          ]
        }
      },
      {
        "id": "results-001",
        "type": "results",
        "visible": true,
        "menu": { "label": "합격실적" },
        "fields": {
          "eyebrow": "RESULTS",
          "title": "숫자로 보는 합격 실적",
          "items": [
            {
              "id": "items-1",
              "fields": {
                "value": "127명",
                "label": "2025 주요대 합격"
              }
            },
            {
              "id": "items-2",
              "fields": {
                "value": "89%",
                "label": "내신 1~2등급 비율"
              }
            },
            {
              "id": "items-3",
              "fields": {
                "value": "20년",
                "label": "지역 운영 경력"
              }
            },
            {
              "id": "items-4",
              "fields": {
                "value": "1:8",
                "label": "강사 대 학생 비율"
              }
            }
          ]
        }
      },
      {
        "id": "contact-001",
        "type": "contact",
        "visible": true,
        "fields": {
          "eyebrow": "CONSULTING",
          "title": "지금 상담을 신청하세요",
          "subtitle": "레벨테스트는 무료입니다.\n편하신 방법으로 문의해 주세요.",
          "phone": "02-123-4567",
          "kakaoText": "@우리학원 (채널 검색)"
        }
      },
      {
        "id": "location-001",
        "type": "location",
        "visible": true,
        "menu": { "label": "오시는 길" },
        "fields": {
          "eyebrow": "LOCATION",
          "title": "오시는 길",
          "address": "서울 강남구 테헤란로 123, 5층",
          "transit": "2호선 강남역 4번 출구 도보 5분\n버스 146·360 강남역 정류장 하차",
          "hours": "평일 14:00–22:00\n토요일 10:00–18:00 (일요일 휴무)",
          "mapImage": { "url": "" }
        }
      },
      {
        "id": "footer-001",
        "type": "footer",
        "visible": true,
        "fields": {
          "academyName": "우리입시학원",
          "tagline": "학생의 목표에서 시작하는 맞춤 입시",
          "phone": "02-123-4567",
          "copyright": "© 2026 우리입시학원. All rights reserved."
        }
      }
    ]
  },
  "thumbnailPath": "public/thumbnails/template-academy-default.webp",
  "version": "1.0.0",
  "defaults": {
    "name": "학원",
    "description": "입시·보습 학원을 위한 신뢰감 있는 원페이지 템플릿. 특장점·커리큘럼·강사진·수강료·합격실적·상담신청 섹션 포함.",
    "category": "education"
  }
};

export default preset;
