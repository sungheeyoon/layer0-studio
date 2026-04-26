# Template Authoring Guide — Layer0 Studio

_대상: 새 템플릿 또는 새 테마를 추가하려는 개발자_

이 문서를 처음 읽으면 "뭘 어디부터 손대야 하지?"가 사라지도록 작성했습니다. 코드 위치·JSON 구조·자주 빠지는 함정까지 한 곳에 모았습니다.

---

## 0. 핵심 개념: Theme vs Template

| 용어 | 무엇 | 어디 산다 | 누가 만든다 |
|---|---|---|---|
| **Theme** | React 렌더러 (코드). slot 정의 + section 컴포넌트들 | `src/themes/<key>/` | 개발자 (코드 PR) |
| **Template** | JSON 데이터. 어느 theme을 쓰고 어떤 텍스트/이미지를 채울지 | DB `templates` 테이블 | 어드민 (관리자 UI) 또는 개발자 (시드 SQL) |
| **UserSite** | Template을 복사해서 사용자가 편집한 인스턴스 | DB `user_sites` 테이블 | 일반 사용자 |

**관계**:
1. Theme이 "어떤 모양의 슬롯이 가능한가"를 정의 (`slots.ts`)
2. Template이 "그 슬롯들을 어떻게 채울 것인가"를 JSON으로 기술
3. 사용자가 Template을 고르면 JSON이 deep-copy 되어 자기 UserSite가 됨 (`create-site-from-template.usecase.ts:43`)

> **의사결정 first**: 기존 테마(`corporate`)로 표현 가능하면 → Template만 추가 (코드 변경 0).
> 새 레이아웃·새 섹션 타입이 필요하면 → Theme부터 추가 후 Template 추가.

---

## 1. TemplateJson 구조 한눈에

```ts
// src/domain/entities/template.entity.ts:52
TemplateJson = {
  themeKey: "corporate",          // 어느 theme의 렌더러를 쓸지
  globalStyles: {
    primaryColor: "#1a1a2e",
    secondaryColor: "#e94560",
    fontFamily: "'Inter', sans-serif",
    fontSize: "16px",
    layout: "wide",
  },
  pages: [
    {
      id: "home",                 // page 식별자
      title: "Home",
      slug: "/",
      order: 0,
      sections: [
        {
          id: "hero-001",         // section 식별자 (페이지 내 unique)
          type: "hero",           // ★ theme의 slot.type과 매칭 필수
          order: 1,
          visible: true,          // false면 renderer에서 숨김
          editable: true,         // false면 editor 좌측 Parameters 패널 숨김
          data: {
            title:    { value: "We Build Digital Experiences", type: "text",     label: "Main Title",    editable: true },
            subtitle: { value: "Strategy · Design · Tech",     type: "text",     label: "Subtitle",      editable: true },
            backgroundImage: {
              value: "https://images.unsplash.com/photo-...",
              type: "image",
              label: "Background Image",
              editable: true,
              // assetId?: string  ← 사용자가 업로드한 자산이면 추가됨 (lifecycle 추적)
            },
            ctaText: { value: "Explore", type: "text", label: "CTA Text", editable: true },
            ctaUrl:  { value: "#contact", type: "url", label: "CTA Link", editable: true },
          },
        },
        // ... 다음 section
      ],
    },
  ],
}
```

### 필드 타입 (`TemplateFieldType`, `template.entity.ts:1`)

| `type` | 에디터 입력 UI | 비고 |
|---|---|---|
| `text` | single-line input | |
| `textarea` | multi-line | |
| `url` | url input | 검증은 브라우저 기본만 |
| `color` | color picker + hex input | |
| `number` | number input | 값은 string으로 저장됨 |
| `select` | dropdown | `options: string[]` 필수 |
| `image` | URL 입력 + 파일 업로드 버튼 | 업로드 시 `assetId` 자동 부여 |

> **모든 `value`는 string**입니다. number 타입도 문자열로 저장됨에 주의 (`template.entity.ts:8-11` 참조).

### globalStyles
`src/components/editor/DynamicEditor.tsx:157-162`에서 `--theme-primary` 등 CSS 변수로 root에 주입됩니다. 테마 컴포넌트는 `var(--theme-primary)` 형태로 참조해야 사용자 색상 변경이 즉시 반영됩니다.

---

## 2. 시나리오 A — 기존 테마로 새 템플릿 추가 (코드 변경 없음)

가장 흔한 케이스. 디자인은 `corporate` 그대로 두되 텍스트·이미지·기본 색상만 다른 템플릿을 만들고 싶을 때.

