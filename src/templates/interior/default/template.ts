import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  "slug": "interior-default",
  "content": {
    "mode": "single",
    "templateKey": "interior-default",
    "globalStyles": {
      "primaryColor": "#C9A96E",
      "secondaryColor": "#0C0A08",
      "backgroundColor": "#0C0A08",
      "fontFamily": "'Pretendard Variable', 'Pretendard', system-ui, sans-serif",
      "fontSize": "16px",
      "layout": "wide"
    },
    "blocks": [
      {
        "id": "nav-001",
        "type": "nav",
        "visible": true,
        "fields": {
          "brandName": "에스파시오",
          "ctaText": "무료 상담 신청"
        }
      },
      {
        "id": "hero-001",
        "type": "hero",
        "visible": true,
        "fields": {
          "eyebrow": "Seoul Premium Interior Studio",
          "estLabel": "Est. 2015",
          "title": "공간이\n삶을 바꾸는\n순간을 설계합니다",
          "description": "에스파시오는 단순한 인테리어를 넘어섭니다. 거주자의 생활 방식, 감각, 그리고 가치관을 깊이 이해한 뒤 공간으로 번역합니다. 10년간 280곳 이상의 공간이 우리를 통해 다시 태어났습니다.",
          "ctaPrimary": "포트폴리오 보기",
          "ctaSecondary": "무료 상담 예약",
          "trust1": "한국 인테리어 대상 2023",
          "trust2": "건설업 면허 보유",
          "trust3": "고객 만족도 4.9/5.0",
          "statValue": "280",
          "statLabel": "완성된 프로젝트",
          "projectTitle": "성북동 단독주택 — 거실 리모델링"
        }
      },
      {
        "id": "stats-001",
        "type": "stats",
        "visible": true,
        "fields": {
          "s1Value": "280",
          "s1Label": "완성된 프로젝트",
          "s2Value": "10",
          "s2Label": "년의 전문 경력",
          "s3Value": "4.9",
          "s3Label": "고객 만족도",
          "s4Value": "98",
          "s4Label": "재계약·추천 비율"
        }
      },
      {
        "id": "about-001",
        "type": "about",
        "visible": true,
        "menu": { "label": "스튜디오 소개" },
        "fields": {
          "eyebrow": "About Espacio",
          "title": "우리는 인테리어가 아닌\n삶의 방식을 설계합니다",
          "description": "에스파시오(Espacio)는 스페인어로 '공간'을 뜻합니다. 2015년 설립 이후, 우리는 공간이 단순한 구조물이 아니라 사람의 감정과 생활을 담는 그릇이라는 믿음 하나로 일해왔습니다.\n\n트렌드를 쫓지 않습니다. 대신 고객 한 명 한 명의 생활 방식, 감각, 미래 계획을 깊이 이해한 뒤 그에 맞는 유일한 공간을 제안합니다.",
          "v1Title": "완전 맞춤 설계",
          "v1Desc": "동일한 설계는 단 하나도 없습니다. 모든 프로젝트는 고객의 이야기에서 출발합니다.",
          "v2Title": "타협 없는 소재 품질",
          "v2Desc": "이탈리아 원목 마루, 독일제 시스템 창호, 국내 검증 페인트만 사용합니다.",
          "v3Title": "납기 100% 준수",
          "v3Desc": "10년간 280건 전 프로젝트를 예정일 내 완공했습니다.",
          "projectTitle": "한남동 타운하우스 — 주방 리노베이션"
        }
      },
      {
        "id": "services-001",
        "type": "services",
        "visible": true,
        "menu": { "label": "서비스" },
        "fields": {
          "eyebrow": "Our Services",
          "title": "어떤 공간이든,\n에스파시오가 함께합니다",
          "description": "주거부터 상업 공간까지, 규모와 예산에 관계없이 최선의 결과를 드립니다.",
          "s1Badge": "Most Popular",
          "s1Title": "주거 인테리어",
          "s1Desc": "아파트, 빌라, 단독주택까지 — 거주자의 라이프스타일에 맞춘 완전 맞춤형 설계.",
          "s1Price": "95만원",
          "s2Title": "상업 공간",
          "s2Desc": "카페, 레스토랑, 리테일 스토어, 쇼룸 — 브랜드 정체성을 공간으로 완성합니다.",
          "s3Title": "오피스 디자인",
          "s3Desc": "직원 생산성과 브랜드 인상 모두를 고려한 업무 공간 설계.",
          "s4Title": "공간 컨설팅",
          "s4Desc": "시공 전 전문가 컨설팅으로 방향과 예산을 먼저 잡습니다.",
          "s5Title": "2년 A/S 보장",
          "s5Desc": "시공 후 2년간 하자 보수를 무상 제공합니다."
        }
      },
      {
        "id": "portfolio-001",
        "type": "portfolio",
        "visible": true,
        "menu": { "label": "포트폴리오" },
        "fields": {
          "eyebrow": "Portfolio",
          "title": "에스파시오의\n대표 작업물",
          "p1Meta": "RESIDENTIAL · 2024",
          "p1Title": "용산구 한남동 — 42평 아파트",
          "p1Desc": "거실·주방 전체 리노베이션",
          "p2Meta": "COMMERCIAL · 2024",
          "p2Title": "청담동 — 파인다이닝 레스토랑",
          "p3Meta": "RESIDENTIAL · 2023",
          "p3Title": "성북동 — 마스터 침실",
          "p4Meta": "OFFICE · 2024",
          "p4Title": "강남구 — 스타트업 오피스"
        }
      },
      {
        "id": "process-001",
        "type": "process",
        "visible": true,
        "menu": { "label": "진행 과정" },
        "fields": {
          "eyebrow": "How We Work",
          "title": "투명하고 체계적인\n6단계 진행 과정",
          "step1Title": "초기 상담",
          "step1Desc": "니즈·예산·일정 파악. 첫 상담은 무료입니다.",
          "step2Title": "현장 실측",
          "step2Desc": "공간의 구조와 상태를 정밀 측정합니다.",
          "step3Title": "설계 제안",
          "step3Desc": "3D 렌더링과 도면으로 완성 모습을 확인합니다.",
          "step4Title": "계약·착수금",
          "step4Desc": "공정·소재·금액을 계약서로 명문화합니다.",
          "step5Title": "공사 진행",
          "step5Desc": "주 1회 사진 보고로 상황을 공유합니다.",
          "step6Title": "준공·입주",
          "step6Desc": "최종 점검 후 키를 드립니다. 2년 A/S 시작."
        }
      },
      {
        "id": "testimonials-001",
        "type": "testimonials",
        "visible": true,
        "fields": {
          "eyebrow": "Client Reviews",
          "title": "고객의 말이\n가장 정직한 포트폴리오입니다",
          "r1Body": "\"이사하면서 처음으로 공간을 제대로 설계해봤습니다. 디자이너분이 제 취향을 제 말보다 더 잘 이해하시더라고요. 결과물이 너무 좋아서 친구들한테 자랑하고 다니고 있어요.\"",
          "r1Author": "이수민 님",
          "r1Meta": "서울 마포구 · 30평대 아파트",
          "r2Body": "\"카페 오픈 전에 인테리어를 맡겼는데, 예상보다 2주 빨리 끝났습니다. 공사 중에도 매주 사진 보고를 해주셔서 신뢰가 갔고, 오픈 후 손님들 반응이 정말 뜨겁습니다.\"",
          "r2Author": "박준혁 님",
          "r2Meta": "서울 합정동 · 카페 오너",
          "r3Body": "\"회사 사무실 리뉴얼을 의뢰했습니다. 직원들 만족도가 눈에 띄게 올라갔고, 거래처에서도 공간이 달라졌다는 말을 들었어요. 비용 대비 효과가 압도적입니다.\"",
          "r3Author": "김하윤 님",
          "r3Meta": "서울 강남구 · IT 스타트업 대표"
        }
      },
      {
        "id": "contact-001",
        "type": "contact",
        "visible": true,
        "menu": { "label": "문의" },
        "fields": {
          "eyebrow": "Get Started",
          "title": "당신의 공간을\n지금 바꿔드립니다",
          "description": "첫 상담은 무료입니다. 예산과 일정에 대한 걱정 없이 편하게 이야기 나눠보세요. 에스파시오의 전문가가 최적의 방향을 제안해드립니다.",
          "phone": "02-1234-5678",
          "email": "hello@espacio.kr",
          "address": "서울 강남구 도산대로 128"
        }
      },
      {
        "id": "footer-001",
        "type": "footer",
        "visible": true,
        "fields": {
          "description": "공간이 삶을 바꾸는 순간을 설계하는 프리미엄 인테리어 스튜디오. 2015년 설립.",
          "address": "서울 강남구 도산대로 128, 5층",
          "phone": "02-1234-5678",
          "email": "hello@espacio.kr",
          "hours": "평일 09:00 – 18:00\n(토 10:00 – 15:00)",
          "copyright": "© 2025 에스파시오 인테리어. All rights reserved."
        }
      }
    ]
  },
  "thumbnailPath": "public/thumbnails/template-interior-default.webp",
  "version": "1.1.0",
  "defaults": {
    "name": "Interior",
    "description": "고급스러운 인테리어 디자인 스튜디오 템플릿. 포트폴리오, 서비스, 프로세스 섹션 포함.",
    "category": "design"
  }
};

export default preset;
