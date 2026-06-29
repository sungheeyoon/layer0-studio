# Template System — Layer0 Studio

_대상: Template / Section component 를 추가·수정하거나 sync · generate 파이프라인을 손볼 개발자_
_최종 갱신: 2026-05-22 (β 모델 기준 전면 개정)_

> 본 문서는 `CONTEXT.md` 의 도메인 어휘 (Template / Category / Section / Preset / Sync / Generate / Design Tokens / Global Styles) 와 `docs/adr/0001`–`0006` 을 기반으로 한다. 두 문서를 먼저 일별하면 본 문서가 자연스럽게 읽힌다.

이 문서 한 장만 읽으면 **(1) 시스템이 어떻게 굴러가는지**, **(2) 새 Template / Section 을 어떻게 추가하는지**, **(3) 어디를 만지면 무엇이 깨지는지** 모두 파악할 수 있도록 만든다. 추가 컨텍스트는 모두 코드에 있다 — 이 문서가 가리키는 위치만 따라가면 된다.

---

## 0. 한 페이지 요약

```
   코드 (개발자가 작성, source of truth)              DB (Sync 가 채움)            사용자
┌──────────────────────────────────┐         ┌────────────────────────┐    ┌────────────────┐
│ src/templates/<category>/<leaf>/ │         │ templates              │    │ user_sites     │
│  ├ tokens.ts                     │         │  ├ slug (PK)           │    │  ├ template_id │
│  │   (designTokens +             │         │  ├ template_json       │    │  ├ site_json   │
│  │    defaultGlobalStyles)       │         │  ├ thumbnail_url       │    │  └ ...         │
│  ├ library/*.tsx                 │ ─sync─▶│  ├ version              │ ─┐                  │
│  │   (.meta.dataSchema)          │         │  └ status (admin only) │  └▶ (사용자 편집)  │
│  ├ template.ts (= the Preset)    │         └────────────────────────┘    └────────────────┘
│  ├ thumbnail.config.ts           │                    │
│  └ index.tsx (Renderer)          │                    ▼
└──────────────────────────────────┘         template_sync_audit (감사 로그)
        ▲
        │
   `pnpm generate:templates`         `pnpm template:capture`         `pnpm template:sync [--apply]`
   (predev/prebuild 자동)             (썸네일)                          (코드 → DB 반영)

   새 Template 저작 = `new-template` Claude Code 스킬 (dev-time)
   (브리프 자연어 → 6 개 파일 작성 → 검증 루프 → sync)
```

- **코드가 진실 — Template** ([ADR-0002](./adr/0002-templates-source-of-truth-is-code.md)): `template_json` / 썸네일 / `version` 은 항상 코드값으로 덮어씀.
- **DB 가 진실 — UserSite**: 사용자 사이트는 sync 가 안 건드림. 모든 저장은 optimistic concurrency RPC 경유 ([ADR-0004](./adr/0004-optimistic-concurrency-via-rpc.md)).
- **Template 간 코드 공유 = 0** ([ADR-0001](./adr/0001-beta-model-template-isolation.md) β 모델): cafe-default 와 cafe-cozy 는 component / token / css 를 *전혀* 공유하지 않음.
- **렌더 순서 = 배열 순서**: `composition: PresetSection[]` 의 배열 순서가 화면 위 → 아래. `section.order` 는 폐기 (Phase 6d / migration 012).

---

## 1. 핵심 개념

| 용어 | 무엇 | 어디 산다 | 누가 만든다 |
|---|---|---|---|
| **Category** | Template 카탈로그 분류 버킷 (cafe / corporate / fitness / interior / legal / medical / outdoor / wedding). **두 가지 표기**: 파일시스템은 **소문자** 디렉터리명(`src/templates/cafe/`), 카탈로그·DB(`templates.category`)·`templateCategories` 값은 **첫 글자 대문자**(`Cafe`) — codegen 이 디렉터리명을 Capitalize 해 만든다. 자세히는 §2.6 | `src/templates/<category>/` 디렉터리 이름 | 개발자 (디렉터리 추가) |
| **Template** | 한 Category 안의 한 디자인. **모든 시각/구성 자산을 자기 디렉터리 안에 자급자족** (ADR-0001) | `src/templates/<category>/<leaf>/` | 개발자 (코드 PR) 또는 Claude Code (`new-template` 스킬) |
| **Section component** | 자기 메타 (`componentKey` / `category` / `label` / `dataSchema`) 를 동봉하는 self-describing React 컴포넌트 | `<templateDir>/library/<Name>.tsx` | 개발자 |
| **Template Library** | `componentKey → Section component` 매핑. 한 Template 의 조립 키트. **다른 Template 와 공유 안 됨** | `<templateDir>/library/index.ts` | 개발자 |
| **Preset** | 코드가 진실인 시드. composition + 데이터 + 토큰 오버라이드 | `<templateDir>/template.ts` | 개발자 / LLM |
| **Template (DB row)** | `templates` 테이블 한 행. Preset 에서 Sync 로 시드되거나 어드민이 manual 로 만듦 | DB | sync CLI / 어드민 UI |
| **UserSite** | Template 을 복사해 사용자가 편집한 인스턴스 | DB `user_sites` | 일반 사용자 |
| **`templateKey`** | `${category}-${leaf}` 형태 합성 슬러그 (예: `cafe-default`). `templateMap` upsert 키 | `_generated.ts` | codegen |

### 1.1 소유권 매트릭스 (Sync 가 무엇을 건드리나) — ADR-0002 의 운영 표현

| 필드 | 코드 (Preset) | DB (어드민) | sync 동작 |
|---|---|---|---|
| `slug` | ✅ (upsert 키, 영원히 변경 금지) | — | 일치 보장 |
| `templateJson` | ✅ | — | 항상 코드값으로 덮어씀 |
| `thumbnailUrl` | ✅ (해시 기반) | — | 해시 다르면 재업로드 |
| `version` | ✅ (semver) | — | 코드값으로 덮어씀 |
| `name` / `description` / `category` | 신규 row 시드값 only | ✅ | DB 값 있으면 보존 |
| `status` | — | ✅ | 절대 안 건드림 — 신규 row 는 `'active'` ([ADR-0012](./adr/0012-template-publishing-pipeline.md): 머지=공개 승인) |

> **핵심 약속**: 운영자가 어드민에서 description 을 바꿔도 다음 sync 가 코드값으로 되돌리지 않는다. `templateJson` / 썸네일 / 버전은 **항상 코드 진실** — 어드민에서 코드 preset row 의 JSON 직접 편집은 차단되어 있음 (manual row 만 편집 허용).

### 1.2 Sync vs Generate (ADR-0002 의 두 진입점)

- **Sync** (운영) — *기존 코드* → DB. `pnpm template:sync`. 매 배포마다.
- **Generate** (창작) — *자연어 brief* → 새 코드 파일들 (그 다음 Sync 가 필요). **`new-template` Claude Code 스킬**(`.claude/skills/new-template/`)이 dev-time 에 수행. 사람/Claude Code 가 6 개 파일을 작성하고 검증 게이트를 돌린다 — 사용자(최종 고객)는 Template 을 만들지 않는다.

둘 다 *코드가 진실* 약속을 지킨다 — Generate 도 DB 에 직접 쓰지 않음 (sync 경유).