### 단계
1. **관리자로 로그인** (계정에 `app_metadata.role = 'admin'` 필요)
2. `/admin/templates` 접속 → 우측 패널 "Template Editor"
3. 폼 채우기:
   - **Template Title**: 사용자가 카탈로그에서 보는 이름 ("Modern Corporate")
   - **Theme Blueprint**: 드롭다운에서 `corporate` 선택 (현재 등록된 유일한 theme)
   - **Description**: 카탈로그 카드 설명
   - **Slug**: URL 친화 ID. 비워두면 title 기반으로 자동 생성
   - **Category**: 자유 텍스트 ("Business", "Portfolio" 등)
   - **Status**: `draft` / `active` / `archived`
   - **Thumbnail**: 카탈로그 미리보기 이미지 (클릭 → 업로드 → `template-thumbnails` 버킷에 저장됨)
   - **template_schema.json**: 본 가이드 §1의 구조로 작성
4. **Save Draft** (사용자에게 미노출) 또는 **Deploy Template** (`status='active'` 강제)

### JSON 작성 팁
- 출발점: `src/themes/corporate/slots.ts:14` `defaultTemplateJson`을 그대로 복사 → 값만 수정
- 또는 `TemplateEditorPanel`이 자동으로 채워주는 `DEFAULT_JSON` (`TemplateEditorPanel.tsx:13`)
- corporate 테마가 인식하는 slot type만 사용 (다음 섹션 참고)

### corporate 테마의 slot 명세

`src/themes/corporate/slots.ts:6` 기준 등록된 slot:

| `type` | required | 컴포넌트 | 인식하는 `data` 키 |
|---|---|---|---|
| `hero` | ✅ | `HeroSection.tsx` | `title`(또는 `heading`), `subtitle`, `backgroundImage`(또는 `image`), `ctaText`, `ctaUrl` |
| `about` | ❌ | `AboutSection.tsx` | `title`, `subtitle`, `body`, `image`(또는 `backgroundImage`) |
| `features` | ❌ | `FeaturesSection.tsx` | `title`, `subtitle`, **+ 임의 키들** (각각이 feature 카드로 렌더) |
| `contact` | ❌ | `ContactSection.tsx` | `title`, `email`, `phone`, `address` |
| `footer` | ❌ | `FooterSection.tsx` | `companyName`, `copyright` |

> **slot에 등록은 됐지만 `sectionComponentMap`에 없는 type**은 `GenericSection.tsx`로 폴백 렌더됩니다 (`corporate/index.tsx:34`). 즉 미디어가 부족한 임시 섹션을 정의해도 깨지진 않음.

### Features 섹션이 가장 헷갈리는 부분
`FeaturesSection.tsx:10`이 `title`/`subtitle`/`heading` 외 **모든 `data` 키를 feature 카드로 취급**합니다. 그래서:

```json
{
  "type": "features",
  "data": {
    "title":    { "value": "Core Capabilities", "type": "text", "label": "Title", "editable": true },
    "subtitle": { "value": "What we do best",   "type": "text", "label": "Subtitle", "editable": true },
    "strategy":    { "value": "Data-driven", "type": "text", "label": "Strategy",    "editable": true },
    "design":      { "value": "Human-first", "type": "text", "label": "Design",      "editable": true },
    "development": { "value": "Modern arch", "type": "text", "label": "Development", "editable": true }
  }
}
```
→ feature 카드 3개 (strategy, design, development) 자동 생성. 카드 수를 늘리려면 키만 추가하면 됨.

### Contact 섹션은 반대로 키가 고정
`title`, `email`, `phone`, `address` **외 키는 무시**됩니다 (`ContactSection.tsx:8-11`). 추가 정보를 넣고 싶으면 새 컴포넌트가 필요 (시나리오 B).

---

## 3. 시나리오 B — 새 테마 추가 (코드 변경)

`corporate`로 표현 못 하는 레이아웃이 필요할 때 (예: `cafe`, `portfolio`).

### 디렉터리 구조 (`src/themes/<key>/`)

```
src/themes/cafe/
├── index.tsx          ← ThemeRenderer + ThemeModule export
├── slots.ts           ← slot 정의 + defaultTemplateJson
├── cafe.module.css    ← (선택) 스타일
└── sections/
    ├── HeroSection.tsx
    ├── MenuSection.tsx
    └── ...
```

### 4단계

**1. Slot 정의 (`slots.ts`)**

```ts
import { ThemeSlotDefinition } from '../types';
import { TemplateJson } from '@/domain/entities/template.entity';

export const slots: ThemeSlotDefinition[] = [
  { type: 'hero', label: 'Hero', required: true },
  { type: 'menu', label: 'Menu', required: true },
  { type: 'hours', label: 'Opening Hours', required: false },
];

export const defaultTemplateJson: TemplateJson = {
  themeKey: 'cafe',
  globalStyles: { primaryColor: '#3a2618', /* ... */ },
  pages: [
    {
      id: 'home', title: 'Home', slug: '/', order: 0,
      sections: [
        { id: 'hero-001',  type: 'hero',  order: 1, visible: true, editable: true, data: { /* ... */ } },
        { id: 'menu-001',  type: 'menu',  order: 2, visible: true, editable: true, data: { /* ... */ } },
        { id: 'hours-001', type: 'hours', order: 3, visible: true, editable: true, data: { /* ... */ } },
      ],
    },
  ],
};
```

