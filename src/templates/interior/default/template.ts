import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  "slug": "interior-default",
  "templateJson": {
    "mode": "single",
    "templateKey": "interior-default",
    "globalStyles": {
      "primaryColor": "#C9A96E",
      "secondaryColor": "#0C0A08",
      "fontFamily": "'Pretendard', system-ui, sans-serif",
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
        "data": {
          "brandName": {
            "value": "에스파시오",
            "type": "text",
            "label": "브랜드 이름",
            "editable": true
          },
          "ctaText": {
            "value": "무료 상담 신청",
            "type": "text",
            "label": "CTA 텍스트",
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
          "label": "Seoul Premium Interior Studio"
        },
        "data": {
          "eyebrow": {
            "value": "Seoul Premium Interior Studio",
            "type": "text",
            "label": "상단 라벨",
            "editable": true
          },
          "estLabel": {
            "value": "Est. 2015",
            "type": "text",
            "label": "설립 연도 라벨",
            "editable": true
          },
          "title": {
            "value": "공간이\n삶을 바꾸는\n순간을 설계합니다",
            "type": "textarea",
            "label": "메인 타이틀",
            "editable": true
          },
          "description": {
            "value": "에스파시오는 단순한 인테리어를 넘어섭니다. 거주자의 생활 방식, 감각, 그리고 가치관을 깊이 이해한 뒤 공간으로 번역합니다. 10년간 280곳 이상의 공간이 우리를 통해 다시 태어났습니다.",
            "type": "textarea",
            "label": "설명",
            "editable": true
          },
          "ctaPrimary": {
            "value": "포트폴리오 보기",
            "type": "text",
            "label": "기본 CTA",
            "editable": true
          },
          "ctaSecondary": {
            "value": "무료 상담 예약",
            "type": "text",
            "label": "보조 CTA",
            "editable": true
          },
          "trust1": {
            "value": "한국 인테리어 대상 2023",
            "type": "text",
            "label": "신뢰 문구 1",
            "editable": true
          },
          "trust2": {
            "value": "건설업 면허 보유",
            "type": "text",
            "label": "신뢰 문구 2",
            "editable": true
          },
          "trust3": {
            "value": "고객 만족도 4.9/5.0",
            "type": "text",
            "label": "신뢰 문구 3",
            "editable": true
          },
          "statValue": {
            "value": "280",
            "type": "text",
            "label": "플로팅 수치",
            "editable": true
          },
          "statLabel": {
            "value": "완성된 프로젝트",
            "type": "text",
            "label": "플로팅 라벨",
            "editable": true
          },
          "projectTitle": {
            "value": "성북동 단독주택 — 거실 리모델링",
            "type": "text",
            "label": "대표 프로젝트명",
            "editable": true
          }
        }
      },
      {
        "id": "stats-001",
        "type": "stats",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "통계"
        },
        "data": {
          "s1Value": {
            "value": "280",
            "type": "text",
            "label": "통계 1 수치",
            "editable": true
          },
          "s1Label": {
            "value": "완성된 프로젝트",
            "type": "text",
            "label": "통계 1 라벨",
            "editable": true
          },
          "s2Value": {
            "value": "10",
            "type": "text",
            "label": "통계 2 수치",
            "editable": true
          },
          "s2Label": {
            "value": "년의 전문 경력",
            "type": "text",
            "label": "통계 2 라벨",
            "editable": true
          },
          "s3Value": {
            "value": "4.9",
            "type": "text",
            "label": "통계 3 수치",
            "editable": true
          },
          "s3Label": {
            "value": "고객 만족도",
            "type": "text",
            "label": "통계 3 라벨",
            "editable": true
          },
          "s4Value": {
            "value": "98",
            "type": "text",
            "label": "통계 4 수치",
            "editable": true
          },
          "s4Label": {
            "value": "재계약·추천 비율",
            "type": "text",
            "label": "통계 4 라벨",
            "editable": true
          }
        }
      },
      {
        "id": "about-001",
        "type": "about",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "스튜디오 소개"
        },
        "data": {
          "eyebrow": {
            "value": "About Espacio",
            "type": "text",
            "label": "섹션 라벨",
            "editable": true
          },
          "title": {
            "value": "우리는 인테리어가 아닌\n삶의 방식을 설계합니다",
            "type": "textarea",
            "label": "섹션 타이틀",
            "editable": true
          },
          "description": {
            "value": "에스파시오(Espacio)는 스페인어로 '공간'을 뜻합니다. 2015년 설립 이후, 우리는 공간이 단순한 구조물이 아니라 사람의 감정과 생활을 담는 그릇이라는 믿음 하나로 일해왔습니다.\n\n트렌드를 쫓지 않습니다. 대신 고객 한 명 한 명의 생활 방식, 감각, 미래 계획을 깊이 이해한 뒤 그에 맞는 유일한 공간을 제안합니다.",
            "type": "textarea",
            "label": "설명",
            "editable": true
          },
          "v1Title": {
            "value": "완전 맞춤 설계",
            "type": "text",
            "label": "가치 1 제목",
            "editable": true
          },
          "v1Desc": {
            "value": "동일한 설계는 단 하나도 없습니다. 모든 프로젝트는 고객의 이야기에서 출발합니다.",
            "type": "text",
            "label": "가치 1 설명",
            "editable": true
          },
          "v2Title": {
            "value": "타협 없는 소재 품질",
            "type": "text",
            "label": "가치 2 제목",
            "editable": true
          },
          "v2Desc": {
            "value": "이탈리아 원목 마루, 독일제 시스템 창호, 국내 검증 페인트만 사용합니다.",
            "type": "text",
            "label": "가치 2 설명",
            "editable": true
          },
          "v3Title": {
            "value": "납기 100% 준수",
            "type": "text",
            "label": "가치 3 제목",
            "editable": true
          },
          "v3Desc": {
            "value": "10년간 280건 전 프로젝트를 예정일 내 완공했습니다.",
            "type": "text",
            "label": "가치 3 설명",
            "editable": true
          },
          "projectTitle": {
            "value": "한남동 타운하우스 — 주방 리노베이션",
            "type": "text",
            "label": "이미지 프로젝트명",
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
        "data": {
          "eyebrow": {
            "value": "Our Services",
            "type": "text",
            "label": "섹션 라벨",
            "editable": true
          },
          "title": {
            "value": "어떤 공간이든,\n에스파시오가 함께합니다",
            "type": "textarea",
            "label": "섹션 타이틀",
            "editable": true
          },
          "description": {
            "value": "주거부터 상업 공간까지, 규모와 예산에 관계없이 최선의 결과를 드립니다.",
            "type": "textarea",
            "label": "섹션 설명",
            "editable": true
          },
          "s1Badge": {
            "value": "Most Popular",
            "type": "text",
            "label": "S1 배지",
            "editable": true
          },
          "s1Title": {
            "value": "주거 인테리어",
            "type": "text",
            "label": "S1 제목",
            "editable": true
          },
          "s1Desc": {
            "value": "아파트, 빌라, 단독주택까지 — 거주자의 라이프스타일에 맞춘 완전 맞춤형 설계.",
            "type": "textarea",
            "label": "S1 설명",
            "editable": true
          },
          "s1Price": {
            "value": "95만원",
            "type": "text",
            "label": "S1 시작 가격",
            "editable": true
          },
          "s2Title": {
            "value": "상업 공간",
            "type": "text",
            "label": "S2 제목",
            "editable": true
          },
          "s2Desc": {
            "value": "카페, 레스토랑, 리테일 스토어, 쇼룸 — 브랜드 정체성을 공간으로 완성합니다.",
            "type": "textarea",
            "label": "S2 설명",
            "editable": true
          },
          "s3Title": {
            "value": "오피스 디자인",
            "type": "text",
            "label": "S3 제목",
            "editable": true
          },
          "s3Desc": {
            "value": "직원 생산성과 브랜드 인상 모두를 고려한 업무 공간 설계.",
            "type": "textarea",
            "label": "S3 설명",
            "editable": true
          },
          "s4Title": {
            "value": "공간 컨설팅",
            "type": "text",
            "label": "S4 제목",
            "editable": true
          },
          "s4Desc": {
            "value": "시공 전 전문가 컨설팅으로 방향과 예산을 먼저 잡습니다.",
            "type": "textarea",
            "label": "S4 설명",
            "editable": true
          },
          "s5Title": {
            "value": "2년 A/S 보장",
            "type": "text",
            "label": "S5 제목",
            "editable": true
          },
          "s5Desc": {
            "value": "시공 후 2년간 하자 보수를 무상 제공합니다.",
            "type": "textarea",
            "label": "S5 설명",
            "editable": true
          }
        }
      },
      {
        "id": "portfolio-001",
        "type": "portfolio",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "포트폴리오"
        },
        "data": {
          "eyebrow": {
            "value": "Portfolio",
            "type": "text",
            "label": "섹션 라벨",
            "editable": true
          },
          "title": {
            "value": "에스파시오의\n대표 작업물",
            "type": "textarea",
            "label": "섹션 타이틀",
            "editable": true
          },
          "p1Meta": {
            "value": "RESIDENTIAL · 2024",
            "type": "text",
            "label": "P1 메타",
            "editable": true
          },
          "p1Title": {
            "value": "용산구 한남동 — 42평 아파트",
            "type": "text",
            "label": "P1 제목",
            "editable": true
          },
          "p1Desc": {
            "value": "거실·주방 전체 리노베이션",
            "type": "text",
            "label": "P1 설명",
            "editable": true
          },
          "p2Meta": {
            "value": "COMMERCIAL · 2024",
            "type": "text",
            "label": "P2 메타",
            "editable": true
          },
          "p2Title": {
            "value": "청담동 — 파인다이닝 레스토랑",
            "type": "text",
            "label": "P2 제목",
            "editable": true
          },
          "p3Meta": {
            "value": "RESIDENTIAL · 2023",
            "type": "text",
            "label": "P3 메타",
            "editable": true
          },
          "p3Title": {
            "value": "성북동 — 마스터 침실",
            "type": "text",
            "label": "P3 제목",
            "editable": true
          },
          "p4Meta": {
            "value": "OFFICE · 2024",
            "type": "text",
            "label": "P4 메타",
            "editable": true
          },
          "p4Title": {
            "value": "강남구 — 스타트업 오피스",
            "type": "text",
            "label": "P4 제목",
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
          "label": "진행 과정"
        },
        "data": {
          "eyebrow": {
            "value": "How We Work",
            "type": "text",
            "label": "섹션 라벨",
            "editable": true
          },
          "title": {
            "value": "투명하고 체계적인\n6단계 진행 과정",
            "type": "textarea",
            "label": "섹션 타이틀",
            "editable": true
          },
          "step1Title": {
            "value": "초기 상담",
            "type": "text",
            "label": "1단계 제목",
            "editable": true
          },
          "step1Desc": {
            "value": "니즈·예산·일정 파악. 첫 상담은 무료입니다.",
            "type": "text",
            "label": "1단계 설명",
            "editable": true
          },
          "step2Title": {
            "value": "현장 실측",
            "type": "text",
            "label": "2단계 제목",
            "editable": true
          },
          "step2Desc": {
            "value": "공간의 구조와 상태를 정밀 측정합니다.",
            "type": "text",
            "label": "2단계 설명",
            "editable": true
          },
          "step3Title": {
            "value": "설계 제안",
            "type": "text",
            "label": "3단계 제목",
            "editable": true
          },
          "step3Desc": {
            "value": "3D 렌더링과 도면으로 완성 모습을 확인합니다.",
            "type": "text",
            "label": "3단계 설명",
            "editable": true
          },
          "step4Title": {
            "value": "계약·착수금",
            "type": "text",
            "label": "4단계 제목",
            "editable": true
          },
          "step4Desc": {
            "value": "공정·소재·금액을 계약서로 명문화합니다.",
            "type": "text",
            "label": "4단계 설명",
            "editable": true
          },
          "step5Title": {
            "value": "공사 진행",
            "type": "text",
            "label": "5단계 제목",
            "editable": true
          },
          "step5Desc": {
            "value": "주 1회 사진 보고로 상황을 공유합니다.",
            "type": "text",
            "label": "5단계 설명",
            "editable": true
          },
          "step6Title": {
            "value": "준공·입주",
            "type": "text",
            "label": "6단계 제목",
            "editable": true
          },
          "step6Desc": {
            "value": "최종 점검 후 키를 드립니다. 2년 A/S 시작.",
            "type": "text",
            "label": "6단계 설명",
            "editable": true
          }
        }
      },
      {
        "id": "testimonials-001",
        "type": "testimonials",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "Client Reviews"
        },
        "data": {
          "eyebrow": {
            "value": "Client Reviews",
            "type": "text",
            "label": "섹션 라벨",
            "editable": true
          },
          "title": {
            "value": "고객의 말이\n가장 정직한 포트폴리오입니다",
            "type": "textarea",
            "label": "섹션 타이틀",
            "editable": true
          },
          "r1Body": {
            "value": "\"이사하면서 처음으로 공간을 제대로 설계해봤습니다. 디자이너분이 제 취향을 제 말보다 더 잘 이해하시더라고요. 결과물이 너무 좋아서 친구들한테 자랑하고 다니고 있어요.\"",
            "type": "textarea",
            "label": "후기 1 본문",
            "editable": true
          },
          "r1Author": {
            "value": "이수민 님",
            "type": "text",
            "label": "후기 1 작성자",
            "editable": true
          },
          "r1Meta": {
            "value": "서울 마포구 · 30평대 아파트",
            "type": "text",
            "label": "후기 1 메타",
            "editable": true
          },
          "r2Body": {
            "value": "\"카페 오픈 전에 인테리어를 맡겼는데, 예상보다 2주 빨리 끝났습니다. 공사 중에도 매주 사진 보고를 해주셔서 신뢰가 갔고, 오픈 후 손님들 반응이 정말 뜨겁습니다.\"",
            "type": "textarea",
            "label": "후기 2 본문",
            "editable": true
          },
          "r2Author": {
            "value": "박준혁 님",
            "type": "text",
            "label": "후기 2 작성자",
            "editable": true
          },
          "r2Meta": {
            "value": "서울 합정동 · 카페 오너",
            "type": "text",
            "label": "후기 2 메타",
            "editable": true
          },
          "r3Body": {
            "value": "\"회사 사무실 리뉴얼을 의뢰했습니다. 직원들 만족도가 눈에 띄게 올라갔고, 거래처에서도 공간이 달라졌다는 말을 들었어요. 비용 대비 효과가 압도적입니다.\"",
            "type": "textarea",
            "label": "후기 3 본문",
            "editable": true
          },
          "r3Author": {
            "value": "김하윤 님",
            "type": "text",
            "label": "후기 3 작성자",
            "editable": true
          },
          "r3Meta": {
            "value": "서울 강남구 · IT 스타트업 대표",
            "type": "text",
            "label": "후기 3 메타",
            "editable": true
          }
        }
      },
      {
        "id": "contact-001",
        "type": "contact",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "문의"
        },
        "data": {
          "eyebrow": {
            "value": "Get Started",
            "type": "text",
            "label": "섹션 라벨",
            "editable": true
          },
          "title": {
            "value": "당신의 공간을\n지금 바꿔드립니다",
            "type": "textarea",
            "label": "섹션 타이틀",
            "editable": true
          },
          "description": {
            "value": "첫 상담은 무료입니다. 예산과 일정에 대한 걱정 없이 편하게 이야기 나눠보세요. 에스파시오의 전문가가 최적의 방향을 제안해드립니다.",
            "type": "textarea",
            "label": "설명",
            "editable": true
          },
          "phone": {
            "value": "02-1234-5678",
            "type": "text",
            "label": "전화번호",
            "editable": true
          },
          "email": {
            "value": "hello@espacio.kr",
            "type": "text",
            "label": "이메일",
            "editable": true
          },
          "address": {
            "value": "서울 강남구 도산대로 128",
            "type": "text",
            "label": "주소",
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
        "data": {
          "description": {
            "value": "공간이 삶을 바꾸는 순간을 설계하는 프리미엄 인테리어 스튜디오. 2015년 설립.",
            "type": "textarea",
            "label": "브랜드 설명",
            "editable": true
          },
          "address": {
            "value": "서울 강남구 도산대로 128, 5층",
            "type": "text",
            "label": "주소",
            "editable": true
          },
          "phone": {
            "value": "02-1234-5678",
            "type": "text",
            "label": "전화번호",
            "editable": true
          },
          "email": {
            "value": "hello@espacio.kr",
            "type": "text",
            "label": "이메일",
            "editable": true
          },
          "hours": {
            "value": "평일 09:00 – 18:00\n(토 10:00 – 15:00)",
            "type": "textarea",
            "label": "운영 시간",
            "editable": true
          },
          "copyright": {
            "value": "© 2025 에스파시오 인테리어. All rights reserved.",
            "type": "text",
            "label": "저작권",
            "editable": true
          }
        }
      }
    ]
  },
  "thumbnailPath": "public/thumbnails/template-interior.webp",
  "version": "1.1.0",
  "defaults": {
    "name": "Interior",
    "description": "고급스러운 인테리어 디자인 스튜디오 템플릿. 포트폴리오, 서비스, 프로세스 섹션 포함.",
    "category": "design"
  }
};

export default preset;
