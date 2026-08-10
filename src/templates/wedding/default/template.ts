import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  "slug": "wedding-default",
  "content": {
    "mode": "single",
    "templateKey": "wedding-default",
    "globalStyles": {
      "primaryColor": "#e8b4b8",
      "secondaryColor": "#d4a96a",
      "backgroundColor": "#0a0908",
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
          "brand": "HAUTRE",
          "tagline": "Wedding & Event",
          "ctaText": "상담 예약",
          "ctaUrl": "#contact"
        }
      },
      {
        "id": "hero-001",
        "type": "hero",
        "visible": true,
        "fields": {
          "eyebrow": "Wedding & Event Planner",
          "title": "당신의 이야기를,\n**평생의 기억**으로",
          "subtitle": "첫 만남부터 마지막 꽃잎이 떨어지는 순간까지 — 오뜨르의 웨딩 플래너가 오직 당신만을 위한 하루를 설계합니다.",
          "ctaPrimaryText": "무료 상담 예약하기",
          "ctaPrimaryUrl": "#contact",
          "ctaSecondaryText": "갤러리 보기",
          "ctaSecondaryUrl": "#gallery",
          "backgroundImage": { "url": "https://picsum.photos/seed/wedding_hero_main/1600/900" },
          "stat1Value": "847+",
          "stat1Label": "누적 웨딩 연출",
          "stat2Value": "9.8/10",
          "stat2Label": "평균 만족도",
          "stat3Value": "11년",
          "stat3Label": "웨딩 플래닝 경력"
        }
      },
      {
        "id": "philosophy-001",
        "type": "philosophy",
        "visible": true,
        "fields": {
          "eyebrow": "Our Philosophy",
          "title": "\"모든 결혼은 다릅니다.\n**두 사람의 온도**로\n만들어져야 하니까요.\"",
          "body": "수백 건의 웨딩을 진행했지만, 오뜨르는 단 한 번도 같은 웨딩을 만든 적이 없습니다. 두 분이 처음 만났던 날의 감정, 함께 좋아하는 음악, 두 분만 아는 농담 — 그 모든 것이 당신의 웨딩에 녹아듭니다.",
          "ctaText": "우리의 이야기 시작하기",
          "ctaUrl": "#contact"
        }
      },
      {
        "id": "services-001",
        "type": "services",
        "visible": true,
        "menu": { "label": "서비스" },
        "fields": {
          "eyebrow": "Services",
          "title": "어떤 하루를 꿈꾸시나요",
          "service1Badge": "Most Popular",
          "service1Title": "풀 웨딩 플래닝",
          "service1Body": "예식장 섭외부터 꽃장식, 당일 MC·연출까지 모든 과정을 오뜨르가 함께합니다.",
          "service1Image": { "url": "https://picsum.photos/seed/wedding_full/900/500" },
          "service2Title": "스몰 웨딩",
          "service2Body": "소규모 야외·공간 웨딩. 100인 이하, 더 깊은 감동.",
          "service2Image": { "url": "https://picsum.photos/seed/wedding_small/500/600" },
          "service3Title": "프러포즈 이벤트",
          "service3Body": "레스토랑 대관, 플라워 세팅, 현장 연출 — 그 순간을 완벽하게 준비합니다.",
          "service4Title": "기념일·파티 연출",
          "service4Body": "돌잔치, 환갑, 생일 파티, 기업 행사까지. 규모와 예산에 맞춰 기획합니다.",
          "ctaCardTitle": "어떤 서비스가\n맞는지 모르겠다면?",
          "ctaCardBody": "무료 상담으로 두 분께 가장 잘 맞는 플랜을 찾아드립니다.",
          "ctaCardButton": "상담 시작하기",
          "ctaCardUrl": "#contact"
        }
      },
      {
        "id": "gallery-001",
        "type": "gallery",
        "visible": true,
        "menu": { "label": "갤러리" },
        "fields": {
          "eyebrow": "Gallery",
          "title": "오뜨르가 만든 순간들",
          "image1": { "url": "https://picsum.photos/seed/wed_g1/400/600" },
          "image2": { "url": "https://picsum.photos/seed/wed_g2/400/300" },
          "image3": { "url": "https://picsum.photos/seed/wed_g3/400/300" },
          "image4": { "url": "https://picsum.photos/seed/wed_g4/400/600" },
          "image5": { "url": "https://picsum.photos/seed/wed_g5/400/300" },
          "image6": { "url": "https://picsum.photos/seed/wed_g6/400/300" }
        }
      },
      {
        "id": "process-001",
        "type": "process",
        "visible": true,
        "menu": { "label": "진행 방식" },
        "fields": {
          "eyebrow": "How We Work",
          "title": "처음부터 끝까지, 함께합니다",
          "step1Title": "첫 상담",
          "step1Body": "두 분의 이야기와 날짜, 예산, 스타일을 여유 있게 나눕니다. 무료 진행.",
          "step2Title": "맞춤 기획안",
          "step2Body": "두 분만을 위한 컨셉, 공간, 플라워, 타임라인을 담은 기획안을 제안합니다.",
          "step3Title": "디테일 조율",
          "step3Body": "드레스, 부케, 음악, 다이닝까지 — 모든 디테일을 함께 결정합니다.",
          "step4Title": "완벽한 D-Day",
          "step4Body": "당일 전담 코디네이터 배치. 두 분은 오직 서로만 바라보시면 됩니다.",
          "ctaText": "첫 상담 예약하기 — 무료",
          "ctaUrl": "#contact",
          "ctaNote": "평균 응답 시간 2시간 이내"
        }
      },
      {
        "id": "pricing-001",
        "type": "pricing",
        "visible": true,
        "menu": { "label": "패키지" },
        "fields": {
          "eyebrow": "Packages",
          "title": "패키지 안내",
          "subtitle": "모든 패키지는 상담 후 두 분에 맞게 조정 가능합니다.",
          "pkg1Tier": "Essentials",
          "pkg1Name": "당일 코디네이션",
          "pkg1Price": "390",
          "pkg1PriceSuffix": "만원~",
          "pkg1Note": "부가세 별도",
          "pkg1Feature1": "D-Day 전담 코디네이터 1인",
          "pkg1Feature2": "타임라인·큐시트 제작",
          "pkg1Feature3": "업체 컨펌·현장 점검",
          "pkg1Feature4": "리허설 동행",
          "pkg1CtaText": "상담 신청",
          "pkg2Badge": "가장 많이 선택",
          "pkg2Tier": "Standard",
          "pkg2Name": "세미 풀 플래닝",
          "pkg2Price": "780",
          "pkg2PriceSuffix": "만원~",
          "pkg2Note": "부가세 별도",
          "pkg2Feature1": "Essentials 전체 포함",
          "pkg2Feature2": "컨셉·무드보드 기획",
          "pkg2Feature3": "플라워·데코 디렉팅",
          "pkg2Feature4": "업체 협상·계약 대행",
          "pkg2Feature5": "무제한 상담 (카카오·전화)",
          "pkg2CtaText": "상담 신청",
          "pkg3Tier": "Premium",
          "pkg3Name": "풀 웨딩 플래닝",
          "pkg3Price": "문의",
          "pkg3PriceSuffix": "~",
          "pkg3Note": "규모·장소에 따라 상이",
          "pkg3Feature1": "Standard 전체 포함",
          "pkg3Feature2": "예식장 섭외·투어 동행",
          "pkg3Feature3": "드레스·메이크업 동행",
          "pkg3Feature4": "해외 웨딩 진행 가능",
          "pkg3Feature5": "전담 플래너 1:1 배정",
          "pkg3CtaText": "문의하기"
        }
      },
      {
        "id": "testimonials-001",
        "type": "testimonials",
        "visible": true,
        "menu": { "label": "후기" },
        "fields": {
          "eyebrow": "Reviews",
          "title": "두 분이 직접 전해주신 이야기",
          "review1Body": "처음엔 예산이 걱정됐는데, 플래너님이 우선순위를 같이 정해주시고 불필요한 지출을 줄여 오히려 절약했어요. 식장에 들어서는 순간 눈물이 났습니다. 정말 우리 웨딩이었어요.",
          "review1Author": "김지연 · 박재원",
          "review1Meta": "세미 풀 플래닝 · 2024.05",
          "review1Avatar": { "url": "https://i.pravatar.cc/150?u=couple_jiyeon" },
          "review2Body": "남자친구가 프러포즈 이벤트를 부탁했다고 하는데, 당일 레스토랑에 들어갔을 때 너무 예뻐서 실제로 소리를 질렀어요. 사소한 것 하나까지 우리 취향이었어요. 어떻게 알았는지 신기합니다.",
          "review2Author": "이소연",
          "review2Meta": "프러포즈 이벤트 · 2024.02",
          "review2Avatar": { "url": "https://i.pravatar.cc/150?u=propose_soyeon" },
          "review3Body": "해외 스몰 웨딩이라 걱정 많았는데, 현지 업체 선정부터 비자 서류, 당일 통역까지 전부 해결해 주셨어요. 저희는 사랑하는 사람들과 그 순간에만 집중할 수 있었습니다.",
          "review3Author": "최하준 · 윤서아",
          "review3Meta": "해외 스몰 웨딩 · 2023.10",
          "review3Avatar": { "url": "https://i.pravatar.cc/150?u=overseas_couple" },
          "ratingScore": "9.8",
          "ratingNote": "847쌍의 커플이 남긴 후기를 바탕으로 산출된 오뜨르의 평균 만족도 점수입니다. (네이버 예약 기준)"
        }
      },
      {
        "id": "faq-001",
        "type": "faq",
        "visible": true,
        "fields": {
          "eyebrow": "FAQ",
          "title": "자주 묻는 질문",
          "q1": "예식까지 얼마나 여유가 있어야 하나요?",
          "a1": "풀 플래닝은 최소 6개월 전, 당일 코디네이션은 2개월 전을 권장합니다. 단, 예식장이 이미 확정되어 있는 경우 더 촉박해도 가능한 경우가 많으니 우선 연락 주세요.",
          "q2": "예산이 많지 않아도 괜찮을까요?",
          "a2": "물론입니다. 오뜨르는 예산 안에서 두 분이 가장 원하는 것에 집중합니다. 상담 시 예산을 솔직하게 알려주시면, 불필요한 지출을 줄이고 의미 있는 곳에 집중하는 플랜을 제안드립니다.",
          "q3": "플래너가 중간에 바뀌지 않나요?",
          "a3": "첫 상담부터 D-Day까지 동일한 플래너가 담당합니다. 오뜨르는 팀 내 업무 배분이 아닌, 1:1 전담제를 운영하고 있어 두 분과 처음부터 끝까지 같이 합니다.",
          "q4": "야외 또는 해외 웨딩도 가능한가요?",
          "a4": "네, 가능합니다. 국내 야외 웨딩 및 제주·강원 지역 웨딩, 해외(발리, 프라하, 파리 등)도 진행한 경험이 있습니다. 위치에 따른 추가 비용은 상담 시 안내드립니다."
        }
      },
      {
        "id": "contact-001",
        "type": "contact",
        "visible": true,
        "fields": {
          "eyebrow": "Start Your Story",
          "title": "두 분의 날짜를\n**함께 잡아보세요.**",
          "body": "아직 아무것도 정해지지 않아도 괜찮습니다. 날짜도, 장소도, 예산도 — 모든 것은 상담 이후에 결정해도 충분합니다.",
          "phone": "02-5678-9012",
          "hours": "평일 10:00–19:00 · 주말 예약제",
          "location": "서울 성수동 · 예약 후 방문 가능",
          "backgroundImage": { "url": "https://picsum.photos/seed/wedding_cta_bg/1600/700" },
          "formTitle": "무료 상담 신청",
          "formNote": "첫 상담은 무료입니다 · 평균 응답 2시간 이내"
        }
      },
      {
        "id": "footer-001",
        "type": "footer",
        "visible": true,
        "fields": {
          "brand": "HAUTRE",
          "tagline": "Wedding & Event Planner · Seoul",
          "description": "2013년부터 847쌍의 커플과 함께해 온 오뜨르. 당신의 이야기가 가장 아름다운 하루가 될 수 있도록 함께하겠습니다.",
          "address": "서울 성동구 성수이로 · 오뜨르 쇼룸\nTEL. 02-5678-9012\n평일 10:00–19:00",
          "copyright": "© 2024 오뜨르 웨딩 & 이벤트. All rights reserved."
        }
      }
    ]
  },
  "thumbnailPath": "public/thumbnails/template-wedding-default.webp",
  "version": "1.1.0",
  "defaults": {
    "name": "Wedding",
    "description": "감성적인 웨딩 플래너 웹사이트 템플릿. 서비스, 갤러리, 가격 안내, FAQ 포함.",
    "category": "lifestyle"
  }
};

export default preset;
