import { TemplatePreset } from '../../types';

/**
 * 능선 (NEUNGSEON) — a Multi Site Type preset (ADR-0007): a Korean
 * mountain-trail outdoor brand with seven routable pages (홈 / 스토어 /
 * 컬렉션 / 액티비티 / 저널 / 브랜드 / 문의) plus a shared header + footer.
 *
 * Multi presets carry the `templateJson` union verbatim — `composition` only
 * ever emits one page (TEMPLATE_SYSTEM.md §9-H). Nav is projected by
 * `deriveNav`, never stored as a section.
 */

// Curated outdoor imagery (Unsplash CDN — stable public URLs, no API key).
const u = (id: string, w = 1200, h = 1500) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const IMG = {
  heroHome: u('1454496522488-7a8e488e8606', 1600, 1000),
  storyForest: u('1441974231531-c6227db76b6e', 1100, 1375),
  ctaTrail: u('1464822759023-fed622ff2c3b', 1600, 900),
  ctaShop: u('1469474968028-56623f02e42e', 1600, 900),
  ctaActivity: u('1546519638-68e109498ffc', 1600, 900),
  // page headers
  hdrShop: u('1517824806704-9040b037703b', 1600, 900),
  hdrCollections: u('1470770841072-f978cf4d019e', 1600, 900),
  hdrActivities: u('1533240332313-0db49b459ad6', 1600, 900),
  hdrJournal: u('1517649763962-0c623066013b', 1600, 900),
  hdrAbout: u('1502082553048-f009c37129b9', 1600, 900),
  hdrContact: u('1519681393784-d120267933ba', 1600, 900),
  // collections
  colA: u('1551632811-561732d1e306', 1200, 900),
  colB: u('1506905925346-21bda4d32df4', 1200, 900),
  colC: u('1501785888041-af3ef285b470', 1200, 900),
  colD: u('1472214103451-9374bd1c798e', 1200, 900),
  colE: u('1455156218388-5e61b526818b', 1200, 900),
  aboutSplit: u('1519681393784-d120267933ba', 1100, 1375),
  collectionsSplit: u('1470770841072-f978cf4d019e', 1100, 1375),
  // products
  prodA: u('1622260614153-03223fb72052', 1000, 1250),
  prodB: u('1553062407-98eeb64c6a62', 1000, 1250),
  prodC: u('1520923642038-b4259acecbd7', 1000, 1250),
  prodD: u('1571687949921-1306bfb24b72', 1000, 1250),
  prodE: u('1542291026-7eec264c27ff', 1000, 1250),
  prodF: u('1596516109370-29001ec8ec36', 1000, 1250),
  // activities
  actA: u('1545959570-a94084071b5d', 1200, 750),
  actB: u('1510797215324-95aa89f43c33', 1200, 750),
  actC: u('1556905055-8f358a7a47b2', 1200, 750),
  actD: u('1508739773434-c26b3d09e071', 1200, 750),
  // journal
  jrnA: u('1533873984035-25970ab07461', 1100, 733),
  jrnB: u('1606107557195-0e29a4b5b4aa', 1100, 733),
  jrnC: u('1551632811-561732d1e306', 1100, 733),
  jrnD: u('1502082553048-f009c37129b9', 1100, 733),
  jrnE: u('1469474968028-56623f02e42e', 1100, 733),
  jrnF: u('1470770841072-f978cf4d019e', 1100, 733),
};

