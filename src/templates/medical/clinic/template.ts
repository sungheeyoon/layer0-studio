import { TemplatePreset } from '../../types';

/**
 * 온유의원 (ONYU CLINIC) — a Multi Site Type preset (ADR-0007): a Korean
 * neighbourhood clinic with five routable pages (홈 / 병원소개 / 진료안내 /
 * 갤러리 / 오시는길) plus a shared header + footer. Clean white + blue,
 * trustworthy, large photography and generous whitespace.
 *
 * Nav is projected by `deriveNav`, never stored as a section.
 */

// Curated medical imagery (Unsplash CDN — stable public URLs, no API key).
const u = (id: string, w = 1200, h = 1500) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const IMG = {
  heroHome: u('1519494026892-80bbd2d6fd0d', 1600, 1000), // clinic reception
  // page headers
  hdrAbout: u('1631217868264-e5b90bb7e133', 1600, 900),
  hdrServices: u('1631217872822-1c2546d6b864', 1600, 900),
  hdrGallery: u('1512678080530-7760d81faba6', 1600, 900),
  hdrContact: u('1587351021759-3e566b6af7cc', 1600, 900),
  // feature splits (portrait)
  aboutIntro: u('1587351021759-3e566b6af7cc', 1100, 1375),
  directorPortrait: u('1612349317150-e413f6a5b16d', 1100, 1375),
  facilityIntro: u('1512678080530-7760d81faba6', 1100, 1375),
  serviceDetail: u('1631217872822-1c2546d6b864', 1100, 1375),
  // doctors
  docA: u('1612349317150-e413f6a5b16d', 900, 1200),
  docB: u('1559839734-2b71ea197ec2', 900, 1200),
  docC: u('1582750433449-648ed127bb54', 900, 1200),
  docD: u('1576091160399-112ba8d25d1d', 900, 1200),
  // gallery
  galReception: u('1519494026892-80bbd2d6fd0d', 1000, 1000),
  galRoom: u('1512678080530-7760d81faba6', 1000, 1000),
  galBuilding: u('1587351021759-3e566b6af7cc', 1000, 1000),
  galLab: u('1579154204601-01588f351e67', 1000, 1000),
  galSurgery: u('1504813184591-01572f98c85f', 1000, 1000),
  galSurgeon: u('1571772996211-2f02c9727629', 1000, 1000),
  galStetho: u('1584982751601-97dcc096659c', 1000, 1000),
  galBP: u('1631815588090-d4bfec5b1ccb', 1000, 1000),
  galDetail: u('1526256262350-7da7584cf5eb', 1000, 1000),
  // cta
  ctaHome: u('1631815588090-d4bfec5b1ccb', 1600, 900),
  ctaServices: u('1576091160399-112ba8d25d1d', 1600, 900),
};

