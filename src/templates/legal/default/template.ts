import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  "slug": "legal-default",
  "content": {
    "mode": "single",
    "templateKey": "legal-default",
    "globalStyles": {
      "primaryColor": "#0f172a",
      "secondaryColor": "#92400e",
      "backgroundColor": "#fafaf9",
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
          "brandName": "하람",
          "brandSubtext": "Law & Tax",
          "phone": "02-3456-7890",
          "ctaText": "무료 상담 신청"
        }
      },
      {
        "id": "hero-001",
        "type": "hero",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "법무부 등록 · 한국세무사회 정회원"
        },
        "fields": {
          "eyebrow": "법무부 등록 · 한국세무사회 정회원",
          "title": "23년의 전문성,\n귀사의 든든한\n법률·세무 파트너",
          "subtitle": "기업법무부터 세무신고, 부동산 거래, 상속·증여까지 — 하람의 전문가가 처음부터 끝까지 직접 담당합니다.",
          "ctaPrimaryText": "무료 상담 신청하기",
          "ctaSecondaryText": "업무 분야 보기",
          "stat1Value": "23",
          "stat1Label": "년 전문 경력",
          "stat2Value": "14,300",
          "stat2Label": "+ 누적 상담",
          "stat3Value": "94.3",
          "stat3Label": "% 승소율",
          "stat4Value": "18",
          "stat4Label": "명 전문가"
        }
      },
      {
        "id": "trust-strip-001",
        "type": "trust-strip",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "신뢰 배지"
        },
        "fields": {
          "stat1Value": "4,700",
          "stat1Label": "법인 설립·자문",
          "stat2Value": "98.1",
          "stat2Label": "% 가산세 없는 처리",
          "stat3Value": "2,100",
          "stat3Label": "억+ 거래 자문",
          "stat4Value": "97.4",
          "stat4Label": "% 재의뢰·추천율"
        }
      },
      {
        "id": "services-001",
        "type": "services",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "업무 분야"
        },
        "fields": {
          "title": "어떤 법률·세무 문제든\n하람이 함께합니다",
          "service1Title": "기업법무 · 계약",
          "service1Body": "계약서 검토·작성, M&A 자문, 기업분쟁 해결. 법인 설립부터 청산까지 기업의 전 생애주기를 지원합니다.",
          "service2Title": "세무 · 회계",
          "service2Body": "법인세·종소세·부가세 신고, 세무조사 대응, 절세 플랜 수립까지 원스톱으로 처리합니다.",
          "service3Title": "부동산 거래",
          "service3Body": "매매·임대 계약, 등기, 부동산 관련 세금 최적화 및 분쟁 해결까지 종합 지원합니다.",
          "service4Title": "상속 · 증여",
          "service4Body": "사전증여 플랜, 상속세 신고, 유언장 작성, 가업승계 절세 전략을 체계적으로 수립합니다.",
          "service5Title": "노무 · 인사",
          "service5Body": "취업규칙 작성, 근로계약, 부당해고·산재 대응, 노동청 진술 동행까지 지원합니다.",
          "service6Title": "민·형사 소송 · 행정심판",
          "service6Body": "사기·횡령 등 형사사건, 민사소송, 조세심판까지 — 하람 변호사가 직접 담당합니다."
        }
      },
      {
        "id": "about-001",
        "type": "about",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "사무소 소개"
        },
        "fields": {
          "title": "하람을 선택하는\n세 가지 이유",
          "body": "23년간 강남에서 하나의 사무소를 운영해온 이유는 하나입니다 — 의뢰인과의 신뢰를 지키는 것.",
          "reason1Title": "전문가가 직접 담당",
          "reason1Body": "상담한 변호사·세무사가 서류를 직접 작성하고 법정에 출석합니다.",
          "reason2Title": "비용 명확 고지",
          "reason2Body": "사전 견적서를 문서로 제공하며, 예상치 못한 추가 비용은 없습니다.",
          "reason3Title": "비밀 보장",
          "reason3Body": "모든 상담 내용은 법에 의해 엄격히 보호되며 완전한 비밀을 보장합니다."
        }
      },
      {
        "id": "team-001",
        "type": "team",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "구성원"
        },
        "fields": {
          "title": "하람의 전문가를 소개합니다",
          "member1Name": "김준혁",
          "member1Role": "대표 변호사",
          "member1Body": "사법연수원 38기 · 전 검사 · 기업형사 전문",
          "member1Image": { "url": "https://picsum.photos/seed/lawyer_kim/600/450" },
          "member2Name": "이서진",
          "member2Role": "수석 세무사",
          "member2Body": "공인회계사 · 법인세·상속증여 전문 · 15년 경력",
          "member2Image": { "url": "https://picsum.photos/seed/tax_lee/600/450" },
          "member3Name": "박도현",
          "member3Role": "파트너 변호사",
          "member3Body": "노무사 겸직 · 노동·부동산 전문 · 국토부 자문",
          "member3Image": { "url": "https://picsum.photos/seed/lawyer_park/600/450" }
        }
      },
      {
        "id": "process-001",
        "type": "process",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "진행 절차"
        },
        "fields": {
          "title": "투명하고 체계적인 진행 절차",
          "step1Title": "무료 초기 상담",
          "step1Body": "전화·방문·온라인 중 편한 방식으로 초기 방향을 안내합니다.",
          "step2Title": "검토 및 견적 제시",
          "step2Body": "서류 검토 후 예상 기간과 비용을 문서로 제출합니다.",
          "step3Title": "계약 및 착수",
          "step3Body": "위임계약서 작성 후 전문가가 배정되어 즉시 업무를 시작합니다.",
          "step4Title": "정기 보고",
          "step4Body": "매주 진행 현황을 보고하며 중요 일정은 사전에 안내합니다.",
          "step5Title": "결과 및 사후 관리",
          "step5Body": "종결 보고서와 함께 재발 방지 가이드를 안내드립니다."
        }
      },
      {
        "id": "testimonials-001",
        "type": "testimonials",
        "visible": true,
        "nav": {
          "visible": false,
          "label": "testimonials"
        },
        "fields": {
          "title": "의뢰인들이 직접 말하는 하람",
          "review1Body": "세무조사 통보를 받고 너무 당황했는데, 세무사님이 전략을 잘 세워주셔서 세액이 크게 줄었습니다.",
          "review1Author": "최윤호",
          "review1Meta": "제조업 법인 대표",
          "review2Body": "부모님 상속 문제로 분쟁이 있었는데, 변호사님이 원만하게 해결해 주셨습니다.",
          "review2Author": "박하윤",
          "review2Meta": "개인 의뢰인",
          "review3Body": "스타트업 창업부터 투자 계약까지 항상 빠르고 정확한 도움을 받았습니다.",
          "review3Author": "김도윤",
          "review3Meta": "테크 스타트업 대표"
        }
      },
      {
        "id": "faq-001",
        "type": "faq",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "자주 묻는 질문"
        },
        "fields": {
          "title": "자주 묻는 질문",
          "q1": "초기 상담은 정말 무료인가요?",
          "a1": "네, 최초 30분 상담은 완전 무료입니다. 진행 여부와 관계없이 비용을 청구하지 않습니다.",
          "q2": "비용은 어떻게 책정되나요?",
          "a2": "사건 복잡도에 따라 사전 서면 견적을 제출합니다. 투명하게 안내드립니다.",
          "q3": "온라인으로만 진행 가능한가요?",
          "a3": "대부분의 업무는 화상상담, 이메일, 카톡으로 처리 가능합니다."
        }
      },
      {
        "id": "contact-001",
        "type": "contact",
        "visible": true,
        "nav": {
          "visible": true,
          "label": "문의하기"
        },
        "fields": {
          "title": "지금 바로 상담하세요.\n첫 상담은 무료입니다.",
          "body": "문제가 더 커지기 전에 전문가의 판단을 받아보세요.",
          "phone": "02-3456-7890",
          "hours": "평일 09:00–18:00",
          "location": "강남역 9번 출구 도보 3분"
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
          "brandName": "하람 법률세무사무소",
          "copyright": "© 2024 하람 법률세무사무소. All rights reserved.",
          "address": "서울 강남구 테헤란로 123 하람빌딩 8층"
        }
      }
    ]
  },
  "thumbnailPath": "public/thumbnails/template-legal-default.webp",
  "version": "1.1.0",
  "defaults": {
    "name": "Legal",
    "description": "신뢰감 있는 법률·세무 사무소 웹사이트 템플릿. 서비스, 팀, 사례 안내 섹션 포함.",
    "category": "legal"
  }
};

export default preset;
