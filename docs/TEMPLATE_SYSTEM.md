# Template System — Layer0 Studio

_대상: Template / Block component 를 추가·수정하거나 저작 · sync 파이프라인을 손볼 개발자_
_최종 갱신: 2026-08-11 (ADR-0016 전체 구현과 문서 정리)_

> 본 문서는 `CONTEXT.md` 의 도메인 어휘 (Template / Category / Block / Preset / Sync / Design Tokens / Global Styles) 와 `docs/adr/` 를 기반으로 한다. 특히 [ADR-0001](./adr/0001-beta-model-template-isolation.md)(isolation) · [ADR-0002](./adr/0002-templates-source-of-truth-is-code.md)(코드가 진실) · [ADR-0005](./adr/0005-design-tokens-gradual-migration.md)(토큰 점진 전환) · [ADR-0007](./adr/0007-single-multi-site-type-structural-union.md)(Single/Multi) · [ADR-0012](./adr/0012-template-publishing-pipeline.md)(등록·공개 파이프라인) · [ADR-0016](./adr/0016-block-rename-and-field-value-split.md)(schema-first Field/Value와 Block/Menu 모델) 를 먼저 읽으면 본 문서가 자연스럽게 읽힌다.

이 문서 한 장만 읽으면 **(1) 시스템이 어떻게 굴러가는지**, **(2) 새 Template / Block 을 어떻게 추가하는지**, **(3) 어디를 만지면 무엇이 깨지는지** 모두 파악할 수 있도록 만든다. 추가 컨텍스트는 모두 코드에 있다 — 이 문서가 가리키는 위치만 따라가면 된다.

---

## 0. 한 페이지 요약

```
   코드 (개발자가 작성, source of truth)              DB (Sync 가 채움)            사용자
┌──────────────────────────────────┐         ┌────────────────────────┐    ┌────────────────┐
│ src/templates/<category>/<leaf>/ │         │ templates              │    │ user_sites     │
│  ├ tokens.ts                     │         │  ├ slug (PK)           │    │  ├ template_id │
│  │   (designTokens +             │         │  ├ content             │    │  ├ content     │
│  │    defaultGlobalStyles)       │         │  ├ thumbnail_url       │    │  └ ...         │
│  ├ library/*.tsx                 │ ─sync─▶│  ├ version              │ ─┐                  │
│  │   (.meta.fieldsSchema)          │         │  └ status (admin only) │  └▶ (사용자 편집)  │
│  ├ template.ts (= the Preset)    │         └────────────────────────┘    └────────────────┘
│  ├ thumbnail.config.ts           │                    │
│  └ index.tsx (Renderer)          │                    ▼
└──────────────────────────────────┘         template_sync_audit (감사 로그)
        ▲
        │
   `pnpm generate:templates`         `pnpm template:capture`         `pnpm template:sync [--apply]`
   (predev/prebuild 자동)             (썸네일)                          (코드 → DB 반영)

   새 Template 저작 = `new-template` Claude Code 스킬 (dev-time)
   (브리프 자연어 → 골격 파일 작성 → 검증 루프 → sync)
```

- **코드가 진실 — Template** ([ADR-0002](./adr/0002-templates-source-of-truth-is-code.md)): `content` (구 `template_json`) / 썸네일 / `version` 은 항상 코드값으로 덮어씀.
- **DB 가 진실 — UserSite**: 사용자 사이트는 sync 가 안 건드림. 모든 저장은 optimistic concurrency RPC 경유 ([ADR-0004](./adr/0004-optimistic-concurrency-via-rpc.md)).
- **Template 간 코드 공유 = 0** ([ADR-0001](./adr/0001-beta-model-template-isolation.md) β 모델): cafe-default 와 cafe-cozy 는 component / token / css 를 *전혀* 공유하지 않음.
- **렌더 순서 = 배열 순서**: `blocks[]` 의 배열 순서가 화면 위 → 아래. `section.order` 는 폐기 (Phase 6d / migration 012).

---

## 1. 핵심 개념

| 용어 | 무엇 | 어디 산다 | 누가 만든다 |
|---|---|---|---|
| **Category** | Template 카탈로그 분류 버킷 (현재 목록은 `ls -d src/templates/*/`). **두 가지 표기**: 파일시스템은 **소문자** 디렉터리명(`src/templates/cafe/`), 카탈로그·DB(`templates.category`)·`templateCategories` 값은 **첫 글자 대문자**(`Cafe`) — codegen 이 디렉터리명을 Capitalize 해 만든다. 자세히는 §2.6 | `src/templates/<category>/` 디렉터리 이름 | 개발자 (디렉터리 추가) |
| **Template** | 한 Category 안의 한 디자인. **모든 시각/구성 자산을 자기 디렉터리 안에 자급자족** (ADR-0001) | `src/templates/<category>/<leaf>/` | 개발자 (코드 PR) 또는 Claude Code (`new-template` 스킬) |
| **Block component** | 자기 메타 (`componentKey` / `category` / `label` / `fieldsSchema`) 를 동봉하는 self-describing React 컴포넌트 | `<templateDir>/library/<Name>.tsx` | 개발자 |
| **Template Library** | `componentKey → Block component` 매핑. 한 Template 의 조립 키트. **다른 Template 와 공유 안 됨** | `<templateDir>/library/index.ts` | 개발자 |
| **Preset** | 코드가 진실인 시드. `content`(ContentModel) + 토큰 | `<templateDir>/template.ts` | 개발자 / LLM |
| **Template (DB row)** | `templates` 테이블 한 행. Preset 에서 Sync 로 시드되거나 어드민이 manual 로 만듦 | DB | sync CLI / 어드민 UI |
| **UserSite** | Template 을 복사해 사용자가 편집한 인스턴스 | DB `user_sites` | 일반 사용자 |
| **`templateKey`** | `${category}-${leaf}` 형태 합성 슬러그 (예: `cafe-default`). `templateMap` upsert 키 | `_generated.ts` | codegen |

### 1.1 소유권 매트릭스 (Sync 가 무엇을 건드리나) — ADR-0002 의 운영 표현

| 필드 | 코드 (Preset) | DB (어드민) | sync 동작 |
|---|---|---|---|
| `slug` | ✅ (upsert 키, 영원히 변경 금지) | — | 일치 보장 |
| `content` | ✅ | — | 항상 코드값으로 덮어씀 |
| `thumbnailUrl` | ✅ (해시 기반) | — | 해시 다르면 재업로드 |
| `version` | ✅ (semver) | — | 코드값으로 덮어씀 |
| `name` / `description` / `category` | 신규 row 시드값 only | ✅ | DB 값 있으면 보존 |
| `status` | — | ✅ | 절대 안 건드림 — 신규 row 는 `'active'` ([ADR-0012](./adr/0012-template-publishing-pipeline.md): 머지=공개 승인) |

> **핵심 약속**: 운영자가 어드민에서 description 을 바꿔도 다음 sync 가 코드값으로 되돌리지 않는다. `content` / 썸네일 / 버전은 **항상 코드 진실** — 어드민에서 코드 preset row 의 JSON 직접 편집은 차단되어 있음 (manual row 만 편집 허용).

### 1.2 저작과 Sync — 두 진입점 (ADR-0002)

- **저작** (창작) — *자연어 brief* → 새 코드 파일들. **`new-template` Claude Code 스킬**(`.claude/skills/new-template/`)이 dev-time 에 수행하며 골격 파일을 쓰고 검증 게이트를 돌린다. 사용자(최종 고객)는 Template 을 만들지 않는다.
- **Sync** (운영) — *기존 코드* → DB. `pnpm template:sync`. 프로덕션 배포 성공 후 자동([ADR-0012](./adr/0012-template-publishing-pipeline.md)).

저작은 DB 에 직접 쓰지 않는다 — 반드시 sync 를 경유한다. 그래서 *코드가 진실* 약속이 유지된다.