const preset: TemplatePreset = {
  slug: 'medical-clinic',
  content: {
    mode: 'multi',
    templateKey: 'medical-clinic',
    globalStyles: {
      primaryColor: '#2563EB',
      secondaryColor: '#0E7490',
      backgroundColor: '#FFFFFF',
      fontFamily: "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', sans-serif",
      fontSize: '16px',
      layout: 'wide',
    },
    shared: {
      header: [
        {
          id: 'nav-001',
          type: 'nav',
          visible: true,
          fields: {
            brandName: '온유의원',
            ctaLabel: '예약하기',
            ctaHref: '/contact',
          },
        },
      ],
      footer: [
        {
          id: 'footer-001',
          type: 'footer',
          visible: true,
          fields: {
            brandName: '온유의원',
            tagline: '가까운 곳에서 믿을 수 있는 진료를. 온유의원은 이웃의 주치의가 되겠습니다.',
            phone: '02-336-7582',
            address: '서울 마포구 양화로 78, 3층 (서교동)',
            copyright: '© 2026 온유의원 ONYU CLINIC. All rights reserved.',
          },
        },
      ],
    },
    pages: [
      // ───────────────────────── 홈 ─────────────────────────
      {
        id: 'page-home',
        slug: 'home',
        visible: true,
        nav: { visible: true, label: '홈' },
        seo: {
          title: '온유의원 — 가까운 곳에서 믿을 수 있는 진료',
          description:
            '서울 마포 온유의원. 내과·가정의학과·건강검진. 당일 진료와 검사, 편안한 1:1 상담을 제공합니다.',
        },
        sections: [
          {
            id: 'home-hero',
            type: 'hero',
            visible: true,
            fields: {
              eyebrow: 'ONYU CLINIC · SINCE 2009',
              title: '가까운 곳에서,\n믿을 수 있는 진료',
              subtitle: '온유의원은 이웃의 주치의입니다. 정확한 진단과 편안한 상담으로 작은 증상도 가볍게 넘기지 않습니다.',
              primaryCtaLabel: '진료 예약',
              secondaryCtaLabel: '진료과목 보기',
              image: { "url": IMG.heroHome },
            },
          },
          {
            id: 'home-pillars',
            type: 'pillars',
            visible: true,
            fields: {
              eyebrow: '온유의원의 약속',
              heading: '왜 온유의원일까요',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "title": '풍부한 임상 경험',
                    "body": '15년 이상 지역 진료를 이어온 전문의가 직접 진찰하고 끝까지 책임집니다.'
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "title": '당일 검사 시스템',
                    "body": '혈액검사·초음파·심전도를 원내에서 바로 진행해 결과를 빠르게 확인합니다.'
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "title": '편안한 1:1 상담',
                    "body": '충분한 진료 시간을 두어 증상과 궁금한 점을 차분히 나눌 수 있습니다.'
                  }
                }
              ],
            },
          },
          {
            id: 'home-departments',
            type: 'departments',
            visible: true,
            fields: {
              eyebrow: '진료과목',
              heading: '대표 진료과목',
              description: '일상에서 자주 찾게 되는 진료를 한 곳에서. 자세한 내용은 진료안내에서 확인하세요.',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "icon": 'stethoscope',
                    "name": '내과',
                    "description": '감기·소화기·고혈압·당뇨 등 만성질환을 꾸준히 관리합니다.'
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "icon": 'bone',
                    "name": '정형외과',
                    "description": '근골격계 통증과 관절, 척추 질환을 정확히 진단합니다.'
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "icon": 'child',
                    "name": '가정의학과',
                    "description": '온 가족의 예방접종과 건강 상담을 함께합니다.'
                  }
                },
                {
                  "id": "items-4",
                  "fields": {
                    "icon": 'plus',
                    "name": '건강검진',
                    "description": '국가검진과 맞춤 종합검진으로 질병을 미리 발견합니다.'
                  }
                }
              ],
            },
          },
          {
            id: 'home-doctors',
            type: 'doctors',
            visible: true,
            fields: {
              eyebrow: '의료진',
              heading: '믿고 만나는 의료진',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "name": '김온유',
                    "role": '원장 · 내과 전문의',
                    "bio": '내과 전문의. 만성질환 관리와 건강검진을 담당합니다.',
                    "image": { "url": IMG.docA }
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "name": '이서연',
                    "role": '가정의학과 전문의',
                    "bio": '가족 단위 진료와 예방접종, 생활습관 상담에 힘씁니다.',
                    "image": { "url": IMG.docB }
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "name": '박도현',
                    "role": '정형외과 전문의',
                    "bio": '관절·척추 통증 치료와 재활을 전문으로 합니다.',
                    "image": { "url": IMG.docC }
                  }
                }
              ],
            },
          },
          {
            id: 'home-gallery',
            type: 'gallery',
            visible: true,
            fields: {
              eyebrow: '시설 미리보기',
              heading: '편안한 진료 공간',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "image": { "url": IMG.galReception },
                    "category": '접수·대기',
                    "caption": '밝고 넓은 접수 데스크'
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "image": { "url": IMG.galRoom },
                    "category": '진료실',
                    "caption": '프라이버시를 지키는 1인 진료실'
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "image": { "url": IMG.galLab },
                    "category": '검사실',
                    "caption": '원내 검사·판독 장비'
                  }
                }
              ],
            },
          },
          {
            id: 'home-testimonials',
            type: 'testimonials',
            visible: true,
            fields: {
              eyebrow: '환자 후기',
              heading: '이웃들이 전하는 이야기',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "quote": '증상 하나하나 자세히 들어주시고 검사 결과도 바로 설명해 주셔서 안심이 됐어요.',
                    "author": '정** 님',
                    "meta": '건강검진 · 40대'
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "quote": '아이 예방접종 때마다 친절하게 챙겨주셔서 늘 이 곳만 찾습니다.',
                    "author": '한** 님',
                    "meta": '가정의학과 · 30대'
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "quote": '무릎 통증으로 고생했는데 정확히 짚어주시고 재활까지 안내받아 좋았습니다.',
                    "author": '오** 님',
                    "meta": '정형외과 · 60대'
                  }
                }
              ],
            },
          },
          {
            id: 'home-cta',
            type: 'ctaBanner',
            visible: true,
            fields: {
              eyebrow: '진료 예약',
              heading: '오늘, 건강을 챙기세요',
              body: '온라인으로 간편하게 예약하거나 전화로 문의해 주세요.',
              ctaLabel: '온라인 예약',
              phone: '02-336-7582',
              image: { "url": IMG.ctaHome },
            },
          },
        ],
      },

      // ───────────────────────── 병원소개 ─────────────────────────
      {
        id: 'page-about',
        slug: 'about',
        visible: true,
        nav: { visible: true, label: '병원소개' },
        seo: {
          title: '병원소개 — 온유의원',
          description: '온유의원의 진료 철학과 원장 인사말, 미션·비전, 연혁, 의료진과 시설을 소개합니다.',
        },
        sections: [
          {
            id: 'about-header',
            type: 'pageHeader',
            visible: true,
            fields: {
              eyebrow: 'ABOUT',
              title: '온유의원 소개',
              description: '이웃과 오래 함께하는 동네 주치의. 온유의원이 지켜온 진료의 원칙입니다.',
              image: { "url": IMG.hdrAbout },
            },
          },
          {
            id: 'about-intro',
            type: 'featureSplit',
            visible: true,
            fields: {
              eyebrow: '병원 소개',
              heading: '동네에서 가장 가까운 주치의',
              body: '온유의원은 2009년 마포 서교동에 문을 연 지역 밀착형 의원입니다.\n한 번의 방문으로 끝나지 않고, 이웃의 건강을 오래 함께 살피는 주치의가 되고자 합니다.',
              note: '누적 진료 12만 건, 15년의 신뢰',
              image: { "url": IMG.aboutIntro },
              imageSide: 'right',
            },
          },
          {
            id: 'about-director',
            type: 'featureSplit',
            visible: true,
            fields: {
              eyebrow: '원장 인사말',
              heading: '작은 증상도 가볍게 넘기지 않겠습니다',
              body: '환자분의 이야기를 끝까지 듣는 것에서 진료가 시작된다고 믿습니다.\n정확한 진단과 정직한 설명으로, 과하지도 부족하지도 않은 진료를 약속드립니다. 언제든 편안히 찾아와 주세요.',
              note: '— 온유의원 원장 · 내과 전문의 김온유',
              image: { "url": IMG.directorPortrait },
              imageSide: 'left',
            },
          },
          {
            id: 'about-mission',
            type: 'pillars',
            visible: true,
            fields: {
              eyebrow: 'MISSION & VISION',
              heading: '온유의원이 지키는 가치',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "title": '미션',
                    "body": '이웃이 아플 때 가장 먼저 떠올리는, 신뢰할 수 있는 주치의가 됩니다.'
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "title": '비전',
                    "body": '예방부터 치료, 관리까지 이어지는 평생 건강 파트너를 지향합니다.'
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "title": '핵심 가치',
                    "body": '정직한 진료, 충분한 설명, 따뜻한 태도를 언제나 지킵니다.'
                  }
                }
              ],
            },
          },
          {
            id: 'about-timeline',
            type: 'timeline',
            visible: true,
            fields: {
              eyebrow: 'HISTORY',
              heading: '온유의원의 연혁',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "year": '2009',
                    "title": '온유의원 개원',
                    "body": '마포 서교동에서 내과·가정의학과 진료를 시작했습니다.'
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "year": '2014',
                    "title": '건강검진 센터 개설',
                    "body": '국가검진 지정기관으로 종합검진 프로그램을 운영합니다.'
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "year": '2019',
                    "title": '정형외과 진료 확대',
                    "body": '물리치료실을 갖추고 근골격계 진료를 강화했습니다.'
                  }
                },
                {
                  "id": "items-4",
                  "fields": {
                    "year": '2024',
                    "title": '전 층 리모델링',
                    "body": '더 넓고 쾌적한 진료 환경으로 새롭게 단장했습니다.'
                  }
                }
              ],
            },
          },
          {
            id: 'about-doctors',
            type: 'doctors',
            visible: true,
            fields: {
              eyebrow: '의료진 소개',
              heading: '온유의원 의료진',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "name": '김온유',
                    "role": '원장 · 내과',
                    "bio": '내과 전문의. 만성질환 관리와 건강검진을 담당합니다.',
                    "image": { "url": IMG.docA }
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "name": '이서연',
                    "role": '가정의학과',
                    "bio": '가족 단위 진료와 예방접종, 생활습관 상담을 맡고 있습니다.',
                    "image": { "url": IMG.docB }
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "name": '박도현',
                    "role": '정형외과',
                    "bio": '관절·척추 통증 치료와 재활을 전문으로 합니다.',
                    "image": { "url": IMG.docC }
                  }
                },
                {
                  "id": "items-4",
                  "fields": {
                    "name": '최지우',
                    "role": '건강검진 · 영상의학',
                    "bio": '초음파·영상 검사와 판독으로 정확한 진단을 돕습니다.',
                    "image": { "url": IMG.docD }
                  }
                }
              ],
            },
          },
          {
            id: 'about-facility',
            type: 'featureSplit',
            visible: true,
            fields: {
              eyebrow: '시설 안내',
              heading: '깨끗하고 안전한 진료 환경',
              body: '진료실·검사실·물리치료실을 층별로 분리하고, 매일 소독과 환기로 감염 관리에 힘씁니다.\n엘리베이터와 휠체어 동선을 갖춰 어르신과 거동이 불편한 분도 편하게 이용하실 수 있습니다.',
              note: '배리어프리 설계 · 원내 감염관리 지침 운영',
              image: { "url": IMG.facilityIntro },
              imageSide: 'right',
            },
          },
          {
            id: 'about-stats',
            type: 'stats',
            visible: true,
            fields: {
              heading: '숫자로 보는 온유의원',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "value": '2009',
                    "label": '개원 연도'
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "value": '4명',
                    "label": '전문의'
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "value": '12만+',
                    "label": '누적 진료'
                  }
                },
                {
                  "id": "items-4",
                  "fields": {
                    "value": '98%',
                    "label": '재방문 만족도'
                  }
                }
              ],
            },
          },
        ],
      },

      // ───────────────────────── 진료안내 ─────────────────────────
      {
        id: 'page-services',
        slug: 'services',
        visible: true,
        nav: { visible: true, label: '진료안내' },
        seo: {
          title: '진료안내 — 온유의원',
          description: '온유의원의 진료과목과 건강검진, 진료 과정, 자주 묻는 질문을 안내합니다.',
        },
        sections: [
          {
            id: 'services-header',
            type: 'pageHeader',
            visible: true,
            fields: {
              eyebrow: 'SERVICES',
              title: '진료 안내',
              description: '일상 진료부터 만성질환 관리, 건강검진까지. 필요한 진료를 한 곳에서 받으세요.',
              image: { "url": IMG.hdrServices },
            },
          },
          {
            id: 'services-departments',
            type: 'departments',
            visible: true,
            fields: {
              eyebrow: '진료과목',
              heading: '무엇을 진료하나요',
              description: '증상에 맞는 과목을 선택해 예약하실 수 있습니다.',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "icon": 'stethoscope',
                    "name": '내과',
                    "description": '감기·기관지 질환부터 고혈압·당뇨 등 만성질환을 관리합니다.'
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "icon": 'bone',
                    "name": '정형외과',
                    "description": '관절·척추 통증, 스포츠 손상, 물리치료를 진행합니다.'
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "icon": 'child',
                    "name": '가정의학과',
                    "description": '예방접종, 금연·비만 상담, 온 가족 건강관리를 돕습니다.'
                  }
                },
                {
                  "id": "items-4",
                  "fields": {
                    "icon": 'heart',
                    "name": '순환기 클리닉',
                    "description": '심전도·혈압 관리로 심혈관 건강을 살핍니다.'
                  }
                },
                {
                  "id": "items-5",
                  "fields": {
                    "icon": 'skin',
                    "name": '피부 · 상처 처치',
                    "description": '가벼운 피부 트러블과 상처 소독·처치를 진행합니다.'
                  }
                },
                {
                  "id": "items-6",
                  "fields": {
                    "icon": 'plus',
                    "name": '건강검진',
                    "description": '국가검진과 맞춤 종합검진으로 질병을 조기에 발견합니다.'
                  }
                }
              ],
            },
          },
          {
            id: 'services-detail',
            type: 'featureSplit',
            visible: true,
            fields: {
              eyebrow: '건강검진 센터',
              heading: '나에게 맞는 맞춤 검진',
              body: '연령과 생활습관에 맞춰 검진 항목을 설계합니다. 혈액·소변 검사, 복부 초음파, 심전도, 흉부 촬영을 원내에서 진행합니다.\n검진 후에는 전문의가 결과를 직접 설명하고 필요한 관리 방향을 안내합니다.',
              note: '국가검진 지정기관 · 당일 결과 상담 가능',
              image: { "url": IMG.serviceDetail },
              imageSide: 'left',
            },
          },
          {
            id: 'services-process',
            type: 'process',
            visible: true,
            fields: {
              eyebrow: '진료 과정',
              heading: '진료는 이렇게 진행됩니다',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "title": '접수 · 상담',
                    "body": '방문 또는 온라인으로 접수하고 증상을 확인합니다.'
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "title": '진료 · 진찰',
                    "body": '전문의가 충분한 시간을 두고 자세히 진찰합니다.'
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "title": '검사 · 판독',
                    "body": '필요한 검사를 원내에서 바로 진행하고 판독합니다.'
                  }
                },
                {
                  "id": "items-4",
                  "fields": {
                    "title": '치료 · 관리',
                    "body": '치료 계획을 설명하고 이후 관리까지 함께합니다.'
                  }
                }
              ],
            },
          },
          {
            id: 'services-faq',
            type: 'faq',
            visible: true,
            fields: {
              eyebrow: 'FAQ',
              heading: '자주 묻는 질문',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "question": '예약 없이 방문해도 진료가 가능한가요?',
                    "answer": '네, 현장 접수로도 진료가 가능합니다. 다만 대기를 줄이려면 온라인·전화 예약을 권해드립니다.'
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "question": '건강검진은 얼마나 걸리나요?',
                    "answer": '기본 검진은 약 40분 내외이며, 종합검진은 항목에 따라 1시간 이상 소요될 수 있습니다.'
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "question": '주차가 가능한가요?',
                    "answer": '건물 지하 주차장을 이용하실 수 있으며, 진료 시 2시간 무료 주차를 지원합니다.'
                  }
                },
                {
                  "id": "items-4",
                  "fields": {
                    "question": '검사 결과는 언제 알 수 있나요?',
                    "answer": '혈액·초음파 등 대부분의 원내 검사는 당일 결과 확인과 상담이 가능합니다.'
                  }
                },
                {
                  "id": "items-5",
                  "fields": {
                    "question": '점심시간에도 진료하나요?',
                    "answer": '평일 13:00–14:00은 점심시간으로 휴진합니다. 자세한 시간은 오시는 길에서 확인해 주세요.'
                  }
                }
              ],
            },
          },
          {
            id: 'services-cta',
            type: 'ctaBanner',
            visible: true,
            fields: {
              eyebrow: '문의 · 예약',
              heading: '궁금한 점이 있으신가요?',
              body: '진료와 검진에 대한 문의는 전화 또는 온라인 예약으로 남겨주세요.',
              ctaLabel: '진료 예약',
              phone: '02-336-7582',
              image: { "url": IMG.ctaServices },
            },
          },
        ],
      },

      // ───────────────────────── 갤러리 ─────────────────────────
      {
        id: 'page-gallery',
        slug: 'gallery',
        visible: true,
        nav: { visible: true, label: '갤러리' },
        seo: {
          title: '갤러리 — 온유의원',
          description: '온유의원의 진료 공간과 검사 장비, 의료진 활동을 사진으로 만나보세요.',
        },
        sections: [
          {
            id: 'gallery-header',
            type: 'pageHeader',
            visible: true,
            fields: {
              eyebrow: 'GALLERY',
              title: '갤러리',
              description: '밝고 깨끗한 공간에서 편안하게 진료받으실 수 있도록 준비했습니다.',
              image: { "url": IMG.hdrGallery },
            },
          },
          {
            id: 'gallery-spaces',
            type: 'gallery',
            visible: true,
            fields: {
              eyebrow: '진료 공간',
              heading: '온유의원의 공간',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "image": { "url": IMG.galReception },
                    "category": '접수·대기',
                    "caption": '따뜻한 조명의 접수 데스크'
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "image": { "url": IMG.galRoom },
                    "category": '진료실',
                    "caption": '프라이버시를 지키는 1인 진료실'
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "image": { "url": IMG.galBuilding },
                    "category": '외관',
                    "caption": '접근이 편리한 건물 입구'
                  }
                }
              ],
            },
          },
          {
            id: 'gallery-care',
            type: 'gallery',
            visible: true,
            fields: {
              eyebrow: '장비 · 활동',
              heading: '장비와 의료진 활동',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "image": { "url": IMG.galLab },
                    "category": '검사 장비',
                    "caption": '원내 혈액·영상 검사 장비'
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "image": { "url": IMG.galBP },
                    "category": '진료 활동',
                    "caption": '세심한 문진과 활력징후 측정'
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "image": { "url": IMG.galSurgery },
                    "category": '처치실',
                    "caption": '청결하게 관리되는 처치 공간'
                  }
                },
                {
                  "id": "items-4",
                  "fields": {
                    "image": { "url": IMG.galSurgeon },
                    "category": '의료진 활동',
                    "caption": '정밀한 시술을 위한 준비'
                  }
                },
                {
                  "id": "items-5",
                  "fields": {
                    "image": { "url": IMG.galStetho },
                    "category": '사진 상세',
                    "caption": '진료의 기본, 청진'
                  }
                },
                {
                  "id": "items-6",
                  "fields": {
                    "image": { "url": IMG.galDetail },
                    "category": '사진 상세',
                    "caption": '위생적으로 준비된 진료 도구'
                  }
                }
              ],
            },
          },
        ],
      },

      // ───────────────────────── 오시는길 ─────────────────────────
      {
        id: 'page-contact',
        slug: 'contact',
        visible: true,
        nav: { visible: true, label: '오시는길' },
        seo: {
          title: '오시는 길 — 온유의원',
          description: '온유의원 위치와 진료시간, 연락처 안내. 온라인 예약도 신청하실 수 있습니다.',
        },
        sections: [
          {
            id: 'contact-header',
            type: 'pageHeader',
            visible: true,
            fields: {
              eyebrow: 'CONTACT',
              title: '오시는 길',
              description: '지하철과 버스로 편리하게 오실 수 있습니다. 진료시간과 연락처를 확인하세요.',
              image: { "url": IMG.hdrContact },
            },
          },
          {
            id: 'contact-info',
            type: 'contact',
            visible: true,
            fields: {
              heading: '오시는 길 · 진료시간',
              intro: '홍대입구역과 가까운 마포 서교동에 자리하고 있습니다. 어르신과 휠체어 이용도 편리합니다.',
              address: '서울 마포구 양화로 78, 3층 (서교동)',
              directions: '지하철 2호선 홍대입구역 3번 출구 도보 5분\n버스 서교동 정류장 하차 · 건물 지하 주차장 2시간 무료',
              hours: '평일 09:00 – 18:30 (점심 13:00 – 14:00)\n토요일 09:00 – 13:00\n일요일·공휴일 휴진',
              items: [
                {
                  "id": "items-1",
                  "fields": {
                    "label": '전화',
                    "value": '02-336-7582'
                  }
                },
                {
                  "id": "items-2",
                  "fields": {
                    "label": '팩스',
                    "value": '02-336-7583'
                  }
                },
                {
                  "id": "items-3",
                  "fields": {
                    "label": '이메일',
                    "value": 'hello@onyu.clinic'
                  }
                },
                {
                  "id": "items-4",
                  "fields": {
                    "label": '카카오',
                    "value": '@온유의원'
                  }
                }
              ],
            },
          },
          {
            id: 'contact-form',
            type: 'appointmentForm',
            visible: true,
            fields: {
              heading: '온라인 예약 신청',
              description: '희망 일시와 증상을 남겨 주시면 확인 후 예약 시간을 안내해 드립니다.',
              submitLabel: '예약 신청',
              note: '본 양식은 예약 신청용이며, 접수 완료 시 전화 또는 문자로 안내드립니다. 응급 증상은 119 또는 응급실을 이용해 주세요.',
              fields: [
                {
                  "id": "fields-1",
                  "fields": {
                    "label": '이름',
                    "type": 'text',
                    "placeholder": '홍길동'
                  }
                },
                {
                  "id": "fields-2",
                  "fields": {
                    "label": '연락처',
                    "type": 'tel',
                    "placeholder": '010-0000-0000'
                  }
                },
                {
                  "id": "fields-3",
                  "fields": {
                    "label": '희망 날짜',
                    "type": 'date',
                    "placeholder": ''
                  }
                },
                {
                  "id": "fields-4",
                  "fields": {
                    "label": '진료과목',
                    "type": 'select',
                    "placeholder": '과목을 선택하세요'
                  }
                },
                {
                  "id": "fields-5",
                  "fields": {
                    "label": '증상 · 문의',
                    "type": 'textarea',
                    "placeholder": '증상이나 궁금한 점을 자유롭게 적어주세요'
                  }
                }
              ],
            },
          },
        ],
      },
    ],
  },
  thumbnailPath: 'public/thumbnails/template-medical-clinic.webp',
  version: '1.0.0',
  defaults: {
    name: '온유의원 (의료)',
    description:
      '동네 의원·클리닉을 위한 멀티페이지 템플릿 — 홈·병원소개·진료안내·갤러리·오시는길. 깨끗한 화이트+블루 팔레트와 Pretendard, 넓은 여백과 큰 사진.',
    category: 'medical',
  },
};

export default preset;
