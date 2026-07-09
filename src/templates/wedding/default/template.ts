import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  "slug": "wedding-default",
  "content": {
    "mode": "single",
    "templateKey": "wedding-default",
    "globalStyles": {
      "primaryColor": "#e8b4b8",
      "secondaryColor": "#d4a96a",
      "fontFamily": "'Pretendard Variable', 'Pretendard', system-ui, sans-serif",
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
          "brand": {
            "value": "HAUTRE",
            "type": "text",
            "label": "브랜드 로고",
            "editable": true
          },
          "tagline": {
            "value": "Wedding & Event",
            "type": "text",
            "label": "브랜드 태그라인",
            "editable": true
          },
          "ctaText": {
            "value": "상담 예약",
            "type": "text",
            "label": "CTA 버튼",
            "editable": true
          },
          "ctaUrl": {
            "value": "#contact",
            "type": "url",
            "label": "CTA 링크",
            "editable": true
          }
        }
      },
      {
        "id": "hero-001",
        "type": "hero",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "Wedding & Event Planner"
        },
        "fields": {
          "eyebrow": {
            "value": "Wedding & Event Planner",
            "type": "text",
            "label": "상단 라벨",
            "editable": true
          },
          "title": {
            "value": "당신의 이야기를,\n**평생의 기억**으로",
            "type": "textarea",
            "label": "메인 타이틀 (**...** 으로 강조)",
            "editable": true
          },
          "subtitle": {
            "value": "첫 만남부터 마지막 꽃잎이 떨어지는 순간까지 — 오뜨르의 웨딩 플래너가 오직 당신만을 위한 하루를 설계합니다.",
            "type": "textarea",
            "label": "서브 타이틀",
            "editable": true
          },
          "ctaPrimaryText": {
            "value": "무료 상담 예약하기",
            "type": "text",
            "label": "주요 CTA 버튼",
            "editable": true
          },
          "ctaPrimaryUrl": {
            "value": "#contact",
            "type": "url",
            "label": "주요 CTA 링크",
            "editable": true
          },
          "ctaSecondaryText": {
            "value": "갤러리 보기",
            "type": "text",
            "label": "보조 CTA 버튼",
            "editable": true
          },
          "ctaSecondaryUrl": {
            "value": "#gallery",
            "type": "url",
            "label": "보조 CTA 링크",
            "editable": true
          },
          "backgroundImage": {
            "value": "https://picsum.photos/seed/wedding_hero_main/1600/900",
            "type": "image",
            "label": "배경 이미지",
            "editable": true
          },
          "stat1Value": {
            "value": "847+",
            "type": "text",
            "label": "통계 1 수치",
            "editable": true
          },
          "stat1Label": {
            "value": "누적 웨딩 연출",
            "type": "text",
            "label": "통계 1 라벨",
            "editable": true
          },
          "stat2Value": {
            "value": "9.8/10",
            "type": "text",
            "label": "통계 2 수치",
            "editable": true
          },
          "stat2Label": {
            "value": "평균 만족도",
            "type": "text",
            "label": "통계 2 라벨",
            "editable": true
          },
          "stat3Value": {
            "value": "11년",
            "type": "text",
            "label": "통계 3 수치",
            "editable": true
          },
          "stat3Label": {
            "value": "웨딩 플래닝 경력",
            "type": "text",
            "label": "통계 3 라벨",
            "editable": true
          }
        }
      },
      {
        "id": "philosophy-001",
        "type": "philosophy",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "Our Philosophy"
        },
        "fields": {
          "eyebrow": {
            "value": "Our Philosophy",
            "type": "text",
            "label": "상단 라벨",
            "editable": true
          },
          "title": {
            "value": "\"모든 결혼은 다릅니다.\n**두 사람의 온도**로\n만들어져야 하니까요.\"",
            "type": "textarea",
            "label": "타이틀 (**...** 으로 강조)",
            "editable": true
          },
          "body": {
            "value": "수백 건의 웨딩을 진행했지만, 오뜨르는 단 한 번도 같은 웨딩을 만든 적이 없습니다. 두 분이 처음 만났던 날의 감정, 함께 좋아하는 음악, 두 분만 아는 농담 — 그 모든 것이 당신의 웨딩에 녹아듭니다.",
            "type": "textarea",
            "label": "본문",
            "editable": true
          },
          "ctaText": {
            "value": "우리의 이야기 시작하기",
            "type": "text",
            "label": "CTA 버튼",
            "editable": true
          },
          "ctaUrl": {
            "value": "#contact",
            "type": "url",
            "label": "CTA 링크",
            "editable": true
          }
        }
      },
      {
        "id": "services-001",
        "type": "services",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "서비스"
        },
        "fields": {
          "eyebrow": {
            "value": "Services",
            "type": "text",
            "label": "상단 라벨",
            "editable": true
          },
          "title": {
            "value": "어떤 하루를 꿈꾸시나요",
            "type": "text",
            "label": "타이틀",
            "editable": true
          },
          "service1Badge": {
            "value": "Most Popular",
            "type": "text",
            "label": "서비스 1 배지",
            "editable": true
          },
          "service1Title": {
            "value": "풀 웨딩 플래닝",
            "type": "text",
            "label": "서비스 1 제목",
            "editable": true
          },
          "service1Body": {
            "value": "예식장 섭외부터 꽃장식, 당일 MC·연출까지 모든 과정을 오뜨르가 함께합니다.",
            "type": "textarea",
            "label": "서비스 1 설명",
            "editable": true
          },
          "service1Image": {
            "value": "https://picsum.photos/seed/wedding_full/900/500",
            "type": "image",
            "label": "서비스 1 이미지",
            "editable": true
          },
          "service2Title": {
            "value": "스몰 웨딩",
            "type": "text",
            "label": "서비스 2 제목",
            "editable": true
          },
          "service2Body": {
            "value": "소규모 야외·공간 웨딩. 100인 이하, 더 깊은 감동.",
            "type": "textarea",
            "label": "서비스 2 설명",
            "editable": true
          },
          "service2Image": {
            "value": "https://picsum.photos/seed/wedding_small/500/600",
            "type": "image",
            "label": "서비스 2 이미지",
            "editable": true
          },
          "service3Title": {
            "value": "프러포즈 이벤트",
            "type": "text",
            "label": "서비스 3 제목",
            "editable": true
          },
          "service3Body": {
            "value": "레스토랑 대관, 플라워 세팅, 현장 연출 — 그 순간을 완벽하게 준비합니다.",
            "type": "textarea",
            "label": "서비스 3 설명",
            "editable": true
          },
          "service4Title": {
            "value": "기념일·파티 연출",
            "type": "text",
            "label": "서비스 4 제목",
            "editable": true
          },
          "service4Body": {
            "value": "돌잔치, 환갑, 생일 파티, 기업 행사까지. 규모와 예산에 맞춰 기획합니다.",
            "type": "textarea",
            "label": "서비스 4 설명",
            "editable": true
          },
          "ctaCardTitle": {
            "value": "어떤 서비스가\n맞는지 모르겠다면?",
            "type": "textarea",
            "label": "CTA 카드 타이틀",
            "editable": true
          },
          "ctaCardBody": {
            "value": "무료 상담으로 두 분께 가장 잘 맞는 플랜을 찾아드립니다.",
            "type": "textarea",
            "label": "CTA 카드 본문",
            "editable": true
          },
          "ctaCardButton": {
            "value": "상담 시작하기",
            "type": "text",
            "label": "CTA 카드 버튼",
            "editable": true
          },
          "ctaCardUrl": {
            "value": "#contact",
            "type": "url",
            "label": "CTA 카드 링크",
            "editable": true
          }
        }
      },
      {
        "id": "gallery-001",
        "type": "gallery",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "갤러리"
        },
        "fields": {
          "eyebrow": {
            "value": "Gallery",
            "type": "text",
            "label": "상단 라벨",
            "editable": true
          },
          "title": {
            "value": "오뜨르가 만든 순간들",
            "type": "text",
            "label": "타이틀",
            "editable": true
          },
          "image1": {
            "value": "https://picsum.photos/seed/wed_g1/400/600",
            "type": "image",
            "label": "갤러리 이미지 1",
            "editable": true
          },
          "image2": {
            "value": "https://picsum.photos/seed/wed_g2/400/300",
            "type": "image",
            "label": "갤러리 이미지 2",
            "editable": true
          },
          "image3": {
            "value": "https://picsum.photos/seed/wed_g3/400/300",
            "type": "image",
            "label": "갤러리 이미지 3",
            "editable": true
          },
          "image4": {
            "value": "https://picsum.photos/seed/wed_g4/400/600",
            "type": "image",
            "label": "갤러리 이미지 4",
            "editable": true
          },
          "image5": {
            "value": "https://picsum.photos/seed/wed_g5/400/300",
            "type": "image",
            "label": "갤러리 이미지 5",
            "editable": true
          },
          "image6": {
            "value": "https://picsum.photos/seed/wed_g6/400/300",
            "type": "image",
            "label": "갤러리 이미지 6",
            "editable": true
          }
        }
      },
      {
        "id": "process-001",
        "type": "process",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "진행 방식"
        },
        "fields": {
          "eyebrow": {
            "value": "How We Work",
            "type": "text",
            "label": "상단 라벨",
            "editable": true
          },
          "title": {
            "value": "처음부터 끝까지, 함께합니다",
            "type": "text",
            "label": "타이틀",
            "editable": true
          },
          "step1Title": {
            "value": "첫 상담",
            "type": "text",
            "label": "스텝 1 제목",
            "editable": true
          },
          "step1Body": {
            "value": "두 분의 이야기와 날짜, 예산, 스타일을 여유 있게 나눕니다. 무료 진행.",
            "type": "textarea",
            "label": "스텝 1 설명",
            "editable": true
          },
          "step2Title": {
            "value": "맞춤 기획안",
            "type": "text",
            "label": "스텝 2 제목",
            "editable": true
          },
          "step2Body": {
            "value": "두 분만을 위한 컨셉, 공간, 플라워, 타임라인을 담은 기획안을 제안합니다.",
            "type": "textarea",
            "label": "스텝 2 설명",
            "editable": true
          },
          "step3Title": {
            "value": "디테일 조율",
            "type": "text",
            "label": "스텝 3 제목",
            "editable": true
          },
          "step3Body": {
            "value": "드레스, 부케, 음악, 다이닝까지 — 모든 디테일을 함께 결정합니다.",
            "type": "textarea",
            "label": "스텝 3 설명",
            "editable": true
          },
          "step4Title": {
            "value": "완벽한 D-Day",
            "type": "text",
            "label": "스텝 4 제목",
            "editable": true
          },
          "step4Body": {
            "value": "당일 전담 코디네이터 배치. 두 분은 오직 서로만 바라보시면 됩니다.",
            "type": "textarea",
            "label": "스텝 4 설명",
            "editable": true
          },
          "ctaText": {
            "value": "첫 상담 예약하기 — 무료",
            "type": "text",
            "label": "CTA 버튼",
            "editable": true
          },
          "ctaUrl": {
            "value": "#contact",
            "type": "url",
            "label": "CTA 링크",
            "editable": true
          },
          "ctaNote": {
            "value": "평균 응답 시간 2시간 이내",
            "type": "text",
            "label": "CTA 안내 문구",
            "editable": true
          }
        }
      },
      {
        "id": "pricing-001",
        "type": "pricing",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "패키지"
        },
        "fields": {
          "eyebrow": {
            "value": "Packages",
            "type": "text",
            "label": "상단 라벨",
            "editable": true
          },
          "title": {
            "value": "패키지 안내",
            "type": "text",
            "label": "타이틀",
            "editable": true
          },
          "subtitle": {
            "value": "모든 패키지는 상담 후 두 분에 맞게 조정 가능합니다.",
            "type": "text",
            "label": "서브 타이틀",
            "editable": true
          },
          "pkg1Tier": {
            "value": "Essentials",
            "type": "text",
            "label": "패키지 1 등급",
            "editable": true
          },
          "pkg1Name": {
            "value": "당일 코디네이션",
            "type": "text",
            "label": "패키지 1 이름",
            "editable": true
          },
          "pkg1Price": {
            "value": "390",
            "type": "text",
            "label": "패키지 1 가격",
            "editable": true
          },
          "pkg1PriceSuffix": {
            "value": "만원~",
            "type": "text",
            "label": "패키지 1 가격 단위",
            "editable": true
          },
          "pkg1Note": {
            "value": "부가세 별도",
            "type": "text",
            "label": "패키지 1 안내",
            "editable": true
          },
          "pkg1Feature1": {
            "value": "D-Day 전담 코디네이터 1인",
            "type": "text",
            "label": "패키지 1 항목 1",
            "editable": true
          },
          "pkg1Feature2": {
            "value": "타임라인·큐시트 제작",
            "type": "text",
            "label": "패키지 1 항목 2",
            "editable": true
          },
          "pkg1Feature3": {
            "value": "업체 컨펌·현장 점검",
            "type": "text",
            "label": "패키지 1 항목 3",
            "editable": true
          },
          "pkg1Feature4": {
            "value": "리허설 동행",
            "type": "text",
            "label": "패키지 1 항목 4",
            "editable": true
          },
          "pkg1CtaText": {
            "value": "상담 신청",
            "type": "text",
            "label": "패키지 1 버튼",
            "editable": true
          },
          "pkg2Badge": {
            "value": "가장 많이 선택",
            "type": "text",
            "label": "패키지 2 배지",
            "editable": true
          },
          "pkg2Tier": {
            "value": "Standard",
            "type": "text",
            "label": "패키지 2 등급",
            "editable": true
          },
          "pkg2Name": {
            "value": "세미 풀 플래닝",
            "type": "text",
            "label": "패키지 2 이름",
            "editable": true
          },
          "pkg2Price": {
            "value": "780",
            "type": "text",
            "label": "패키지 2 가격",
            "editable": true
          },
          "pkg2PriceSuffix": {
            "value": "만원~",
            "type": "text",
            "label": "패키지 2 가격 단위",
            "editable": true
          },
          "pkg2Note": {
            "value": "부가세 별도",
            "type": "text",
            "label": "패키지 2 안내",
            "editable": true
          },
          "pkg2Feature1": {
            "value": "Essentials 전체 포함",
            "type": "text",
            "label": "패키지 2 항목 1",
            "editable": true
          },
          "pkg2Feature2": {
            "value": "컨셉·무드보드 기획",
            "type": "text",
            "label": "패키지 2 항목 2",
            "editable": true
          },
          "pkg2Feature3": {
            "value": "플라워·데코 디렉팅",
            "type": "text",
            "label": "패키지 2 항목 3",
            "editable": true
          },
          "pkg2Feature4": {
            "value": "업체 협상·계약 대행",
            "type": "text",
            "label": "패키지 2 항목 4",
            "editable": true
          },
          "pkg2Feature5": {
            "value": "무제한 상담 (카카오·전화)",
            "type": "text",
            "label": "패키지 2 항목 5",
            "editable": true
          },
          "pkg2CtaText": {
            "value": "상담 신청",
            "type": "text",
            "label": "패키지 2 버튼",
            "editable": true
          },
          "pkg3Tier": {
            "value": "Premium",
            "type": "text",
            "label": "패키지 3 등급",
            "editable": true
          },
          "pkg3Name": {
            "value": "풀 웨딩 플래닝",
            "type": "text",
            "label": "패키지 3 이름",
            "editable": true
          },
          "pkg3Price": {
            "value": "문의",
            "type": "text",
            "label": "패키지 3 가격",
            "editable": true
          },
          "pkg3PriceSuffix": {
            "value": "~",
            "type": "text",
            "label": "패키지 3 가격 단위",
            "editable": true
          },
          "pkg3Note": {
            "value": "규모·장소에 따라 상이",
            "type": "text",
            "label": "패키지 3 안내",
            "editable": true
          },
          "pkg3Feature1": {
            "value": "Standard 전체 포함",
            "type": "text",
            "label": "패키지 3 항목 1",
            "editable": true
          },
          "pkg3Feature2": {
            "value": "예식장 섭외·투어 동행",
            "type": "text",
            "label": "패키지 3 항목 2",
            "editable": true
          },
          "pkg3Feature3": {
            "value": "드레스·메이크업 동행",
            "type": "text",
            "label": "패키지 3 항목 3",
            "editable": true
          },
          "pkg3Feature4": {
            "value": "해외 웨딩 진행 가능",
            "type": "text",
            "label": "패키지 3 항목 4",
            "editable": true
          },
          "pkg3Feature5": {
            "value": "전담 플래너 1:1 배정",
            "type": "text",
            "label": "패키지 3 항목 5",
            "editable": true
          },
          "pkg3CtaText": {
            "value": "문의하기",
            "type": "text",
            "label": "패키지 3 버튼",
            "editable": true
          }
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
          "eyebrow": {
            "value": "Reviews",
            "type": "text",
            "label": "상단 라벨",
            "editable": true
          },
          "title": {
            "value": "두 분이 직접 전해주신 이야기",
            "type": "text",
            "label": "타이틀",
            "editable": true
          },
          "review1Body": {
            "value": "처음엔 예산이 걱정됐는데, 플래너님이 우선순위를 같이 정해주시고 불필요한 지출을 줄여 오히려 절약했어요. 식장에 들어서는 순간 눈물이 났습니다. 정말 우리 웨딩이었어요.",
            "type": "textarea",
            "label": "후기 1 본문",
            "editable": true
          },
          "review1Author": {
            "value": "김지연 · 박재원",
            "type": "text",
            "label": "후기 1 작성자",
            "editable": true
          },
          "review1Meta": {
            "value": "세미 풀 플래닝 · 2024.05",
            "type": "text",
            "label": "후기 1 메타",
            "editable": true
          },
          "review1Avatar": {
            "value": "https://i.pravatar.cc/150?u=couple_jiyeon",
            "type": "image",
            "label": "후기 1 아바타",
            "editable": true
          },
          "review2Body": {
            "value": "남자친구가 프러포즈 이벤트를 부탁했다고 하는데, 당일 레스토랑에 들어갔을 때 너무 예뻐서 실제로 소리를 질렀어요. 사소한 것 하나까지 우리 취향이었어요. 어떻게 알았는지 신기합니다.",
            "type": "textarea",
            "label": "후기 2 본문",
            "editable": true
          },
          "review2Author": {
            "value": "이소연",
            "type": "text",
            "label": "후기 2 작성자",
            "editable": true
          },
          "review2Meta": {
            "value": "프러포즈 이벤트 · 2024.02",
            "type": "text",
            "label": "후기 2 메타",
            "editable": true
          },
          "review2Avatar": {
            "value": "https://i.pravatar.cc/150?u=propose_soyeon",
            "type": "image",
            "label": "후기 2 아바타",
            "editable": true
          },
          "review3Body": {
            "value": "해외 스몰 웨딩이라 걱정 많았는데, 현지 업체 선정부터 비자 서류, 당일 통역까지 전부 해결해 주셨어요. 저희는 사랑하는 사람들과 그 순간에만 집중할 수 있었습니다.",
            "type": "textarea",
            "label": "후기 3 본문",
            "editable": true
          },
          "review3Author": {
            "value": "최하준 · 윤서아",
            "type": "text",
            "label": "후기 3 작성자",
            "editable": true
          },
          "review3Meta": {
            "value": "해외 스몰 웨딩 · 2023.10",
            "type": "text",
            "label": "후기 3 메타",
            "editable": true
          },
          "review3Avatar": {
            "value": "https://i.pravatar.cc/150?u=overseas_couple",
            "type": "image",
            "label": "후기 3 아바타",
            "editable": true
          },
          "ratingScore": {
            "value": "9.8",
            "type": "text",
            "label": "평균 만족도 점수",
            "editable": true
          },
          "ratingNote": {
            "value": "847쌍의 커플이 남긴 후기를 바탕으로 산출된 오뜨르의 평균 만족도 점수입니다. (네이버 예약 기준)",
            "type": "textarea",
            "label": "평균 만족도 설명",
            "editable": true
          }
        }
      },
      {
        "id": "faq-001",
        "type": "faq",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "FAQ"
        },
        "fields": {
          "eyebrow": {
            "value": "FAQ",
            "type": "text",
            "label": "상단 라벨",
            "editable": true
          },
          "title": {
            "value": "자주 묻는 질문",
            "type": "text",
            "label": "타이틀",
            "editable": true
          },
          "q1": {
            "value": "예식까지 얼마나 여유가 있어야 하나요?",
            "type": "text",
            "label": "질문 1",
            "editable": true
          },
          "a1": {
            "value": "풀 플래닝은 최소 6개월 전, 당일 코디네이션은 2개월 전을 권장합니다. 단, 예식장이 이미 확정되어 있는 경우 더 촉박해도 가능한 경우가 많으니 우선 연락 주세요.",
            "type": "textarea",
            "label": "답변 1",
            "editable": true
          },
          "q2": {
            "value": "예산이 많지 않아도 괜찮을까요?",
            "type": "text",
            "label": "질문 2",
            "editable": true
          },
          "a2": {
            "value": "물론입니다. 오뜨르는 예산 안에서 두 분이 가장 원하는 것에 집중합니다. 상담 시 예산을 솔직하게 알려주시면, 불필요한 지출을 줄이고 의미 있는 곳에 집중하는 플랜을 제안드립니다.",
            "type": "textarea",
            "label": "답변 2",
            "editable": true
          },
          "q3": {
            "value": "플래너가 중간에 바뀌지 않나요?",
            "type": "text",
            "label": "질문 3",
            "editable": true
          },
          "a3": {
            "value": "첫 상담부터 D-Day까지 동일한 플래너가 담당합니다. 오뜨르는 팀 내 업무 배분이 아닌, 1:1 전담제를 운영하고 있어 두 분과 처음부터 끝까지 같이 합니다.",
            "type": "textarea",
            "label": "답변 3",
            "editable": true
          },
          "q4": {
            "value": "야외 또는 해외 웨딩도 가능한가요?",
            "type": "text",
            "label": "질문 4",
            "editable": true
          },
          "a4": {
            "value": "네, 가능합니다. 국내 야외 웨딩 및 제주·강원 지역 웨딩, 해외(발리, 프라하, 파리 등)도 진행한 경험이 있습니다. 위치에 따른 추가 비용은 상담 시 안내드립니다.",
            "type": "textarea",
            "label": "답변 4",
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
          "label": "Start Your Story"
        },
        "fields": {
          "eyebrow": {
            "value": "Start Your Story",
            "type": "text",
            "label": "상단 라벨",
            "editable": true
          },
          "title": {
            "value": "두 분의 날짜를\n**함께 잡아보세요.**",
            "type": "textarea",
            "label": "타이틀 (**...** 으로 강조)",
            "editable": true
          },
          "body": {
            "value": "아직 아무것도 정해지지 않아도 괜찮습니다. 날짜도, 장소도, 예산도 — 모든 것은 상담 이후에 결정해도 충분합니다.",
            "type": "textarea",
            "label": "본문",
            "editable": true
          },
          "phone": {
            "value": "02-5678-9012",
            "type": "text",
            "label": "전화번호",
            "editable": true
          },
          "hours": {
            "value": "평일 10:00–19:00 · 주말 예약제",
            "type": "text",
            "label": "운영 시간",
            "editable": true
          },
          "location": {
            "value": "서울 성수동 · 예약 후 방문 가능",
            "type": "text",
            "label": "쇼룸 위치",
            "editable": true
          },
          "backgroundImage": {
            "value": "https://picsum.photos/seed/wedding_cta_bg/1600/700",
            "type": "image",
            "label": "배경 이미지",
            "editable": true
          },
          "formTitle": {
            "value": "무료 상담 신청",
            "type": "text",
            "label": "폼 제목",
            "editable": true
          },
          "formNote": {
            "value": "첫 상담은 무료입니다 · 평균 응답 2시간 이내",
            "type": "text",
            "label": "폼 안내 문구",
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
          "brand": {
            "value": "HAUTRE",
            "type": "text",
            "label": "브랜드 로고",
            "editable": true
          },
          "tagline": {
            "value": "Wedding & Event Planner · Seoul",
            "type": "text",
            "label": "태그라인",
            "editable": true
          },
          "description": {
            "value": "2013년부터 847쌍의 커플과 함께해 온 오뜨르. 당신의 이야기가 가장 아름다운 하루가 될 수 있도록 함께하겠습니다.",
            "type": "textarea",
            "label": "브랜드 설명",
            "editable": true
          },
          "address": {
            "value": "서울 성동구 성수이로 · 오뜨르 쇼룸\nTEL. 02-5678-9012\n평일 10:00–19:00",
            "type": "textarea",
            "label": "주소·연락처",
            "editable": true
          },
          "copyright": {
            "value": "© 2024 오뜨르 웨딩 & 이벤트. All rights reserved.",
            "type": "text",
            "label": "저작권 표기",
            "editable": true
          }
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
