import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  "slug": "legal-default",
  "templateJson": {
    "mode": "single",
    "templateKey": "legal-default",
    "globalStyles": {
      "primaryColor": "#0f172a",
      "secondaryColor": "#92400e",
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
        "data": {
          "brandName": {
            "value": "하람",
            "type": "text",
            "label": "사무소 이름",
            "editable": true
          },
          "brandSubtext": {
            "value": "Law & Tax",
            "type": "text",
            "label": "보조 텍스트",
            "editable": true
          },
          "phone": {
            "value": "02-3456-7890",
            "type": "text",
            "label": "전화번호",
            "editable": true
          },
          "ctaText": {
            "value": "무료 상담 신청",
            "type": "text",
            "label": "CTA 버튼 텍스트",
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
          "label": "법무부 등록 · 한국세무사회 정회원"
        },
        "data": {
          "eyebrow": {
            "value": "법무부 등록 · 한국세무사회 정회원",
            "type": "text",
            "label": "상단 배지",
            "editable": true
          },
          "title": {
            "value": "23년의 전문성,\n귀사의 든든한\n법률·세무 파트너",
            "type": "textarea",
            "label": "메인 타이틀",
            "editable": true
          },
          "subtitle": {
            "value": "기업법무부터 세무신고, 부동산 거래, 상속·증여까지 — 하람의 전문가가 처음부터 끝까지 직접 담당합니다.",
            "type": "textarea",
            "label": "서브 타이틀",
            "editable": true
          },
          "ctaPrimaryText": {
            "value": "무료 상담 신청하기",
            "type": "text",
            "label": "기본 CTA",
            "editable": true
          },
          "ctaSecondaryText": {
            "value": "업무 분야 보기",
            "type": "text",
            "label": "보조 CTA",
            "editable": true
          },
          "stat1Value": {
            "value": "23",
            "type": "text",
            "label": "통계 1 값",
            "editable": true
          },
          "stat1Label": {
            "value": "년 전문 경력",
            "type": "text",
            "label": "통계 1 라벨",
            "editable": true
          },
          "stat2Value": {
            "value": "14,300",
            "type": "text",
            "label": "통계 2 값",
            "editable": true
          },
          "stat2Label": {
            "value": "+ 누적 상담",
            "type": "text",
            "label": "통계 2 라벨",
            "editable": true
          },
          "stat3Value": {
            "value": "94.3",
            "type": "text",
            "label": "통계 3 값",
            "editable": true
          },
          "stat3Label": {
            "value": "% 승소율",
            "type": "text",
            "label": "통계 3 라벨",
            "editable": true
          },
          "stat4Value": {
            "value": "18",
            "type": "text",
            "label": "통계 4 값",
            "editable": true
          },
          "stat4Label": {
            "value": "명 전문가",
            "type": "text",
            "label": "통계 4 라벨",
            "editable": true
          }
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
        "data": {
          "stat1Value": {
            "value": "4,700",
            "type": "text",
            "label": "통계 1 값",
            "editable": true
          },
          "stat1Label": {
            "value": "법인 설립·자문",
            "type": "text",
            "label": "통계 1 라벨",
            "editable": true
          },
          "stat2Value": {
            "value": "98.1",
            "type": "text",
            "label": "통계 2 값",
            "editable": true
          },
          "stat2Label": {
            "value": "% 가산세 없는 처리",
            "type": "text",
            "label": "통계 2 라벨",
            "editable": true
          },
          "stat3Value": {
            "value": "2,100",
            "type": "text",
            "label": "통계 3 값",
            "editable": true
          },
          "stat3Label": {
            "value": "억+ 거래 자문",
            "type": "text",
            "label": "통계 3 라벨",
            "editable": true
          },
          "stat4Value": {
            "value": "97.4",
            "type": "text",
            "label": "통계 4 값",
            "editable": true
          },
          "stat4Label": {
            "value": "% 재의뢰·추천율",
            "type": "text",
            "label": "통계 4 라벨",
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
          "label": "업무 분야"
        },
        "data": {
          "title": {
            "value": "어떤 법률·세무 문제든\n하람이 함께합니다",
            "type": "textarea",
            "label": "섹션 타이틀",
            "editable": true
          },
          "service1Title": {
            "value": "기업법무 · 계약",
            "type": "text",
            "label": "서비스 1 제목",
            "editable": true
          },
          "service1Body": {
            "value": "계약서 검토·작성, M&A 자문, 기업분쟁 해결. 법인 설립부터 청산까지 기업의 전 생애주기를 지원합니다.",
            "type": "textarea",
            "label": "서비스 1 설명",
            "editable": true
          },
          "service2Title": {
            "value": "세무 · 회계",
            "type": "text",
            "label": "서비스 2 제목",
            "editable": true
          },
          "service2Body": {
            "value": "법인세·종소세·부가세 신고, 세무조사 대응, 절세 플랜 수립까지 원스톱으로 처리합니다.",
            "type": "textarea",
            "label": "서비스 2 설명",
            "editable": true
          },
          "service3Title": {
            "value": "부동산 거래",
            "type": "text",
            "label": "서비스 3 제목",
            "editable": true
          },
          "service3Body": {
            "value": "매매·임대 계약, 등기, 부동산 관련 세금 최적화 및 분쟁 해결까지 종합 지원합니다.",
            "type": "textarea",
            "label": "서비스 3 설명",
            "editable": true
          },
          "service4Title": {
            "value": "상속 · 증여",
            "type": "text",
            "label": "서비스 4 제목",
            "editable": true
          },
          "service4Body": {
            "value": "사전증여 플랜, 상속세 신고, 유언장 작성, 가업승계 절세 전략을 체계적으로 수립합니다.",
            "type": "textarea",
            "label": "서비스 4 설명",
            "editable": true
          },
          "service5Title": {
            "value": "노무 · 인사",
            "type": "text",
            "label": "서비스 5 제목",
            "editable": true
          },
          "service5Body": {
            "value": "취업규칙 작성, 근로계약, 부당해고·산재 대응, 노동청 진술 동행까지 지원합니다.",
            "type": "textarea",
            "label": "서비스 5 설명",
            "editable": true
          },
          "service6Title": {
            "value": "민·형사 소송 · 행정심판",
            "type": "text",
            "label": "서비스 6 제목",
            "editable": true
          },
          "service6Body": {
            "value": "사기·횡령 등 형사사건, 민사소송, 조세심판까지 — 하람 변호사가 직접 담당합니다.",
            "type": "textarea",
            "label": "서비스 6 설명",
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
          "label": "사무소 소개"
        },
        "data": {
          "title": {
            "value": "하람을 선택하는\n세 가지 이유",
            "type": "textarea",
            "label": "섹션 타이틀",
            "editable": true
          },
          "body": {
            "value": "23년간 강남에서 하나의 사무소를 운영해온 이유는 하나입니다 — 의뢰인과의 신뢰를 지키는 것.",
            "type": "textarea",
            "label": "본문",
            "editable": true
          },
          "reason1Title": {
            "value": "전문가가 직접 담당",
            "type": "text",
            "label": "이유 1 제목",
            "editable": true
          },
          "reason1Body": {
            "value": "상담한 변호사·세무사가 서류를 직접 작성하고 법정에 출석합니다.",
            "type": "textarea",
            "label": "이유 1 설명",
            "editable": true
          },
          "reason2Title": {
            "value": "비용 명확 고지",
            "type": "text",
            "label": "이유 2 제목",
            "editable": true
          },
          "reason2Body": {
            "value": "사전 견적서를 문서로 제공하며, 예상치 못한 추가 비용은 없습니다.",
            "type": "textarea",
            "label": "이유 2 설명",
            "editable": true
          },
          "reason3Title": {
            "value": "비밀 보장",
            "type": "text",
            "label": "이유 3 제목",
            "editable": true
          },
          "reason3Body": {
            "value": "모든 상담 내용은 법에 의해 엄격히 보호되며 완전한 비밀을 보장합니다.",
            "type": "textarea",
            "label": "이유 3 설명",
            "editable": true
          }
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
        "data": {
          "title": {
            "value": "하람의 전문가를 소개합니다",
            "type": "text",
            "label": "섹션 타이틀",
            "editable": true
          },
          "member1Name": {
            "value": "김준혁",
            "type": "text",
            "label": "멤버 1 이름",
            "editable": true
          },
          "member1Role": {
            "value": "대표 변호사",
            "type": "text",
            "label": "멤버 1 직함",
            "editable": true
          },
          "member1Body": {
            "value": "사법연수원 38기 · 전 검사 · 기업형사 전문",
            "type": "textarea",
            "label": "멤버 1 설명",
            "editable": true
          },
          "member1Image": {
            "value": "https://picsum.photos/seed/lawyer_kim/600/450",
            "type": "image",
            "label": "멤버 1 사진",
            "editable": true
          },
          "member2Name": {
            "value": "이서진",
            "type": "text",
            "label": "멤버 2 이름",
            "editable": true
          },
          "member2Role": {
            "value": "수석 세무사",
            "type": "text",
            "label": "멤버 2 직함",
            "editable": true
          },
          "member2Body": {
            "value": "공인회계사 · 법인세·상속증여 전문 · 15년 경력",
            "type": "textarea",
            "label": "멤버 2 설명",
            "editable": true
          },
          "member2Image": {
            "value": "https://picsum.photos/seed/tax_lee/600/450",
            "type": "image",
            "label": "멤버 2 사진",
            "editable": true
          },
          "member3Name": {
            "value": "박도현",
            "type": "text",
            "label": "멤버 3 이름",
            "editable": true
          },
          "member3Role": {
            "value": "파트너 변호사",
            "type": "text",
            "label": "멤버 3 직함",
            "editable": true
          },
          "member3Body": {
            "value": "노무사 겸직 · 노동·부동산 전문 · 국토부 자문",
            "type": "textarea",
            "label": "멤버 3 설명",
            "editable": true
          },
          "member3Image": {
            "value": "https://picsum.photos/seed/lawyer_park/600/450",
            "type": "image",
            "label": "멤버 3 사진",
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
          "label": "진행 절차"
        },
        "data": {
          "title": {
            "value": "투명하고 체계적인 진행 절차",
            "type": "text",
            "label": "섹션 타이틀",
            "editable": true
          },
          "step1Title": {
            "value": "무료 초기 상담",
            "type": "text",
            "label": "단계 1 제목",
            "editable": true
          },
          "step1Body": {
            "value": "전화·방문·온라인 중 편한 방식으로 초기 방향을 안내합니다.",
            "type": "textarea",
            "label": "단계 1 설명",
            "editable": true
          },
          "step2Title": {
            "value": "검토 및 견적 제시",
            "type": "text",
            "label": "단계 2 제목",
            "editable": true
          },
          "step2Body": {
            "value": "서류 검토 후 예상 기간과 비용을 문서로 제출합니다.",
            "type": "textarea",
            "label": "단계 2 설명",
            "editable": true
          },
          "step3Title": {
            "value": "계약 및 착수",
            "type": "text",
            "label": "단계 3 제목",
            "editable": true
          },
          "step3Body": {
            "value": "위임계약서 작성 후 전문가가 배정되어 즉시 업무를 시작합니다.",
            "type": "textarea",
            "label": "단계 3 설명",
            "editable": true
          },
          "step4Title": {
            "value": "정기 보고",
            "type": "text",
            "label": "단계 4 제목",
            "editable": true
          },
          "step4Body": {
            "value": "매주 진행 현황을 보고하며 중요 일정은 사전에 안내합니다.",
            "type": "textarea",
            "label": "단계 4 설명",
            "editable": true
          },
          "step5Title": {
            "value": "결과 및 사후 관리",
            "type": "text",
            "label": "단계 5 제목",
            "editable": true
          },
          "step5Body": {
            "value": "종결 보고서와 함께 재발 방지 가이드를 안내드립니다.",
            "type": "textarea",
            "label": "단계 5 설명",
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
          "label": "testimonials"
        },
        "data": {
          "title": {
            "value": "의뢰인들이 직접 말하는 하람",
            "type": "text",
            "label": "섹션 타이틀",
            "editable": true
          },
          "review1Body": {
            "value": "세무조사 통보를 받고 너무 당황했는데, 세무사님이 전략을 잘 세워주셔서 세액이 크게 줄었습니다.",
            "type": "textarea",
            "label": "후기 1 본문",
            "editable": true
          },
          "review1Author": {
            "value": "최윤호",
            "type": "text",
            "label": "후기 1 작성자",
            "editable": true
          },
          "review1Meta": {
            "value": "제조업 법인 대표",
            "type": "text",
            "label": "후기 1 메타",
            "editable": true
          },
          "review2Body": {
            "value": "부모님 상속 문제로 분쟁이 있었는데, 변호사님이 원만하게 해결해 주셨습니다.",
            "type": "textarea",
            "label": "후기 2 본문",
            "editable": true
          },
          "review2Author": {
            "value": "박하윤",
            "type": "text",
            "label": "후기 2 작성자",
            "editable": true
          },
          "review2Meta": {
            "value": "개인 의뢰인",
            "type": "text",
            "label": "후기 2 메타",
            "editable": true
          },
          "review3Body": {
            "value": "스타트업 창업부터 투자 계약까지 항상 빠르고 정확한 도움을 받았습니다.",
            "type": "textarea",
            "label": "후기 3 본문",
            "editable": true
          },
          "review3Author": {
            "value": "김도윤",
            "type": "text",
            "label": "후기 3 작성자",
            "editable": true
          },
          "review3Meta": {
            "value": "테크 스타트업 대표",
            "type": "text",
            "label": "후기 3 메타",
            "editable": true
          }
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
        "data": {
          "title": {
            "value": "자주 묻는 질문",
            "type": "text",
            "label": "섹션 타이틀",
            "editable": true
          },
          "q1": {
            "value": "초기 상담은 정말 무료인가요?",
            "type": "text",
            "label": "질문 1",
            "editable": true
          },
          "a1": {
            "value": "네, 최초 30분 상담은 완전 무료입니다. 진행 여부와 관계없이 비용을 청구하지 않습니다.",
            "type": "textarea",
            "label": "답변 1",
            "editable": true
          },
          "q2": {
            "value": "비용은 어떻게 책정되나요?",
            "type": "text",
            "label": "질문 2",
            "editable": true
          },
          "a2": {
            "value": "사건 복잡도에 따라 사전 서면 견적을 제출합니다. 투명하게 안내드립니다.",
            "type": "textarea",
            "label": "답변 2",
            "editable": true
          },
          "q3": {
            "value": "온라인으로만 진행 가능한가요?",
            "type": "text",
            "label": "질문 3",
            "editable": true
          },
          "a3": {
            "value": "대부분의 업무는 화상상담, 이메일, 카톡으로 처리 가능합니다.",
            "type": "textarea",
            "label": "답변 3",
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
          "label": "문의하기"
        },
        "data": {
          "title": {
            "value": "지금 바로 상담하세요.\n첫 상담은 무료입니다.",
            "type": "textarea",
            "label": "타이틀",
            "editable": true
          },
          "body": {
            "value": "문제가 더 커지기 전에 전문가의 판단을 받아보세요.",
            "type": "textarea",
            "label": "본문",
            "editable": true
          },
          "phone": {
            "value": "02-3456-7890",
            "type": "text",
            "label": "전화번호",
            "editable": true
          },
          "hours": {
            "value": "평일 09:00–18:00",
            "type": "text",
            "label": "운영 시간",
            "editable": true
          },
          "location": {
            "value": "강남역 9번 출구 도보 3분",
            "type": "text",
            "label": "위치",
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
          "brandName": {
            "value": "하람 법률세무사무소",
            "type": "text",
            "label": "사무소 이름",
            "editable": true
          },
          "copyright": {
            "value": "© 2024 하람 법률세무사무소. All rights reserved.",
            "type": "text",
            "label": "저작권",
            "editable": true
          },
          "address": {
            "value": "서울 강남구 테헤란로 123 하람빌딩 8층",
            "type": "textarea",
            "label": "주소",
            "editable": true
          }
        }
      }
    ]
  },
  "thumbnailPath": "public/thumbnails/template-legal.webp",
  "version": "1.1.0",
  "defaults": {
    "name": "Legal",
    "description": "신뢰감 있는 법률·세무 사무소 웹사이트 템플릿. 서비스, 팀, 사례 안내 섹션 포함.",
    "category": "legal"
  }
};

export default preset;
