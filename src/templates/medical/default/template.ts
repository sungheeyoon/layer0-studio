import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  "slug": "medical-default",
  "content": {
    "mode": "single",
    "templateKey": "medical-default",
    "globalStyles": {
      "primaryColor": "#1C1917",
      "secondaryColor": "#C8A97E",
      "backgroundColor": "#F9F7F3",
      "fontFamily": "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', sans-serif",
      "fontSize": "16px",
      "layout": "wide"
    },
    "sections": [
      {
        "id": "nav-001",
        "type": "nav",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "네비게이션"
        },
        "fields": {
          "brandName": "ARRC",
          "brandSubtext": "Clinic",
          "ctaText": "예약하기"
        }
      },
      {
        "id": "hero-001",
        "type": "hero",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "ARRC Clinic — 서울 강남구 청담동"
        },
        "fields": {
          "eyebrow": "ARRC Clinic — 서울 강남구 청담동",
          "title": "당신만의\n**아름다움**을\n설계합니다",
          "description": "15년 이상의 임상 경험과 데이터 기반 진료로, 단순한 시술이 아닌 당신의 고유한 아름다움을 이끌어내는 1:1 맞춤 케어를 제공합니다.",
          "image": { "url": "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1200&q=80" },
          "statValue": "4,800",
          "statLabel": "누적 시술 건수",
          "sinceLabel": "Since 2011",
          "ctaPrimary": "진료 예약하기",
          "ctaSecondary": "클리닉 둘러보기",
          "stat1Value": "15",
          "stat1Label": "년 임상 경험",
          "stat2Value": "3",
          "stat2Label": "인 전문의 상주",
          "stat3Value": "98",
          "stat3Label": "% 재방문율"
        }
      },
      {
        "id": "marquee-001",
        "type": "marquee",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "마퀴"
        },
        "fields": {
          "item1": "대한피부과학회 인정의",
          "item2": "국제심미의학학회 인증",
          "item3": "의료기관 인증원 인증",
          "item4": "2024 뷰티어워드 대상",
          "item5": "서울대학교병원 협진 클리닉",
          "item6": "FDA 승인 레이저 도입"
        }
      },
      {
        "id": "services-001",
        "type": "services",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "진료 안내"
        },
        "fields": {
          "eyebrow": "진료 안내",
          "title": "당신의 피부에\n맞는 솔루션",
          "description": "단일 시술이 아닌 피부 전체를 바라보는 통합적 접근으로 최적의 결과를 제공합니다.",
          "service1Title": "리프팅 & 탄력",
          "service1Desc": "처짐과 탄력을 동시에 개선하는 고강도 리프팅 케어",
          "service1Image": { "url": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80" },
          "service2Title": "레이저 토닝",
          "service2Desc": "피부 톤과 결을 섬세하게 개선",
          "service2Image": { "url": "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=600&q=80" },
          "service3Title": "보톡스 & 필러",
          "service3Desc": "자연스러운 볼륨과 라인을 완성하는 정밀 시술",
          "service4Title": "피부 재생",
          "service4Desc": "손상된 피부 장벽을 회복하는 재생 프로그램",
          "service5Title": "안티에이징",
          "service5Desc": "노화를 선제적으로 관리하는 통합 솔루션",
          "service5Image": { "url": "https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=600&q=80" }
        }
      },
      {
        "id": "space-001",
        "type": "space",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "클리닉 소개"
        },
        "fields": {
          "eyebrow": "클리닉 소개",
          "title": "공간이\n치유의\n시작입니다",
          "description": "아르크 클리닉은 의료 공간의 고정관념을 넘어, 방문 그 자체가 치유의 경험이 되도록 설계된 공간입니다. 청담동 한복판에 자리한 4층 규모의 클리닉은 편안함과 프라이버시를 최우선으로 합니다.",
          "mainImage": { "url": "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=900&q=80" },
          "subImage": { "url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80" },
          "feature1Title": "4층 독립 공간",
          "feature1Desc": "층별 독립 구성으로 완벽한 프라이버시",
          "feature2Title": "프리미엄 라운지",
          "feature2Desc": "시술 전후 휴식을 위한 전용 라운지",
          "feature3Title": "1:1 전담 케어룸",
          "feature3Desc": "모든 시술은 전담 케어룸에서 진행",
          "feature4Title": "전용 주차장",
          "feature4Desc": "건물 내 전용 주차 공간 제공"
        }
      },
      {
        "id": "why-001",
        "type": "why",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "아르크가 다른 이유"
        },
        "fields": {
          "eyebrow": "아르크가 다른 이유",
          "title": "차이는 디테일에서 만들어집니다",
          "f1Title": "데이터 기반\n피부 진단 시스템",
          "f1Desc": "AI 피부 분석 시스템과 15년 임상 데이터를 결합해, 육안으로 파악하기 어려운 피부 속 상태까지 정밀하게 진단합니다. 매 방문마다 데이터가 축적되어 당신의 피부 변화를 장기적으로 관리합니다.",
          "f1Image": { "url": "https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=900&q=80" },
          "f2Title": "전문의만이\n직접 시술합니다",
          "f2Desc": "아르크 클리닉의 모든 시술은 전문의가 처음부터 끝까지 직접 진행합니다. 상담도, 시술도, 사후 관리도 같은 전문의가 담당합니다. 일관된 케어로 당신의 피부 히스토리를 완전히 이해하는 주치의가 됩니다.",
          "f2Image": { "url": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80" },
          "f3Title": "FDA 인증\n최신 장비 운용",
          "f3Desc": "국내 최초로 도입된 차세대 레이저 플랫폼을 포함, 모든 장비는 FDA 승인을 받은 최신 의료기기로 구성되어 있습니다. 정기적인 장비 업데이트로 항상 최고 수준의 시술 결과를 보장합니다.",
          "f3Image": { "url": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80" }
        }
      },
      {
        "id": "team-001",
        "type": "team",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "의료진"
        },
        "fields": {
          "eyebrow": "의료진 소개",
          "title": "당신의 피부를\n책임지는 전문가",
          "description": "서울대·연세대·고려대 의대 출신의 전문의들이 모든 진료를 직접 담당합니다.",
          "member1Name": "이지수 원장",
          "member1Role": "피부과 전문의",
          "member1Info1": "서울대학교 의과대학 졸업",
          "member1Info2": "서울대학교병원 피부과 전공의",
          "member1Info3": "임상 경력 17년",
          "member1Image": { "url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80" },
          "member2Name": "박민아 부원장",
          "member2Role": "피부과 전문의",
          "member2Info1": "연세대학교 의과대학 졸업",
          "member2Info2": "세브란스병원 피부과 전공의",
          "member2Info3": "임상 경력 12년",
          "member2Image": { "url": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80" },
          "member3Name": "김태영 원장",
          "member3Role": "성형외과 전문의",
          "member3Info1": "고려대학교 의과대학 졸업",
          "member3Info2": "고려대학교병원 성형외과 전공의",
          "member3Info3": "임상 경력 15년",
          "member3Image": { "url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80" }
        }
      },
      {
        "id": "testimonials-001",
        "type": "testimonials",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "후기"
        },
        "fields": {
          "eyebrow": "환자 후기",
          "title": "직접 경험한\n변화의 이야기",
          "rating": "4.9",
          "review1Body": "\"3년 전부터 다니고 있는데, 이지수 원장님이 항상 제 피부 히스토리를 정확히 파악하고 계셔서 놀랐어요. 단순히 트러블을 고치는 게 아니라 근본 원인을 찾아 케어해 주신 덕분에 피부가 완전히 달라졌습니다.\"",
          "review1Author": "하윤서",
          "review1Meta": "리프팅 & 레이저 토닝",
          "review2Body": "\"다른 피부과에서 해결 못했던 색소 문제를 아르크에서 해결했어요. 처음 상담할 때부터 명확한 진단과 치료 계획을 제시해 주셔서 믿음이 갔습니다. 공간도 너무 프라이빗하고 고급스러워서 매번 방문이 기대됩니다.\"",
          "review2Author": "정서연",
          "review2Meta": "레이저 토닝 & 피부 재생",
          "review3Body": "\"보톡스 시술을 받았는데 정말 자연스럽게 나왔어요. 박민아 원장님이 얼굴 구조를 정밀하게 분석한 후 최소한의 양으로 최대 효과를 내는 방식으로 해주셨어요. 티가 나지 않으면서도 확실한 변화가 있어 만족합니다.\"",
          "review3Author": "최은지",
          "review3Meta": "보톡스 & 필러"
        }
      },
      {
        "id": "booking-001",
        "type": "booking",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "진료 예약"
        },
        "fields": {
          "eyebrow": "진료 예약",
          "title": "첫 상담은\n무료입니다",
          "description": "전문의와의 1:1 피부 상담을 통해 당신의 피부 상태를 정밀 진단하고, 최적의 케어 플랜을 설계해 드립니다.",
          "phone": "02-512-1234",
          "hours": "평일 10:00–19:00 / 토 10:00–17:00",
          "image": { "url": "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1600&q=70" }
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
          "brandName": "ARRC",
          "brandSubtext": "Clinic",
          "description": "당신만의 아름다움을 설계하는 프리미엄 피부과 & 성형외과",
          "address": "서울 강남구 청담동 147-15 아르크빌딩 2–5층",
          "phone": "02-512-1234",
          "hours": "평일 10:00 – 19:00\n토요일 10:00 – 17:00\n일요일 · 공휴일 휴진",
          "copyright": "© 2024 ARRC Clinic. All rights reserved.",
          "businessNum": "123-45-67890",
          "representative": "이지수"
        }
      }
    ]
  },
  "thumbnailPath": "public/thumbnails/template-medical-default.webp",
  "version": "1.1.0",
  "defaults": {
    "name": "Medical",
    "description": "깔끔한 의원·클리닉 웹사이트 템플릿. 진료 서비스, 의료진 소개, 예약 안내 포함.",
    "category": "health"
  }
};

export default preset;