> **이력**: 구버전엔 `pnpm template:generate` 라는 LLM API 4-stage CLI 파이프라인(`scripts/generate-template.ts`, Tracer #11–#17)이 있었으나 **Claude Code 스킬로 대체하며 제거됐다** (눈먼 한 방 생성 + 사람 인계 대신, Claude Code 가 검증 루프를 자기가 닫고 추가 API 비용 0). 검증/이미지/카테고리 가드 로직(`validate-and-capture.ts`/`image-fetch.ts`/`category-gate.ts`)은 스킬의 도구로 살아남았다. **"Generate" 를 고유명사처럼 쓰지 말 것** — 그런 명령도, 그런 도메인 용어도 지금은 없다. 그냥 "저작(authoring)" 이다.

---

## 2. 데이터 모델

### 2.1 `ContentModel` (DB 에 저장되는 형태) — `src/domain/entities/template.entity.ts`

> **네이밍**: 이 타입은 예전 `TemplateJson` — `Template` 과 `Site` 가 **공유**하는 콘텐츠 형태라 엔티티 중립 이름 `ContentModel` 로 개명됐다 ([ADR-0013](./adr/0013-content-model-rename.md)). `mode` 판별 구조적 유니온(`SiteMode = 'single' | 'multi'`): `SingleContent | MultiContent`. 아래는 Single 예시.
>
> ADR-0016 §2–§5가 현재 코드와 저장 JSON의 진실이다: `Block`/`blocks`/`chrome`, schema-first Values, optional `menu`, Multi `Page.name`. 이전 모양은 migration 027의 입력에서만 읽는다.

```ts
ContentModel (single) = {
  mode: 'single',                       // ★ Site Type 판별자 (SiteMode)
  templateKey: 'cafe-default',          // _generated.ts의 templateMap 키 (= ${category}-${leaf})
  globalStyles: {                       // 사용자 편집 가능한 얇은 layer (ADR-0005)
    primaryColor: '#C96A3A',
    secondaryColor: '#231509',
    backgroundColor: '#F5F0E8',         // 페이지 배경 → --color-surface
    fontFamily: "'Playfair Display', sans-serif",
    fontSize: '16px',                   // CSS length
    layout: 'wide',                     // 'wide'|'narrow'|'asymmetric'|'default'|'full'
  },
  blocks: [                           // ★ Single 은 blocks[] 를 루트에 직접 (Page 없음)
    {
      id: 'hero-001',                   // unique, 사용자 사이트에서도 보존
      type: 'hero',                     // ★ Template Library 의 componentKey 와 매칭
      visible: true,                    // 서빙 여부
      menu: { label: 'Home' },          // 존재 자체가 Single menu 포함을 뜻함
      fields: {                         // ★ Value 만 담는다 (ADR-0016) — 구 `data`(migration 022)
        title: '천천히, 제대로',          //   text/textarea/url/color/select → string
        columns: 3,                     //   number → number
        image: { url: 'https://...' },  //   image  → { url, assetId? }
        items: [                        //   array  → { id, fields }[] (재귀)
          { id: 'a1b2…', fields: { title: '아메리카노', price: '4,500' } },
        ],
      },
    },
  ],
}
// Multi 는 대신: { mode: 'multi', templateKey, globalStyles,
//                  chrome: { header: Block[], footer: Block[] },
//                  pages: [{ id, slug, visible, name, menu?, blocks: Block[] }, ...] }
```

**`fields` 는 Value 만 담는다 — `{type,label,value}` 래퍼가 아니다** ([ADR-0016](./adr/0016-block-rename-and-field-value-split.md) §4). 어떤 키가 텍스트고 어떤 키가 이미지인지는 **오직 컴포넌트의 `fieldsSchema`** 가 안다(§2.3). 인스턴스마다 `type`/`label` 을 복사해 두면 스키마와 drift 할 수 있어서 그걸 막는 규칙(`FIELD_TYPE_MISMATCH`)만 존재했다 — 저장을 안 하니 drift 자체가 사라졌다.

| 스키마 descriptor | 저장되는 Value | 비고 |
|---|---|---|
| `text` / `textarea` / `url` / `color` | `string` | |
| `select` | `string` (`options` 중 하나) | `options: readonly string[]` 필요 |
| `number` | `number` (진짜 숫자) | **`default: number` 필수** — 빈 입력을 에디터가 이 값으로 리셋 (§4-3) |
| `image` | `{ url: string; assetId?: string \| null }` | `assetId` 는 스키마 메타가 아니라 콘텐츠 — ADR-0003 참조 카운팅이 읽음 |
| `array` | `{ id: string; fields: {...} }[]` | `itemSchema` 필수(재귀). `id` 는 `fields` **바깥**의 형제 |

> **`Field` union 과 `getFieldValue()` 는 삭제됐다** (#136). 남은 유일한 등장 위치는 옛 행을 변환하는 마이그레이션 러너(`scripts/lib/migrate-single-site.ts`, `migrate-field-to-value.ts`)이고, 각자 파일 안에 `LegacyField` 로 로컬 선언해 들고 있다. 새 코드가 이 모양을 읽으면 회귀다.

### 2.2 `TemplatePreset` (코드 진실) — `src/templates/types.ts`

```ts
interface TemplatePreset {
  slug: string;                          // = templateKey. DB upsert 키. 변경 금지.
  content: ContentModel;            // ★ DB 에 그대로 시드되는 전체 콘텐츠 (Single/Multi 유니온)
  thumbnailPath: string;                 // 'public/thumbnails/template-<slug>.webp'
  version: string;                       // semver
  defaults: { name: string; description: string; category: string };
}
```

> Preset 은 `content`(= `ContentModel`)을 **그대로** 들고 있고 sync 가 verbatim 으로 DB `content` 컬럼에 저장한다. 예전 `composition: PresetSection[]` 축약형은 제거됐다 ([ADR-0007](./adr/0007-single-multi-site-type-structural-union.md)). 필드명·타입·DB 컬럼이 모두 `content` 로 일치한다 (필드명은 [ADR-0013](./adr/0013-content-model-rename.md) 후속 정리로 `templateJson`→`content`, DB 컬럼은 migration 021).

### 2.3 스키마가 진실 — `fieldsSchema` 와 `ValuesOf` (ADR-0016 §4)

**저작자는 스키마만 쓴다. Content 인터페이스는 쓰지 않고 추론한다.** 손으로 쓴 인터페이스를 두면 진실이 둘이 되고, 실측 결과 `satisfies` 로 묶어도 잡히는 건 키 오타 하나뿐이었다 (ADR-0016 §4-1 의 폐기 기록).

```tsx
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

const menuSchema = {
  eyebrow: { type: 'text',     label: '섹션 라벨' },
  title:   { type: 'textarea', label: '섹션 타이틀', required: true },
  tone:    { type: 'select',   label: '톤', options: ['light', 'dark'], required: true },
  columns: { type: 'number',   label: '열 수', default: 3 },
  items:   { type: 'array',    label: '메뉴 항목', minItems: 1, maxItems: 6,
             itemSchema: {
               title: { type: 'text',  label: '제목', required: true },
               image: { type: 'image', label: '이미지' },
             } },
} as const satisfies FieldsSchema;      // ★ `as const` 필수

type MenuContent = ValuesOf<typeof menuSchema>;
// → { title: string; tone: 'light'|'dark'; eyebrow?: string; columns?: number;
//     items?: { id: string; fields: { title: string; image?: ImageValue } }[] }
```

- `required: true` → 키가 **필수**, 그 외 → **optional**. 그래서 optional Value 는 렌더러가 반드시 fallback 을 가져야 한다 (`?? ''`, `?.`) — `getFieldValue` 의 `if (!field) return ''` 방어막이 사라졌기 때문이다 (§6.4).
- `select` 는 `options` **리터럴 유니온**으로 좁혀진다. `number` 는 진짜 `number`. `array` 는 `itemSchema` 로 재귀.
- **스키마에 없는 키를 컴포넌트가 읽으면 컴파일 에러** — 이 방향엔 게이트가 필요 없다. 반대 방향(선언했는데 안 읽음)만 `template:verify` 가 잡는다 (§7.1).

**렌더 경계에서 캐스트 한 번**. 저장 경로가 이미 검증했으므로 재검증하지 않는다 (ADR-0016 §4-2, §6):

```tsx
const Menu: BlockComponent = function Menu({ block }: TemplateBlockProps) {
  const content = block.fields as MenuContent;   // 유일한 캐스트
  const label = content.eyebrow ?? '';
  const items = content.items ?? [];
  return <>{items.map(item => <li key={item.id}>{item.fields.title}</li>)}</>;
  //                                ↑ item.id — 인덱스 금지 (§10.4)
};
```

타입은 도메인에 산다 (`src/domain/entities/template.entity.ts`): `FieldsSchema` · `FieldDescriptor` · `ValuesOf` · `ImageValue` · `ArrayItem`. **도메인의 `Block.fields` 자체는 계속 loose (`Record<string, unknown>`)** — Block 은 문자열 `type` 으로 디스패치되므로 도메인은 어떤 Block 이 어떤 Value 모양인지 정적으로 알 수 없다. 타입은 컴포넌트 경계에서만 좁힌다.

### 2.3.1 Library entry — `src/templates/types.ts`

```ts
interface BlockComponentMeta {
  componentKey: string;                  // 라이브러리 키 ('hero', 'menu', 'story' …)
  category: string;                      // 'hero' | 'menu' | 'story' | 'footer' | …
  label: string;                         // 어드민 카탈로그용 표시명
  fieldsSchema: FieldsSchema;            // ★ 위에서 선언한 그 스키마 (단일 진실)
  previewImage?: string;
}

type BlockComponent = ComponentType<TemplateBlockProps> & { meta?: BlockComponentMeta };

interface TemplateLibraryEntry {
  Component: BlockComponent;
  meta: BlockComponentMeta;            // 항상 server-resolved
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
- **client 컴포넌트** (`'use client'`): meta 를 sibling `<Component>.meta.ts` 에 named export 로 정의 → `libEntry(Component, componentMeta)` 로 명시 전달. **스키마도 같이 옮긴다** — `.meta.ts` 에 선언하고 `.tsx` 가 그것을 import 해 `ValuesOf<typeof schema>` 를 만든다. 선언은 여전히 한 곳이다 (`cafe/default/library/Navigation.meta.ts` 참고).

### 2.4 `TemplateModule` (`src/templates/types.ts`)

```ts
interface TemplateModule {
  default: ComponentType<TemplateRendererProps>;  // 페이지 레벨 렌더러
  defaultContent: ContentModel;              // 시각 토큰 시드 (was defaultTemplateJson — ADR-0013 후속 정리)
  library: TemplateLibrary;
}
```

각 Template 의 `index.tsx` 가 이 셋을 export 해야 함.

### 2.5 `DesignTokens` — 풍부한 토큰 (ADR-0005)

`tokens.ts` 는 **두 layer** 로 구성:

```ts
// src/templates/cafe/default/tokens.ts
export const defaultGlobalStyles: GlobalStyles = { ... };  // 얇은 layer (사용자 편집)
export const designTokens: DesignTokens = { ... };                 // 풍부한 layer (코드 고정)
```

**얇은 layer (`GlobalStyles`)** — 에디터에서 사용자가 편집 가능한 6 개 필드:
`primaryColor`, `secondaryColor`, `backgroundColor`, `fontFamily`, `fontSize`, `layout`.
Site 생성 시 `content` 로 deep-copy 되므로 **여기를 고쳐도 기존 Site 에는 닿지 않는다.**

**풍부한 layer (`DesignTokens`)** — 코드 고정. 6 개 차원 (`colors`, `fonts`, `spacing`, `radius`, `shadows`, `typography`). 각 차원 entry 는 `--{dimension-singular}-{key}` CSS custom property 가 됨 (`colors.primary` → `--color-primary`).

**Overlay 규칙** — `src/lib/template/design-tokens.ts` 의 `OVERLAY_MAP` 이 얇은 layer 를 풍부한 layer 위에 덮음:

| 얇은 layer 필드 | 덮어쓰는 CSS var |
|---|---|
| `primaryColor` | `--color-primary` |
| `secondaryColor` | `--color-secondary` |
| `backgroundColor` | `--color-surface` |
| `fontFamily` | `--font-base` |
| `fontSize` | `--font-size` |

→ 사용자가 `primaryColor` 만 바꿔도 사이트 전역의 `var(--color-primary)` 참조가 즉시 propagate.

**배경색의 톤 형제는 파생시킬 것.** 유저가 `backgroundColor` 를 바꾸면 `--color-surface` 만 움직인다. 카드·테두리처럼 배경의 밝기 계단 위에 있는 토큰을 고정값으로 두면 배경만 어두워지고 카드는 밝은 채로 남아 **계층이 뒤집힌다.** `color-mix` 로 파생시켜 따라오게 한다:

```ts
surface:        '#F5F0E8',                                          // themable
'surface-dark': 'color-mix(in srgb, var(--color-surface) 94%, #000)', // 밝은 템플릿 → 검정 쪽
cream:          'color-mix(in srgb, var(--color-surface) 97%, #000)',
```

어두운 템플릿(fitness·interior·wedding)은 `#fff` 쪽으로 섞는다. 반대로 hero/footer 의 **역전 밴드**(`surface-dark` 가 자기 `on-dark` 글자색을 갖는 경우)는 배경 형제가 아니므로 고정값으로 둔다.

글자색(`ink`/`muted`/`dust`)은 파생 대상이 아니다 — 코드 소유이며 템플릿 기본 배경의 밝기에 맞춰져 있다. 유저가 명암을 뒤집으면 `BACKGROUND_POLARITY_FLIPPED` 경고가 에디터에 뜬다. **경고일 뿐 저장은 막지 않는다** (ADR-0015 규칙 4).

**적용 방법**: Template `index.tsx` 에서 site 렌더러(Single → `RenderSingleSite`, Multi → `RenderMultiSite`)에 `designTokens` prop 전달:

```tsx
<RenderSingleSite
  {...props}
  library={library}
  className={styles.themeRoot}
  designTokens={designTokens}   // ← root div 에 var 들이 inline style 로 주입됨
/>
```

**⚠️ `designTokens` 를 넘기는 순간, 같은 변수를 `.module.css` 에도 선언하면 그쪽은 죽은 코드다.** 렌더러는 `className` 과 inline `style` 을 **같은 엘리먼트**에 붙이는데(`renderSingleSite.tsx`: `<div className={className} style={rootStyle}>`), inline 이 class 를 이긴다. 따라서 `.themeRoot { --color-surface: … }` 는 `tokensToCssVars` 가 내보내는 `--color-surface` 에 영구히 가려진다.

읽히지 않을 뿐 아니라 **파생 공식을 두 곳에 유지해야 하는 함정**이 된다 — 한쪽만 고치면 아무 일도 안 일어나고, 왜 안 먹는지 찾느라 시간을 쓴다. rich 로 전환한 Template 의 `.module.css` 에는 **토큰 선언을 남기지 말고** 레이아웃·애니메이션 등 구조 CSS 만 둔다 (legacy `var(--theme-*, …)` fallback 도 마찬가지로 불필요 — `backgroundColor` 는 오버레이 맵으로 `--color-surface` 에 도달한다). 실제 예: `src/templates/cafe/default/cafe.module.css`.

아직 전환하지 않은 Template 은 반대다. `designTokens` 를 export 하지 않으므로 `tokensToCssVars`/`OVERLAY_MAP` 경로가 아예 돌지 않고, 유저 편집값은 **오직** page-level `--theme-*` 주입(`globalStylesToThemeVars`, `src/lib/template/design-tokens.ts`)으로만 도달한다. 그래서 legacy `.module.css` 는 `var(--theme-bg, #F5F0E8)` 형태의 fallback 을 반드시 유지해야 한다.

**컴포넌트 사용**: 인라인 hex 금지 (§6.3 ESLint 룰). `var(--color-primary)`, `var(--font-base)` 등 참조만 허용.

**현재 적용 상태** (ADR-0005) — **문서가 아니라 코드에서 확인한다**: `grep -l "export const designTokens" src/templates/*/*/tokens.ts` (맨 이름으로 grep 하면 미전환 Template 의 주석까지 걸린다). rich 패턴을 쓰는 Template 와 legacy `.module.css`(`--{prefix}-{name}`) Template 가 **의도적으로 공존**하며, 각 Template 가 다른 이유로 손볼 때 자연스럽게 옮겨간다. "전부 전환됨" 이 목표 상태가 아니다.

**신규 Template (스킬 저작) 은 무조건 rich 패턴** — 마이그 부담을 늘리지 않기 위해.

> 이 목록을 문서에 박아두면 반드시 낡는다. 2026-07-26 감사 시점에 이 절과 CLAUDE.md·CONTEXT.md·ADR-0005 가 모두 "cafe-default 만" 이라고 적고 있었으나 실제로는 네 개가 전환을 마친 상태였고, 그중 둘은 `.module.css` 를 아예 갖지 않는 완전 전환이었다.

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
├── tokens.ts                       # defaultGlobalStyles (+ designTokens 는 rich 패턴일 때, §2.5)
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
├── sections/                     # 보조 utility 만 (아이콘, title-parts) — Block component 아님
├── thumbnail.config.ts             # Playwright 캡처 설정
├── cafe.module.css                 # 이 Template 전용 CSS (다른 Template 와 공유 안 됨)
├── template.ts                     # ← 이 디렉터리의 Preset (= Source of Truth)
└── index.tsx                       # TemplateRenderer (RenderSingleSite/RenderMultiSite 위임), library/defaultContent export
```

### 3.1 β 모델의 핵심 약속 (ADR-0001)

- **Template 간 component / token / css 공유 = 0**. cafe-default 의 `HeroImage.tsx` 와 cafe-cozy 의 `HeroImage.tsx` 는 서로 다른 파일 (코드가 같아 보여도 별개).
- **DRY 위배는 의도된 설계**. cross-Template 추출 제안은 ADR-0001 을 근거로 거절.
- **`sections/` 폴더**는 이름만 남은 보조 아이콘/유틸 폴더다. 새 Block component는 무조건 `library/`에 둔다.

### 3.2 자동 등록

`src/templates/_generated.ts` 는 `scripts/generate-templates.mjs` 가 디렉터리 스캔으로 자동 생성. **수정 금지 (커밋은 함)**. `predev` / `prebuild` 훅으로 자동 갱신됨.

해당 파일은 4 개의 맵을 export:
- `templateMap` — `templateKey → () => Promise<TemplateModule>`
- `presetMap` — `templateKey → () => Promise<{ default: TemplatePreset }>`
- `presetSlugs` — `templateKey[]`
- `templateCategories` — `templateKey → category`

`loadTemplate(templateKey)` 헬퍼 (`src/templates/registry.ts`) 가 `templateMap` 을 wrapping. **Backward-compat shim**: bare legacy key (예: `'cafe'`) 가 들어오면 `${key}-default` 로 fallback (migration 015–017 이 user_sites 의 templateKey 를 슬러그 형태로 정렬한 뒤로는 사실상 잔존 보호막).

> **Single / Multi Site Type:** Single은 `blocks[]`의 optional `menu`로 앵커 메뉴를 만들고, Multi는 `chrome` + `pages[]`의 optional `menu`를 header/footer로 투영한다. `visible`, `Page.name`, `menu.label`은 서로 독립이다.

### 3.3 미래 구조 방향 (footnote, ADR-0001)

현재 `library/` 는 *과도기 아티팩트*. multi-page 는 **데이터 모델 차원**(ADR-0007 유니온)으로 이미 출시됐지만, 디렉터리를 `<templateDir>/pages/<page>/blocks/<Block>.tsx` 로 옮기는 **코드 구조 재편은 아직 미결**(ADR-0001 의 future direction) — `renderMultiSite` 는 평탄한 `library/` 를 그대로 쓴다. 그래서 글로서리 (CONTEXT.md) 에 "Library" 를 도메인 용어로 굳히지 않음.

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
    │  Single: content.blocks        Multi: chrome.header → active page.blocks → chrome.footer
    │  blocks.map((block) => library[block.type]); menu = deriveNav(source, hrefOf)
    │
    ▼
<Component block={block} />            // BlockComponent (nav/footer componentKey엔 navItems 주입)
```

핵심 규약:

1. **block.type ↔ componentKey 1:1 매칭**. 라이브러리에 없으면 console.warn + skip → 화면 빈칸.
2. **렌더 순서 = blocks 배열 순서**. `order` 필드는 schema 에서 제거됨 (migration 012).
3. **`block.visible === false` 면 skip**.
4. **클릭 콜백**: `onSectionClick` 이 있으면 wrapper `<div>` 가 stopPropagation + 호출 (어드민 / 에디터 인라인 선택용).

---

## 5. Preset → DB Sync 파이프라인 (ADR-0002)

`pnpm template:sync` ⇒ `scripts/sync-templates.ts` ⇒ `src/lib/template/sync.ts:syncTemplates`

### 5.1 단계별 흐름

```
1. _generated.ts 의 presetMap 순회
2. preset 1개에 대해:
   ├─ templateKey 결정 (preset.content.templateKey)
   ├─ templateMap[templateKey]() 로드 → TemplateModule (library 포함)
   ├─ content = preset.content  ← 유도 단계 없이 ContentModel 을 verbatim 사용 (composition 제거됨, ADR-0007)
   ├─ validateContent(content, { availableTemplateKeys, templateLibrary: templateModule.library })
   │     ↳ 에러 1개라도 있으면 SKIP (해당 preset 만)
   ├─ thumbnail 처리:
   │     md5 해시 기반 파일명 (template-<slug>-<hash>.webp)
   │     이미 storage 에 있으면 재사용, 아니면 업로드
   ├─ existing slug 비교:
   │     없음 → INSERT (status='active' — ADR-0012)
   │     있음 → JSON.stringify 비교, 변경 있으면 UPDATE
   │           (content / version / thumbnail_url / updated_at)
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

### 5.4 Template 삭제 파이프라인 — `template:delete` (sync 의 역방향)

`pnpm template:delete <templateKey>` ⇒ `scripts/delete-template.ts` ⇒ `src/lib/template/delete.ts:deleteTemplate`. **`new-template`/sync 의 대칭 짝** — dev-time 코드 제거 도구다. 런타임 admin 의 Archive/Delete (§8) 와 책임 분리: Archive 는 *운영자가 라이브 카탈로그에서 내리는* 결정, `template:delete` 는 *개발자가 코드베이스에서 Template 을 없애는* 작업.

**입력은 `templateKey` 하나.** Template 이 남기는 흔적(DB row / `template_assets/<key>/` / `template-thumbnails` 썸네일 / `public/thumbnails/template-<key>.webp` / `_generated.ts`)은 모두 key 로 유도되므로 preset 소스를 읽을 필요가 없다. 따라서 **소스는 선택** — 있으면 정상 삭제, 이미 지워졌으면(`rm` 후 남은 찌꺼기) orphan cleanup 으로 같은 도구가 처리한다.

```
1. buildDeletePlan(key) — 소스 dir 스캔 + findBySlug + user_sites count + storage list + code-ref 스캔
2. 가드 / 경고:
   ├─ EMPTY_MATCH          — 아무것도 안 걸리면 중단 (오타 방지)
   ├─ USER_SITES_REFERENCE — user_sites 가 참조하면 하드 블록 (--force 로만 우회)
   └─ code references(경고) — 삭제 소스를 import 하는 파일(예: 테스트) 목록. git rm 후 tsc 깨짐 → 함께 수정
3. dry-run 이면 plan 만 출력하고 종료 (기본값; --apply 로 실제 삭제)
4. --apply 순서 (전 단계 멱등, 중간 실패 시 재실행 수렴):
   ├─ DELETE db row        ← ON DELETE RESTRICT 가 최종 게이트. 되돌릴 수 있는 관문을 먼저
   ├─ template_assets/<key>/ prefix 삭제   ← 여기부터 되돌릴 수 없음(뒤로 배치)
   ├─ template-thumbnails/thumbnails/template-<key>-<md5>.(webp|png) 삭제
   ├─ public/thumbnails/template-<key>.webp 삭제 (워킹트리)
   └─ generate:templates 재생성 (+ template_sync_audit 에 summary.action='delete' 기록)
5. 소스가 남아있으면 "git rm -r src/templates/<cat>/<leaf>" 안내 — 소스 삭제는 사람/git 책임
6. (스킬) git rm + generate:templates 후 pnpm tsc --noEmit — 붕 뜬 import 를 로컬에서 잡아 고침(CI 아님)
```

**핵심 제약 (하드 블록의 이유)**: UserSite 는 데이터만 복사하고 렌더러 **코드는 serve-time 에 `templateKey` 로 로드**한다(`loadTemplate`). 그래서 user_sites 가 참조하는 Template 의 코드를 지우면 라이브 사이트가 전부 500. DB 의 `user_sites.template_id ON DELETE RESTRICT`(migration 001) 가 row 삭제를 막고, CLI 는 그 전에 count 로 선제 차단한다. 실제 유저가 쓰는 Template 을 내리는 건 삭제가 아니라 **Archive(§8)** 의 영역.

자연어로 의뢰하면(`"landing 템플릿 삭제해줘"`) **`delete-template` 스킬**(`.claude/skills/delete-template/`)이 dry-run→확인→`--apply`→`git rm` 스테이징→regen 까지 수행하고, diff 검토·commit 은 사람에게 남긴다.

---

## 6. Validate 규칙 카탈로그

`src/lib/template/validate.ts` — `validateContent(json, options)`. **Site-content 유효성의 단일 소스.** sync 전, `pnpm test`, 어드민 Save, 그리고 **에디터 저장 경로**에서 모두 호출 (#56). 도메인 유스케이스는 `SiteContentValidator` 포트(`src/domain/usecases/ports/site-content-validator.port.ts`)를 통해 호출하고, `LibraryAwareSiteContentValidator`(`src/lib/template/site-content-validator.ts`) 어댑터가 `templateKey` 로 라이브러리를 로드해 이 함수에 위임한다. errors 가 하나라도 있으면 `TemplateError('INVALID_TEMPLATE_JSON')` 로 저장 거부.

옵션:

```ts
{
  availableTemplateKeys?: string[];   // 있으면 templateKey 검증
  templateLibrary?: TemplateLibrary;   // 있으면 fieldsSchema 깊은 검증
}
```

**블로킹 기준은 ADR-0015 규칙 4 다: 저장을 막는 건 "그 모양이면 렌더러가 깨질 때" 뿐이다.** ADR-0016 이후 렌더러는 `block.fields` 를 재검증 없이 캐스팅하므로 *모양* 이 틀리면 실제로 터진다(문자열에 `.map`, `undefined` 에 `.url`). 반면 모양은 맞는데 내용이 이상한 건 — 범위를 벗어난 숫자, 옵션 밖 select, hex 아닌 색 — 경고다. 하나를 막으면 같은 `ContentModel` 안의 **다른 모든 편집이 인질**이 되기 때문이다. 이 기준 때문에 여러 규칙이 에러 → 경고로 강등됐다.

### 6.1 Errors (블로킹)

| Code | 조건 |
|---|---|
| `UNKNOWN_TEMPLATE_KEY` | `templateKey` 가 `availableTemplateKeys` 에 없음 |
| `UNKNOWN_MODE` | `mode` 가 `'single'`/`'multi'` 가 아님 |
| `BLOCKS_EMPTY` / `PAGES_EMPTY` | Single 의 `blocks` / Multi 의 `pages` 가 비었음 |
| `MISSING_GLOBAL_STYLES` | `globalStyles` 누락 |
| `MISSING_PAGE_SLUG` / `DUPLICATE_PAGE_SLUG` | page.slug 누락 / 중복 |
| `MISSING_PAGE_NAME` | Multi Page의 `name` 누락 |
| `DUPLICATE_BLOCK_ID` | block.id가 콘텐츠 전체에서 중복 |
| `INVALID_MENU` / `INVALID_MENU_LABEL` / `INVALID_MENU_PLACEMENT` | optional menu 모양이 잘못됨 |
| `SINGLE_MENU_PLACEMENT_UNSUPPORTED` | Single menu에 placement가 저장됨 |
| `UNKNOWN_COMPONENT_KEY` | `templateLibrary` 옵션 + `block.type` 이 라이브러리에 없음 |
| `MISSING_REQUIRED_FIELD` | `required: true` 인데 키가 없거나 `null` |
| `FIELD_VALUE_TYPE_MISMATCH` | Value 모양이 descriptor 와 불일치 (text 에 객체, number 에 `NaN`, image 에 `url` 없음, array 아님 …) |
| `INVALID_ASSET_ID` | `image` 의 `assetId` 가 UUID 문자열이 아님 — `asset_usages.asset_id`(uuid) 로 복사되므로 RPC 가 터진다 |
| `MISSING_ITEM_SCHEMA` | `type:'array'` 인데 `itemSchema` 없음 (런타임 가드; 타입 레벨에선 이미 필수) |
| `ARRAY_ITEM_MALFORMED` | 배열 아이템이 `{ id, fields }` 가 아님 |
| `ARRAY_ITEM_ID_MISSING` / `ARRAY_ITEM_ID_DUPLICATE` | 아이템 `id` 누락 / 같은 배열 안 중복 — React 재조정과 asset slot_key 를 깨뜨림 (ADR-0016 §4-4) |

### 6.2 Warnings (통과하지만 stderr)

| Code | 조건 |
|---|---|
| `INVALID_COLOR` | globalStyles 의 primary/secondary 누락 |
| `NON_HEX_COLOR` | globalStyles 의 primary/secondary/background 가 hex 아님 |
| `BACKGROUND_POLARITY_FLIPPED` | 사용자 배경이 템플릿 기본값의 명암을 뒤집음 — 글자색은 따라오지 않는다 (§2.5) |
| `INVALID_FONT_SIZE` / `UNKNOWN_LAYOUT` | CSS length 아님 / 레이아웃 화이트리스트 밖. **`layout` 은 어떤 렌더러도 읽지 않는다** |
| `INVALID_COLOR_FIELD` | `type:'color'` 필드가 hex 아님 — 색 입력은 자유 텍스트라 `#`, `#a` 같은 중간 타이핑 상태가 매번 지나간다 |
| `SELECT_VALUE_NOT_IN_OPTIONS` | select Value 가 `options` 밖 — 렌더러는 기본 분기로 떨어진다. 도달 경로는 배포된 스키마의 옵션 축소이고 그건 §6.4 가 막는다 |
| `ARRAY_ITEMS_BELOW_MIN` / `ARRAY_ITEMS_ABOVE_MAX` | 에디터 add/remove 로 도달 가능하고 렌더러는 짧거나 긴 목록을 그릴 뿐 |
| `NULL_FIELD_VALUE` | optional 키가 `null` — 키를 빼는 게 맞다 (`ValuesOf` 는 `T \| undefined` 지 `T \| null` 이 아니다) |
| `UNKNOWN_DATA_FIELD` | `fields` 에 스키마에 없는 키 (필드명 변경·삭제로 고아가 된 데이터) |
| `INSECURE_URL` | `image`/`url` 필드가 `http://` (mixed-content) |

> **라이브러리 없이 호출하면 필드는 아예 검증되지 않는다.** Value 는 자기 `type` 을 안 들고 다니므로 비교 대상이 없다. 저장 경로(`LibraryAwareSiteContentValidator`)·sync·`template:verify` 는 항상 라이브러리를 넘긴다 — 구조만 보는 단독 호출부만 넘기지 않는다.

### 6.3 Token enforcement (인라인 색·폰트 차단)

Block component 는 모든 시각 토큰을 `var(--*)` (또는 같은 CSS 변수로 풀리는 Tailwind arbitrary value) 로 참조해야 한다 — 이게 사용자의 `globalStyles` 오버라이드가 사이트 전역으로 전파되는 유일한 통로이기 때문 (ADR-0005). 인라인 hex/rgb/hsl 색 리터럴이나 `font-family` 문자열은 그 메커니즘을 우회한다.

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

### 6.4 배포된 Template 의 스키마 호환성 규칙 (ADR-0016 §6)

렌더러는 `block.fields` 를 **검증 없이** 추론 타입으로 캐스팅한다 — "파싱은 경계에서 한 번". 이 신뢰는 공짜가 아니다. 컴파일 타임이 보장하는 건 **코드 안에서** 스키마와 렌더러가 합치한다는 것뿐이고, **이미 DB 에 저장된 Value 가 새 스키마와 맞는지는 아무도 보장하지 않는다.** 게다가 `getFieldValue` 가 `if (!field) return ''` 로 메워주던 누락 필드 방어막도 없다.

그래서 **배포된 Template 의 스키마 변경은 기본적으로 additive 여야 한다.** 렌더러 코드는 serve-time 에 로드되므로 스키마 한 줄 수정이 곧 전 사이트 수정이다 (CLAUDE.md "What a Template edit does and does not reach").

| 변경 | 판정 | 조건 |
|---|---|---|
| optional 필드 추가 | ✅ 허용 | 렌더러가 fallback (`?? ''`) 을 둔다 |
| `label` 변경 · `required` 완화 · `select options` **확장** | ✅ 허용 | Value 모양 불변 |
| 필드명 변경 | ⛔ 파괴적 | 옛 Value 는 `UNKNOWN_DATA_FIELD` 로 고아가 되고 새 키는 비어 있다 |
| 필수 필드 추가 | ⛔ 파괴적 | 기존 행이 전부 `MISSING_REQUIRED_FIELD` |
| 값 타입 변경 (`text`→`number` 등) | ⛔ 파괴적 | |
| `select options` **축소** | ⛔ 파괴적 | 기존 Value 가 유니온 밖으로 나감 |
| 배열 `itemSchema` 구조 변경 | ⛔ 파괴적 | |

**파괴적 변경을 하려면** `templates.content` + `user_sites.content` + `user_sites.snapshot` 세 컬럼을 **함께** 마이그레이션하고, 전 행을 새 라이브러리로 검증해 통과한 뒤에만 배포한다 (ADR-0016 §8-1 절차; 본보기는 migration 026 — `scripts/lib/migrate-field-to-value.ts` 의 plan→전수검증→단일 트랜잭션 패턴).

`componentKey` 는 이 표의 바깥에 있다 — **어떤 경우에도 변경 금지**다 (§10.2). 깨는 변경이 필요하면 새 leaf 디렉터리로 fork 한다.

> **CI 게이트로 강제된다.** `pnpm schema:manifest` 가 전 Template 의 `componentKey → fieldsSchema` 를 정규화해 `src/templates/_schema-manifest.json` 으로 기록한다. CI 는 (1) 현재 라이브러리와 커밋된 manifest 의 freshness, (2) PR base manifest 와 현재 manifest 의 하위 호환성을 각각 검사한다. 파괴적 변경은 실패하며, 의도적 변경은 같은 PR 에 새 `docs/migrations/<name>.sql` + `<name>.md` 쌍이 있어야 통과한다. 이 쌍은 리뷰 증거일 뿐 SQL 의 정확성을 증명하지 않으므로 세 컬럼 전수 변환·검증 책임은 그대로다.

---

## 7. CLI / 명령 한 장 요약

명령 목록 자체는 `CLAUDE.md` 에도 있다. 여기 있는 이유는 **플래그와 변형**이고, 그건 이 문서에만 있다.

```bash
# Template 저작 (new-template 스킬이 검증 루프에서 사용)
pnpm template:verify <templateKey>                # 통합 게이트(tsc/eslint/validate/schema↔jsx/capture)
pnpm template:verify <templateKey> --skip-capture # 느린 썸네일 단계만 생략
pnpm template:image <templateKey> "<query>" [wide|square|portrait]  # 스톡 이미지 fetch+호스팅 → URL 출력
pnpm schema:manifest                              # fieldsSchema 스냅샷 갱신(스키마 수정 PR에 커밋)
pnpm schema:manifest:check                        # 현재 라이브러리와 snapshot freshness 검사

# 썸네일 캡처 (Playwright + sharp + pixelmatch)
pnpm template:capture             # 모든 Template 일괄
pnpm template:capture <slug>      # 특정 Template (templateKey)
pnpm template:capture --check     # CI 용 — 차이 있으면 exit 1, 파일은 안 씀

# DB 동기화 (ADR-0002)
pnpm template:sync                # default = dry-run, diff만
pnpm template:sync --apply        # 5초 카운트다운 후 실제 적용
pnpm template:sync --apply --yes  # 카운트다운 우회 (CI)
pnpm template:sync <slug-or-prefix>

# Template 삭제 (sync 의 역방향, §5.4 — delete-template 스킬이 감싼다)
pnpm template:delete <templateKey>            # default = dry-run, 삭제 계획만
pnpm template:delete <templateKey> --apply    # DB row + storage + public + _generated 정리
pnpm template:delete <templateKey> --apply --force  # user_sites 하드 블록 우회 (라이브 사이트 깨질 각오)

# Template 디렉터리 스캐폴드 (게이트를 통과하는 Single 골격 — 새 컨셉/카테고리용)
pnpm template:scaffold <category>/<leaf>      # 예: bakery/default → templateKey "bakery-default"
pnpm template:scaffold <category> <leaf>      # 같은 것 (공백 구분도 허용)

# CI 게이트 (전 Template, capture 생략)
pnpm template:verify:ci
pnpm schema:manifest:check --base origin/main     # CI의 PR-base 호환성 검사와 동일
```

### 7.1 Template 저작 흐름 (`new-template` 스킬)

새 Template 은 **`new-template` Claude Code 스킬**(`.claude/skills/new-template/`)로 만든다. 명령어를 외우지 않고 자연어로 의뢰하면("아웃도어 브랜드 멀티페이지로 만들어줘") 스킬이 발동해 아래를 수행:

```
brief(자연어) ──▶ Site Type 결정 (Single/Multi 모두 content `ContentModel` 유니온 직접 작성)
             ──▶ 디렉터리: 가까운 Template 복제(변형) 또는 template:scaffold(새 컨셉)
             ──▶ 파일 작성: 스키마 선언 → ValuesOf 추론 → Value 모양 preset (rich 토큰; gotchas-checklist 준수)
             ──▶ 이미지: pnpm template:image <key> "<query>"
             ──▶ 검증 루프(아래) — 깨지면 self-fix 후 재실행
             ──▶ 썸네일 육안 / /preview/preset/<key> → pnpm template:sync (dry-run) → PR
```

생성 결과: `src/templates/<category>/<leaf>/` 안에 `tokens.ts`, `template.ts`, `thumbnail.config.ts`, `index.tsx`, `library/index.ts`, `library/<Block>.tsx`(N 개). `pnpm generate:templates` 로 `_generated.ts` 갱신 → `/preview/preset/<templateKey>` 미리보기.

**저작 부담은 ADR-0016 으로 오히려 줄었다** — 작성자는 `fieldsSchema` 하나만 쓰고 Content 타입은 `ValuesOf` 가 만든다(§2.3). preset 의 `fields` 는 Value 를 그대로 적는다: `title: '…'`, `image: { url: '…' }`, `items: [{ id, fields }]`. `{ type, label, value }` 래퍼를 적으면 `FIELD_VALUE_TYPE_MISMATCH` 로 게이트가 막는다.

`pnpm template:scaffold <category>/<leaf>` 는 **게이트를 그대로 통과하는 Single 골격**을 쓴다 — hero(풀 뷰포트 + image Value) · features(`array` + `item.id`) · footer, rich 토큰, `.module.css` 없음. 배선이 아니라 디자인부터 손대라는 뜻이다. 새 category 면 i18n 라벨 키 추가를 화면에 상기시킨다.

> **프리뷰 렌더 검증은 capture 로만 가능하다 — `curl` 로는 안 된다.** `TemplateClientWrapper` 가 `loadTemplate()` 를 `useEffect` 안에서 동적 import 하므로 SSR HTML 에는 직렬화된 props JSON 만 들어가고 섹션 DOM 은 없다. `curl /preview/preset/<key>` 결과에 섹션이 안 보이는 건 렌더 실패가 아니라 **의도된 동작**이다. 실제 렌더/레이아웃 확인은 Playwright capture 또는 브라우저로 한다.

**검증 게이트 — `pnpm template:verify <key>`** (`scripts/lib/validate-and-capture.ts`): **7 단계.** (1) `tsc --noEmit` — 글로벌 실행 후 template dir 관련 에러만 필터; (2) `eslint <templateRoot>` — §6.3 토큰 룰 포함; (3) `validateContent` — `preset.content`(ContentModel)를 **라이브러리와 함께** 검증(§6); (4) `validateTemplateFiles` — §6.3 file-level 인라인 색·폰트 스캔; (5) **fieldsSchema ↔ JSX 일관성** — 스키마가 선언한 모든 필드를 컴포넌트가 실제로 읽는지 확인 (`content.key` / `item.fields.key` / 계산 키; 브레이스 밸런스 파서). 반대 방향(선언 안 된 키를 읽음)은 `ValuesOf<typeof schema>` 덕분에 **컴파일 에러**라 게이트가 필요 없다; (6) `pnpm template:capture <templateKey>` — Playwright Chromium 썸네일 webp; (7) `thumbnailPath` ↔ 실제 파일 존재·확장자 일치 확인(§10.1). (1)–(5), (7)은 실패 즉시 halt 한다. (6)의 실행 실패 자체는 soft-fail이지만 (7)이 실제 파일을 요구하므로 새 Template은 결국 캡처 산출물 없이는 통과하지 못한다. `--skip-capture` 로 (6) 만 건너뛰는 게 저작 중 빠른 루프다 — 단 (7) 이 아직 썸네일 없다고 실패하므로 마지막엔 캡처를 포함해 한 번 돌려야 green 이 된다. 스킬은 깨진 단계를 고치고 green 까지 재실행한다.

> (5) 는 **한 방향만** 본다: "선언했는데 아무도 안 읽는 필드" = 에디터에 뜨지만 아무것도 안 바꾸는 입력칸. 예전 검사는 `getFieldValue(...)` 호출 수를 `fieldsSchema: {` 리터럴과 대조했는데, ADR-0016 이후 **양쪽 다 0 건**이라 모든 파일을 skip 한 채 초록을 보고했다 — 죽은 게이트였다. #136 에서 재작성. 배포된 스키마의 파괴적 변경은 이 게이트가 아니라 별도의 schema manifest base 비교가 막는다(§6.4).
> `template:verify` 는 템플릿 모듈을 동적 import 하므로 첫 줄에서 `./lib/register-css-stub` 를 로드해 `.module.css` import 가 tsx 에서 깨지지 않게 한다 (sync 와 동일).

**New-category 규칙**: 새 category slug 은 `^[a-z][a-z0-9-]{0,39}$` 를 만족해야 하고, 기존 디렉터리에 없는 새 top-level category 는 구조 변경이므로 사람의 명시적 승인 후 만든다. 판정은 정확 일치만 — `cafe-studio` 는 `cafe` 의 변형이 아니라 새 category 다.

> `template:scaffold` 는 category/leaf 모두에 같은 slug 정규식을 적용하고, 새 top-level category 면 i18n 라벨과 사람 승인이 필요하다고 출력한다. `new-template` 스킬도 승인 단계를 명시한다. 단, 승인은 사람의 판단이므로 CLI 가 자동으로 증명하거나 우회 불가능하게 막는 종류의 게이트는 아니다.

### 7.2 이미지 호스팅 헬퍼 (Issue #15)

`scripts/lib/image-fetch.ts` 의 `fetchAndHostImage({ query, templateKey, aspectRatio?, role? })` — `fieldsSchema` 의 `type: 'image'` 필드를 채울 때 사용. **`pnpm template:image <templateKey> "<query>" [aspect]`** CLI 래퍼(`scripts/host-image.ts`)로 호출하면 query 만 정하고 fetch + host + URL 출력을 헬퍼가 처리한다.

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
4. **데이터 손보기** — `template.ts` (`content`) 의 각 section `fields` **Value** 를 새 컨셉에 맞게 (§2.1).
5. **(필요 시) library 컴포넌트 수정** — β 모델: 이 Template 의 라이브러리는 이 Template 만 씀. 마음대로 손봐도 다른 Template 안 깨짐. **단 복제원(cafe-default)의 스키마를 고치는 건 그쪽 배포본을 건드리는 것**이니 §6.4 를 따른다.
6. **`pnpm generate:templates`** — `_generated.ts` 자동 갱신 (predev / prebuild 에서도 자동).
7. **`pnpm template:verify cafe-sunlit`** — 7 단계 게이트 + 썸네일 캡처를 한 번에 (§7.1).
8. **`pnpm test`** — 템플릿 디렉터리 밖을 건드렸을 때만. (tsc/lint 는 7 번이 이미 커버)
9. **`pnpm template:sync`** dry-run → PR 머지 (= 공개 승인, ADR-0012).

### B. Claude Code 로 Template 통째로 생성 (`new-template` 스킬, ADR-0002 의 짝)

Claude Code 에 자연어로 의뢰하면 `new-template` 스킬이 발동한다 (dev-time; 사용자 기능 아님):

```
"동네 빵집 — 따뜻한 톤, 갓 구운 빵 강조 한 페이지 사이트 만들어줘"
"아웃도어 브랜드, 홈/스토리/제품/매장 페이지 멀티페이지로 만들어줘"
```

→ Site Type 결정 → `src/templates/<category>/<leaf>/` 에 골격 파일 작성 → §7.1 검증 게이트(`pnpm template:verify`)를 green 까지 self-fix → 이후 시나리오 A 의 7~9 번부터.

신규 Category 는 §7.1 의 슬러그 가드 + 사람 승인을 거친다.

### C. 기존 Template 에 새 Block component 추가

`src/templates/cafe/default/library/HeroParallax.tsx` 신규:

```tsx
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';
import { TemplateBlockProps, BlockComponent } from '../../../types';

const heroParallaxSchema = {
  title:    { type: 'text',     label: '타이틀',     required: true },
  image:    { type: 'image',    label: '배경 이미지', required: true },
  subtitle: { type: 'textarea', label: '설명' },
} as const satisfies FieldsSchema;

type HeroParallaxContent = ValuesOf<typeof heroParallaxSchema>;

const HeroParallax: BlockComponent = function HeroParallax({ block }: TemplateBlockProps) {
  const content = block.fields as HeroParallaxContent;   // 경계에서 한 번만 캐스트
  const subtitle = content.subtitle ?? '';                 // optional → 반드시 fallback
  // ... 렌더 로직 — 색·폰트는 var(--color-primary), var(--font-base) 만 (§6.3)
  //     content.title / content.image.url 은 required 라 그대로 읽으면 된다
};

HeroParallax.meta = {
  componentKey: 'hero-parallax',         // ★ 라이브러리 키 — 영원히 고정
  category: 'hero',
  label: 'Hero (Parallax)',
  fieldsSchema: heroParallaxSchema,      // 스키마는 한 곳에만 산다
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

preset의 `content.blocks`에서 사용 — `{ id: 'hero-1', type: 'hero-parallax', visible: true, menu: { label: 'Hero' }, fields: { title: '…', image: { url: '…' } } }`. `pnpm template:verify <key>` → `pnpm template:sync`.

**주의**: ADR-0001 — 이 컴포넌트는 cafe-default 전용이다. cafe-cozy 에도 같은 게 필요하면 *복제*. cross-Template 추출 금지.

### D. 새 Category 통째로 추가

1. **`pnpm template:scaffold <category>/<leaf>`** (`<leaf>` = `default` 권장 — 첫 번째 Template). §3 골격을 게이트 통과 상태로 써 준다. 신규 Template 은 rich 토큰 패턴이므로 `.module.css` 는 만들지 않는다(§2.5).
2. **i18n 라벨 추가** — `src/lib/i18n/messages/ko.ts` **와** `en.ts` 의 `templatesCatalog.categoryLabels` 에 **소문자** 키 (§2.6). 빠뜨리면 카탈로그에 raw slug 가 뜬다.
3. `tokens.ts` / 컴포넌트 / `template.ts` 의 TODO 를 실제 컨셉으로 교체.
4. 이후 시나리오 A 의 6~9 번부터.

새 top-level Category 는 구조 변경이라 사람의 명시적 승인을 먼저 받는다 (§7.1). 대안: `new-template` 스킬에 brief 만 던지면 Category 판단 + 스캐폴드 + 검증 루프까지 한 번에 (시나리오 B).

### E. `fieldsSchema` 에 `required` 추가/변경

**먼저 §6.4 를 본다** — 배포된 Template 에 `required` 를 *추가*하는 건 파괴적 변경이다. 코드 preset 은 같은 PR 에서 채우면 되지만(`MISSING_REQUIRED_FIELD` 로 sync 가 막아준다), **sync 는 `user_sites` 를 건드리지 않으므로** 이미 존재하는 Site 들은 그 키 없이 남고 저장할 때마다 블로킹 에러를 맞는다. 데이터 마이그레이션을 동반하거나, optional + 렌더러 fallback 으로 두거나 둘 중 하나다.

`required` 를 *완화*하는 방향은 언제나 안전하다. 반대로 optional 필드를 추가할 땐 렌더러가 `?? ''` fallback 을 갖는 게 조건이다 — `ValuesOf` 가 optional 로 추론하므로 안 두면 컴파일이 막아준다.

### F. Validate 룰 추가

`src/lib/template/validate.ts` 에 새 `err(...)` / `warn(...)` 호출 추가 → `__tests__/validate.test.ts` 에 케이스 추가. error 추가는 기존 preset 이 모두 통과하는지 먼저 dry-run 확인.

### G. 반복 항목을 위한 `array` 필드 추가

메뉴, 공지사항, 리뷰 등 반복되는 데이터는 `type: 'array'` 를 사용.
1. **스키마 정의**: `itemSchema` 필수. `minItems` / `maxItems` 로 제약 가능(위반은 경고, §6.2).
   ```ts
   items: {
     type: 'array',
     label: '메뉴 항목',
     minItems: 1,
     itemSchema: {
       title: { type: 'text', label: '제목', required: true },
       price: { type: 'text', label: '가격' },
     },
   }
   ```
2. **Preset 데이터**: `items: [{ id: 'menu-1', fields: { title: '…', price: '…' } }, …]`. **`id` 는 `fields` 의 형제**이고 같은 배열 안에서 unique 하면 된다(전역 unique 아님). 에디터의 "항목 추가" 는 `crypto.randomUUID()` 로 만든다. 누락·중복은 블로킹 (§6.1).
3. **컴포넌트 렌더**: `(content.items ?? []).map(item => …)`. 값은 `item.fields.title`, React key 는 **`item.id`** (인덱스 금지 — ADR-0016 §4-4). 인덱스는 재정렬 후 다른 아이템을 가리키고, asset slot_key 도 이 id 로 인코딩된다.
4. **인덱스로 스타일 주지 말 것** — `idx === 0` 으로 카드를 넓히면 사용자가 순서를 바꿔도 디자인이 '슬롯'에 남는다. 항목에 종속된 디자인은 `itemSchema` 에 `select` 필드로 (§10.14).

### H. 새 페이지 추가 (Multi)

Multi Template은 `pages[]`에 `{ id, slug, visible, name, menu?, blocks:[...] }`를 추가한다. `menu` 생략은 어느 메뉴에도 없음, `{label}`은 header, `{label, placement:'footer'}`는 footer다. `name`은 메뉴 라벨과 독립이며 `slug`는 unique여야 한다. 공개 경로는 `/site/[domain]/[[...slug]]`다.

---

## 10. 자주 빠지는 함정

1. **`thumbnailPath` 와 `thumbnail.config.ts:output` 확장자 mismatch**
   `.webp`/`.jpg` 어긋나면 sync 가 옛 파일을 업로드하거나 로컬 경로 문자열을 그대로 DB 에 박는다. 두 곳을 항상 일치.

2. **`componentKey` 변경 = 사용자 사이트 깨짐**
   `user_sites.content` 의 `block.type` 이 매칭 안 되면 site 렌더러(`renderSingleSite`/`renderMultiSite`)가 console.warn + skip → 화면 빈칸. componentKey 는 **영원히** 변경 금지. 새 컴포넌트는 새 key 로.

3. **`fields` 는 Value 다 — `{type,label,value}` 래퍼가 아니다** ⚠️
   가장 흔한 회귀. `title: 'MONO'`, `columns: 3`, `image: { url: '…' }`, `items: [{ id, fields }]`. `number` 는 진짜 숫자라 `Number(...)` 변환이 필요 없다. 래퍼를 적으면 `FIELD_VALUE_TYPE_MISMATCH` 로 게이트가 막는다 (§2.1, ADR-0016 §4).

4. **items 의 React key 는 `item.id`** (Array Field)
   각 아이템은 `{ id, fields }` 이고 `id` 는 콘텐츠에 **영구 저장**된다. 인덱스를 key 로 쓰면 재정렬 시 React 가 엉뚱한 카드를 재사용한다. 구 `_key` 주입/제거(`injectKeys`/`stripKeys`, `src/lib/template/keys.ts`)는 **삭제됐다** — 안정적 식별자가 없어 가짜 Field 를 심었다 빼던 우회로였다 (ADR-0016 §4-4).

5. **Lazy Migration & Graceful Fallback**
   optional Value 는 언제든 없을 수 있다 — 그 필드가 생기기 전에 만들어진 Site 는 키 자체를 안 들고 있고, `getFieldValue` 의 `if (!field) return ''` 방어막은 사라졌다. `content.items ?? []`, `content.image?.url`, `content.subtitle ?? ''`. `required` 가 아닌 키는 `ValuesOf` 가 optional 로 추론하므로 fallback 을 빠뜨리면 대개 컴파일이 막아준다 — **`?? ''` 를 붙이는 게 관례가 아니라 §6.4 호환성 규칙의 전제다.**

6. **`required: true` 를 fieldsSchema 에 안 적으면 silent**
   필수 필드를 빠뜨려도 sync 통과하고 런타임에 빈 값. `fieldsSchema` 에 명시할 것.

7. **`templateKey` 누락 / legacy 'cafe' → backward-compat shim**
   `loadTemplate('cafe')` 가 들어오면 `'cafe-default'` 로 fallback (`registry.ts`). 의도된 동작 — migration 015 / 016 / 017 이 user_sites 의 templateKey 를 슬러그 형태로 정렬한 뒤로는 잔존 보호막. 디버깅 시간 낭비 흔함.

8. **`editable: false` 는 UI 만 숨김**
   서버 가드 없음. 사용자가 JSON 직접 수정하면 변경 가능 — 진짜 잠금이 필요하면 use case 레이어에 추가해야 함.

9. **Sync 는 user_sites 를 안 건드린다**
   `templates` 만 update. 이미 발행된 UserSite 는 옛 데이터 그대로. 강제 마이그가 필요하면 별도 SQL (참고: 012 / 015 / 016 / 017, 그리고 Single→union 백필 **018**(`user_sites`) / **019**(`templates`)).

10. **`_generated.ts` 수정 금지**
    수동 편집해도 다음 `predev` / `prebuild` 에서 덮어씀. 새 Template 추가는 디렉터리 / 파일만 만들면 됨.

11. **`globalStyles` 는 `content` 안에 산다**
    `globalStyles` 는 이제 `preset.content.globalStyles` 로 콘텐츠 유니온 안에 직접 들어간다(별도 `preset.globalStyles` 필드 없음 — composition 제거와 함께 사라짐). 저작 시 `tokens.ts` 의 `defaultGlobalStyles`(얇은 layer)를 시드로 복사해 넣고, 풍부한 토큰은 `designTokens` 로 코드 고정(ADR-0005, §2.5).

12. **`'use client'` 컴포넌트의 `Component.meta = {...}` 는 서버에서 안 보임** ⚠️
    Next.js 는 `'use client'` 모듈을 server-side import 시 client reference 로 wrapping 하고 모듈 본문을 서버에서 실행하지 않는다. 그래서 `.tsx` 파일 끝에서 한 `Component.meta = {...}` side-effect 는 server 에는 보이지 않고 → `library['nav'].meta` 가 undefined → sync / validate 시 `Cannot read properties of undefined (reading 'fieldsSchema')` 폭발.
    **해법**: client 컴포넌트의 meta 는 항상 sibling `<Component>.meta.ts` 에 named export 로 정의하고, `library/index.ts` 에서 `libEntry(Component, componentMeta)` 로 명시 전달. server 컴포넌트는 종전대로 `.meta = {...}` 그대로 OK.

13. **Capture 는 dev server 를 띄움**
    `thumbnail.config.ts` 의 `source` 가 `preview://` 로 시작하면 `capture-templates.ts` 가 자동으로 `pnpm dev` 를 백그라운드로 실행. 서버 없이 캡처하려면 `source` 에 `file://` URL 을 직접 준다.

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
| `ContentModel` / `Block` 타입 + **`FieldsSchema` / `FieldDescriptor` / `ValuesOf` / `ImageValue` / `ArrayItem`** (ADR-0013 / ADR-0016) | `src/domain/entities/template.entity.ts` |
| `TemplatePreset` / `BlockComponent` / `BlockComponentMeta` / `TemplateModule` / `DesignTokens` / `NavBlockProps` 타입 | `src/templates/types.ts` (`PresetSection`/`composition` 은 ADR-0007 때, 구 `Field` union/`getFieldValue`/`keys.ts` 는 ADR-0016 때 제거됨) |
| 자동생성 레지스트리 | `src/templates/_generated.ts` (커밋, 수정 금지) |
| 동적 import 헬퍼 | `src/templates/registry.ts` (`loadTemplate(templateKey)` + legacy shim) |
| Site 렌더러 (mode 별) | `src/templates/renderSingleSite.tsx` · `src/templates/renderMultiSite.tsx` |
| Template 1 개 reference | `src/templates/cafe/default/` (rich design tokens 적용 demo), `src/templates/corporate/default/` (가장 단순) |
| Validate 규칙 | `src/lib/template/validate.ts` (+ `__tests__/validate.test.ts`) |
| Inline-tokens 스캐너 | `src/lib/template/inline-tokens.ts` |
| Design tokens overlay | `src/lib/template/design-tokens.ts` (`tokensToCssVars`, `OVERLAY_MAP`) |
| Sync 코어 로직 (preset.`content` 을 `content` 컬럼에 verbatim upsert) | `src/lib/template/sync.ts` (+ `__tests__/sync.test.ts`) |
| Delete 코어 로직 (key 로 DB/storage/public/generated 정리, §5.4) | `src/lib/template/delete.ts` |
| Template assets 업로드 헬퍼 | `src/lib/template/template-assets.ts` |
| Codegen 스크립트 | `scripts/generate-templates.mjs` |
| Template 저작 스킬 | `.claude/skills/new-template/` (`SKILL.md` + `gotchas-checklist.md`) |
| Template 삭제 스킬 | `.claude/skills/delete-template/` (`SKILL.md`) |
| Sync CLI | `scripts/sync-templates.ts` |
| Delete CLI | `scripts/delete-template.ts` (`pnpm template:delete`) |
| Verify CLI (통합 게이트) | `scripts/verify-template.ts` (`pnpm template:verify`) |
| Capture CLI (Playwright) | `scripts/capture-templates.ts` |
| Scaffold (게이트 통과 골격) | `scripts/scaffold-template.ts` (`pnpm template:scaffold <category>/<leaf>`) |
| Asset usage 수집 (스키마 기반, `item.id` slot_key) | `src/lib/template/asset-usages.ts` (호출은 `SiteWriteUseCase` — ADR-0016 §5) |
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
- **크로스-Template Block 공유** (`src/blocks/` 공용 풀) — ADR-0001 위배. 별도 RFC 없이는 X.
- **사용자 에디터에서 Block 추가 / 삭제·순서 변경** — 데이터 모델은 가능하지만 UX·검증 추가 비용. 현재 1 차는 preset 구조 고정.
- **Multi 저작 편의 + 디렉터리 재편** — Multi 사이트는 출시됨 (ADR-0007: renderMultiSite + `[[...slug]]` nav). Single/Multi 모두 `preset.content` 의 `ContentModel` 유니온을 손으로 작성한다 (§2.2, §9-H; 예전 `composition` 축약형은 제거됨). 남은 미래 작업은 (1) 저작 보일러플레이트를 줄이는 헬퍼와 (2) ADR-0001 footnote 의 `pages/<page>/blocks/` **디렉터리** 재편(렌더러 코드 구조)이다.

---

## 13. Migration 히스토리

실행·검증·복구 절차가 필요한 migration만 `docs/migrations/`에 runbook을 둔다. 적용 개수나 상태 표는 금방 낡으므로 이 문서에 복제하지 않는다. 전체 이력은 migration 파일과 git log를 보고, 본 문서는 **현재 동작하는 상태**만 기술한다.

---

## 14. 한 줄 요약

> **Template = 자급자족 디렉터리** (tokens + library + preset + renderer, 다른 Template 와 공유 안 됨 — ADR-0001). **코드가 진실**, Sync 로 DB 반영 (ADR-0002). **새 Template 저작 = `new-template` Claude Code 스킬** (dev-time; brief → 골격 파일 → `template:verify` 게이트 → sync). 새 variant = 디렉터리 복제 1 번. 새 Block = `library/` 에 `.meta` 동봉한 `.tsx` 1 개. 새 Category = 디렉터리 통째로 만들면 codegen 이 알아서 등록. **삭제 = `template:delete <key>` (dry-run→`--apply`) + `git rm`** — sync 의 역방향, `delete-template` 스킬이 감싼다 (§5.4).
