import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  "slug": "academy-default",
  "content": {
    "mode": "single",
    "templateKey": "academy-default",
    "globalStyles": {
      "primaryColor": "#1B2A4A",
      "secondaryColor": "#1F7A5C",
      "fontFamily": "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
      "fontSize": "16px",
      "layout": "wide"
    },
    "sections": [
      {
        "id": "nav-001",
        "type": "nav",
        "visible": true,
        "nav": { "visible": false, "label": "네비게이션" },
        "fields": {
          "brandName": { "value": "우리입시학원", "type": "text", "label": "학원 이름", "editable": true },
          "brandSubtext": { "value": "ACADEMY", "type": "text", "label": "보조 텍스트", "editable": true },
          "ctaText": { "value": "상담 신청", "type": "text", "label": "CTA 문구", "editable": true },
          "ctaUrl": { "value": "#section-contact-001", "type": "url", "label": "CTA 링크", "editable": true }
        }
      },
      {
        "id": "hero-001",
        "type": "hero",
        "visible": true,
        "nav": { "visible": false, "label": "히어로" },
        "fields": {
          "eyebrow": { "value": "대치·목동 20년 입시 노하우", "type": "text", "label": "상단 라벨", "editable": true },
          "title": { "value": "성적으로 증명하는\n맞춤 입시 전략", "type": "textarea", "label": "메인 슬로건", "editable": true },
          "subtitle": { "value": "학생 한 명의 목표에서 시작합니다. 진단 → 반 편성 → 주간 관리로 이어지는 체계적인 커리큘럼이 결과를 만듭니다.", "type": "textarea", "label": "보조 설명", "editable": true },
          "ctaText": { "value": "무료 레벨테스트 신청", "type": "text", "label": "상담 버튼 문구", "editable": true },
          "ctaUrl": { "value": "#section-contact-001", "type": "url", "label": "상담 버튼 링크", "editable": true },
          "phoneText": { "value": "대표전화 02-123-4567", "type": "text", "label": "전화 안내 문구", "editable": true },
          "backgroundImage": { "value": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80", "type": "image", "label": "배경 이미지", "editable": true }
        }
      },
      {
        "id": "features-001",
        "type": "features",
        "visible": true,
        "nav": { "visible": true, "label": "특장점" },
        "fields": {
          "eyebrow": { "value": "WHY US", "type": "text", "label": "상단 라벨", "editable": true },
          "title": { "value": "우리 학원만의 강점", "type": "text", "label": "섹션 제목", "editable": true },
          "subtitle": { "value": "실력 향상은 시스템에서 나옵니다.", "type": "textarea", "label": "섹션 설명", "editable": true },
          "items": {
            "type": "array",
            "label": "특장점 항목",
            "items": [
              { "title": { "value": "1:1 수준별 반 편성", "type": "text", "label": "제목" }, "desc": { "value": "입학 진단고사로 정확한 현재 위치를 파악하고, 목표 대학에 맞춘 반으로 배정합니다.", "type": "textarea", "label": "설명" } },
              { "title": { "value": "주간 학습 리포트", "type": "text", "label": "제목" }, "desc": { "value": "매주 학습량·오답·태도를 학부모님께 문자로 공유합니다.", "type": "textarea", "label": "설명" } },
              { "title": { "value": "전담 담임제", "type": "text", "label": "제목" }, "desc": { "value": "과목 강사와 별도로 담임이 출결·멘탈·진로까지 관리합니다.", "type": "textarea", "label": "설명" } }
            ]
          }
        }
      },
      {
        "id": "curriculum-001",
        "type": "curriculum",
        "visible": true,
        "nav": { "visible": true, "label": "커리큘럼" },
        "fields": {
          "eyebrow": { "value": "CURRICULUM", "type": "text", "label": "상단 라벨", "editable": true },
          "title": { "value": "커리큘럼 · 반 편성", "type": "text", "label": "섹션 제목", "editable": true },
          "subtitle": { "value": "학년과 목표에 맞춘 단계별 과정을 운영합니다.", "type": "textarea", "label": "섹션 설명", "editable": true },
          "items": {
            "type": "array",
            "label": "커리큘럼 항목",
            "items": [
              { "name": { "value": "중등 내신 완성반", "type": "text", "label": "반/과정 이름" }, "target": { "value": "중1~중3", "type": "text", "label": "대상" }, "desc": { "value": "학교별 시험 범위에 맞춘 내신 대비. 개념 정리 후 실전 문제풀이로 마무리합니다.", "type": "textarea", "label": "설명" } },
              { "name": { "value": "고등 수능 정규반", "type": "text", "label": "반/과정 이름" }, "target": { "value": "고1~고3", "type": "text", "label": "대상" }, "desc": { "value": "수능 유형별 전략과 EBS 연계 분석. 매월 모의고사로 실력을 점검합니다.", "type": "textarea", "label": "설명" } },
              { "name": { "value": "예비 고1 선행반", "type": "text", "label": "반/과정 이름" }, "target": { "value": "중3 겨울", "type": "text", "label": "대상" }, "desc": { "value": "고등 진학 전 핵심 개념을 미리 다지는 집중 과정입니다.", "type": "textarea", "label": "설명" } }
            ]
          }
        }
      },
      {
        "id": "teachers-001",
        "type": "teachers",
        "visible": true,
        "nav": { "visible": true, "label": "강사진" },
        "fields": {
          "eyebrow": { "value": "TEACHERS", "type": "text", "label": "상단 라벨", "editable": true },
          "title": { "value": "검증된 강사진", "type": "text", "label": "섹션 제목", "editable": true },
          "subtitle": { "value": "각 과목 전문 강사가 책임지고 지도합니다.", "type": "textarea", "label": "섹션 설명", "editable": true },
          "items": {
            "type": "array",
            "label": "강사 항목",
            "items": [
              { "name": { "value": "김민석 원장", "type": "text", "label": "이름" }, "subject": { "value": "수학", "type": "text", "label": "담당 과목" }, "bio": { "value": "서울대 수리과학부 졸업. 15년 경력의 수능 수학 전문.", "type": "textarea", "label": "소개/경력" }, "image": { "value": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80", "type": "image", "label": "사진" } },
              { "name": { "value": "이서연 강사", "type": "text", "label": "이름" }, "subject": { "value": "영어", "type": "text", "label": "담당 과목" }, "bio": { "value": "연세대 영문학과 졸업. 내신·수능 영어 1등급 다수 배출.", "type": "textarea", "label": "소개/경력" }, "image": { "value": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80", "type": "image", "label": "사진" } },
              { "name": { "value": "박준호 강사", "type": "text", "label": "이름" }, "subject": { "value": "국어", "type": "text", "label": "담당 과목" }, "bio": { "value": "고려대 국어교육과 졸업. 비문학 독해 전략 특화.", "type": "textarea", "label": "소개/경력" }, "image": { "value": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80", "type": "image", "label": "사진" } }
            ]
          }
        }
      },
      {
        "id": "tuition-001",
        "type": "tuition",
        "visible": true,
        "nav": { "visible": true, "label": "수강료" },
        "fields": {
          "eyebrow": { "value": "TUITION", "type": "text", "label": "상단 라벨", "editable": true },
          "title": { "value": "시간표 · 수강료", "type": "text", "label": "섹션 제목", "editable": true },
          "note": { "value": "※ 교재비 별도. 형제·자매 등록 시 10% 할인됩니다.", "type": "textarea", "label": "하단 안내 문구", "editable": true },
          "items": {
            "type": "array",
            "label": "과정 항목",
            "items": [
              { "name": { "value": "중등 내신반", "type": "text", "label": "과정명" }, "schedule": { "value": "월·수·금 17:00–19:00", "type": "text", "label": "시간표" }, "price": { "value": "월 32만원", "type": "text", "label": "수강료" } },
              { "name": { "value": "고등 정규반", "type": "text", "label": "과정명" }, "schedule": { "value": "화·목·토 19:00–22:00", "type": "text", "label": "시간표" }, "price": { "value": "월 45만원", "type": "text", "label": "수강료" } },
              { "name": { "value": "주말 단과 특강", "type": "text", "label": "과정명" }, "schedule": { "value": "토·일 10:00–13:00", "type": "text", "label": "시간표" }, "price": { "value": "월 28만원", "type": "text", "label": "수강료" } }
            ]
          }
        }
      },
      {
        "id": "results-001",
        "type": "results",
        "visible": true,
        "nav": { "visible": true, "label": "합격실적" },
        "fields": {
          "eyebrow": { "value": "RESULTS", "type": "text", "label": "상단 라벨", "editable": true },
          "title": { "value": "숫자로 보는 합격 실적", "type": "text", "label": "섹션 제목", "editable": true },
          "items": {
            "type": "array",
            "label": "실적 항목",
            "items": [
              { "value": { "value": "127명", "type": "text", "label": "수치" }, "label": { "value": "2025 주요대 합격", "type": "text", "label": "라벨" } },
              { "value": { "value": "89%", "type": "text", "label": "수치" }, "label": { "value": "내신 1~2등급 비율", "type": "text", "label": "라벨" } },
              { "value": { "value": "20년", "type": "text", "label": "수치" }, "label": { "value": "지역 운영 경력", "type": "text", "label": "라벨" } },
              { "value": { "value": "1:8", "type": "text", "label": "수치" }, "label": { "value": "강사 대 학생 비율", "type": "text", "label": "라벨" } }
            ]
          }
        }
      },
      {
        "id": "contact-001",
        "type": "contact",
        "visible": true,
        "nav": { "visible": false, "label": "상담신청" },
        "fields": {
          "eyebrow": { "value": "CONSULTING", "type": "text", "label": "상단 라벨", "editable": true },
          "title": { "value": "지금 상담을 신청하세요", "type": "text", "label": "섹션 제목", "editable": true },
          "subtitle": { "value": "레벨테스트는 무료입니다.\n편하신 방법으로 문의해 주세요.", "type": "textarea", "label": "섹션 설명", "editable": true },
          "phone": { "value": "02-123-4567", "type": "text", "label": "전화번호", "editable": true },
          "kakaoText": { "value": "@우리학원 (채널 검색)", "type": "text", "label": "카카오톡 안내", "editable": true }
        }
      },
      {
        "id": "location-001",
        "type": "location",
        "visible": true,
        "nav": { "visible": true, "label": "오시는 길" },
        "fields": {
          "eyebrow": { "value": "LOCATION", "type": "text", "label": "상단 라벨", "editable": true },
          "title": { "value": "오시는 길", "type": "text", "label": "섹션 제목", "editable": true },
          "address": { "value": "서울 강남구 테헤란로 123, 5층", "type": "text", "label": "주소", "editable": true },
          "transit": { "value": "2호선 강남역 4번 출구 도보 5분\n버스 146·360 강남역 정류장 하차", "type": "textarea", "label": "교통편 안내", "editable": true },
          "hours": { "value": "평일 14:00–22:00\n토요일 10:00–18:00 (일요일 휴무)", "type": "textarea", "label": "운영 시간", "editable": true },
          "mapImage": { "value": "", "type": "image", "label": "지도 이미지", "editable": true }
        }
      },
      {
        "id": "footer-001",
        "type": "footer",
        "visible": true,
        "nav": { "visible": false, "label": "푸터" },
        "fields": {
          "academyName": { "value": "우리입시학원", "type": "text", "label": "학원 이름", "editable": true },
          "tagline": { "value": "학생의 목표에서 시작하는 맞춤 입시", "type": "text", "label": "슬로건", "editable": true },
          "phone": { "value": "02-123-4567", "type": "text", "label": "대표전화", "editable": true },
          "copyright": { "value": "© 2026 우리입시학원. All rights reserved.", "type": "text", "label": "저작권 문구", "editable": true }
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