**2. Section 컴포넌트들**

```tsx
// src/themes/cafe/sections/HeroSection.tsx
import { ThemeSectionProps } from '../../types';

export default function HeroSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const title = data['title']?.value || '';
  // ...
  return <section>{title}</section>;
}
```

`ThemeSectionProps` (`src/themes/types.ts:13`)는 `section`, `isSelected`, `onClick`을 받습니다. 인라인 편집 하이라이트는 wrapper(`index.tsx`)가 처리하므로 컴포넌트는 데이터만 신경 쓰면 됩니다.

**3. Theme renderer (`index.tsx`)** — `corporate/index.tsx`를 그대로 복사 후 import만 교체

```tsx
import { ThemeRendererProps, ThemeSectionProps } from '../types';
import { slots, defaultTemplateJson } from './slots';
import HeroSection from './sections/HeroSection';
import MenuSection from './sections/MenuSection';
// ...

const sectionComponentMap: Record<string, ComponentType<ThemeSectionProps>> = {
  hero: HeroSection,
  menu: MenuSection,
  hours: HoursSection,
};

export { slots, defaultTemplateJson };

export default function CafeTheme({ siteJson, selectedSectionId, onSectionClick, activePageId }: ThemeRendererProps) {
  // corporate/index.tsx:22-57 동일 패턴
}
```

**4. Registry 등록 (`src/themes/registry.ts:3`)**

```ts
const themeMap: Record<string, () => Promise<ThemeModule>> = {
  corporate: () => import('./corporate'),
  cafe:      () => import('./cafe'),   // ★ 추가
};
```

이 한 줄이 추가되면 `TemplateEditorPanel`의 Theme Blueprint 드롭다운에 자동 노출됩니다 (`TemplateEditorPanel.tsx:84` `getAvailableThemeKeys()`).

> **dynamic import** 형태를 유지해야 합니다. 정적 import로 바꾸면 모든 테마가 사용자 사이트 번들에 포함됨.

---

## 4. 자주 빠지는 함정 (Gotchas)

### 4.1 `section.type`이 slot 목록에 없으면 안 보임
`corporate/index.tsx:30` — 렌더러는 `slots` 배열을 순회하며 매칭되는 section만 찾습니다. JSON에 멋진 section을 넣어도 slot에 등록 안 했으면 화면에 0픽셀.

### 4.2 같은 page 안에 같은 `type`이 두 개면 첫 것만 렌더
`corporate/index.tsx:31` `sections.find(...)`. 한 페이지에 hero를 두 개 두려면 theme 레벨에서 slot type을 구분(`hero-primary`, `hero-secondary`)하거나 컴포넌트 자체를 둘로 나눠야 합니다.

### 4.3 `section.order`는 사실상 무시
렌더러는 `slots` 배열 순서로 그립니다 — `section.order`는 데이터에는 있지만 정렬에 쓰이지 않습니다. 순서를 바꾸려면 **theme의 `slots` 배열 순서**를 바꾸는 것이 정답.

### 4.4 `id`는 페이지 내에서 unique 해야 함
`update-site-json.usecase.ts:71-75`의 fieldUpdate 분기가 `find(s => s.id === sectionId)`로 첫 매칭만 가져옵니다. 중복 id는 silent하게 잘못된 섹션을 갱신.

### 4.5 모든 `value`는 string
`type: 'number'`도 string으로 저장되고, `type: 'image'`의 `value`는 URL 문자열입니다. 컴포넌트에서 숫자 연산이 필요하면 `Number(field.value)`.

### 4.6 image 필드의 두 가지 패턴
- **외부 URL** (`https://images.unsplash.com/...`): `value`만 있음. 자산 lifecycle 추적 안 됨
- **사용자 업로드**: `value` + `assetId`. `save_site_template_with_lock` RPC가 `asset_usages` 테이블을 갱신해 자동 정리(`SupabaseUserSiteRepoImpl::updateSiteJson:128`)

템플릿 시드는 보통 외부 URL을 쓰면 됩니다. 사용자가 자기 이미지로 바꾸면 `assetId`가 붙음.

### 4.7 JSON 검증은 매우 느슨
`UpdateSiteJsonUseCase.validateJson:90-98`은 `pages` 배열 비어있지 않음 + `globalStyles` 존재 두 가지만 봅니다. section.type이 slot에 없거나 data가 비어있어도 통과 → 화면은 텅 빔. **수동으로 미리보기 확인 필수**.

