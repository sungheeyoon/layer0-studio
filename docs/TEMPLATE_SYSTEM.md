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

   `pnpm template:generate "<brief>"`  ← LLM 4-stage pipeline (Tracer)
   (6 개 파일 자동 생성 후 generate:templates 호출)
```

- **코드가 진실 — Template** ([ADR-0002](./adr/0002-templates-source-of-truth-is-code.md)): `template_json` / 썸네일 / `version` 은 항상 코드값으로 덮어씀.
- **DB 가 진실 — UserSite**: 사용자 사이트는 sync 가 안 건드림. 모든 저장은 optimistic concurrency RPC 경유 ([ADR-0004](./adr/0004-optimistic-concurrency-via-rpc.md)).
- **Template 간 코드 공유 = 0** ([ADR-0001](./adr/0001-beta-model-template-isolation.md) β 모델): cafe-default 와 cafe-cozy 는 component / token / css 를 *전혀* 공유하지 않음.
- **렌더 순서 = 배열 순서**: `composition: PresetSection[]` 의 배열 순서가 화면 위 → 아래. `section.order` 는 폐기 (Phase 6d / migration 012).

---

## 1. 핵심 개념

| 용어 | 무엇 | 어디 산다 | 누가 만든다 |
|---|---|---|---|
| **Category** | Template 카탈로그 분류 버킷 (cafe / corporate / fitness / interior / legal / medical / wedding) | `src/templates/<category>/` 디렉터리 이름 | 개발자 (디렉터리 추가) |
| **Template** | 한 Category 안의 한 디자인. **모든 시각/구성 자산을 자기 디렉터리 안에 자급자족** (ADR-0001) | `src/templates/<category>/<leaf>/` | 개발자 (코드 PR) 또는 LLM (`pnpm template:generate`) |
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
| `status` | — | ✅ | 절대 안 건드림 (신규 row 만 `'draft'`) |

> **핵심 약속**: 운영자가 어드민에서 description 을 바꿔도 다음 sync 가 코드값으로 되돌리지 않는다. `templateJson` / 썸네일 / 버전은 **항상 코드 진실** — 어드민에서 코드 preset row 의 JSON 직접 편집은 차단되어 있음 (manual row 만 편집 허용).

### 1.2 Sync vs Generate (ADR-0002 의 두 진입점)

- **Sync** (운영) — *기존 코드* → DB. `pnpm template:sync`. 매 배포마다.
- **Generate** (창작) — *자연어 brief* → 새 코드 파일들 (그 다음 Sync 가 필요). `pnpm template:generate`. LLM 호출 (Anthropic API).

둘 다 *코드가 진실* 약속을 지킨다 — Generate 도 DB 에 직접 쓰지 않음.

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

**적용 방법**: Template `index.tsx` 에서 `RenderComposition` 에 `designTokens` prop 전달:

```tsx
<RenderComposition
  {...props}
  library={library}
  className={styles.themeRoot}
  designTokens={designTokens}   // ← root div 에 var 들이 inline style 로 주입됨
