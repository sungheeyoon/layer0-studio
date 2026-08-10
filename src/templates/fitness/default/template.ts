import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  "slug": "fitness-default",
  "content": {
    "mode": "single",
    "templateKey": "fitness-default",
    "globalStyles": {
      "primaryColor": "#CDFF00",
      "secondaryColor": "#141414",
      "backgroundColor": "#080808",
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
          "brandName": "APEX",
          "ctaText": "무료 체험"
        }
      },
      {
        "id": "hero-001",
        "type": "hero",
        "visible": true,
        "fields": {
          "eyebrow": "Seoul Gangnam — Since 2010",
          "title1": "한계를",
          "title2": "다시",
          "title3": "정의합니다",
          "description": "14년의 노하우를 가진 전문 트레이너가 당신만의 목표를 현실로 만들어 드립니다.\n첫 체험은 완전 무료입니다.",
          "backgroundImage": { "url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80" },
          "ctaPrimary": "무료 체험 신청",
          "ctaSecondary": "프로그램 보기",
          "stat1Value": "1,200",
          "stat1Suffix": "+",
          "stat1Label": "누적 회원",
          "stat2Value": "14",
          "stat2Suffix": "년",
          "stat2Label": "운영 경력",
          "stat3Value": "32",
          "stat3Suffix": "개",
          "stat3Label": "주간 클래스",
          "stat4Value": "98",
          "stat4Suffix": "%",
          "stat4Label": "목표 달성률"
        }
      },
      {
        "id": "marquee-001",
        "type": "marquee",
        "visible": true,
        "fields": {
          "item1": "퍼스널 트레이닝",
          "item2": "그룹 클래스",
          "item3": "크로스핏",
          "item4": "필라테스",
          "item5": "복싱",
          "item6": "영양 코칭",
          "item7": "재활 운동",
          "item8": "체형 교정"
        }
      },
      {
        "id": "programs-001",
        "type": "programs",
        "visible": true,
        "menu": { "label": "프로그램" },
        "fields": {
          "eyebrow": "프로그램",
          "title": "당신의 목표에\n맞는 프로그램",
          "description": "6가지 전문 프로그램으로 체력 강화, 체형 개선, 재활까지 목적에 맞는 트레이닝을 제공합니다.",
          "p1Title": "퍼스널 트레이닝",
          "p1Desc": "1:1 완전 맞춤형 운동 설계 & 집중 케어",
          "p1Image": { "url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1100&q=80" },
          "p2Title": "크로스핏",
          "p2Desc": "기능성 운동의 극한을 경험",
          "p2Image": { "url": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=700&q=80" },
          "p3Title": "복싱",
          "p3Desc": "파워와 지구력을 동시에 키우는 실전 복싱",
          "p4Title": "필라테스",
          "p4Desc": "코어 강화와 유연성을 동시에 잡는 정밀 운동",
          "p5Title": "그룹 클래스",
          "p5Desc": "함께할 때 더 강해집니다",
          "p5Image": { "url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=80" },
          "p6Title": "영양 코칭",
          "p6Desc": "식단 전문가의 1:1 맞춤 영양 관리"
        }
      },
      {
        "id": "facility-001",
        "type": "facility",
        "visible": true,
        "menu": { "label": "시설" },
        "fields": {
          "eyebrow": "시설 안내",
          "title": "장비가\n결과를\n만듭니다",
          "description": "500평 규모의 전문 공간에 최신 피트니스 장비가 완비되어 있습니다. 유산소, 웨이트, 기능성 훈련 구역이 명확히 분리되어 집중력 있는 운동이 가능합니다.",
          "f1Title": "500평 전용 공간",
          "f1Label": "Facility",
          "f2Title": "150+ 최신 피트니스 장비",
          "f2Label": "Equipment",
          "f3Title": "남녀 전용 샤워 & 사우나",
          "f3Label": "Locker",
          "f4Title": "새벽 5시 – 자정 운영",
          "f4Label": "Hours",
          "f5Title": "전용 주차 50대 무료",
          "f5Label": "Parking",
          "image1": { "url": "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=600&q=80" },
          "image2": { "url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80" },
          "image3": { "url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80" },
          "trustValue": "14",
          "trustLabel": "Years\nof Trust"
        }
      },
      {
        "id": "trainers-001",
        "type": "trainers",
        "visible": true,
        "menu": { "label": "트레이너" },
        "fields": {
          "eyebrow": "트레이너",
          "title": "당신 옆에서\n함께 싸웁니다",
          "description": "국가대표 출신부터 국제 자격증 보유자까지, 검증된 전문가만이 APEX에 있습니다.",
          "m1Name": "남준혁",
          "m1Role": "헤드 코치",
          "m1Badge": "Head Coach",
          "m1Image": { "url": "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80" },
          "m1Info1": "前 국가대표 역도 선수",
          "m1Info2": "NSCA-CSCS 인증",
          "m1Info3": "트레이닝 경력 13년",
          "m2Name": "이서현",
          "m2Role": "필라테스 · 재활",
          "m2Badge": "Pilates",
          "m2Image": { "url": "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?auto=format&fit=crop&w=600&q=80" },
          "m2Info1": "국제 필라테스 강사 자격 (STOTT)",
          "m2Info2": "스포츠 재활 전문가",
          "m2Info3": "트레이닝 경력 9년",
          "m3Name": "박도현",
          "m3Role": "복싱 · 퍼스널",
          "m3Badge": "Boxing",
          "m3Image": { "url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80" },
          "m3Info1": "前 프로 복싱 챔피언",
          "m3Info2": "NSCA-CPT & 복싱 공인 코치",
          "m3Info3": "트레이닝 경력 11년"
        }
      },
      {
        "id": "testimonials-001",
        "type": "testimonials",
        "visible": true,
        "menu": { "label": "후기" },
        "fields": {
          "eyebrow": "멤버 후기",
          "title": "결과가\n모든 걸\n말합니다",
          "ratingValue": "4.9",
          "ratingLabel": "Google 리뷰 기준 • 894개 후기",
          "r1Body": "\"3개월 만에 체지방 8% 감소, 근육량 4kg 증가라는 결과를 냈어요. 남준혁 코치님이 제 몸 상태를 완전히 파악하고 주차별로 프로그램을 조정해 주셔서 부상 없이 빠르게 결과를 낼 수 있었습니다.\"",
          "r1Author": "최준서",
          "r1Meta": "퍼스널 트레이닝 3개월",
          "r2Body": "\"허리 디스크로 오래 운동을 못 했는데, 이서현 트레이너님의 재활 필라테스를 시작하고 나서 통증이 60% 이상 줄었어요. 전문적인 지식과 세심한 케어 덕분에 다시 운동할 수 있게 됐습니다.\"",
          "r2Author": "김도연",
          "r2Meta": "필라테스 & 재활 4개월",
          "r3Body": "\"복싱 처음 배울 때 다른 곳에서는 그냥 치는 법만 알려줬는데, 박도현 코치님은 체력 기반부터 탄탄하게 만들어 주셔서 달랐어요. 6개월째 다니고 있는데 스트레스 해소 + 체력 증가 두 마리 토끼를 잡았습니다.\"",
          "r3Author": "오승민",
          "r3Meta": "복싱 클래스 6개월"
        }
      },
      {
        "id": "join-001",
        "type": "join",
        "visible": true,
        "fields": {
          "eyebrow": "무료 체험",
          "title1": "지금 시작하면",
          "title2": "첫 주가 무료",
          "description": "트레이너 상담부터 시설 이용, 그룹 클래스까지 조건 없이 7일 무료 체험을 제공합니다. 마음에 드셔야 결제하시면 됩니다.",
          "backgroundImage": { "url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=70" },
          "phone": "02-555-9876",
          "address": "서울 강남구 역삼동 823-14 B1–2F",
          "hours": "매일 05:00 – 24:00"
        }
      },
      {
        "id": "footer-001",
        "type": "footer",
        "visible": true,
        "fields": {
          "brandName": "APEX",
          "brandSubtext": "Fitness",
          "description": "한계를 다시 정의하는\n강남 프리미엄 피트니스 센터",
          "copyright": "© 2024 APEX FITNESS. All rights reserved.",
          "businessInfo": "사업자등록번호: 456-78-90123 | 대표: 남준혁",
          "address": "서울 강남구 역삼동 823-14\n에이펙스빌딩 B1–2F",
          "phone": "02-555-9876",
          "hours": "평일·주말 05:00 – 24:00\n공휴일 06:00 – 22:00"
        }
      }
    ]
  },
  "thumbnailPath": "public/thumbnails/template-fitness-default.webp",
  "version": "1.1.0",
  "defaults": {
    "name": "Fitness",
    "description": "역동적인 피트니스·헬스장 웹사이트 템플릿. 프로그램, 트레이너 소개, 회원권 안내 포함.",
    "category": "health"
  }
};

export default preset;
