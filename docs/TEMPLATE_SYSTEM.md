# Template System — Layer0 Studio

_대상: 템플릿/테마/섹션 컴포넌트를 추가·수정하거나 sync 파이프라인을 손볼 개발자_
_최종 갱신: 2026-05-04 (Phase 6d 정리 + array 필드 Phase 1 완료 시점)_

> ⚠️ **β 마이그 (Issue #6, 2026-05-19) 이후 구조 변경**: `src/themes/<theme>/{library,presets}/`에서 **`src/templates/<category>/<leaf>/`** (per-template 디렉터리, 컴포넌트 비공유) 모델로 전환. 이 문서의 §3 (디렉터리 구조), §9 (확장 시나리오), §10 일부는 옛 구조 기준으로 작성되어 있음 — 경로/코드젠 어휘는 새 모델로 읽어주세요 (`pnpm generate:templates`, `templateMap`, `templateCategories` 등). 본 문서는 추후 별도 PR에서 전면 개정 예정.

이 문서 한 장만 읽으면 **(1) 시스템이 어떻게 굴러가는지**, **(2) 새 변종/컴포넌트/테마를 어떻게 추가하는지**, **(3) 어디를 만지면 무엇이 깨지는지** 모두 파악할 수 있도록 만든다. 추가 컨텍스트는 모두 코드에 있다 — 이 문서가 가리키는 위치만 따라가면 된다.

---

## 0. 한 페이지 요약

```
   코드(개발자가 작성)                    DB(어드민/sync가 채움)         최종 사용자
┌────────────────────────┐         ┌────────────────────────┐    ┌──────────────────┐
│ src/themes/<key>/      │         │ templates              │    │ user_sites       │
│  ├ library/*.tsx       │         │  ├ slug (PK)           │    │  ├ template_id   │
│  │   .meta(dataSchema) │         │  ├ template_json       │    │  ├ site_json     │
│  ├ tokens.ts           │ ── sync ▶│  ├ thumbnail_url      │ ─┐ │  └ ...           │
│  ├ presets/*.preset.ts │         │  ├ version             │  └▶ (사용자가 편집)   │
│  └ thumbnail.config.ts │         │  └ status (admin only) │    └──────────────────┘
└────────────────────────┘         └────────────────────────┘
        ▲                                    │
        │                                    ▼
   `pnpm generate:themes`           `template_sync_audit` (감사 로그)
   `pnpm template:capture`
   `pnpm template:sync [--apply]`
```

- **코드가 진실**: `templateJson` / 썸네일 / `version` 은 항상 코드값으로 덮어씀.
- **어드민이 진실**: `name` / `description` / `category` / `status` 는 sync가 신규 row에만 시드하고 이후 보존.
- **렌더 순서 = 배열 순서**: `composition: PresetSection[]` 의 배열 순서가 곧 화면 위→아래 순서. `section.order` 필드는 폐기됨 (Phase 6d).

---

## 1. 핵심 개념

| 용어 | 무엇 | 어디 산다 | 누가 만든다 |
|---|---|---|---|
| **Theme** | 시각 토큰(`tokens.ts`) + 재사용 가능한 **Section Component 라이브러리** + TemplateRenderer | `src/themes/<key>/` | 개발자 (코드 PR) |
| **Section Component** | 자기 메타(`componentKey`/`category`/`label`/`dataSchema`)를 동봉하는 self-describing React 컴포넌트 | `src/themes/<key>/library/<Name>.tsx` | 개발자 |
| **Library** | `componentKey → Section Component` 매핑. 한 테마의 "조립 키트" | `src/themes/<key>/library/index.ts` | 개발자 |
| **Preset** | 라이브러리에서 골라 배열한 **composition** + 데이터 + 토큰 오버라이드. 코드가 진실인 시드 템플릿 | `src/themes/<key>/presets/<slug>.preset.ts` | 개발자 |
| **Template (DB row)** | `templates` 테이블 한 행. preset에서 sync로 시드되거나 어드민이 manual로 만듦 | DB | sync CLI / 어드민 UI |
| **UserSite** | Template을 복사해 사용자가 편집한 인스턴스 | DB `user_sites` | 일반 사용자 |

### 1.1 소유권 매트릭스 (sync가 무엇을 건드리나)

| 필드 | 코드(preset) | DB(어드민) | sync 동작 |
|---|---|---|---|
| `slug` | ✅ (upsert 키, 영원히 변경 금지) | — | 일치 보장 |
| `templateJson` | ✅ | — | 항상 코드값으로 덮어씀 |
| `thumbnailUrl` | ✅ (해시 기반) | — | 해시 다르면 재업로드 |
| `version` | ✅ (semver) | — | 코드값으로 덮어씀 |
| `name` / `description` / `category` | 신규 row 시드값 only | ✅ | DB 값 있으면 보존 |
| `status` | — | ✅ | 절대 안 건드림 (신규 row만 `'draft'`) |

> **핵심 약속**: 운영자가 어드민에서 description을 바꿔도 다음 sync가 코드값으로 되돌리지 않는다. `templateJson`/썸네일/버전은 **항상 코드 진실** — 어드민에서 코드 preset row의 JSON 직접 편집은 막혀 있음 (manual row만 편집 허용).

---

## 2. 데이터 모델

### 2.1 `TemplateJson` (DB에 저장되는 형태) — `src/domain/entities/template.entity.ts`

```ts
TemplateJson = {
  templateKey: 'cafe',                     // _generated.ts의 templateMap 키
  globalStyles: {
    primaryColor: '#C96A3A',            // hex 권장 (validate가 warn)
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
          type: 'hero-video',           // ★ library의 componentKey와 매칭
          visible: true,
          editable: true,
          data: {
            title: { type: 'text', label: 'Main Title', value: '...', editable: true },
            videoUrl: { type: 'url', label: '배경 비디오', value: 'https://...' },
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
| `text` / `textarea` / `url` / `color` / `number` | 자명 | 모든 `value`는 string (number도) |
| `select` | dropdown | `options: string[]` 필요 |
| `image` | URL + 업로드 | 업로드 시 `assetId` 자동 부여 (orphan 정리용) |
| `array` | repeated items CRUD | `itemSchema` (Recursive SectionDataSchema) 필수 |

### 2.2 `TemplatePreset` (코드의 시드 형태) — `src/themes/types.ts`

```ts
interface TemplatePreset {
  slug: string;                          // DB upsert 키. 변경 금지.
  templateKey?: string;                     // composition 사용 시 필수
  composition?: PresetSection[];         // ★ 신규 모델
  globalStyles?: Partial<TemplateGlobalStyles>;
  templateJson?: TemplateJson;           // legacy — composition 미사용 시
  thumbnailPath: string;                 // 'public/thumbnails/template-<slug>.webp'
  version: string;                       // semver
  defaults: { name: string; description: string; category: string };
}

interface PresetSection {
  id: string;                            // 사용자 사이트에서도 보존되는 안정 ID
  componentKey: string;                  // 테마 라이브러리에 존재해야 함
  visible?: boolean;
  data: Record<string, TemplateField>;   // dataSchema 만족 필요
}
```

> `composition`을 쓰면 `deriveTemplateJsonFromPreset` (`src/lib/template/preset.ts`) 가 sync 시점에 `TemplateJson` 으로 변환해 DB에 저장한다. `templateJson` 레거시 형태도 여전히 동작하지만 **신규 preset은 항상 `composition`**을 쓴다.

### 2.3 `SectionComponentMeta` & 라이브러리 entry — `src/themes/types.ts`

```ts
interface SectionComponentMeta {
  componentKey: string;                  // 라이브러리 키 ('hero-video', 'menu-grid' …)
  category: string;                      // 'hero' | 'menu' | 'story' | 'footer' | …
  label: string;                         // 어드민 카탈로그용 표시명
  dataSchema: SectionDataSchema;         // 필드 type/label/required 정의
  previewImage?: string;                 // (선택) 어드민 썸네일
}

interface SectionDataSchema {
  [fieldKey: string]: {
    type: TemplateFieldType;
    label: string;
    required?: boolean;
    itemSchema?: SectionDataSchema; // ★ type: 'array'일 때 필수 (재귀 구조)
    minItems?: number; // (선택) 최소 항목 수
    maxItems?: number; // (선택) 최대 항목 수
    options?: string[]; // type: 'select'일 때 사용
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

// helper used in every <theme>/library/index.ts
function libEntry(Component: SectionComponent, metaOverride?: SectionComponentMeta): TemplateLibraryEntry;
```

라이브러리는 항상 **`{ Component, meta }` 쌍**으로 등록한다. **이유**: `'use client'` 컴포넌트는 server-side import 시 client reference로 wrapping되어 모듈 본문이 서버에서 실행되지 않는다 → `Component.meta = {...}` side-effect가 server에서 안 보인다. sync/validate는 서버에서 돌기 때문에 meta를 server-resolved 위치에 따로 두어야 한다 (자세한 함정은 §10.10).

운영 패턴:
- **server 컴포넌트** (no `'use client'`): `.tsx` 안에서 `Component.meta = {...}` 으로 부착. `libEntry(Component)` 만 호출 — 헬퍼가 `Component.meta` 를 자동으로 가져옴.
- **client 컴포넌트** (`'use client'`): meta를 sibling `<Component>.meta.ts` 에 named export 로 정의 → `libEntry(Component, componentMeta)` 로 명시 전달.

### 2.4 `TemplateModule` (`src/themes/types.ts`)

```ts
interface TemplateModule {
  default: ComponentType<TemplateRendererProps>;  // 페이지 레벨 렌더러
  defaultTemplateJson: TemplateJson;            // 시각 토큰 시드 (composition은 [] 비워둠)
  library: TemplateLibrary;                        // ★ Phase 6d 이후 필수
}
```

`slots` / `ThemeSlotDefinition` 은 **제거됨** (Phase 6d). 이전 어댑터(`buildLibraryFromSlots`)도 사라졌다.

---

## 3. 테마 디렉터리 구조

7개 테마(cafe / corporate / fitness / interior / legal / medical / wedding)는 모두 같은 골격:

```
src/themes/cafe/
├── tokens.ts                      # defaultGlobalStyles export (primary/secondary/font/layout)
├── library/
│   ├── index.ts                   # cafeLibrary: { componentKey: { Component, meta } } 매핑 — libEntry 사용
│   ├── HeroImage.tsx              # 서버 컴포넌트: 본문 끝에 Component.meta = {...}
│   ├── HeroVideo.tsx              # 같은 'hero' 카테고리, 다른 componentKey
│   ├── HeroSplit.tsx
│   ├── Navigation.tsx             # ★ 'use client' 컴포넌트 — meta는 sibling .meta.ts
│   ├── Navigation.meta.ts         #    server-resolved meta (named export)
│   ├── MenuBento.tsx
│   ├── Story.tsx
│   ├── Visit.tsx
│   ├── Footer.tsx
│   └── ...
├── presets/
│   ├── default.preset.ts          # ★ 모든 테마는 default 1개 필수
│   ├── modern.preset.ts           # variant — composition 자유
│   └── cozy.preset.ts             # variant
├── sections/                      # 보조 utility만 (icons, title-parts) — section component X
│   └── icons.tsx
├── thumbnail.config.ts            # Playwright 캡처 설정
├── cafe.module.css                # 테마 전용 CSS
└── index.tsx                      # TemplateRenderer (RenderComposition 위임), library export
```

> **`sections/`는 더 이상 컴포넌트를 두지 않는다.** 공통 아이콘/유틸만 사는 폴더로 축소됨. 새 섹션은 무조건 `library/`.

`src/themes/_generated.ts` 는 `pnpm generate:themes`가 디렉터리 스캔으로 자동 생성. **수정 금지 (커밋은 함)**. predev/prebuild 훅으로 자동 갱신됨.

---

## 4. 렌더링 파이프라인

```
사이트 요청
    │
    ▼
loadTemplate(templateKey)            ← src/themes/registry.ts
    │
    ▼
TemplateRenderer (themes/<key>/index.tsx)
    │
    ▼
RenderComposition              ← src/themes/renderComposition.tsx
    │  page = siteJson.pages.find(activePageId) ?? pages[0]
    │  page.sections.map((section) => library[section.type])
    │
    ▼
<Component section={section} />  // SectionComponent
```

핵심 규약:

1. **section.type ↔ componentKey 1:1 매칭**. 라이브러리에 없으면 console.warn + skip.
2. **렌더 순서 = sections 배열 순서**. `order` 필드는 schema에서 제거됨.
3. **`section.visible === false` 면 skip**.
4. **클릭 콜백**: `onSectionClick` 이 있으면 wrapper `<div>` 가 stopPropagation + 호출 (어드민/에디터 인라인 선택용).

---

## 5. Preset → DB Sync 파이프라인

`pnpm template:sync` ⇒ `scripts/sync-templates.ts` ⇒ `src/lib/template/sync.ts:syncTemplates`

### 5.1 단계별 흐름

```
1. _generated.ts의 presetMap 순회
2. preset 1개에 대해:
   ├─ templateKey 결정 (composition? preset.templateKey : preset.templateJson?.templateKey)
   ├─ templateMap[templateKey]() 로드
   ├─ deriveTemplateJsonFromPreset(preset, themeModule)  ← src/lib/template/preset.ts
   │     composition[] → pages[0].sections[] (id/type/visible/data)
   ├─ validateTemplateJson(json, { availableTemplateKeys, templateLibrary: themeModule.library })
   │     ↳ 에러 1개라도 있으면 SKIP (해당 preset만)
   ├─ thumbnail 처리:
   │     md5 해시 기반 파일명 (template-cafe-<hash>.webp)
   │     이미 storage에 있으면 재사용, 아니면 업로드
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
pnpm template:sync --apply --yes    # 카운트다운 우회 (CI용)
pnpm template:sync cafe             # 슬러그 또는 테마 prefix로 필터
```

`--apply` 시 validate 에러가 있으면 전체 중단. 권한은 super-admin (`app_metadata.canPublishTemplates === true`) 만 어드민 UI에서 apply 가능. CLI는 service role key로 무조건 가능 — 운영 서버에서 실수 방지를 위해 필수로 dry-run 먼저 보고 적용.

### 5.3 감사 로그

`template_sync_audit` 테이블 — `docs/migrations/011_template_sync_audit.sql`:

| 컬럼 | 의미 |
|---|---|
| `performed_by` | user.id (CLI일 때 'CLI') |
| `affected_slugs` | 실제 변경된 slug 배열 |
| `dry_run` | 항상 false (dry-run은 기록 안 함) |
| `summary` | { creates, updates, errors, details } JSONB |

---

## 6. Validate 규칙 카탈로그

`src/lib/template/validate.ts` — `validateTemplateJson(json, options)`. sync 전, `pnpm test`, 어드민 Save에서 모두 호출됨.

옵션:

```ts
{
  availableTemplateKeys?: string[];   // 있으면 templateKey 검증
  templateLibrary?: TemplateLibrary;     // 있으면 dataSchema 깊은 검증
}
```

### 6.1 Errors (블로킹)

| Code | 조건 |
|---|---|
| `UNKNOWN_TEMPLATE_KEY` | `templateKey`가 `availableTemplateKeys`에 없음 |
| `PAGES_EMPTY` | `pages`가 없거나 빈 배열 |
| `MISSING_GLOBAL_STYLES` | `globalStyles` 누락 |
| `INVALID_COLOR` | primary/secondary 누락 |
| `INVALID_FONT_SIZE` | CSS length 패턴 불일치 |
| `UNKNOWN_LAYOUT` | 화이트리스트 외 (`wide`/`narrow`/`asymmetric`/`default`/`full`) |
| `DUPLICATE_PAGE_SLUG` | page.slug 중복 |
| `DUPLICATE_SECTION_ID` | 페이지 내 section.id 중복 |
| `UNKNOWN_COMPONENT_KEY` | `templateLibrary` 옵션 + `section.type`이 라이브러리에 없음 |
| `MISSING_REQUIRED_FIELD` | `dataSchema[field].required === true` 인데 누락 |
| `FIELD_TYPE_MISMATCH` | `field.type !== schema[field].type` |
| `MISSING_FIELD_TYPE` / `MISSING_FIELD_LABEL` / `MISSING_FIELD_VALUE` | 필수 메타 누락 |
| `NON_STRING_FIELD_VALUE` | `value`가 string 아님 (array 타입 제외) |
| `NON_ARRAY_FIELD_VALUE` | `type: 'array'` 인데 `items` 가 배열이 아니거나 누락 |
| `MISSING_ITEM_SCHEMA` | schema에서 `type: 'array'` 인데 `itemSchema` 가 정의 안 됨 |
| `ARRAY_ITEMS_BELOW_MIN` / `ARRAY_ITEMS_ABOVE_MAX` | minItems/maxItems 제약 위반 |

### 6.2 Warnings (통과하지만 stderr)

| Code | 조건 |
|---|---|
| `NON_HEX_COLOR` | primary/secondary가 hex가 아님 (CSS named color는 통과) |
| `UNKNOWN_DATA_FIELD` | `data`에 schema에 없는 키 (오타·deprecated 감지) |
| `INSECURE_URL` | `image`/`url` 필드가 `http://` (mixed-content 위험) |

> Phase 6d에서 `DEPRECATED_SECTION_ORDER` / `MISSING_REQUIRED_SLOT` / `UNKNOWN_SECTION_TYPE` 룰은 **삭제**되었다. legacy `themeSlots` 옵션 자체가 사라짐.

### 6.3 Token enforcement (inline 색·폰트 차단)

섹션 컴포넌트는 모든 시각 토큰을 `var(--*)` (또는 같은 CSS 변수로 풀리는 Tailwind arbitrary value)로 참조해야 한다 — 이게 편집기의 `globalStyles` 오버라이드가 사이트 전역으로 전파되는 유일한 통로이기 때문. 인라인 hex/rgb/hsl 색 리터럴이나 `font-family` 문자열은 그 메커니즘을 우회한다.

**두 레이어로 강제**:

1. **Validate** — `validateTemplateFiles(templateDir)` (`src/lib/template/inline-tokens.ts`): 템플릿 생성 파이프라인이 `library/*.tsx` 파일 텍스트를 스캔. 위반 시 `ValidationIssue[]` 반환.
2. **ESLint** — `local/no-inline-design-tokens` (`eslint-rules/no-inline-design-tokens.mjs`): `src/templates/**/*.{ts,tsx}` 대상으로 `pnpm lint`에서 동작. AST 기반 (string Literal / TemplateElement / `fontFamily` JSX prop).

| Code | 조건 |
|---|---|
| `INLINE_COLOR_LITERAL` | `#rgb` / `#rrggbb` / `#rrggbbaa` 또는 `rgb(`/`rgba(`/`hsl(`/`hsla(` 호출 |
| `INLINE_FONT_LITERAL`  | `font-family: '...'` (CSS) 또는 `{ fontFamily: '...' }` (JSX inline-style) |

**Whitelist**:
- 파일: `tokens.ts`, `template.ts` (둘 다 색·폰트 정의 sit-of-truth)
- 값: `transparent`, `inherit`, `currentColor`, `none`, `initial`, `unset`, `revert` (CSS 키워드 — 디자인 토큰이 아님)

**Severity**: `'error'`. #22에서 기존 9개 템플릿의 누적 위반 ~412건을 모두 정리한 뒤 승급됨. 신규 회귀는 `pnpm lint`에서 즉시 차단.

**규칙 추가 시**: `src/lib/template/inline-tokens.ts`의 regex/whitelist와 `eslint-rules/no-inline-design-tokens.mjs`의 동일 항목을 함께 갱신할 것 (의도적 중복).

---

## 7. CLI / 명령 한 장 요약

```bash
# 코드 생성
pnpm generate:themes              # _generated.ts 재생성 (predev/prebuild에 자동 연결)

# 썸네일 캡처 (Playwright + sharp + pixelmatch)
pnpm template:capture             # 모든 테마 일괄
pnpm template:capture <theme>     # 특정 테마
pnpm template:capture --check     # CI용 — 차이 있으면 exit 1, 파일은 안 씀

# DB 동기화
pnpm template:sync                # default = dry-run, diff만
pnpm template:sync --apply        # 5초 카운트다운 후 실제 적용
pnpm template:sync --apply --yes  # 카운트다운 우회 (CI)
pnpm template:sync <slug-or-prefix>

# HTML → preset PoC (1회성 시드용)
pnpm template:scaffold <key> --from templates-ui/<key>.html

# 검증
pnpm test                         # vitest — validate 규칙 + sync 단위 테스트
pnpm tsc --noEmit                 # 타입 체크 (CI에서 클린 유지)
```

---

## 8. Admin UI

`/admin/templates` — `app_metadata.role === 'admin'` 필요.

| 영역 | 동작 |
|---|---|
| 카탈로그 그리드 | preset row는 `code` 배지·read-only, manual row는 `manual` 배지·편집 가능 |
| `Sync from Code` 버튼 | 1단계: Preview Sync (dry-run, 모두 가능) |
| `Apply Sync` 버튼 | 2단계: 실제 적용 (`canPublishTemplates === true` 필요) |
| Composition 다이어그램 | `CompositionPreview.tsx` — preset row 클릭 시 componentKey/category 시각화 |
| `+ New Template` | manual one-off 시드 (시즌 프로모션 등) — JSON textarea 직접 편집 가능 |
| Status 토글 | `draft` ↔ `active` ↔ `archived` (sync는 안 건드림) |

`syncTemplatesAction(dryRun)` — `src/app/admin/templates/actions.ts`. apply 분기에서 `canPublishTemplates` 체크. service role client로 storage 업로드 + DB upsert.

---

## 9. 시나리오 — 어떻게 확장하나

### A. 같은 테마에 새 preset variant 추가 (가장 흔함, 1 PR)

1. **preset 파일 작성** — `src/themes/<theme>/presets/<slug-suffix>.preset.ts`
   ```ts
   import { TemplatePreset } from '../../types';
   const preset: TemplatePreset = {
     slug: 'cafe-cozy',                    // DB upsert 키 — 영원히 고정
     templateKey: 'cafe',
     globalStyles: { primaryColor: '#...' }, // 토큰 오버라이드
     composition: [
       { id: 'nav-1',   componentKey: 'nav',         data: { /* dataSchema 만족 */ } },
       { id: 'hero-1',  componentKey: 'hero-image',  data: { /* ... */ } },
       { id: 'menu-1',  componentKey: 'menu',        data: { /* ... */ } },
       { id: 'footer-1',componentKey: 'footer',      data: { /* ... */ } },
     ],
     thumbnailPath: 'public/thumbnails/template-cafe-cozy.webp',
     version: '1.0.0',
     defaults: { name: 'Cafe Cozy', description: '...', category: 'food' },
   };
   export default preset;
   ```

2. **`pnpm test`** — validate가 dataSchema·globalStyles·page slug uniqueness 자동 검증.
3. **`pnpm template:capture cafe-cozy`** *또는* `public/thumbnails/`에 직접 저장.
   - `thumbnailPath`와 `thumbnail.config.ts`의 `output` 경로/확장자가 **반드시 일치**해야 함.
4. **`pnpm template:sync`** — dry-run으로 변경 확인.
5. PR 머지 → 어드민 UI Preview Sync → Apply Sync (또는 CI에서 `pnpm template:sync --apply --yes`).

### B. 기존 테마에 새 컴포넌트 추가 (예: 새 Hero variant)

1. `src/themes/<theme>/library/HeroParallax.tsx` 신규
   ```tsx
   import { TemplateSectionProps, SectionComponent } from '../../types';

   const HeroParallax: SectionComponent = function HeroParallax({ section }: TemplateSectionProps) {
     const { data } = section;
     // ... 렌더 로직
   };

   HeroParallax.meta = {
     componentKey: 'hero-parallax',          // ★ 라이브러리 키 — 영원히 고정
     category: 'hero',
     label: 'Hero (Parallax)',
     dataSchema: {
       title:    { type: 'text',     label: '타이틀',    required: true },
       imageUrl: { type: 'image',    label: '배경 이미지', required: true },
       subtitle: { type: 'textarea', label: '설명' },
     },
     previewImage: '/component-previews/<theme>/hero-parallax.webp',
   };

   export default HeroParallax;
   ```
2. `library/index.ts` 에 등록:
   ```ts
   import { libEntry } from '../../types';
   import HeroParallax from './HeroParallax';
   export const cafeLibrary: TemplateLibrary = {
     // ...기존
     'hero-parallax': libEntry(HeroParallax),  // server 컴포넌트 → meta는 .tsx 안에서 자동 픽업
   };
   ```
   **만약 새 컴포넌트가 `'use client'` 라면**: `HeroParallax.meta = {...}` 대신 sibling `HeroParallax.meta.ts` 에 `export const heroParallaxMeta` 로 정의 → `libEntry(HeroParallax, heroParallaxMeta)` 로 명시 전달 (이유는 §10.10).
3. preset에서 사용 — `composition: [{ id: 'hero-1', componentKey: 'hero-parallax', data: { ... } }]`
4. `pnpm test` → `pnpm template:sync` → 어드민 Apply.

### C. 새 테마 통째로 추가

1. `src/themes/<key>/` 디렉터리 생성, **§3 골격대로** 채움.
   - `tokens.ts` (defaultGlobalStyles export)
   - `library/index.ts` + `library/<Component>.tsx` (최소 1개)
   - `presets/default.preset.ts` (composition 사용)
   - `thumbnail.config.ts`
   - `index.tsx` — 기존 테마 복사 후 `<theme>Library` import 부분만 교체. `RenderComposition`에 위임만 함.
2. **`pnpm dev` 또는 `pnpm build`** — `predev`/`prebuild`가 `pnpm generate:themes` 자동 실행 → `_generated.ts`에 등록.
3. 이후 시나리오 A의 5번부터.

### D. `dataSchema`에 `required` 추가/변경

기존 preset의 `data`에 해당 필드가 누락되어 있으면 `MISSING_REQUIRED_FIELD` error로 sync가 막힘. **반드시 같은 PR에서 모든 영향받는 preset의 `data` 채우기**. 사용자 사이트(`user_sites.site_json`)는 sync가 안 건드리므로 사용자가 다음에 편집하기 전까지는 이전 데이터 그대로 — 렌더 시 컴포넌트가 빈 값에 graceful fallback 가지도록 작성.

### E. Validate 룰 추가

`src/lib/template/validate.ts`에 새 `err(...)`/`warn(...)` 호출 추가 → `__tests__/validate.test.ts`에 케이스 추가. error 추가는 기존 preset이 모두 통과하는지 먼저 dry-run 확인.

### F. 새 페이지 추가 (현재 제약)

`composition`은 sync 시 `pages[0]` (home) 1개만 생성 (`src/lib/template/preset.ts:31-46`). 다중 페이지가 필요하면:
- `templateJson` legacy 형태로 직접 작성하거나,
- `preset.ts` ↔ `deriveTemplateJsonFromPreset` 인터페이스를 확장 (`compositions: Record<pageSlug, PresetSection[]>` 등)

후자는 별도 작업 — 공개 사이트 네비게이션, 에디터 페이지 탭, validate `DUPLICATE_PAGE_SLUG` 룰까지 함께 손봐야 함.

### G. 반복 항목을 위한 `array` 필드 추가

메뉴, 공지사항, 리뷰 등 반복되는 데이터는 `type: 'array'`를 사용.
1. **meta 정의**: `itemSchema`를 필수로 포함. `minItems`/`maxItems`로 제약 가능.
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
3. **컴포넌트 렌더**: `(data.items as ArrayTemplateField).items.map(...)`으로 렌더. `item.title.value` 대신 `getFieldValue(item.title)` 사용 권장.

---

## 10. 자주 빠지는 함정

1. **`thumbnailPath`와 `thumbnail.config.ts:output` 확장자 mismatch**
   `.webp`/`.jpg` 어긋나면 sync가 옛 파일을 업로드하거나 로컬 경로 문자열을 그대로 DB에 박는다. 두 곳을 항상 일치.

2. **`componentKey` 변경 = 사용자 사이트 깨짐**
   `user_sites.site_json`의 `section.type`이 매칭 안 되면 `RenderComposition`이 console.warn + skip → 화면 빈칸. componentKey는 **영원히** 변경 금지. 새 컴포넌트는 새 key로.

3. **모든 `value`는 string**
   `type: 'number'`도 `value: '42'`. 컴포넌트에서 `Number(field.value)` 필요. validate가 `NON_STRING_FIELD_VALUE`로 잡음.

4. **items의 React key (Array Field)**
   에디터에서 `array` 필드의 각 항목은 stable한 `_key`가 필요함. 에디터 내부적으로 `injectKeys` / `stripKeys` 헬퍼가 임시 키를 관리하며, DB 저장 시에는 최적화를 위해 제거됨. 렌더러에서는 `item._key || index`를 키로 사용하되, 가급적 데이터 고유값을 조합할 것.

5. **Lazy Migration & Graceful Fallback**
   기존 테마 컴포넌트에 `array` 필드를 추가한 경우, 기존 사용자 사이트 JSON에는 해당 필드나 `items` 배열이 없을 수 있음. 컴포넌트 구현 시 `data.items?.items ?? []` 처럼 항상 빈 배열 fallback을 갖추어야 런타임 에러를 방지할 수 있음. (에디터에서 한 번 저장하면 스키마에 맞춰 채워짐)

6. **`required: true`를 dataSchema에 안 적으면 silent**
   필수 필드를 빠뜨려도 sync 통과하고 런타임에 빈 값. `dataSchema`에 명시할 것.

7. **`templateKey` 누락 → `'corporate'` 폴백**
   `site/[domain]/page.tsx`, `DynamicEditor.tsx`. 의도된 동작이지만 디버깅 시간 낭비 흔함.

8. **`editable: false`는 UI만 숨김**
   서버 가드 없음. 사용자가 JSON 직접 수정하면 변경 가능 — 진짜 잠금이 필요하면 use case 레이어에 추가해야 함.

9. **Sync는 user_sites를 안 건드린다**
   `templates`만 update. 이미 발행된 사용자 사이트는 옛 데이터 그대로. 강제 마이그가 필요하면 별도 SQL (참고: `docs/migrations/012_remove_section_order.sql`).

10. **`_generated.ts` 수정 금지**
    수동 편집해도 다음 `predev`/`prebuild`에서 덮어씀. 새 테마/preset 추가는 디렉터리/파일만 만들면 됨.

11. **`globalStyles` 머지 규칙**
    `composition` 사용 시 sync는 `themeModule.defaultTemplateJson.globalStyles` (= `tokens.ts` 시드) ◀ `preset.globalStyles` 순서로 spread. preset에서 `Partial`로 일부만 덮을 것.

12. **`'use client'` 컴포넌트의 `Component.meta = {...}` 는 서버에서 안 보임** ⚠️
    Next.js는 `'use client'` 모듈을 server-side import 시 client reference로 wrapping하고 모듈 본문을 서버에서 실행하지 않는다. 그래서 `.tsx` 파일 끝에서 한 `Component.meta = {...}` side-effect는 server에는 보이지 않고 → `library['nav'].meta` 가 undefined → sync/validate 시 `Cannot read properties of undefined (reading 'dataSchema')` 폭발.
    **해법**: client 컴포넌트의 meta는 항상 sibling `<Component>.meta.ts` 에 named export 로 정의하고, library/index.ts 에서 `libEntry(Component, componentMeta)` 로 명시 전달. server 컴포넌트는 종전대로 `.meta = {...}` 그대로 OK.
    현재 client 컴포넌트 9개 (cafe/Navigation, corporate/Contact, fitness/Nav, interior/{Contact,Nav}, legal/{Contact,Faq}, wedding/{Contact,Faq}) 가 이 패턴을 따른다.

13. **Capture는 dev server를 띄움**
    `thumbnail.config.ts`의 `source`가 `preview://`로 시작하면 `capture-templates.ts`가 자동으로 `pnpm dev`를 백그라운드로 실행. CI에서는 `templates-ui/*.html` 파일 source를 쓰면 server-less.
14. **인덱스 기반 스타일링의 한계 (Array Field)**
    `Array Field` 항목을 렌더링할 때 `idx === 0` 처럼 인덱스에 따라 스타일(예: 넓은 카드, 특정 아이콘)을 다르게 주면, 사용자가 에디터에서 항목 순서를 바꿀 때 디자인 요소가 항목을 따라가지 않고 '슬롯'에 고정되는 현상이 발생함. "항목에 종속된 디자인"이 필요하다면 `itemSchema`에 `style`이나 `icon` 같은 `select` 필드를 추가하여 사용자가 직접 지정하게 하는 것이 좋음.

---

## 11. 코드 위치 맵

| 무엇 | 어디 |
|---|---|
| `TemplateJson` / `TemplateSection` / `TemplateField` 타입 | `src/domain/entities/template.entity.ts` |
| `TemplatePreset` / `PresetSection` / `SectionComponent` / `TemplateModule` 타입 | `src/themes/types.ts` |
| 자동생성 레지스트리 | `src/themes/_generated.ts` (커밋, 수정 금지) |
| 동적 import 헬퍼 | `src/themes/registry.ts` (`loadTemplate(templateKey)`) |
| 범용 렌더러 | `src/themes/renderComposition.tsx` |
| 테마 1개 reference | `src/themes/cafe/` (composition variant 3개), `src/themes/corporate/` (가장 단순) |
| Validate 규칙 | `src/lib/template/validate.ts` (+ `__tests__/validate.test.ts`) |
| Preset → TemplateJson 변환 | `src/lib/template/preset.ts` |
| Sync 코어 로직 | `src/lib/template/sync.ts` (+ `__tests__/sync.test.ts`) |
| Codegen 스크립트 | `scripts/generate-themes.mjs` |
| Sync CLI | `scripts/sync-templates.ts` |
| Capture CLI (Playwright) | `scripts/capture-templates.ts` |
| Scaffold (HTML→preset PoC) | `scripts/scaffold-template.ts` |
| Sync Server Action | `src/app/admin/templates/actions.ts:syncTemplatesAction` |
| Admin UI (sync 트리거) | `src/app/admin/templates/TemplateListPanel.tsx` |
| Admin UI (composition 시각화) | `src/app/admin/templates/CompositionPreview.tsx` |
| Admin UI (manual JSON 편집) | `src/app/admin/templates/TemplateEditorPanel.tsx` |
| Composition preview (capture용) | `src/app/preview/preset/[...key]/page.tsx` |
| 사용자 에디터 | `src/components/editor/DynamicEditor.tsx` |
| Audit log 마이그레이션 | `docs/migrations/011_template_sync_audit.sql` |
| `section.order` 정리 마이그레이션 | `docs/migrations/012_remove_section_order.sql` |

---

## 12. 비-목표 (이번 시스템에서 의도적으로 안 하는 것)

- 시각적 WYSIWYG preset 빌더 — 코드-PR 워크플로우가 의도된 게이트
- 사용자별 커스텀 테마 업로드 — 보안·격리 비용 큼
- 크로스-테마 섹션 공유 (`src/sections/` 공용 풀) — 별도 RFC 시점에 검토
- 사용자 에디터에서 섹션 추가/삭제·순서 변경 — 데이터 모델은 가능하지만 UX·검증 추가 비용. 현재 1차는 preset 구조 고정.
- 다중 페이지 공개 사이트 네비게이션 — composition 모델이 1페이지 전제 (§9-F)

---

## 13. Migration 히스토리 (템플릿 관련만)

| 번호 | 내용 | 프로덕션 적용 |
|---|---|---|
| 011 | `template_sync_audit` 테이블 (sync 감사 로그) | ✅ 적용 완료 |
| 012 | `templates.template_json` / `user_sites.site_json` / `user_sites.template_snapshot` 의 `section.order` 필드 일괄 제거 | ✅ 적용 완료 |

전체 시스템 이력(Phase 1~6d)은 git log 참고 — 커밋 메시지에 phase 번호와 의도가 적혀 있음. 본 문서는 **현재 동작하는 상태**만 기술한다.

---

## 14. 한 줄 요약

> **테마 = 시각 토큰 + 컴포넌트 라이브러리. Preset = 라이브러리에서 골라 배열한 composition. 코드가 진실, sync로 DB 반영.** 새 변종 = 새 preset 파일 1개. 새 컴포넌트 = `library/`에 `.meta` 동봉한 .tsx 1개. 새 테마 = 디렉터리 통째로 만들면 codegen이 알아서 등록.