const preset: TemplatePreset = {
  slug: 'outdoor-default',
  templateJson: {
    mode: 'multi',
    templateKey: 'outdoor-default',
    globalStyles: {
      primaryColor: '#3F4A37',
      secondaryColor: '#C2602F',
      fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
      fontSize: '16px',
      layout: 'wide',
    },
    shared: {
      header: [
        {
          id: 'nav-001',
          type: 'nav',
          visible: true,
          data: {
            brandName: { type: 'text', label: '브랜드명', value: '능선' },
          },
        },
      ],
      footer: [
        {
          id: 'footer-001',
          type: 'footer',
          visible: true,
          data: {
            brandName: { type: 'text', label: '브랜드명', value: '능선' },
            tagline: {
              type: 'textarea',
              label: '태그라인',
              value:
                '산을 잇는 길 위에서. 능선은 오래 걷는 사람을 위한 장비와 이야기를 만듭니다.',
            },
            copyright: {
              type: 'text',
              label: '저작권 문구',
              value: '© 2026 능선 NEUNGSEON. All rights reserved.',
            },
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
          title: '능선 — 산을 잇는 아웃도어 브랜드',
          description:
            '오래 걷는 사람을 위한 장비. 능선의 컬렉션, 액티비티, 그리고 산의 기록을 만나보세요.',
        },
        sections: [
          {
            id: 'home-hero',
            type: 'hero',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: 'SINCE 2016 · SEOUL' },
              title: { type: 'text', label: '대제목', value: '능선을 잇다' },
              subtitle: {
                type: 'textarea',
                label: '설명',
                value:
                  '바람이 머무는 능선과 그 아래 숲. 능선은 도시와 산을 오가는 사람을 위한 단단하고 가벼운 장비를 만듭니다.',
              },
              primaryCtaLabel: { type: 'text', label: '주 버튼 텍스트', value: '컬렉션 보기' },
              secondaryCtaLabel: { type: 'text', label: '보조 버튼 텍스트', value: '브랜드 이야기' },
              image: { type: 'image', label: '배경 이미지', value: IMG.heroHome },
            },
          },
          {
            id: 'home-pillars',
            type: 'pillars',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: '능선이 일하는 방식' },
              heading: { type: 'text', label: '제목', value: '오래 쓰는 것을, 가볍게' },
              items: {
                type: 'array',
                label: '가치 항목',
                items: [
                  {
                    title: { type: 'text', label: '제목', value: '필드 테스트' },
                    body: {
                      type: 'textarea',
                      label: '설명',
                      value:
                        '모든 제품은 사계절 능선에서 직접 검증합니다. 데이터가 아니라 발끝의 감각으로.',
                    },
                  },
                  {
                    title: { type: 'text', label: '제목', value: '리페어 우선' },
                    body: {
                      type: 'textarea',
                      label: '설명',
                      value:
                        '버리기보다 고쳐 쓰도록. 무상 수선과 부품 공급으로 장비의 수명을 늘립니다.',
                    },
                  },
                  {
                    title: { type: 'text', label: '제목', value: '책임 있는 소재' },
                    body: {
                      type: 'textarea',
                      label: '설명',
                      value:
                        '재생 나일론과 블루사인 인증 원단을 우선합니다. 산에 진 빚을 줄이는 일.',
                    },
                  },
                ],
              },
            },
          },
          {
            id: 'home-story',
            type: 'featureSplit',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: '브랜드' },
              heading: { type: 'text', label: '제목', value: '능선은 길에서 시작됐습니다' },
              body: {
                type: 'textarea',
                label: '본문',
                value:
                  '2016년 겨울, 백두대간을 종주하던 세 사람이 마땅한 장비가 없어 직접 박음질을 시작했습니다.\n능선은 여전히 작은 작업실에서, 실제로 산을 걷는 사람들의 손으로 만들어집니다.',
              },
              note: { type: 'text', label: '강조 문구', value: '— 능선 메이커스, 서울 성수' },
              image: { type: 'image', label: '이미지', value: IMG.storyForest },
              imageSide: { type: 'select', label: '이미지 위치', value: 'right', options: ['left', 'right'] },
            },
          },
          {
            id: 'home-collections',
            type: 'collectionGrid',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: '대표 컬렉션' },
              heading: { type: 'text', label: '제목', value: '계절을 입다' },
              items: {
                type: 'array',
                label: '컬렉션 항목',
                items: [
                  {
                    title: { type: 'text', label: '제목', value: '리지라인 셸' },
                    season: { type: 'text', label: '시즌/태그', value: 'ALL SEASON' },
                    description: {
                      type: 'textarea',
                      label: '설명',
                      value: '3겹 방수 셸과 경량 인슐레이션. 능선 위 변덕스러운 날씨를 위한 한 벌.',
                    },
                    image: { type: 'image', label: '이미지', value: IMG.colA },
                  },
                  {
                    title: { type: 'text', label: '제목', value: '포레스트 베이스' },
                    season: { type: 'text', label: '시즌/태그', value: 'SPRING — FALL' },
                    description: {
                      type: 'textarea',
                      label: '설명',
                      value: '숲길과 도시를 잇는 데일리 레이어. 부드럽고 빠르게 마릅니다.',
                    },
                    image: { type: 'image', label: '이미지', value: IMG.colB },
                  },
                ],
              },
            },
          },
          {
            id: 'home-stats',
            type: 'stats',
            visible: true,
            data: {
              heading: { type: 'text', label: '제목', value: '숫자로 보는 능선' },
              items: {
                type: 'array',
                label: '지표 항목',
                items: [
                  { value: { type: 'text', label: '수치', value: '9년' }, label: { type: 'text', label: '라벨', value: '필드 테스트' } },
                  { value: { type: 'text', label: '수치', value: '42' }, label: { type: 'text', label: '라벨', value: '검증한 능선 코스' } },
                  { value: { type: 'text', label: '수치', value: '12,800+' }, label: { type: 'text', label: '라벨', value: '무상 수선 건수' } },
                  { value: { type: 'text', label: '수치', value: '78%' }, label: { type: 'text', label: '라벨', value: '재생 소재 비중' } },
                ],
              },
            },
          },
          {
            id: 'home-cta',
            type: 'ctaBanner',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: '함께 걷기' },
              heading: { type: 'text', label: '제목', value: '다음 능선에서 만나요' },
              body: {
                type: 'textarea',
                label: '설명',
                value: '주말 가이드 트레킹과 신제품 소식을 가장 먼저 받아보세요.',
              },
              ctaLabel: { type: 'text', label: '버튼 텍스트', value: '뉴스레터 구독' },
              image: { type: 'image', label: '배경 이미지', value: IMG.ctaTrail },
            },
          },
        ],
      },

      // ───────────────────────── 스토어 ─────────────────────────
      {
        id: 'page-shop',
        slug: 'shop',
        visible: true,
        nav: { visible: true, label: '스토어' },
        seo: {
          title: '스토어 — 능선',
          description: '재킷, 백팩, 신발까지. 능선이 직접 테스트한 아웃도어 장비를 만나보세요.',
        },
        sections: [
          {
            id: 'shop-header',
            type: 'pageHeader',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: 'STORE' },
              title: { type: 'text', label: '제목', value: '스토어' },
              description: {
                type: 'textarea',
                label: '설명',
                value: '오래 걷기 위해 만든 장비들. 모든 제품은 능선 위에서 한 시즌 이상 검증을 거칩니다.',
              },
              image: { type: 'image', label: '배경 이미지', value: IMG.hdrShop },
            },
          },
          {
            id: 'shop-products',
            type: 'productGrid',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: '신상품' },
              heading: { type: 'text', label: '제목', value: '이번 시즌의 장비' },
              items: {
                type: 'array',
                label: '제품 항목',
                items: [
                  {
                    name: { type: 'text', label: '제품명', value: '리지라인 3L 셸' },
                    category: { type: 'text', label: '분류', value: '재킷' },
                    price: { type: 'text', label: '가격', value: '₩389,000' },
                    image: { type: 'image', label: '이미지', value: IMG.prodA },
                  },
                  {
                    name: { type: 'text', label: '제품명', value: '능선 40L 백팩' },
                    category: { type: 'text', label: '분류', value: '백팩' },
                    price: { type: 'text', label: '가격', value: '₩259,000' },
                    image: { type: 'image', label: '이미지', value: IMG.prodB },
                  },
                  {
                    name: { type: 'text', label: '제품명', value: '트레일러너 GTX' },
                    category: { type: 'text', label: '분류', value: '신발' },
                    price: { type: 'text', label: '가격', value: '₩219,000' },
                    image: { type: 'image', label: '이미지', value: IMG.prodC },
                  },
                  {
                    name: { type: 'text', label: '제품명', value: '포레스트 플리스' },
                    category: { type: 'text', label: '분류', value: '미드레이어' },
                    price: { type: 'text', label: '가격', value: '₩149,000' },
                    image: { type: 'image', label: '이미지', value: IMG.prodD },
                  },
                  {
                    name: { type: 'text', label: '제품명', value: '서밋 다운 700' },
                    category: { type: 'text', label: '분류', value: '인슐레이션' },
                    price: { type: 'text', label: '가격', value: '₩329,000' },
                    image: { type: 'image', label: '이미지', value: IMG.prodE },
                  },
                  {
                    name: { type: 'text', label: '제품명', value: '베이스캠프 텐트 2P' },
                    category: { type: 'text', label: '분류', value: '캠핑' },
                    price: { type: 'text', label: '가격', value: '₩459,000' },
                    image: { type: 'image', label: '이미지', value: IMG.prodF },
                  },
                ],
              },
            },
          },
          {
            id: 'shop-cta',
            type: 'ctaBanner',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: '리페어 서비스' },
              heading: { type: 'text', label: '제목', value: '고쳐 쓰면 더 오래갑니다' },
              body: {
                type: 'textarea',
                label: '설명',
                value: '능선 제품은 평생 무상 수선을 약속합니다. 가까운 매장이나 온라인으로 접수하세요.',
              },
              ctaLabel: { type: 'text', label: '버튼 텍스트', value: '수선 접수하기' },
              image: { type: 'image', label: '배경 이미지', value: IMG.ctaShop },
            },
          },
        ],
      },

      // ───────────────────────── 컬렉션 ─────────────────────────
      {
        id: 'page-collections',
        slug: 'collections',
        visible: true,
        nav: { visible: true, label: '컬렉션' },
        seo: {
          title: '컬렉션 — 능선',
          description: '계절과 지형에 맞춘 능선의 라인업. 리지라인부터 포레스트 베이스까지.',
        },
        sections: [
          {
            id: 'col-header',
            type: 'pageHeader',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: 'COLLECTIONS' },
              title: { type: 'text', label: '제목', value: '컬렉션' },
              description: {
                type: 'textarea',
                label: '설명',
                value: '하나의 능선을 위한 한 벌. 지형과 계절에 따라 네 개의 라인으로 나눴습니다.',
              },
              image: { type: 'image', label: '배경 이미지', value: IMG.hdrCollections },
            },
          },
          {
            id: 'col-grid',
            type: 'collectionGrid',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: '2026 라인업' },
              heading: { type: 'text', label: '제목', value: '네 개의 능선' },
              items: {
                type: 'array',
                label: '컬렉션 항목',
                items: [
                  {
                    title: { type: 'text', label: '제목', value: '리지라인' },
                    season: { type: 'text', label: '시즌/태그', value: '고산 · 사계절' },
                    description: { type: 'textarea', label: '설명', value: '바람과 비를 정면으로 맞는 능선 위를 위한 하드셸 라인.' },
                    image: { type: 'image', label: '이미지', value: IMG.colC },
                  },
                  {
                    title: { type: 'text', label: '제목', value: '포레스트 베이스' },
                    season: { type: 'text', label: '시즌/태그', value: '저지대 · 봄가을' },
                    description: { type: 'textarea', label: '설명', value: '숲길과 도시를 잇는 데일리 레이어와 액세서리.' },
                    image: { type: 'image', label: '이미지', value: IMG.colD },
                  },
                  {
                    title: { type: 'text', label: '제목', value: '서밋 인슐레이션' },
                    season: { type: 'text', label: '시즌/태그', value: '동계' },
                    description: { type: 'textarea', label: '설명', value: '책임 있게 채취한 다운과 합성 보온재로 만든 한겨울 라인.' },
                    image: { type: 'image', label: '이미지', value: IMG.colE },
                  },
                  {
                    title: { type: 'text', label: '제목', value: '리버 & 레이크' },
                    season: { type: 'text', label: '시즌/태그', value: '여름 · 물가' },
                    description: { type: 'textarea', label: '설명', value: '계곡과 호숫가를 위한 빠른 건조 소재의 경량 라인.' },
                    image: { type: 'image', label: '이미지', value: IMG.colA },
                  },
                ],
              },
            },
          },
          {
            id: 'col-split',
            type: 'featureSplit',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: '소재 이야기' },
              heading: { type: 'text', label: '제목', value: '산에서 와서 산으로 돌아가도록' },
              body: {
                type: 'textarea',
                label: '본문',
                value:
                  '능선의 원단 78%는 재생 나일론과 폴리에스터입니다. 페트병과 폐어망이 다시 능선을 오릅니다.\n남은 자투리 원단은 리페어 패치와 파우치로 되살립니다.',
              },
              note: { type: 'text', label: '강조 문구', value: 'bluesign® 인증 원단 사용' },
              image: { type: 'image', label: '이미지', value: IMG.collectionsSplit },
              imageSide: { type: 'select', label: '이미지 위치', value: 'left', options: ['left', 'right'] },
            },
          },
        ],
      },

      // ───────────────────────── 액티비티 ─────────────────────────
      {
        id: 'page-activities',
        slug: 'activities',
        visible: true,
        nav: { visible: true, label: '액티비티' },
        seo: {
          title: '액티비티 — 능선',
          description: '능선이 직접 안내하는 가이드 트레킹과 워크숍. 함께 걸으며 장비를 경험하세요.',
        },
        sections: [
          {
            id: 'act-header',
            type: 'pageHeader',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: 'ACTIVITIES' },
              title: { type: 'text', label: '제목', value: '액티비티' },
              description: {
                type: 'textarea',
                label: '설명',
                value: '장비는 걸으면서 완성됩니다. 능선 메이커스가 직접 안내하는 트레킹과 워크숍.',
              },
              image: { type: 'image', label: '배경 이미지', value: IMG.hdrActivities },
            },
          },
          {
            id: 'act-grid',
            type: 'activityGrid',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: '2026 일정' },
              heading: { type: 'text', label: '제목', value: '함께 걷는 프로그램' },
              items: {
                type: 'array',
                label: '액티비티 항목',
                items: [
                  {
                    title: { type: 'text', label: '제목', value: '북한산 능선 데이하이크' },
                    level: { type: 'text', label: '난이도', value: '입문' },
                    meta: { type: 'text', label: '소요/거리', value: '4시간 · 8km' },
                    description: { type: 'textarea', label: '설명', value: '도심에서 가장 가까운 능선. 기본 장비 사용법을 익히며 가볍게 걷습니다.' },
                    image: { type: 'image', label: '이미지', value: IMG.actA },
                  },
                  {
                    title: { type: 'text', label: '제목', value: '설악 공룡능선 종주' },
                    level: { type: 'text', label: '난이도', value: '고급' },
                    meta: { type: 'text', label: '소요/거리', value: '1박2일 · 24km' },
                    description: { type: 'textarea', label: '설명', value: '능선의 진면목을 만나는 종주 코스. 셸과 인슐레이션을 실전에서 테스트합니다.' },
                    image: { type: 'image', label: '이미지', value: IMG.actB },
                  },
                  {
                    title: { type: 'text', label: '제목', value: '숲속 베이스캠프 워크숍' },
                    level: { type: 'text', label: '난이도', value: '입문' },
                    meta: { type: 'text', label: '소요/거리', value: '1박2일 · 캠핑' },
                    description: { type: 'textarea', label: '설명', value: '텐트 설치부터 야영 요리까지. 캠핑이 처음인 분을 위한 1박 프로그램.' },
                    image: { type: 'image', label: '이미지', value: IMG.actC },
                  },
                  {
                    title: { type: 'text', label: '제목', value: '리페어 클래스: 내 장비 고치기' },
                    level: { type: 'text', label: '난이도', value: '워크숍' },
                    meta: { type: 'text', label: '소요/거리', value: '3시간 · 성수 작업실' },
                    description: { type: 'textarea', label: '설명', value: '찢어진 셸을 직접 꿰매 봅니다. 패치와 실은 능선이 제공합니다.' },
                    image: { type: 'image', label: '이미지', value: IMG.actD },
                  },
                ],
              },
            },
          },
          {
            id: 'act-cta',
            type: 'ctaBanner',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: '신청 안내' },
              heading: { type: 'text', label: '제목', value: '자리가 빠르게 마감됩니다' },
              body: { type: 'textarea', label: '설명', value: '각 회차 정원은 12명입니다. 멤버십 회원은 우선 신청과 장비 대여 혜택을 받습니다.' },
              ctaLabel: { type: 'text', label: '버튼 텍스트', value: '일정 신청하기' },
              image: { type: 'image', label: '배경 이미지', value: IMG.ctaActivity },
            },
          },
        ],
      },

      // ───────────────────────── 저널 ─────────────────────────
      {
        id: 'page-journal',
        slug: 'journal',
        visible: true,
        nav: { visible: true, label: '저널' },
        seo: {
          title: '저널 — 능선',
          description: '산의 기록. 능선 메이커스가 전하는 코스 가이드, 장비 이야기, 필드 노트.',
        },
        sections: [
          {
            id: 'jrn-header',
            type: 'pageHeader',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: 'JOURNAL' },
              title: { type: 'text', label: '제목', value: '저널' },
              description: {
                type: 'textarea',
                label: '설명',
                value: '걷는 동안 적어 둔 기록들. 코스 가이드부터 장비를 만드는 뒷이야기까지.',
              },
              image: { type: 'image', label: '배경 이미지', value: IMG.hdrJournal },
            },
          },
          {
            id: 'jrn-grid',
            type: 'journalGrid',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: '최근 글' },
              heading: { type: 'text', label: '제목', value: '산에서 온 이야기' },
              items: {
                type: 'array',
                label: '저널 항목',
                items: [
                  {
                    title: { type: 'text', label: '제목', value: '겨울 능선, 레이어링의 모든 것' },
                    category: { type: 'text', label: '분류', value: '장비 가이드' },
                    date: { type: 'text', label: '날짜', value: '2026.01.18' },
                    excerpt: { type: 'textarea', label: '요약', value: '땀과 추위 사이에서 균형 잡기. 베이스부터 셸까지 세 겹의 원칙.' },
                    image: { type: 'image', label: '커버 이미지', value: IMG.jrnA },
                  },
                  {
                    title: { type: 'text', label: '제목', value: '공룡능선을 처음 걷는 사람에게' },
                    category: { type: 'text', label: '분류', value: '코스' },
                    date: { type: 'text', label: '날짜', value: '2025.11.02' },
                    excerpt: { type: 'textarea', label: '요약', value: '24km의 바위 능선. 물과 발걸음을 어떻게 배분할지에 대한 메모.' },
                    image: { type: 'image', label: '커버 이미지', value: IMG.jrnB },
                  },
                  {
                    title: { type: 'text', label: '제목', value: '재생 나일론은 어떻게 능선이 되나' },
                    category: { type: 'text', label: '분류', value: '메이킹' },
                    date: { type: 'text', label: '날짜', value: '2025.09.20' },
                    excerpt: { type: 'textarea', label: '요약', value: '폐어망이 셸 한 벌이 되기까지. 성수 작업실의 하루를 따라갔습니다.' },
                    image: { type: 'image', label: '커버 이미지', value: IMG.jrnC },
                  },
                  {
                    title: { type: 'text', label: '제목', value: '비 오는 날의 트레일러닝' },
                    category: { type: 'text', label: '분류', value: '필드 노트' },
                    date: { type: 'text', label: '날짜', value: '2025.08.07' },
                    excerpt: { type: 'textarea', label: '요약', value: '젖은 흙과 미끄러운 바위. 우중 러닝에서 신발이 해야 할 일.' },
                    image: { type: 'image', label: '커버 이미지', value: IMG.jrnD },
                  },
                  {
                    title: { type: 'text', label: '제목', value: '능선 위의 작은 부엌' },
                    category: { type: 'text', label: '분류', value: '캠핑' },
                    date: { type: 'text', label: '날짜', value: '2025.06.15' },
                    excerpt: { type: 'textarea', label: '요약', value: '버너 하나로 차리는 하룻밤. 가볍게 따뜻하게 먹는 법.' },
                    image: { type: 'image', label: '커버 이미지', value: IMG.jrnE },
                  },
                  {
                    title: { type: 'text', label: '제목', value: '수선 일지: 9년 된 셸의 부활' },
                    category: { type: 'text', label: '분류', value: '리페어' },
                    date: { type: 'text', label: '날짜', value: '2025.04.29' },
                    excerpt: { type: 'textarea', label: '요약', value: '버릴 뻔한 첫 제품을 되살린 기록. 고쳐 쓴다는 것의 의미.' },
                    image: { type: 'image', label: '커버 이미지', value: IMG.jrnF },
                  },
                ],
              },
            },
          },
        ],
      },

      // ───────────────────────── 브랜드 ─────────────────────────
      {
        id: 'page-about',
        slug: 'about',
        visible: true,
        nav: { visible: true, label: '브랜드' },
        seo: {
          title: '브랜드 — 능선',
          description: '능선이 어떻게 시작됐고, 무엇을 약속하는지. 산을 걷는 사람들이 만드는 브랜드.',
        },
        sections: [
          {
            id: 'about-header',
            type: 'pageHeader',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: 'ABOUT' },
              title: { type: 'text', label: '제목', value: '산을 걷는 사람들이 만듭니다' },
              description: {
                type: 'textarea',
                label: '설명',
                value: '능선은 멀리 있는 브랜드가 아니라, 매주 산에 오르는 작은 팀입니다.',
              },
              image: { type: 'image', label: '배경 이미지', value: IMG.hdrAbout },
            },
          },
          {
            id: 'about-split',
            type: 'featureSplit',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: '시작' },
              heading: { type: 'text', label: '제목', value: '마땅한 장비가 없어서, 직접 만들었습니다' },
              body: {
                type: 'textarea',
                label: '본문',
                value:
                  '2016년, 백두대간을 종주하던 세 사람은 한국의 능선에 맞는 장비가 드물다는 걸 알았습니다.\n수입 장비는 비싸거나 우리 산과 맞지 않았고, 결국 미싱 앞에 앉았습니다. 능선은 그렇게 시작됐습니다.',
              },
              note: { type: 'text', label: '강조 문구', value: '— 창립 멤버 셋, 지금은 열한 명' },
              image: { type: 'image', label: '이미지', value: IMG.aboutSplit },
              imageSide: { type: 'select', label: '이미지 위치', value: 'right', options: ['left', 'right'] },
            },
          },
          {
            id: 'about-pillars',
            type: 'pillars',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: '약속' },
              heading: { type: 'text', label: '제목', value: '능선이 지키는 세 가지' },
              items: {
                type: 'array',
                label: '가치 항목',
                items: [
                  { title: { type: 'text', label: '제목', value: '평생 수선' }, body: { type: 'textarea', label: '설명', value: '능선의 모든 제품은 평생 무상 수선합니다. 오래 입는 것이 가장 친환경적입니다.' } },
                  { title: { type: 'text', label: '제목', value: '투명한 생산' }, body: { type: 'textarea', label: '설명', value: '어디서 누가 만들었는지 모든 제품에 적습니다. 성수 작업실과 파트너 공방을 공개합니다.' } },
                  { title: { type: 'text', label: '제목', value: '산에 돌려주기' }, body: { type: 'textarea', label: '설명', value: '매출의 1%를 국립공원 등산로 복원과 쓰레기 수거 활동에 씁니다.' } },
                ],
              },
            },
          },
          {
            id: 'about-stats',
            type: 'stats',
            visible: true,
            data: {
              heading: { type: 'text', label: '제목', value: '걸어온 길' },
              items: {
                type: 'array',
                label: '지표 항목',
                items: [
                  { value: { type: 'text', label: '수치', value: '2016' }, label: { type: 'text', label: '라벨', value: '능선 시작' } },
                  { value: { type: 'text', label: '수치', value: '11명' }, label: { type: 'text', label: '라벨', value: '메이커스' } },
                  { value: { type: 'text', label: '수치', value: '3곳' }, label: { type: 'text', label: '라벨', value: '오프라인 매장' } },
                  { value: { type: 'text', label: '수치', value: '₩1.2억' }, label: { type: 'text', label: '라벨', value: '누적 산림 기부' } },
                ],
              },
            },
          },
        ],
      },

      // ───────────────────────── 문의 ─────────────────────────
      {
        id: 'page-contact',
        slug: 'contact',
        visible: true,
        nav: { visible: true, label: '문의' },
        seo: {
          title: '문의 — 능선',
          description: '능선 매장과 작업실 안내, 그리고 협업·도매 문의 연락처.',
        },
        sections: [
          {
            id: 'contact-header',
            type: 'pageHeader',
            visible: true,
            data: {
              eyebrow: { type: 'text', label: '상단 라벨', value: 'CONTACT' },
              title: { type: 'text', label: '제목', value: '문의하기' },
              description: {
                type: 'textarea',
                label: '설명',
                value: '제품, 액티비티, 협업 무엇이든 편하게 연락 주세요. 평일 24시간 내에 답합니다.',
              },
              image: { type: 'image', label: '배경 이미지', value: IMG.hdrContact },
            },
          },
          {
            id: 'contact-info',
            type: 'contact',
            visible: true,
            data: {
              heading: { type: 'text', label: '제목', value: '성수 플래그십 & 작업실' },
              intro: {
                type: 'textarea',
                label: '안내 문구',
                value: '능선의 본진. 매장과 리페어 작업실, 액티비티 베이스가 한 건물에 있습니다.',
              },
              hours: {
                type: 'textarea',
                label: '운영 시간',
                value: '화–일 11:00 – 20:00\n월요일 휴무 (공휴일 정상 영업)',
              },
              items: {
                type: 'array',
                label: '연락처 항목',
                items: [
                  { label: { type: 'text', label: '항목명', value: '주소' }, value: { type: 'text', label: '내용', value: '서울 성동구 성수이로 14길 21, 1층' } },
                  { label: { type: 'text', label: '항목명', value: '전화' }, value: { type: 'text', label: '내용', value: '02-1234-5678' } },
                  { label: { type: 'text', label: '항목명', value: '이메일' }, value: { type: 'text', label: '내용', value: 'hello@neungseon.kr' } },
                  { label: { type: 'text', label: '항목명', value: '도매·협업' }, value: { type: 'text', label: '내용', value: 'partners@neungseon.kr' } },
                  { label: { type: 'text', label: '항목명', value: '인스타그램' }, value: { type: 'text', label: '내용', value: '@neungseon.outdoor' } },
                ],
              },
            },
          },
        ],
      },
    ],
  },
  thumbnailPath: 'public/thumbnails/template-outdoor-default.webp',
  version: '1.0.0',
  defaults: {
    name: '능선 (아웃도어)',
    description:
      '산을 잇는 아웃도어 브랜드를 위한 멀티페이지 템플릿 — 홈·스토어·컬렉션·액티비티·저널·브랜드·문의. 어시한 파인 그린 팔레트와 Pretendard.',
    category: 'outdoor',
  },
};

export default preset;