> **이력**: 구버전엔 `pnpm template:generate` 라는 LLM API 4-stage CLI 파이프라인(`scripts/generate-template.ts`, Tracer #11–#17)이 있었으나, **Claude Code 스킬로 대체하며 제거됨** (눈먼 한 방 생성 + 사람 인계 대신, Claude Code 가 검증 루프를 자기가 닫고 추가 API 비용 0). 검증/이미지/카테고리 가드 로직(`validate-and-capture.ts`/`image-fetch.ts`/`category-gate.ts`)은 스킬의 도구로 살아남았다.

---

## 2. 데이터 모델

### 2.1 `TemplateJson` (DB 에 저장되는 형태) — `src/domain/entities/template.entity.ts`

```ts
TemplateJson = {
  templateKey: 'cafe-default',          // _generated.ts의 templateMap 키 (= ${category}-${leaf})
  globalStyles: {                       // 사용자 편집 가능한 얇은 layer (ADR-0005)
    primaryColor: '#C96A3A',
    secondaryColor: '#231509',
    fontFamily: "'Playfair Display', sans-serif",
    fontSize: '16px',                   // CSS length
    layout: 'wide',                     // 'wide'|'narrow'|'asymmetric'|'default'|'full'
  },
  pages: [
    {
      id: 'home',
      title: 'Home',
      slug: '/',                        // 페이지 간 unique
      order: 0,
      sections: [
        {
          id: 'hero-001',               // 페이지 내 unique, 사용자 사이트에서도 보존
          type: 'hero',                 // ★ Template Library 의 componentKey 와 매칭
          visible: true,
          editable: true,
          data: {
            title: { type: 'text', label: 'Main Title', value: '...', editable: true },
            image: { type: 'image', label: '배경 이미지', value: 'https://...' },
            // ...
          },
        },
      ],
    },
  ],
}
```

**필드 타입** (`TemplateField`):

| `type` | 입력 UI | 비고 |
|---|---|---|
| `text` / `textarea` / `url` / `color` / `number` | 자명 | 모든 `value` 는 string (number 도) |
| `select` | dropdown | `options: string[]` 필요 |
| `image` | URL + 업로드 | 업로드 시 `assetId` 자동 부여 (ADR-0003 orphan 정리) |
| `array` | repeated items CRUD | `itemSchema` (Recursive SectionDataSchema) 필수 |

### 2.2 `TemplatePreset` (코드 진실) — `src/templates/types.ts`

```ts
interface TemplatePreset {
  slug: string;                          // = templateKey. DB upsert 키. 변경 금지.
  templateKey?: string;                  // composition 사용 시 필수 — slug 와 동일하게 둠
  composition?: PresetSection[];         // ★ 정식 모델
  globalStyles?: Partial<TemplateGlobalStyles>;
  templateJson?: TemplateJson;           // legacy — composition 미사용 시 (사실상 안 씀)
  thumbnailPath: string;                 // 'public/thumbnails/template-<slug>.webp'
  version: string;                       // semver
  defaults: { name: string; description: string; category: string };
}

interface PresetSection {
  id: string;                            // 사용자 사이트에서도 보존되는 안정 ID
  componentKey: string;                  // Template Library 에 존재해야 함
  visible?: boolean;
  data: Record<string, TemplateField>;   // dataSchema 만족 필요
}
```

> `composition` 을 쓰면 `deriveTemplateJsonFromPreset` (`src/lib/template/preset.ts`) 가 sync 시점에 `TemplateJson` 으로 변환해 DB 에 저장한다. **새 Preset 은 항상 `composition`** 을 쓴다.

### 2.3 `SectionComponentMeta` & Template Library entry — `src/templates/types.ts`

```ts
interface SectionComponentMeta {
  componentKey: string;                  // 라이브러리 키 ('hero', 'menu', 'story' …)
  category: string;                      // 'hero' | 'menu' | 'story' | 'footer' | …
  label: string;                         // 어드민 카탈로그용 표시명
  dataSchema: SectionDataSchema;
  previewImage?: string;
}

interface SectionDataSchema {
  [fieldKey: string]: {
    type: TemplateFieldType;
    label: string;
    required?: boolean;
    itemSchema?: SectionDataSchema; // ★ type: 'array' 일 때 필수 (재귀 구조)
    minItems?: number; // (선택)
    maxItems?: number; // (선택)
    options?: string[]; // type: 'select' 일 때
  };
}

type SectionComponent = ComponentType<TemplateSectionProps> & { meta?: SectionComponentMeta };

interface TemplateLibraryEntry {
  Component: SectionComponent;
  meta: SectionComponentMeta;            // 항상 server-resolved
}

interface TemplateLibrary {
  [componentKey: string]: TemplateLibraryEntry;
}

// helper used in every <templateDir>/library/index.ts
function libEntry(Component, metaOverride?): TemplateLibraryEntry;
```

라이브러리는 항상 **`{ Component, meta }` 쌍** 으로 등록한다. **이유**: `'use client'` 컴포넌트는 server-side import 시 client reference 로 wrapping 되어 모듈 본문이 서버에서 실행되지 않는다 → `Component.meta = {...}` side-effect 가 server 에서 안 보인다. sync / validate 는 서버에서 돌기 때문에 meta 를 server-resolved 위치에 따로 두어야 한다 (자세한 함정은 §10.12).

운영 패턴:
- **server 컴포넌트** (no `'use client'`): `.tsx` 안에서 `Component.meta = {...}` 으로 부착. `libEntry(Component)` 만 호출 — 헬퍼가 `Component.meta` 를 자동으로 가져옴.
- **client 컴포넌트** (`'use client'`): meta 를 sibling `<Component>.meta.ts` 에 named export 로 정의 → `libEntry(Component, componentMeta)` 로 명시 전달.

### 2.4 `TemplateModule` (`src/templates/types.ts`)

```ts
interface TemplateModule {
  default: ComponentType<TemplateRendererProps>;  // 페이지 레벨 렌더러
  defaultTemplateJson: TemplateJson;              // 시각 토큰 시드 (composition 은 [] 비워둠)
  library: TemplateLibrary;
}
```

각 Template 의 `index.tsx` 가 이 셋을 export 해야 함.

### 2.5 `DesignTokens` — 풍부한 토큰 (ADR-0005)

`tokens.ts` 는 **두 layer** 로 구성:

```ts
// src/templates/cafe/default/tokens.ts
export const defaultGlobalStyles: TemplateGlobalStyles = { ... };  // 얇은 layer (사용자 편집)
export const designTokens: DesignTokens = { ... };                 // 풍부한 layer (코드 고정)
```

**얇은 layer (`TemplateGlobalStyles`)** — 에디터에서 사용자가 편집 가능한 5 개 필드:
`primaryColor`, `secondaryColor`, `fontFamily`, `fontSize`, `layout`.

**풍부한 layer (`DesignTokens`)** — 코드 고정. 6 개 차원 (`colors`, `fonts`, `spacing`, `radius`, `shadows`, `typography`). 각 차원 entry 는 `--{dimension-singular}-{key}` CSS custom property 가 됨 (`colors.primary` → `--color-primary`).

**Overlay 규칙** — `src/lib/template/design-tokens.ts` 의 `OVERLAY_MAP` 이 얇은 layer 를 풍부한 layer 위에 덮음:

| 얇은 layer 필드 | 덮어쓰는 CSS var |
|---|---|
| `primaryColor` | `--color-primary` |
| `secondaryColor` | `--color-secondary` |
| `fontFamily` | `--font-base` |
| `fontSize` | `--font-size` |

→ 사용자가 `primaryColor` 만 바꿔도 사이트 전역의 `var(--color-primary)` 참조가 즉시 propagate.

**적용 방법**: Template `index.tsx` 에서 site 렌더러(Single → `RenderSingleSite`, Multi → `RenderMultiSite`)에 `designTokens` prop 전달:

```tsx
<RenderSingleSite
  {...props}
  library={library}
  className={styles.themeRoot}
  designTokens={designTokens}   // ← root div 에 var 들이 inline style 로 주입됨
/>
```

**컴포넌트 사용**: 인라인 hex 금지 (§6.3 ESLint 룰). `var(--color-primary)`, `var(--font-base)` 등 참조만 허용.

**현재 적용 상태** (ADR-0005): **cafe-default** 만 풍부 토큰 패턴 적용 완료 (#9 demo). 나머지 8 개 Template 는 각자 `.module.css` 에 기존 `--{prefix}-{name}` 패턴 유지 — **의도적인 점진 전환**. 각 Template 가 다른 이유로 손볼 때 자연스럽게 새 패턴으로 옮긴다. 신규 Template (스킬 저작) 은 무조건 rich 패턴 (마이그 부담 줄이기 위해).

### 2.6 Category 표기 규칙 — 소문자 디렉터리 / 대문자 카탈로그

Category 는 **한 단어**이고 두 가지 표기로 산다:

| 쓰임 | 표기 | 예 | 어디 |
|---|---|---|---|
| 파일시스템 디렉터리 | **소문자** | `src/templates/cafe/` | 디스크 |
| `templateKey` 접두 | **소문자** | `cafe-default` | `_generated.ts`, DB slug |
| 카탈로그·DB `category` 값 | **첫 글자 대문자** | `Cafe` | `templateCategories`, `templates.category` |

- **단일 규칙**: `templateCategories` (codegen 산출) 가 디렉터리명을 Capitalize 해 담는다 (`generate-templates.mjs` 의 `toCategory()`). 이게 카탈로그/DB 의 정본 형태다.
- `categoryLabel()` (`src/lib/i18n/category-label.ts`) 는 i18n 조회 전에 `toLowerCase()` 하므로 대문자여도 라벨이 해석된다. **i18n `categoryLabels` 맵 키는 소문자** (`cafe`,`outdoor`,…) — 새 category 디렉터리를 추가하면 ko + en 양쪽에 소문자 키를 추가해야 카탈로그에 raw slug 가 안 뜬다.
- `syncTemplates` 는 UPDATE 시 DB `category` 를 이 대문자 값으로 reconcile 한다 (코드가 진실, ADR-0002). 과거엔 INSERT 때만 넣어서 `food`/`Business`/`Event` 같은 stale slug 가 남았고, **migration 020** 이 일회성 정규화(`initcap(split_part(slug,'-','1'))`)를 했다.
- **⚠️ 케이스 민감 함정**: `templateCategories` 값(`Cafe`)을 **파일시스템 경로**에 그대로 쓰면 안 된다 — 디렉터리는 소문자다. macOS(APFS, 케이스 무시)에선 통과하지만 **Linux/CI(케이스 민감)에서 깨진다**. FS 경로를 만들 땐 `category.toLowerCase()` 할 것 (`scripts/verify-template*.ts` 가 이 패턴). §10 함정 참고.

### 2.7 캔버스 크기 — 뷰포트 / 히어로 / 썸네일 / 에디터 (한 줄 정렬)

Template 을 **어느 크기 기준으로 디자인하고, 그게 썸네일·에디터에 어떻게 이어지는지**의 단일 기준. 새 Template 작성·썸네일 재캡처·에디터 동작을 나중에 볼 때 여기를 본다.

| 무엇 | 크기 | 어디서 강제/설정 |
|---|---|---|
| **정본 데스크톱 뷰포트(디자인 기준)** | **1600 × 900** | 모든 `thumbnail.config.ts` 의 `viewport` (캡처가 곧 디자인 검증 화면) |
| **히어로 = 첫 섹션만** | **첫 화면을 꽉 채우는 풀 뷰포트 높이** | 컴포넌트 클래스 — `min-h-[100dvh]`(다수) / `min-h-[calc(100vh-4rem)]`(nav 4rem 포함, outdoor). **첫 섹션(히어로)에만 적용**. 그 아래 섹션들은 콘텐츠에 맞는 **자유 높이** |
| **썸네일 출력** | 800 × 450 (16:9, `resize`) | `thumbnail.config.ts` 의 `resize` |
| **에디터 라이브 프리뷰** | **1440 논리 폭** (fill-to-panel, 높이 적응형) | `EditorPreviewFrame.tsx` 의 `VIEWPORT_WIDTH` |

**왜 이렇게 이어지나 (체인):**
1. 템플릿은 **1600×900 데스크톱**을 기준으로 디자인한다 → 그 화면이 그대로 `thumbnail.config.ts` 의 캡처 뷰포트라 **썸네일 = 실제 디자인 화면**.
2. **첫 섹션(히어로)만 풀 뷰포트 높이**(`100dvh` / `100vh-4rem`)라, 900 높이 화면에선 약 **836px**(nav 64px 제외)로 첫 화면을 꽉 채운다 → 썸네일(hero 캡처)도 히어로가 꽉 찬 모습. **그 아래 섹션들은 자유 높이**(콘텐츠대로) — 풀스크린 규칙은 오직 첫 화면 인상용이다.
3. **에디터 프리뷰**는 iframe 을 **1440 데스크톱 논리 폭**으로 렌더한 뒤 패널 폭에 맞춰 `transform: scale()` (균등, 왜곡 없음). 높이는 패널에 맞춰 적응형이라 풀 뷰포트 히어로가 에디터에서도 풀스크린으로 보인다 ([editor-iframe-preview](#) — `EditorPreviewFrame`).

**1600(썸네일) vs 1440(에디터) 차이는 무시해도 된다**: 템플릿에 `2xl:`(≥1536px) 브레이크포인트가 **0건**이고 콘텐츠는 `max-w-7xl`(1280) 중앙 정렬이라, 1440·1600 둘 다 **동일한 데스크톱 레이아웃**(좌우 여백만 다름)을 렌더한다. 둘 다 "데스크톱"으로 일관된다. (정렬을 더 칼같이 하고 싶으면 `EditorPreviewFrame` 의 `VIEWPORT_WIDTH` 를 1600 으로 올리면 되지만, 콘텐츠 여백이 늘어 미리보기가 약간 작아 보인다.)

> 새 Template 저작 시: **1600×900 기준으로 디자인**, **첫 섹션(히어로)만 `min-h-[100dvh]`(또는 `calc(100vh-4rem)`)로 풀스크린** — 나머지 섹션은 자유 높이, 썸네일은 기본 `thumbnail.config.ts`(1600×900 캡처 → 800×450 출력) 그대로 두면 에디터·카탈로그·실제 사이트가 모두 일관된다.

---

## 3. Template 디렉터리 구조 (β 모델, ADR-0001)

10 개 Template (cafe-{cozy,default,modern}, corporate-default, fitness-default, interior-default, legal-default, medical-default, outdoor-default, wedding-default) 모두 같은 골격:

```
src/templates/cafe/default/
├── tokens.ts                       # defaultGlobalStyles + designTokens (rich, cafe-default 만)
├── library/
│   ├── index.ts                    # cafeDefaultLibrary: { componentKey: { Component, meta } }
│   ├── HeroImage.tsx               # 서버 컴포넌트: 본문 끝에 Component.meta = {...}
│   ├── Marquee.tsx
│   ├── MenuBento.tsx
│   ├── Story.tsx
│   ├── Space.tsx
│   ├── Testimonials.tsx
│   ├── Visit.tsx
│   ├── Footer.tsx
│   ├── Navigation.tsx              # ★ 'use client' 컴포넌트
│   └── Navigation.meta.ts          #    server-resolved meta (named export)
├── sections/                       # 보조 utility 만 (아이콘, title-parts) — Section component 아님
├── thumbnail.config.ts             # Playwright 캡처 설정
├── cafe.module.css                 # 이 Template 전용 CSS (다른 Template 와 공유 안 됨)
├── template.ts                     # ← 이 디렉터리의 Preset (= Source of Truth)
└── index.tsx                       # TemplateRenderer (RenderSingleSite/RenderMultiSite 위임), library/defaultTemplateJson export
```

### 3.1 β 모델의 핵심 약속 (ADR-0001)

- **Template 간 component / token / css 공유 = 0**. cafe-default 의 `HeroImage.tsx` 와 cafe-cozy 의 `HeroImage.tsx` 는 서로 다른 파일 (코드가 같아 보여도 별개).
- **DRY 위배는 의도된 설계**. cross-Template 추출 제안은 ADR-0001 을 근거로 거절.
- **`sections/` 폴더**는 더 이상 Section component 를 두지 않는다. 공통 아이콘 / 유틸만 사는 폴더로 축소됨. 새 Section 은 무조건 `library/`.

### 3.2 자동 등록

`src/templates/_generated.ts` 는 `scripts/generate-templates.mjs` 가 디렉터리 스캔으로 자동 생성. **수정 금지 (커밋은 함)**. `predev` / `prebuild` 훅으로 자동 갱신됨.

해당 파일은 4 개의 맵을 export:
- `templateMap` — `templateKey → () => Promise<TemplateModule>`
- `presetMap` — `templateKey → () => Promise<{ default: TemplatePreset }>`
- `presetSlugs` — `templateKey[]`
- `templateCategories` — `templateKey → category`

`loadTemplate(templateKey)` 헬퍼 (`src/templates/registry.ts`) 가 `templateMap` 을 wrapping. **Backward-compat shim**: bare legacy key (예: `'cafe'`) 가 들어오면 `${key}-default` 로 fallback (migration 015–017 이 user_sites 의 templateKey 를 슬러그 형태로 정렬한 뒤로는 사실상 잔존 보호막).

> **Single / Multi Site Type (구현 완료, ADR-0007):** `TemplateJson` 은 `mode` 판별 구조적 유니온이다 — Single 은 `sections[]`(앵커 nav), Multi 는 `shared:{header,footer}` + `pages[]`(페이지 링크 nav). 렌더는 `renderSingleSite.tsx` / `renderMultiSite.tsx`, Multi 공개 경로는 `/site/[domain]/[[...slug]]`. 데이터 모델·nav projection·2축(`visible`/`nav.visible`)·PageSeo·asset slot_key 의 정식 설명은 [ADR-0007](./adr/0007-single-multi-site-type-structural-union.md) 과 `CONTEXT.md` 글로서리를 본다 (이 문서의 예시는 대부분 Single 기준으로 쓰여 있다).

### 3.3 미래 구조 방향 (footnote, ADR-0001)

현재 `library/` 는 *과도기 아티팩트*. multi-page 는 **데이터 모델 차원**(ADR-0007 유니온)으로 이미 출시됐지만, 디렉터리를 `<templateDir>/pages/<page>/sections/<Section>.tsx` 로 옮기는 **코드 구조 재편은 아직 미결**(ADR-0001 의 future direction) — `renderMultiSite` 는 평탄한 `library/` 를 그대로 쓴다. 그래서 글로서리 (CONTEXT.md) 에 "Library" 를 도메인 용어로 굳히지 않음.

---

## 4. 렌더링 파이프라인

```
사이트 요청 (Live 또는 Preview)
    │
    ▼
loadTemplate(templateKey)             ← src/templates/registry.ts (+ legacy shim)
    │
    ▼
TemplateRenderer (templates/<cat>/<leaf>/index.tsx)
    │  designTokens prop 으로 root 에 CSS var 주입 (ADR-0005)
    ▼
RenderSingleSite / RenderMultiSite    ← src/templates/renderSingleSite.tsx · renderMultiSite.tsx
    │  Single: siteJson.sections        Multi: shared.header → active page.sections → shared.footer
    │  sections.map((section) => library[section.type]); nav = deriveNav(source, hrefOf)
    │
    ▼
<Component section={section} />        // SectionComponent (nav/footer 엔 navItems 주입)
```

핵심 규약:

1. **section.type ↔ componentKey 1:1 매칭**. 라이브러리에 없으면 console.warn + skip → 화면 빈칸.
2. **렌더 순서 = sections 배열 순서**. `order` 필드는 schema 에서 제거됨 (migration 012).
3. **`section.visible === false` 면 skip**.
4. **클릭 콜백**: `onSectionClick` 이 있으면 wrapper `<div>` 가 stopPropagation + 호출 (어드민 / 에디터 인라인 선택용).

---

## 5. Preset → DB Sync 파이프라인 (ADR-0002)

`pnpm template:sync` ⇒ `scripts/sync-templates.ts` ⇒ `src/lib/template/sync.ts:syncTemplates`

### 5.1 단계별 흐름

```
1. _generated.ts 의 presetMap 순회
2. preset 1개에 대해:
   ├─ templateKey 결정 (composition? preset.templateKey : preset.templateJson?.templateKey)
   ├─ templateMap[templateKey]() 로드 → TemplateModule (library 포함)
   ├─ deriveTemplateJsonFromPreset(preset, templateModule)  ← src/lib/template/preset.ts
   │     composition[] → pages[0].sections[] (id/type/visible/data)
   ├─ validateTemplateJson(json, { availableTemplateKeys, templateLibrary: templateModule.library })
   │     ↳ 에러 1개라도 있으면 SKIP (해당 preset 만)
   ├─ thumbnail 처리:
   │     md5 해시 기반 파일명 (template-<slug>-<hash>.webp)
   │     이미 storage 에 있으면 재사용, 아니면 업로드
   ├─ existing slug 비교:
   │     없음 → INSERT (status='active' — ADR-0012)
   │     있음 → JSON.stringify 비교, 변경 있으면 UPDATE
   │           (template_json / version / thumbnail_url / updated_at)
3. 변경 있고 dryRun=false 면 template_sync_audit 로그
```

### 5.2 dry-run vs apply

```bash
pnpm template:sync                  # default = dry-run, diff만 출력
pnpm template:sync --apply          # 5초 카운트다운 후 실제 DB 반영
pnpm template:sync --apply --yes    # 카운트다운 우회 (CI)
pnpm template:sync cafe             # 슬러그 또는 prefix 로 필터
```

`--apply` 시 validate 에러가 있으면 전체 중단. CLI 는 service role key 로 무조건 가능 → 운영 서버에서 실수 방지를 위해 필수로 dry-run 먼저 보고 적용.

> **등록은 이제 자동이다** ([ADR-0012](./adr/0012-template-publishing-pipeline.md)). 프로덕션 배포가 성공하면 `deployment_status` 워크플로(`.github/workflows/register-templates.yml`)가 보호된 엔드포인트 `POST /api/admin/sync-templates`(Bearer `TEMPLATE_SYNC_SECRET`)를 호출해 `syncTemplates --apply` 를 돌린다 — 신규 row 는 `active`, 썸네일은 배포된 public URL 에서 fetch. 어드민 UI 의 수동 sync 는 **비상용(Force re-sync)** 으로 축소됐고, `canPublishTemplates` 는 이제 **라이브 status 토글**(공개/내림)을 게이트한다(ADR-0012 §5, ADR-0006 스코프 재정의).

### 5.3 감사 로그

`template_sync_audit` 테이블 — `docs/migrations/011_template_sync_audit.sql`:

| 컬럼 | 의미 |
|---|---|
| `performed_by` | user.id (CLI 일 때 'CLI') |
| `affected_slugs` | 실제 변경된 slug 배열 |
| `dry_run` | 항상 false (dry-run 은 기록 안 함) |
| `summary` | { creates, updates, errors, details } JSONB |

---

## 6. Validate 규칙 카탈로그

`src/lib/template/validate.ts` — `validateTemplateJson(json, options)`. **Site-content 유효성의 단일 소스.** sync 전, `pnpm test`, 어드민 Save, 그리고 **에디터 저장 경로**에서 모두 호출 (#56). 도메인 유스케이스는 `SiteContentValidator` 포트(`src/domain/usecases/ports/site-content-validator.port.ts`)를 통해 호출하고, `LibraryAwareSiteContentValidator`(`src/lib/template/site-content-validator.ts`) 어댑터가 `templateKey` 로 라이브러리를 로드해 이 함수에 위임한다. errors 가 하나라도 있으면 `TemplateError('INVALID_TEMPLATE_JSON')` 로 저장 거부.

옵션:

```ts
{
  availableTemplateKeys?: string[];   // 있으면 templateKey 검증
  templateLibrary?: TemplateLibrary;   // 있으면 dataSchema 깊은 검증
}
```

### 6.1 Errors (블로킹)

| Code | 조건 |
|---|---|
| `UNKNOWN_TEMPLATE_KEY` | `templateKey` 가 `availableTemplateKeys` 에 없음 |
| `PAGES_EMPTY` | `pages` 가 없거나 빈 배열 |
| `MISSING_GLOBAL_STYLES` | `globalStyles` 누락 |
| `INVALID_COLOR` | primary/secondary 누락 |
| `INVALID_FONT_SIZE` | CSS length 패턴 불일치 |
| `UNKNOWN_LAYOUT` | 화이트리스트 외 (`wide`/`narrow`/`asymmetric`/`default`/`full`) |
| `DUPLICATE_PAGE_SLUG` | page.slug 중복 |
| `DUPLICATE_SECTION_ID` | 페이지 내 section.id 중복 |
| `UNKNOWN_COMPONENT_KEY` | `templateLibrary` 옵션 + `section.type` 이 라이브러리에 없음 |
| `MISSING_REQUIRED_FIELD` | `dataSchema[field].required === true` 인데 누락 |
| `FIELD_TYPE_MISMATCH` | `field.type !== schema[field].type` |
| `MISSING_FIELD_TYPE` / `MISSING_FIELD_LABEL` / `MISSING_FIELD_VALUE` | 필수 메타 누락 |
| `NON_STRING_FIELD_VALUE` | `value` 가 string 아님 (array 타입 제외) |
| `INVALID_COLOR_FIELD` | `type: 'color'` 필드 `value` 가 hex 아님 (블로킹 — globalStyles 의 `NON_HEX_COLOR` warning 과 달리 에러) |
| `NON_ARRAY_FIELD_VALUE` | `type: 'array'` 인데 `items` 가 배열이 아니거나 누락 |
| `MISSING_ITEM_SCHEMA` | schema 에서 `type: 'array'` 인데 `itemSchema` 가 정의 안 됨 |
| `ARRAY_ITEMS_BELOW_MIN` / `ARRAY_ITEMS_ABOVE_MAX` | minItems/maxItems 제약 위반 |

### 6.2 Warnings (통과하지만 stderr)

| Code | 조건 |
|---|---|
| `NON_HEX_COLOR` | primary/secondary 가 hex 가 아님 (CSS named color 는 통과) |
| `UNKNOWN_DATA_FIELD` | `data` 에 schema 에 없는 키 (오타·deprecated 감지) |
| `INSECURE_URL` | `image` / `url` 필드가 `http://` (mixed-content 위험) |

### 6.3 Token enforcement (인라인 색·폰트 차단)

Section component 는 모든 시각 토큰을 `var(--*)` (또는 같은 CSS 변수로 풀리는 Tailwind arbitrary value) 로 참조해야 한다 — 이게 사용자의 `globalStyles` 오버라이드가 사이트 전역으로 전파되는 유일한 통로이기 때문 (ADR-0005). 인라인 hex/rgb/hsl 색 리터럴이나 `font-family` 문자열은 그 메커니즘을 우회한다.

**두 레이어로 강제**:

1. **Validate** — `validateTemplateFiles(templateDir)` (`src/lib/template/inline-tokens.ts`): `pnpm template:verify` 게이트(`validate-and-capture.ts`)가 `library/*.tsx` 파일 텍스트를 스캔. 위반 시 `ValidationIssue[]` 반환.
2. **ESLint** — `local/no-inline-design-tokens` (`eslint-rules/no-inline-design-tokens.mjs`): `src/templates/**/*.{ts,tsx}` 대상으로 `pnpm lint` 에서 동작. AST 기반 (string Literal / TemplateElement / `fontFamily` JSX prop).

| Code | 조건 |
|---|---|
| `INLINE_COLOR_LITERAL` | `#rgb` / `#rrggbb` / `#rrggbbaa` 또는 `rgb(` / `rgba(` / `hsl(` / `hsla(` 호출 |
| `INLINE_FONT_LITERAL`  | `font-family: '...'` (CSS) 또는 `{ fontFamily: '...' }` (JSX inline-style) |

**Whitelist**:
- 파일: `tokens.ts`, `template.ts` (둘 다 색·폰트 정의 source-of-truth)
- 값: `transparent`, `inherit`, `currentColor`, `none`, `initial`, `unset`, `revert` (CSS 키워드 — 디자인 토큰이 아님)

**Severity**: `'error'`. #22 에서 기존 9 개 Template 의 누적 위반 ~412 건을 모두 정리한 뒤 승급됨. 신규 회귀는 `pnpm lint` 에서 즉시 차단.

**규칙 추가 시**: `src/lib/template/inline-tokens.ts` 의 regex / whitelist 와 `eslint-rules/no-inline-design-tokens.mjs` 의 동일 항목을 함께 갱신할 것 (의도적 중복).

---

## 7. CLI / 명령 한 장 요약

```bash
# 코드 생성
pnpm generate:templates           # _generated.ts 재생성 (predev/prebuild 에 자동 연결)

# Template 저작 (new-template 스킬이 검증 루프에서 사용)
pnpm template:verify <templateKey>                # 통합 게이트(tsc/eslint/validate/schema↔jsx/capture)
pnpm template:verify <templateKey> --skip-capture # 느린 썸네일 단계만 생략
pnpm template:image <templateKey> "<query>" [wide|square|portrait]  # 스톡 이미지 fetch+호스팅 → URL 출력

# 썸네일 캡처 (Playwright + sharp + pixelmatch)
pnpm template:capture             # 모든 Template 일괄
pnpm template:capture <slug>      # 특정 Template (templateKey)
pnpm template:capture --check     # CI 용 — 차이 있으면 exit 1, 파일은 안 씀

# DB 동기화 (ADR-0002)
pnpm template:sync                # default = dry-run, diff만
pnpm template:sync --apply        # 5초 카운트다운 후 실제 적용
pnpm template:sync --apply --yes  # 카운트다운 우회 (CI)
pnpm template:sync <slug-or-prefix>

# Template 디렉터리 스캐폴드 (수동 빈 골격)
pnpm template:scaffold

# 검증
pnpm test                         # vitest — validate 규칙 + sync 단위 테스트
pnpm tsc --noEmit                 # 타입 체크 (CI 에서 클린 유지)
```

### 7.1 Template 저작 흐름 (`new-template` 스킬)

새 Template 은 **`new-template` Claude Code 스킬**(`.claude/skills/new-template/`)로 만든다. 명령어를 외우지 않고 자연어로 의뢰하면("아웃도어 브랜드 멀티페이지로 만들어줘") 스킬이 발동해 아래를 수행:

```
brief(자연어) ──▶ Site Type 결정 (Single=composition / Multi=templateJson 유니온 직접)
             ──▶ 디렉터리: 가까운 Template 복제 또는 template:scaffold
             ──▶ 6 개 파일 작성 (rich 토큰; gotchas-checklist 준수)
             ──▶ 이미지: pnpm template:image <key> "<query>"
             ──▶ 검증 루프(아래) — 깨지면 self-fix 후 재실행
             ──▶ /preview/preset/<key> 육안 → pnpm template:sync (dry-run) → PR
```

생성 결과: `src/templates/<category>/<leaf>/` 안에 6 개 파일 (`tokens.ts`, `template.ts`, `thumbnail.config.ts`, `index.tsx`, `library/index.ts`, `library/<Section>.tsx`). `pnpm generate:templates` 로 `_generated.ts` 갱신 → `/preview/preset/<templateKey>` 미리보기.

**검증 게이트 — `pnpm template:verify <key>`** (`scripts/lib/validate-and-capture.ts`): 6 단계. (1) `tsc --noEmit` — 글로벌 실행 후 template dir 관련 에러만 필터; (2) `eslint <templateRoot>` — §6.3 토큰 룰 포함; (3) `validateTemplateJson` — preset → templateJson 유도 후 검증; (4) `validateTemplateFiles` — §6.3 file-level 인라인 색·폰트 스캔; (5) **dataSchema ↔ JSX 일관성** — 모든 declared 필드가 `getFieldValue` 참조됨 + 모든 참조 필드가 declared 됨 cross-check (브레이스 밸런스 파서); (6) `pnpm template:capture <templateKey>` — Playwright Chromium 썸네일 webp. (1)–(5) 중 하나라도 실패하면 halt (캡처는 soft-fail). 스킬은 깨진 단계를 고치고 green 까지 재실행한다.
> `template:verify` 는 템플릿 모듈을 동적 import 하므로 첫 줄에서 `./lib/register-css-stub` 를 로드해 `.module.css` import 가 tsx 에서 깨지지 않게 한다 (sync 와 동일).

**New-category 가드**: 새 category slug 은 `^[a-z][a-z0-9-]{0,39}$` 를 만족해야 하고, 기존 디렉터리에 없는 새 top-level category 는 구조 변경이므로 사람의 명시적 승인 후 만든다 (`scripts/lib/category-gate.ts`, 정확 일치만 — `cafe-studio` 는 `cafe` 와 별개).

### 7.2 이미지 호스팅 헬퍼 (Issue #15)

`scripts/lib/image-fetch.ts` 의 `fetchAndHostImage({ query, templateKey, aspectRatio?, role? })` — `dataSchema` 의 `type: 'image'` 필드를 채울 때 사용. **`pnpm template:image <templateKey> "<query>" [aspect]`** CLI 래퍼(`scripts/host-image.ts`)로 호출하면 query 만 정하고 fetch + host + URL 출력을 헬퍼가 처리한다.

**동작 순서**:
1. Unsplash + Pexels 둘 다 query (인증된 env 키 있는 만큼). 결과를 alternate-interleave 로 합쳐 pool 구성.
2. **Pool offset random** — top 10 중 인덱스 1~9 에서 랜덤 (index 0 회피, AI 가 모두 "1번 사진" 박는 데자뷔 방지).
3. Unsplash 인 경우 download_location 엔드포인트 hit (라이선스 ToS 준수, 사용 트래킹).
4. 이미지 다운로드 → Supabase Storage `template_assets/` (migration 014, #7) 업로드.
5. 다운로드 / 업로드 실패 시 1 회 재시도 → 그래도 실패하면 `picsum.photos/seed/<seed>/<W>/<H>` placeholder URL fallback.

**Aspect ratio**: `wide` (1600×900, hero 용), `square` (1000×1000, gallery), `portrait` (900×1200, menu-item) — provider orientation 파라미터와 fallback 치수 결정.

**환경 변수**:
- `UNSPLASH_ACCESS_KEY` (없으면 Unsplash 스킵)
- `PEXELS_API_KEY` (없으면 Pexels 스킵)
- 둘 다 없으면 항상 picsum fallback. 둘 다 무료 tier (Unsplash 50 req/hr demo, Pexels 200 req/hr).

**테스트 가능 형태로 설계** — `fetchImpl`, `random`, `supabase` 를 inject 가능.

**호출 경로** — `pnpm template:image` (`scripts/host-image.ts`) 래퍼로 노출. `new-template` 스킬이 `type: 'image'` 필드를 채울 때 이 명령으로 호출한다.

---

## 8. Admin UI

`/admin/templates` — `app_metadata.role === 'admin'` 필요. 라이브 status 토글(공개/내림)은 별도 `canPublishTemplates === true` 필요 (ADR-0006/[ADR-0012](./adr/0012-template-publishing-pipeline.md) §5).

| 영역 | 동작 |
|---|---|
| 카탈로그 그리드 | preset row 는 `code` 배지·read-only, manual row 는 `manual` 배지·편집 가능 |
| `Force re-sync` 버튼 | **비상용** (등록은 배포 후 자동, ADR-0012). dry-run Preview 는 모두 가능, 실제 apply 는 `canPublishTemplates` 필요 |
| Composition 다이어그램 | `CompositionPreview.tsx` — preset row 클릭 시 componentKey/category 시각화 |
| `+ New Template` | manual one-off 시드 (시즌 프로모션 등) — JSON textarea 직접 편집 가능 |
| Status 토글 (Activate/Archive/Revert) | `draft` ↔ `active` ↔ `archived` — `canPublishTemplates` 필요(공개=active·보관=archived; draft 저장은 누구나). sync 는 안 건드림 |

`syncTemplatesAction(dryRun)` — `src/app/admin/templates/actions.ts`. apply 및 status 토글 액션은 `canPublishTemplates` 체크. service role client 로 storage 업로드 + DB upsert.

---

## 9. 시나리오 — 어떻게 확장하나

### A. 같은 Category 안에 새 Template variant 추가 (가장 흔함, 1 PR)

예: cafe Category 에 `cafe-sunlit` 추가.

1. **디렉터리 통째로 복제** — 가장 빠른 길:
   ```bash
   cp -r src/templates/cafe/default src/templates/cafe/sunlit
   ```
2. **`template.ts` 의 `slug` 와 `templateKey` 를 새 값으로**:
   ```ts
   slug: 'cafe-sunlit',
   templateKey: 'cafe-sunlit',
   ```
3. **`tokens.ts` 손보기** — primary / secondary, 폰트, 분위기. `designTokens` 같이.
4. **데이터 / composition 손보기** — `template.ts` 의 각 section `data` 값을 새 컨셉에 맞게.
5. **(필요 시) library 컴포넌트 수정** — β 모델: 이 Template 의 라이브러리는 이 Template 만 씀. 마음대로 손봐도 다른 Template 안 깨짐.
6. **`pnpm generate:templates`** — `_generated.ts` 자동 갱신 (predev / prebuild 에서도 자동).
7. **`pnpm template:capture cafe-sunlit`** — 썸네일 생성.
8. **`pnpm test` + `pnpm tsc --noEmit` + `pnpm lint`** — validate / ESLint 토큰 룰 통과 확인.
9. **`pnpm template:sync`** dry-run → PR 머지 → 어드민 Apply.

### B. Claude Code 로 Template 통째로 생성 (`new-template` 스킬, ADR-0002 의 짝)

Claude Code 에 자연어로 의뢰하면 `new-template` 스킬이 발동한다 (dev-time; 사용자 기능 아님):

```
"동네 빵집 — 따뜻한 톤, 갓 구운 빵 강조 한 페이지 사이트 만들어줘"
"아웃도어 브랜드, 홈/스토리/제품/매장 페이지 멀티페이지로 만들어줘"
```

→ Site Type 결정 → `src/templates/<category>/<leaf>/` 에 6 개 파일 작성 → §7.1 검증 게이트(`pnpm template:verify`)를 green 까지 self-fix → 이후 시나리오 A 의 8~9 번부터.

신규 Category 는 §7.1 의 슬러그 가드 + 사람 승인을 거친다.

### C. 기존 Template 에 새 Section component 추가

`src/templates/cafe/default/library/HeroParallax.tsx` 신규:

```tsx
import { TemplateSectionProps, SectionComponent } from '../../../types';

const HeroParallax: SectionComponent = function HeroParallax({ section }) {
  const { data } = section;
  // ... 렌더 로직 — 색·폰트는 var(--color-primary), var(--font-base) 만 (§6.3)
};

HeroParallax.meta = {
  componentKey: 'hero-parallax',         // ★ 라이브러리 키 — 영원히 고정
  category: 'hero',
  label: 'Hero (Parallax)',
  dataSchema: {
    title:    { type: 'text',     label: '타이틀',    required: true },
    imageUrl: { type: 'image',    label: '배경 이미지', required: true },
    subtitle: { type: 'textarea', label: '설명' },
  },
};

export default HeroParallax;
```

`library/index.ts` 에 등록:
```ts
import HeroParallax from './HeroParallax';
export const cafeDefaultLibrary: TemplateLibrary = {
  // ...기존
  'hero-parallax': libEntry(HeroParallax),  // server 컴포넌트 → meta 는 .tsx 안에서 자동 픽업
};
```

**만약 새 컴포넌트가 `'use client'` 라면**: `HeroParallax.meta = {...}` 대신 sibling `HeroParallax.meta.ts` 에 `export const heroParallaxMeta` 로 정의 → `libEntry(HeroParallax, heroParallaxMeta)` 로 명시 전달 (이유는 §10.12).

preset 의 composition 에서 사용 — `{ id: 'hero-1', componentKey: 'hero-parallax', data: { ... } }`. `pnpm test` → `pnpm template:sync` → 어드민 Apply.

**주의**: ADR-0001 — 이 컴포넌트는 cafe-default 전용이다. cafe-cozy 에도 같은 게 필요하면 *복제*. cross-Template 추출 금지.

### D. 새 Category 통째로 추가

1. `src/templates/<category>/<leaf>/` 디렉터리 생성 (`<leaf>` = `default` 권장 — 첫 번째 Template).
2. §3 골격대로 채움 (`tokens.ts`, `library/index.ts` + Section component 들, `template.ts`, `thumbnail.config.ts`, `index.tsx`, `<templateKey>.module.css`).
3. **`pnpm dev` 또는 `pnpm build`** — `predev` / `prebuild` 가 `pnpm generate:templates` 자동 실행 → `_generated.ts` 에 등록.
4. 이후 시나리오 A 의 7~9 번부터.

대안: `new-template` 스킬에 brief 만 던지면 Category 제안 + 슬러그 가드 + 6 파일 작성까지 한 번에. 더 빠름 (시나리오 B).

### E. `dataSchema` 에 `required` 추가/변경

기존 preset 의 `data` 에 해당 필드가 누락되어 있으면 `MISSING_REQUIRED_FIELD` error 로 sync 가 막힘. **반드시 같은 PR 에서 모든 영향받는 preset 의 `data` 채우기**. UserSite (`user_sites.site_json`) 는 sync 가 안 건드리므로 사용자가 다음에 편집하기 전까지는 이전 데이터 그대로 — 렌더 시 컴포넌트가 빈 값에 graceful fallback 가지도록 작성.

### F. Validate 룰 추가

`src/lib/template/validate.ts` 에 새 `err(...)` / `warn(...)` 호출 추가 → `__tests__/validate.test.ts` 에 케이스 추가. error 추가는 기존 preset 이 모두 통과하는지 먼저 dry-run 확인.

### G. 반복 항목을 위한 `array` 필드 추가

메뉴, 공지사항, 리뷰 등 반복되는 데이터는 `type: 'array'` 를 사용.
1. **meta 정의**: `itemSchema` 를 필수로 포함. `minItems` / `maxItems` 로 제약 가능.
   ```ts
   items: {
     type: 'array',
     label: '메뉴 항목',
     itemSchema: {
       title: { type: 'text', label: '제목', required: true },
       price: { type: 'text', label: '가격' }
     },
     minItems: 1
   }
   ```
2. **Preset 데이터**: `items` 배열 안에 각 item 객체 배치.
3. **컴포넌트 렌더**: `(data.items as ArrayTemplateField).items.map(...)` 으로 렌더. `item.title.value` 대신 `getFieldValue(item.title)` 사용 권장.

### H. 새 페이지 추가 (현재 제약)

`composition` 은 sync 시 `pages[0]` (home) 1 개만 생성 (`src/lib/template/preset.ts`). 다중 페이지가 필요하면:
- `templateJson` legacy 형태로 직접 작성하거나,
- `preset.ts` ↔ `deriveTemplateJsonFromPreset` 인터페이스를 확장 (`compositions: Record<pageSlug, PresetSection[]>` 등).

후자는 별도 작업 — 공개 사이트 네비게이션, 에디터 페이지 탭, validate `DUPLICATE_PAGE_SLUG` 룰까지 함께 손봐야 함. ADR-0001 footnote 의 `pages/<page>/sections/` 디렉터리 방향성도 이 시점에 같이 고민.

---

## 10. 자주 빠지는 함정

1. **`thumbnailPath` 와 `thumbnail.config.ts:output` 확장자 mismatch**
   `.webp`/`.jpg` 어긋나면 sync 가 옛 파일을 업로드하거나 로컬 경로 문자열을 그대로 DB 에 박는다. 두 곳을 항상 일치.

2. **`componentKey` 변경 = 사용자 사이트 깨짐**
   `user_sites.site_json` 의 `section.type` 이 매칭 안 되면 site 렌더러(`renderSingleSite`/`renderMultiSite`)가 console.warn + skip → 화면 빈칸. componentKey 는 **영원히** 변경 금지. 새 컴포넌트는 새 key 로.

3. **모든 `value` 는 string**
   `type: 'number'` 도 `value: '42'`. 컴포넌트에서 `Number(field.value)` 필요. validate 가 `NON_STRING_FIELD_VALUE` 로 잡음.

4. **items 의 React key (Array Field)**
   에디터에서 `array` 필드의 각 항목은 stable 한 `_key` 가 필요함. 에디터 내부적으로 `injectKeys` / `stripKeys` 헬퍼가 임시 키를 관리하며, DB 저장 시에는 최적화를 위해 제거됨. 렌더러에서는 `item._key || index` 를 키로 사용하되, 가급적 데이터 고유값을 조합할 것.

5. **Lazy Migration & Graceful Fallback**
   기존 Template 컴포넌트에 `array` 필드를 추가한 경우, 기존 UserSite JSON 에는 해당 필드나 `items` 배열이 없을 수 있음. 컴포넌트 구현 시 `data.items?.items ?? []` 처럼 항상 빈 배열 fallback 을 갖추어야 런타임 에러를 방지할 수 있음. (에디터에서 한 번 저장하면 스키마에 맞춰 채워짐)

6. **`required: true` 를 dataSchema 에 안 적으면 silent**
   필수 필드를 빠뜨려도 sync 통과하고 런타임에 빈 값. `dataSchema` 에 명시할 것.

7. **`templateKey` 누락 / legacy 'cafe' → backward-compat shim**
   `loadTemplate('cafe')` 가 들어오면 `'cafe-default'` 로 fallback (`registry.ts`). 의도된 동작 — migration 015 / 016 / 017 이 user_sites 의 templateKey 를 슬러그 형태로 정렬한 뒤로는 잔존 보호막. 디버깅 시간 낭비 흔함.

8. **`editable: false` 는 UI 만 숨김**
   서버 가드 없음. 사용자가 JSON 직접 수정하면 변경 가능 — 진짜 잠금이 필요하면 use case 레이어에 추가해야 함.

9. **Sync 는 user_sites 를 안 건드린다**
   `templates` 만 update. 이미 발행된 UserSite 는 옛 데이터 그대로. 강제 마이그가 필요하면 별도 SQL (참고: 012 / 015 / 016 / 017, 그리고 Single→union 백필 **018**(`user_sites`) / **019**(`templates`)).

10. **`_generated.ts` 수정 금지**
    수동 편집해도 다음 `predev` / `prebuild` 에서 덮어씀. 새 Template 추가는 디렉터리 / 파일만 만들면 됨.

11. **`globalStyles` 머지 규칙**
    `composition` 사용 시 sync 는 `templateModule.defaultTemplateJson.globalStyles` (= `tokens.ts` 시드) ◀ `preset.globalStyles` 순서로 spread. preset 에서 `Partial` 로 일부만 덮을 것.

12. **`'use client'` 컴포넌트의 `Component.meta = {...}` 는 서버에서 안 보임** ⚠️
    Next.js 는 `'use client'` 모듈을 server-side import 시 client reference 로 wrapping 하고 모듈 본문을 서버에서 실행하지 않는다. 그래서 `.tsx` 파일 끝에서 한 `Component.meta = {...}` side-effect 는 server 에는 보이지 않고 → `library['nav'].meta` 가 undefined → sync / validate 시 `Cannot read properties of undefined (reading 'dataSchema')` 폭발.
    **해법**: client 컴포넌트의 meta 는 항상 sibling `<Component>.meta.ts` 에 named export 로 정의하고, `library/index.ts` 에서 `libEntry(Component, componentMeta)` 로 명시 전달. server 컴포넌트는 종전대로 `.meta = {...}` 그대로 OK.

13. **Capture 는 dev server 를 띄움**
    `thumbnail.config.ts` 의 `source` 가 `preview://` 로 시작하면 `capture-templates.ts` 가 자동으로 `pnpm dev` 를 백그라운드로 실행. CI 에서는 `templates-ui/*.html` 파일 source 를 쓰면 server-less.

14. **인덱스 기반 스타일링의 한계 (Array Field)**
    `Array Field` 항목을 렌더링할 때 `idx === 0` 처럼 인덱스에 따라 스타일 (예: 넓은 카드, 특정 아이콘) 을 다르게 주면, 사용자가 에디터에서 항목 순서를 바꿀 때 디자인 요소가 항목을 따라가지 않고 '슬롯' 에 고정되는 현상이 발생함. "항목에 종속된 디자인" 이 필요하다면 `itemSchema` 에 `style` 이나 `icon` 같은 `select` 필드를 추가하여 사용자가 직접 지정하게 하는 것이 좋음.

15. **Optimistic concurrency RPC 우회 금지** ([ADR-0004](./adr/0004-optimistic-concurrency-via-rpc.md))
    UserSite 저장은 `save_site_template_with_lock` RPC 만 사용. 새 저장 경로 (자동 정리, 마이그 스크립트 등) 추가 시 `expectedUpdatedAt` 을 받아서 RPC 로 흘려야 함. 단순 `update` 로 바이패스하면 다른 탭의 변경분이 silent 하게 사라진다.

16. **`templateCategories` 값(대문자)을 FS 경로에 그대로 쓰면 CI 에서 깨진다** ⚠️
    `templateCategories['cafe-cozy'] === 'Cafe'` (대문자, §2.6). 이걸 `join(TEMPLATES_DIR, category, leaf)` 처럼 **파일시스템 경로**에 그대로 넣으면 디렉터리는 소문자(`cafe`)라 불일치 → **macOS(케이스 무시)에선 통과, Linux/CI 에선 `no thumbnail.config.ts` 류로 전수 실패**. FS 경로엔 항상 `category.toLowerCase()`. (`scripts/verify-template.ts` / `verify-templates-ci.ts` 가 이 패턴.) 반대로 DB `category` 값·카탈로그 표시는 대문자 그대로 둔다.

---

## 11. 코드 위치 맵

| 무엇 | 어디 |
|---|---|
| `TemplateJson` / `TemplateSection` / `TemplateField` 타입 | `src/domain/entities/template.entity.ts` |
| `TemplatePreset` / `SectionComponent` / `TemplateModule` / `DesignTokens` / `NavSectionProps` 타입 | `src/templates/types.ts` (`PresetSection`/`composition` 은 ADR-0007 때 제거됨) |
| 자동생성 레지스트리 | `src/templates/_generated.ts` (커밋, 수정 금지) |
| 동적 import 헬퍼 | `src/templates/registry.ts` (`loadTemplate(templateKey)` + legacy shim) |
| Site 렌더러 (mode 별) | `src/templates/renderSingleSite.tsx` · `src/templates/renderMultiSite.tsx` |
| Template 1 개 reference | `src/templates/cafe/default/` (rich design tokens 적용 demo), `src/templates/corporate/default/` (가장 단순) |
| Validate 규칙 | `src/lib/template/validate.ts` (+ `__tests__/validate.test.ts`) |
| Inline-tokens 스캐너 | `src/lib/template/inline-tokens.ts` |
| Design tokens overlay | `src/lib/template/design-tokens.ts` (`tokensToCssVars`, `OVERLAY_MAP`) |
| Preset → TemplateJson 변환 | `src/lib/template/preset.ts` |
| Sync 코어 로직 | `src/lib/template/sync.ts` (+ `__tests__/sync.test.ts`) |
| Template assets 업로드 헬퍼 | `src/lib/template/template-assets.ts` |
| Codegen 스크립트 | `scripts/generate-templates.mjs` |
| Template 저작 스킬 | `.claude/skills/new-template/` (`SKILL.md` + `gotchas-checklist.md`) |
| Sync CLI | `scripts/sync-templates.ts` |
| Verify CLI (통합 게이트) | `scripts/verify-template.ts` (`pnpm template:verify`) |
| Capture CLI (Playwright) | `scripts/capture-templates.ts` |
| Scaffold (빈 골격) | `scripts/scaffold-template.ts` |
| 이미지 호스팅 CLI/헬퍼 | `scripts/host-image.ts` (`pnpm template:image`) → `scripts/lib/image-fetch.ts` (`fetchAndHostImage`) |
| CSS import 스텁 (tsx 모듈 로딩) | `scripts/lib/register-css-stub.ts` (sync/verify 의 첫 import) |
| 새 카테고리 gate | `scripts/lib/category-gate.ts` |
| Validate + capture 통합 게이트 | `scripts/lib/validate-and-capture.ts` |
| ESLint inline-tokens 룰 | `eslint-rules/no-inline-design-tokens.mjs` |
| Sync Server Action | `src/app/admin/templates/actions.ts:syncTemplatesAction` |
| Admin UI (sync 트리거) | `src/app/admin/templates/TemplateListPanel.tsx` |
| Admin UI (composition 시각화) | `src/app/admin/templates/CompositionPreview.tsx` |
| Admin UI (manual JSON 편집) | `src/app/admin/templates/TemplateEditorPanel.tsx` |
| Composition preview (capture 용) | `src/app/preview/preset/[...key]/page.tsx` |
| 사용자 에디터 | `src/components/editor/DynamicEditor.tsx` |

---

## 12. 비-목표 (이번 시스템에서 의도적으로 안 하는 것)

- **시각적 WYSIWYG preset 빌더** — 코드-PR 워크플로우가 의도된 게이트 (ADR-0002).
- **사용자별 커스텀 Template 업로드** — 보안·격리 비용 큼.
- **크로스-Template Section 공유** (`src/sections/` 공용 풀) — ADR-0001 위배. 별도 RFC 없이는 X.
- **사용자 에디터에서 섹션 추가 / 삭제·순서 변경** — 데이터 모델은 가능하지만 UX·검증 추가 비용. 현재 1 차는 preset 구조 고정.
- **다중 페이지 *composition* 저작** — Multi 사이트 자체는 출시됨 (ADR-0007: renderMultiSite + `[[...slug]]` nav). 다만 `composition` 모델은 여전히 1 페이지 전제라, Multi 는 `templateJson` 유니온을 직접 작성한다 (§7.1, §9-H). `composition` 을 다중 페이지로 확장 + ADR-0001 footnote 의 `pages/<page>/sections/` 디렉터리 재편은 미래 작업.

---

## 13. Migration 히스토리 (템플릿 관련만)

| 번호 | 내용 | 프로덕션 적용 |
|---|---|---|
| 011 | `template_sync_audit` 테이블 (sync 감사 로그) | ✅ |
| 012 | `templates.template_json` / `user_sites.site_json` / `user_sites.template_snapshot` 의 `section.order` 필드 일괄 제거 (Phase 6d) | ✅ |
| 013 | `themeKey` → `templateKey` 일괄 rename (β 모델 정합) | ✅ |
| 014 | `template_assets` public storage 버킷 (AI 생성 / 스톡 이미지 호스팅, #7) | ✅ |
| 015 | user_sites templateKey 를 `${category}-${leaf}` 슬러그로 정렬 (β 모델) | 진행 |
| 016 | 015 후속 fix | 진행 |
| 017 | custom templateKey fix | 진행 |

`registry.ts` 의 backward-compat shim (legacy 'cafe' → 'cafe-default') 은 015 / 016 / 017 정착 후 제거 예정.

전체 시스템 이력 (Phase 1 ~ 6d, β 마이그) 은 git log 참고 — 커밋 메시지에 phase 번호와 의도가 적혀 있음. 본 문서는 **현재 동작하는 상태**만 기술한다.

---

## 14. 한 줄 요약

> **Template = 자급자족 디렉터리** (tokens + library + preset + renderer, 다른 Template 와 공유 안 됨 — ADR-0001). **코드가 진실**, Sync 로 DB 반영 (ADR-0002). **새 Template 저작 = `new-template` Claude Code 스킬** (dev-time; brief → 6 파일 → `template:verify` 게이트 → sync). 새 variant = 디렉터리 복제 1 번. 새 Section = `library/` 에 `.meta` 동봉한 `.tsx` 1 개. 새 Category = 디렉터리 통째로 만들면 codegen 이 알아서 등록.