/>
```

**컴포넌트 사용**: 인라인 hex 금지 (§6.3 ESLint 룰). `var(--color-primary)`, `var(--font-base)` 등 참조만 허용.

**현재 적용 상태** (ADR-0005): **cafe-default** 만 풍부 토큰 패턴 적용 완료 (#9 demo). 나머지 8 개 Template 는 각자 `.module.css` 에 기존 `--{prefix}-{name}` 패턴 유지 — **의도적인 점진 전환**. 각 Template 가 다른 이유로 손볼 때 자연스럽게 새 패턴으로 옮긴다. 신규 **Generate** 출력은 무조건 rich 패턴 (마이그 부담 줄이기 위해).

---

## 3. Template 디렉터리 구조 (β 모델, ADR-0001)

9 개 Template (cafe-{cozy,default,modern}, corporate-default, fitness-default, interior-default, legal-default, medical-default, wedding-default) 모두 같은 골격:

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
└── index.tsx                       # TemplateRenderer (RenderComposition 위임), library/defaultTemplateJson export
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

`loadTemplate(templateKey)` 헬퍼 (`src/templates/registry.ts`) 가 `templateMap` 을 wrapping. **Backward-compat shim**: bare legacy key (예: `'cafe'`) 가 들어오면 `${key}-default` 로 fallback (migration 015–017 이 user_sites 의 templateKey 를 슬러그 형태로 정렬할 때까지의 임시 보호막).

### 3.3 미래 구조 방향 (footnote, ADR-0001)

현재 `library/` 는 *과도기 아티팩트*. multi-page 가 본격 확장되면 `<templateDir>/pages/<page>/sections/<Section>.tsx` 구조로 옮겨갈 가능성이 있다. 그래서 글로서리 (CONTEXT.md) 에 "Library" 를 도메인 용어로 굳히지 않음.

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
RenderComposition                     ← src/templates/renderComposition.tsx
    │  page = siteJson.pages.find(activePageId) ?? pages[0]
    │  page.sections.map((section) => library[section.type])
    │
    ▼
<Component section={section} />        // SectionComponent
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
   │     없음 → INSERT (status='draft')
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

`--apply` 시 validate 에러가 있으면 전체 중단. 권한은 `canPublishTemplates === true` 만 어드민 UI 에서 apply 가능 — **admin role 과 분리** ([ADR-0006](./adr/0006-canpublishtemplates-separate-from-admin.md)). CLI 는 service role key 로 무조건 가능 → 운영 서버에서 실수 방지를 위해 필수로 dry-run 먼저 보고 적용.

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

`src/lib/template/validate.ts` — `validateTemplateJson(json, options)`. sync 전, `pnpm test`, 어드민 Save 에서 모두 호출.

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

1. **Validate** — `validateTemplateFiles(templateDir)` (`src/lib/template/inline-tokens.ts`): Generate 파이프라인이 `library/*.tsx` 파일 텍스트를 스캔. 위반 시 `ValidationIssue[]` 반환.
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

# AI Template Generate (Tracer #1–#8)
pnpm template:generate "<brief>"                  # 인터랙티브 4-stage 승인
pnpm template:generate "<brief>" --auto-approve   # 무인 (CI/smoke)
pnpm template:generate --help

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

### 7.1 `template:generate` 흐름 (Generate, Tracer #1–#8)

```
brief ──▶ propose_composition   ──▶ [y / r / pick leaf 1-3]      ← LLM (#11)
       ──▶ new-category gate    ──▶ [y/N] (only if category 신규)  ← #17
       ──▶ propose_design_tokens ──▶ [y / r / n]                  ← LLM (#12)
       ──▶ generate_section(×N)  ──▶ [approve y/n] (per section) ← stub (#13)
       ──▶ writeFiles + generate:templates
       ──▶ validate_and_capture  ──▶ tsc/eslint/validate/capture  ← real (#16)
```

생성 결과: `src/templates/<category>/<leaf>/` 안에 6 개 파일 (`tokens.ts`, `template.ts`, `thumbnail.config.ts`, `index.tsx`, `library/index.ts`, `library/<Section>.tsx`). 자동으로 `pnpm generate:templates` 실행 → `_generated.ts` 갱신 → `/preview/preset/<templateKey>` 에서 즉시 미리보기 가능.

각 단계 상세:

**LLM #11 — `propose_composition`**: brief → category, leaf slug 후보 2-3 개, section role 시퀀스. 시스템 프롬프트는 category 정규화 룰 (소문자 + hyphen), leaf slug 컨벤션, 카테고리별 섹션 역할 가이드를 명시. UX: 사람이 leaf 후보 중 선택 또는 커스텀 입력, regenerate 가능.

**LLM #12 — `propose_design_tokens`**: brief + composition → `defaultGlobalStyles` (얇은 5 필드) + `designTokens` (rich: colors / fonts / spacing? / radius? / shadows?). ADR-0005 의 2-layer 모델 그대로. Zod 스키마가 `colors.primary/secondary`, `fonts.base`, hex 색 형식, CSS length 단위 등을 runtime 검증. 카테고리별 mood 가이드 (cafe=warm earth, medical=muted + 1 accent 등) 시스템 프롬프트에 포함. UX: [y/r/n] regenerate 가능, 최대 4 회 시도.

공통 인프라 (#11 에서 도입) — `scripts/lib/llm.ts` 의 `claudeJSON({systemPrompt, userMessage, schema, …})` 헬퍼: `claude-opus-4-7` + adaptive thinking + `output_config.format` (json_schema), Zod 검증, 사람-가독적 에러 (키 누락 / 401 / 429 / network / parse / schema fail). 환경 변수 `ANTHROPIC_API_KEY` 필요 — `pnpm tsx --env-file=.env.local scripts/generate-template.ts "<brief>"` 권장.

**남은 stub — #13 `generate_section`**: 여전히 하드코딩. 별도 PR 에서 LLM 호출로 교체 예정.

**New-category gate (#17)**: propose_composition 이 추출한 category 가 `src/templates/<category>/` 에 없으면 명시적 [y/N] 승인. 거부 시 generation 중단. 정확 일치 매칭만 (fuzzy X — `cafe-studio` 는 `cafe` 와 별개). 슬러그 가드 `^[a-z][a-z0-9-]{0,39}$` 위반 시 즉시 abort (LLM 재시도 X, brief 를 다시). `--auto-approve` 에서는 자동 통과 + warning 표시.

**최종 단계 #16 — `validate_and_capture`**: 6 단계 통합 게이트. (1) `tsc --noEmit` — 글로벌 실행 후 template dir 관련 에러만 필터; (2) `eslint <templateRoot>` — §6.3 토큰 룰 포함; (3) `validateTemplateJson` — preset → templateJson 유도 후 검증; (4) `validateTemplateFiles` — §6.3 file-level 인라인 색·폰트 스캔; (5) **dataSchema ↔ JSX 일관성** — 모든 declared 필드가 `getFieldValue` 참조됨 + 모든 참조 필드가 declared 됨 cross-check (브래스 밸런스 파서 — single/multi-line 둘 다 지원); (6) `pnpm template:capture <templateKey>` — Playwright Chromium 썸네일 webp 생성. (1)–(5) 중 하나라도 실패하면 즉시 halt + 부분 진행물 워킹 트리에 남김 (retry 안 함 — 사람 인계가 맞음). 캡처는 soft-fail (썸네일은 사후 재생성 가능).

### 7.2 이미지 호스팅 헬퍼 (Issue #15)

`scripts/lib/image-fetch.ts` 의 `fetchAndHostImage({ query, templateKey, aspectRatio?, role? })` — generate_section (#13) 이 `dataSchema` 에 `type: 'image'` 필드를 만들 때 호출. AI 는 query 문자열만 결정하고 헬퍼가 fetch + host 를 처리.

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

**현재 연결되지 않음** — generate_section(#13) 은 아직 stub 이라 헬퍼가 자동 호출되지 않음. #13 머지 후 wiring 완료 예정.

---

## 8. Admin UI

`/admin/templates` — `app_metadata.role === 'admin'` 필요. Sync 적용은 별도 `canPublishTemplates === true` 필요 (ADR-0006).

| 영역 | 동작 |
|---|---|
| 카탈로그 그리드 | preset row 는 `code` 배지·read-only, manual row 는 `manual` 배지·편집 가능 |
| `Sync from Code` 버튼 | 1 단계: Preview Sync (dry-run, 모두 가능) |
| `Apply Sync` 버튼 | 2 단계: 실제 적용 (`canPublishTemplates === true` 필요) |
| Composition 다이어그램 | `CompositionPreview.tsx` — preset row 클릭 시 componentKey/category 시각화 |
| `+ New Template` | manual one-off 시드 (시즌 프로모션 등) — JSON textarea 직접 편집 가능 |
| Status 토글 | `draft` ↔ `active` ↔ `archived` (sync 는 안 건드림) |

`syncTemplatesAction(dryRun)` — `src/app/admin/templates/actions.ts`. apply 분기에서 `canPublishTemplates` 체크. service role client 로 storage 업로드 + DB upsert.

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

### B. AI 로 Template 통째로 생성 (Generate, ADR-0002 의 짝)

```bash
pnpm tsx --env-file=.env.local scripts/generate-template.ts "동네 빵집 — 따뜻한 톤, 갓 구운 빵 강조"
```

→ Tracer 4-stage 거쳐 `src/templates/<category>/<leaf>/` 에 6 개 파일 자동 생성. 이후 시나리오 A 의 8~9 번부터.

신규 Category 가 추출되면 (#17 gate) 사람이 명시적 [y/N] 승인. 거부하면 generation 중단.

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

대안: `pnpm template:generate "<brief>"` 로 brief 만 던지면 LLM 이 Category 제안 → #17 gate 승인 → 자동 생성. 더 빠름.

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
   `user_sites.site_json` 의 `section.type` 이 매칭 안 되면 `RenderComposition` 이 console.warn + skip → 화면 빈칸. componentKey 는 **영원히** 변경 금지. 새 컴포넌트는 새 key 로.

3. **모든 `value` 는 string**
   `type: 'number'` 도 `value: '42'`. 컴포넌트에서 `Number(field.value)` 필요. validate 가 `NON_STRING_FIELD_VALUE` 로 잡음.

4. **items 의 React key (Array Field)**
   에디터에서 `array` 필드의 각 항목은 stable 한 `_key` 가 필요함. 에디터 내부적으로 `injectKeys` / `stripKeys` 헬퍼가 임시 키를 관리하며, DB 저장 시에는 최적화를 위해 제거됨. 렌더러에서는 `item._key || index` 를 키로 사용하되, 가급적 데이터 고유값을 조합할 것.

5. **Lazy Migration & Graceful Fallback**
   기존 Template 컴포넌트에 `array` 필드를 추가한 경우, 기존 UserSite JSON 에는 해당 필드나 `items` 배열이 없을 수 있음. 컴포넌트 구현 시 `data.items?.items ?? []` 처럼 항상 빈 배열 fallback 을 갖추어야 런타임 에러를 방지할 수 있음. (에디터에서 한 번 저장하면 스키마에 맞춰 채워짐)

6. **`required: true` 를 dataSchema 에 안 적으면 silent**
   필수 필드를 빠뜨려도 sync 통과하고 런타임에 빈 값. `dataSchema` 에 명시할 것.

7. **`templateKey` 누락 / legacy 'cafe' → backward-compat shim**
   `loadTemplate('cafe')` 가 들어오면 `'cafe-default'` 로 fallback (`registry.ts`). 의도된 동작 — migration 015 / 016 / 017 이 user_sites 의 templateKey 를 슬러그 형태로 정렬할 때까지의 보호막. 디버깅 시간 낭비 흔함.

8. **`editable: false` 는 UI 만 숨김**
   서버 가드 없음. 사용자가 JSON 직접 수정하면 변경 가능 — 진짜 잠금이 필요하면 use case 레이어에 추가해야 함.

9. **Sync 는 user_sites 를 안 건드린다**
   `templates` 만 update. 이미 발행된 UserSite 는 옛 데이터 그대로. 강제 마이그가 필요하면 별도 SQL (참고: 012 / 015 / 016 / 017).

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

---

## 11. 코드 위치 맵

| 무엇 | 어디 |
|---|---|
| `TemplateJson` / `TemplateSection` / `TemplateField` 타입 | `src/domain/entities/template.entity.ts` |
| `TemplatePreset` / `PresetSection` / `SectionComponent` / `TemplateModule` / `DesignTokens` 타입 | `src/templates/types.ts` |
| 자동생성 레지스트리 | `src/templates/_generated.ts` (커밋, 수정 금지) |
| 동적 import 헬퍼 | `src/templates/registry.ts` (`loadTemplate(templateKey)` + legacy shim) |
| 범용 렌더러 | `src/templates/renderComposition.tsx` |
| Template 1 개 reference | `src/templates/cafe/default/` (rich design tokens 적용 demo), `src/templates/corporate/default/` (가장 단순) |
| Validate 규칙 | `src/lib/template/validate.ts` (+ `__tests__/validate.test.ts`) |
| Inline-tokens 스캐너 | `src/lib/template/inline-tokens.ts` |
| Design tokens overlay | `src/lib/template/design-tokens.ts` (`tokensToCssVars`, `OVERLAY_MAP`) |
| Preset → TemplateJson 변환 | `src/lib/template/preset.ts` |
| Sync 코어 로직 | `src/lib/template/sync.ts` (+ `__tests__/sync.test.ts`) |
| Template assets 업로드 헬퍼 | `src/lib/template/template-assets.ts` |
| Codegen 스크립트 | `scripts/generate-templates.mjs` |
| Generate CLI (LLM) | `scripts/generate-template.ts` |
| Sync CLI | `scripts/sync-templates.ts` |
| Capture CLI (Playwright) | `scripts/capture-templates.ts` |
| Scaffold (빈 골격) | `scripts/scaffold-template.ts` |
| LLM 공통 인프라 | `scripts/lib/llm.ts` (`claudeJSON`) |
| 이미지 호스팅 헬퍼 | `scripts/lib/image-fetch.ts` (`fetchAndHostImage`) |
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
- **다중 페이지 공개 사이트 네비게이션** — composition 모델이 1 페이지 전제 (§9-H). ADR-0001 footnote 의 `pages/<page>/sections/` 디렉터리 방향성과 함께 미래 작업.

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

> **Template = 자급자족 디렉터리** (tokens + library + preset + renderer, 다른 Template 와 공유 안 됨 — ADR-0001). **코드가 진실**, Sync 로 DB 반영 (ADR-0002). **Generate** 는 brief 1 개로 새 Template 코드 자동 생성. 새 variant = 디렉터리 복제 1 번. 새 Section = `library/` 에 `.meta` 동봉한 `.tsx` 1 개. 새 Category = 디렉터리 통째로 만들면 codegen 이 알아서 등록.