### 4.8 `themeKey` 누락 → `'corporate'` 폴백
`site/[domain]/page.tsx:82`, `DynamicEditor.tsx:57`. 의도된 동작이지만 새 테마 만들고 JSON에서 themeKey 빠뜨리면 corporate로 그려져서 디버깅 시간 낭비.

### 4.9 다중 페이지 — 데이터는 있지만 공개 사이트 네비게이션 부재
`pages` 배열은 여러 개 정의 가능하나, `corporate/index.tsx`는 `activePageId` (또는 `pages[0]`) **한 장만** 렌더합니다. 공개 사이트(`/site/[domain]`)에서 페이지 전환 메뉴는 현재 없음. 다중 페이지 템플릿을 정말 원하면 theme 안에 `<Nav>` 컴포넌트 추가 필요.

### 4.10 `editable`가 false인데 사용자가 직접 JSON 편집하면?
`section.editable=false`는 에디터 UI에서 Parameters 패널만 숨길 뿐(`DynamicEditor.tsx:253`), 데이터 자체는 변경 가능합니다. 사용자가 절대 못 바꾸게 하려면 server-side에서도 검증 추가 필요 — 현재는 그런 가드 없음.

### 4.11 `templateSnapshot` 컬럼은 저장은 되지만 사용 안 함
`user-site.entity.ts:13` 주석 참고. 향후 "템플릿 리셋" 기능용. 현재 시점엔 무시해도 OK.

---

## 5. 체크리스트

### 새 템플릿 등록 전
- [ ] `themeKey`가 등록된 theme key 중 하나
- [ ] 각 `section.type`이 해당 theme의 `slots` 배열에 존재
- [ ] `pages`, 각 page의 `sections` 비어있지 않음
- [ ] page 내 `section.id` 중복 없음
- [ ] 모든 `data` 필드가 `value` + `type` + `label` 보유
- [ ] image 필드의 URL이 실제 접근 가능 (외부 URL이면 CORS / hotlink 정책 확인)
- [ ] 색상 값은 hex 또는 CSS named color (themeVariables가 그대로 CSS 변수에 들어감)
- [ ] 어드민 UI에서 JSON 입력 후 `Invalid JSON format` 에러 없음
- [ ] Save Draft → `/dashboard/templates`에서 카드로 보이는지
- [ ] 카드 클릭 → 사이트 생성 → editor에서 모든 필드 편집 가능
- [ ] preview/published 상태 둘 다 시각적으로 정상

### 새 테마 등록 전
- [ ] `slots.ts`에 `slots`, `defaultTemplateJson` 둘 다 export
- [ ] `index.tsx`에 `default` (renderer), `slots`, `defaultTemplateJson` 모두 export — `ThemeModule` 인터페이스 (`types.ts:26`) 만족
- [ ] `registry.ts`에 dynamic import 등록
- [ ] 모든 section 컴포넌트가 `data['key']?.value` 패턴 — 누락 키에 대한 안전한 폴백
- [ ] `globalStyles` CSS 변수(`var(--theme-primary)` 등)를 적어도 일부 활용
- [ ] `defaultTemplateJson`으로 admin이 한 번에 시드 가능
- [ ] 새 테마용 minimal Template 1건을 `templates` 테이블에 등록해 카탈로그 노출

---

## 6. 코드 위치 맵

| 무엇을 보고 싶을 때 | 어디 |
|---|---|
| TemplateJson 타입 정의 | `src/domain/entities/template.entity.ts` |
| 슬롯/모듈 인터페이스 | `src/themes/types.ts` |
| 테마 등록 | `src/themes/registry.ts` |
| 참조용 테마 구현 | `src/themes/corporate/` 전체 |
| 어드민이 템플릿 만드는 UI | `src/app/admin/templates/TemplateEditorPanel.tsx` |
| 어드민 server actions (CRUD) | `src/app/admin/templates/actions.ts` |
| 사용자가 템플릿 → 사이트 만드는 흐름 | `src/domain/usecases/user-site/create-site-from-template.usecase.ts` |
| 에디터 (DynamicField 입력 UI 매핑) | `src/components/editor/DynamicEditor.tsx:375-500` |
| 공개 사이트 렌더 | `src/app/site/[domain]/page.tsx` |
| 미리보기 (DB 미반영 상태) | `src/app/preview/[id]/page.tsx` |

---

## 7. 한 줄 요약

> **기존 테마 안 건드릴 수 있나?** → 어드민 UI에서 JSON 채우면 끝.
> **새 슬롯/레이아웃 필요?** → `src/themes/<key>/` 디렉터리 + `registry.ts` 한 줄.
> **어떻게 미리 검증하나?** → 작성 직후 admin Save Draft → 카탈로그 → 사이트 생성 → editor 편집까지 손으로 한 번 흘려보내는 게 가장 빠름. JSON 스키마 검증은 의도적으로 느슨.
