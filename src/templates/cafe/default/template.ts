import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  "slug": "cafe-default",
  "content": {
    "mode": "single",
    "templateKey": "cafe-default",
    "globalStyles": {
      "primaryColor": "#C96A3A",
      "secondaryColor": "#231509",
      "backgroundColor": "#F5F0E8",
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
          "brandName": "MONO",
          "brandSubtext": "Specialty Coffee",
          "ctaText": "오시는 길"
        }
      },
      {
        "id": "hero-001",
        "type": "hero",
        "visible": true,
        "fields": {
          "eyebrow": "Seoul Seongsu — Specialty Coffee",
          "title1": "천천히,",
          "titleAccent": "제대로",
          "subtitle": "— 한 잔의 완성",
          "description": "원두 산지부터 로스팅, 추출까지 모든 과정을 직접 관리합니다.\n서두르지 않는 시간 속에서 커피 본연의 맛을 경험하세요.",
          "image": { "url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1100&q=80" },
          "ctaPrimary": "메뉴 보기",
          "ctaSecondary": "카페 소개",
          "stat1Value": "07",
          "stat1Label": "년째 운영",
          "stat2Value": "12",
          "stat2Label": "가지 시그니처",
          "stat3Value": "4",
          "stat3Label": "곳 원두 산지",
          "badgeText": "\"Roasted in-house\"",
          "badgeSubtext": "직접 로스팅한 원두",
          "seasonTag": "Spring Menu"
        }
      },
      {
        "id": "marquee-001",
        "type": "marquee",
        "visible": true,
        "fields": {
          "item1": "Single Origin",
          "item2": "직접 로스팅",
          "item3": "홈메이드 베이커리",
          "item4": "Specialty Grade",
          "item5": "No Rush, No Noise",
          "item6": "매일 아침 신선한 원두",
          "item7": "Slow Coffee Culture"
        }
      },
      {
        "id": "menu-001",
        "type": "menu",
        "visible": true,
        "menu": { "label": "메뉴" },
        "fields": {
          "eyebrow": "메뉴",
          "title": "매일 정성껏\n내리는 한 잔",
          "description": "에티오피아, 콜롬비아, 코스타리카, 케냐에서 엄선한 원두를 직접 로스팅합니다.",
          "items": [
            {
              "id": "items-1",
              "fields": {
                "title": "모노 시그니처 라떼",
                "desc": "흑당 카라멜 & 에스프레소의 조화",
                "price": "6,500",
                "image": { "url": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1100&q=80" },
                "badge": "Signature"
              }
            },
            {
              "id": "items-2",
              "fields": {
                "title": "오늘의 핸드드립",
                "desc": "당일 추천 싱글 오리진",
                "image": { "url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80" }
              }
            },
            {
              "id": "items-3",
              "fields": {
                "title": "에스프레소",
                "desc": "원두 본연의 맛을 가장 진하게 느낄 수 있는 기본",
                "price": "4,000"
              }
            },
            {
              "id": "items-4",
              "fields": {
                "title": "버터 크루아상",
                "desc": "매일 아침 직접 구운 결이 살아있는 크루아상",
                "price": "4,500"
              }
            },
            {
              "id": "items-5",
              "fields": {
                "title": "봄 시즌 드링크",
                "desc": "벚꽃 라떼 & 말차 아포가토",
                "image": { "url": "https://images.unsplash.com/photo-1542444459-2beac0b15e67?auto=format&fit=crop&w=700&q=80" },
                "badge": "Season"
              }
            }
          ]
        }
      },
      {
        "id": "story-001",
        "type": "story",
        "visible": true,
        "menu": { "label": "카페 소개" },
        "fields": {
          "eyebrow": "카페 소개",
          "title1": "커피 한 잔에는",
          "titleAccent": "이야기가",
          "title2": "담겨 있습니다",
          "quote": "2017년, 단 하나의 원칙으로 문을 열었습니다. '좋은 커피는 서두르지 않는다.'\n우리는 빠름보다 정확함을, 많음보다 깊음을 선택했습니다.",
          "description": "에티오피아 예가체프의 플로럴 노트부터 콜롬비아 우일라의 균형 잡힌 바디감까지,\n산지의 특성을 최대한 살린 로스팅으로 커피 본연의 맛을 담아냅니다.",
          "image": { "url": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80" },
          "f1Title": "원두 산지 직거래",
          "f1Desc": "에티오피아, 콜롬비아, 코스타리카, 케냐 농장과 직접 거래해 최상급 원두만을 선별합니다.",
          "f2Title": "인하우스 로스팅",
          "f2Desc": "매주 소량씩 직접 로스팅합니다. 항상 최신 로스팅된 신선한 원두만을 사용합니다.",
          "f3Title": "홈메이드 베이커리",
          "f3Desc": "매일 새벽 직접 구운 크루아상, 스콘, 마들렌을 커피와 함께 제공합니다."
        }
      },
      {
        "id": "space-001",
        "type": "space",
        "visible": true,
        "menu": { "label": "공간" },
        "fields": {
          "eyebrow": "공간",
          "title": "머물고 싶은\n공간을 만듭니다",
          "description": "성수동 골목 안 조용한 3층 건물, 각 층마다 다른 분위기로 당신의 시간을 맞이합니다.",
          "imageLarge": { "url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80" },
          "imageSmall": { "url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=700&q=80" },
          "cardTitle": "채광이 좋은 공간",
          "cardDesc": "오전 햇살이 가장 아름답게 드는 남향 창가 자리가 특히 인기입니다.",
          "f1Title": "3층 독립 공간",
          "f1Desc": "층마다 다른 분위기",
          "f2Title": "무료 고속 와이파이",
          "f2Desc": "작업하기 좋은 환경",
          "f3Title": "큐레이션 책장",
          "f3Desc": "커피 & 아트 서적 구비",
          "f4Title": "바이닐 플레이어",
          "f4Desc": "매일 다른 재즈 음악"
        }
      },
      {
        "id": "testimonials-001",
        "type": "testimonials",
        "visible": true,
        "fields": {
          "eyebrow": "손님 후기",
          "title": "이 공간에서\n느낀 것들",
          "ratingValue": "4.9",
          "r1Body": "\"서울에서 이렇게 조용하고 좋은 커피를 마실 수 있는 곳이 있다는 게 신기해요. 모노 라떼는 단 것을 좋아하지 않아도 먹을 수 있을 만큼 은은하게 달고, 핸드드립은 정말 산지의 특성이 느껴져요.\"",
          "r1Author": "박하린",
          "r1Meta": "모노 시그니처 라떼",
          "r2Body": "\"재택근무할 때 자주 오는데, 분위기가 집중하기 딱 좋아요. 너무 조용하거나 너무 시끄럽지 않고, 와이파이도 빠르고 콘센트도 충분해요. 크루아상이랑 아메리카노 조합이 완벽합니다.\"",
          "r2Author": "류재현",
          "r2Meta": "작업 겸 방문",
          "r3Body": "\"성수동에 카페가 정말 많은데 여기는 진짜 커피 맛으로 승부하는 곳이에요. 스페셜티 커피 처음 입문하시는 분들에게 강력 추천합니다. 바리스타분이 원두 설명도 친절하게 해주셔요.\"",
          "r3Author": "송지안",
          "r3Meta": "오늘의 핸드드립",
          "r4Body": "\"3층 창가 자리에 앉아서 바이닐 음악 들으면서 책 읽었는데 완벽한 오후였어요. 봄 시즌 벚꽃 라떼도 너무 예쁘고 맛있었고, 마들렌은 집에 가져가려고 포장까지 했습니다.\"",
          "r4Author": "김서율",
          "r4Meta": "봄 시즌 드링크",
          "r5Body": "\"에스프레소 마시는 걸 좋아하는데 여기 에스프레소가 서울에서 탑5 안에 든다고 생각해요. 산미와 단맛의 밸런스가 정말 좋고, 추출 시간도 일정하게 유지되는 걸 보면 바리스타분의 실력이 느껴집니다.\"",
          "r5Author": "이준하",
          "r5Meta": "에스프레소 단골",
          "r6Body": "\"성수동 나들이 마지막에 항상 여기서 마무리해요. 원두 소분 판매도 하셔서 집에서도 모노의 맛을 즐길 수 있어요. 선물용으로도 정말 좋아서 지인들한테 많이 선물했습니다.\"",
          "r6Author": "최나은",
          "r6Meta": "원두 구매 & 카페 이용"
        }
      },
      {
        "id": "visit-001",
        "type": "visit",
        "visible": true,
        "menu": { "label": "방문 안내" },
        "fields": {
          "backgroundImage": { "url": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&q=70" },
          "eyebrow": "방문 안내",
          "title": "언제든\n환영합니다",
          "description": "성수역 2번 출구에서 도보 5분. 붉은 벽돌 건물 1층, 작은 테라스가 있는 곳입니다. 예약 없이 방문하셔도 됩니다.",
          "phone": "02-499-7788",
          "instagram": "#",
          "h1Label": "월요일 – 금요일",
          "h1Value": "08:00 – 21:00",
          "h2Label": "토요일",
          "h2Value": "09:00 – 22:00",
          "h3Label": "일요일 & 공휴일",
          "h3Value": "10:00 – 20:00",
          "h4Label": "라스트 오더",
          "h4Value": "마감 30분 전",
          "address": "서울특별시 성동구 성수동2가 289-12",
          "addressDetail": "서울숲역 3번 출구 도보 5분\n주차 불가 (성수역 공영주차장 이용)"
        }
      },
      {
        "id": "footer-001",
        "type": "footer",
        "visible": true,
        "fields": {
          "brandName": "MONO",
          "brandSubtext": "Specialty Coffee & Bakery",
          "description": "천천히, 제대로.\n성수동에서 한 잔의 완성을 경험하세요.",
          "phone": "02-499-7788",
          "address": "서울 성동구 성수동2가 289-12\n서울숲역 3번 출구 5분",
          "weekdayHours": "평일 08:00 – 21:00",
          "weekendHours": "주말·공휴일 09:00 – 22:00",
          "copyright": "© 2024 MONO Specialty Coffee. All rights reserved.",
          "businessInfo": "사업자등록번호: 321-98-45678 | 대표: 김지호"
        }
      }
    ]
  },
  "thumbnailPath": "public/thumbnails/template-cafe-default.webp",
  "version": "1.2.0",
  "defaults": {
    "name": "Cafe",
    "description": "감각적인 카페·커피숍 웹사이트 템플릿. 메뉴, 공간 소개, 위치 안내 섹션 포함.",
    "category": "cafe"
  }
};

export default preset;
