# Block 리네임 + Field/Value 분리 (schema-first) — ADR-0007 구조는 유지, nav 모델은 개정

> **Status: Accepted and implemented** (2026-08-10). Field/Value 전환은 migration 026, Block/Menu 전환은 migration 027로 완료했다.
>
> **이력:** 데이터 모델 재설계 초안을 그릴링으로 확정한 결과다. 2026-08-10 세 차례 개정을 거쳤다 — (1) §4 를 **스키마/Value 분리**로 확장, (2) 초안이 물려준 `→ SiteContent` 리네임을 **취소**(§2 하단), (3) 리뷰 반영: §4-1 의 수동 Content 인터페이스 + 제네릭 스키마 계약 방향을 **폐기하고 schema-first 로 교체**(아래 §4-1), nav 마이그레이션 매핑표 확정(§3), 롤아웃을 사전 검증 후 원자적 기록으로 교체(§8), asset 항목 정정(§7).
>
> **읽는 법:** 이 문서의 AS-IS는 결정 당시의 이전 모델, TO-BE는 현재 모델이다. 현행 용어의 짧은 정본은 `CONTEXT.md`, 저작·운영 절차는 `docs/TEMPLATE_SYSTEM.md`다.

## Context

데이터 모델 재설계 초안은 두 종류의 변경을 한 봉투에 섞었다: (A) **순수 리네임/정직화** 와 (B) **구조 통일**(Single 을 `pages:[Page]` 로, Chrome 을 양쪽 공통으로, 단일 mode-blind 렌더러). 초안 (B) 는 [ADR-0007](./0007-single-multi-site-type-structural-union.md) + migration 018 이 *의도적으로 반대 방향으로* 이미 확정한 결정을 자각 없이 되돌리는 것이었다.

이 재설계의 **1순위 목표는 데이터 모델의 정직성/명명 정리**이며, 렌더러 통일이 아니다. 따라서 (B) 는 기각하고 (A) 만 채택한다.

**결정 당시 규모.** `getFieldValue` 는 **114 개 파일에서 865 회**(그중 111 개가 `src/templates/`) 호출됐다. 인스턴스마다 `{type,label,value}` 를 들고 다니는 구조에서 값 하나를 꺼내기 위한 순수 반복이었다. 취향 문제가 아니라 구조적 중복이었다.

**초안이 ADR 을 앞선다는 사실 자체가 이 ADR 의 반복된 함정이었다.** 초안은 ADR-0007 과 ADR-0013 이전에 쓰였고, 두 번 모두 "초안이 제안 → ADR 이 이미 반대로 결정" 이 발생했다: (B) 구조 통일(ADR-0007 이 기각)과 `→ SiteContent` 리네임(ADR-0013 이 기각, §2 하단). 초안에서 무언가를 물려올 때는 그 항목을 이미 다룬 ADR 이 있는지 먼저 확인할 것.

## Decision

### 1. ADR-0007 구조는 그대로 유지 — 통일하지 않는다

`mode` 판별 구조적 유니온을 유지한다. **Single = `blocks[]` 직접(Page 없음), Multi = `pages[]` + `chrome`.** 렌더러는 `renderSingleSite` / `renderMultiSite` **2개를 그대로** 둔다. 다음 초안 제안은 **기각**:

- ❌ Single = `pages:[Page]` (튜플) — migration 018 을 되감고 죽은 필드 부활. churn.
- ❌ Chrome 을 `SiteBase` 공통으로 — Single 의 nav/footer 는 계속 `blocks[]` 안 인라인.
- ❌ 단일 mode-blind `renderSite()` — 통일은 목표가 아님. mode-aware 헬퍼는 리네임하며 유지.

### 2. 어휘 리네임

**AS-IS 열은 결정 당시 코드에 실재하던 식별자다** — codemod 가 존재하지 않는 이름을 대상으로 삼지 않도록 검증했다(`src/domain/entities/template.entity.ts`, `src/templates/types.ts`, 2026-08-10).

| AS-IS (이전 코드) | TO-BE (현재 코드) | 위치 |
|---|---|---|
| `Section` | `Block` | `template.entity.ts` |
| `SingleSection` | `SingleBlock` | `template.entity.ts` |
| `SingleContent.sections` | `SingleContent.blocks` | `template.entity.ts` |
| `Page.sections` | `Page.blocks` | `template.entity.ts` |
| `MultiContent.shared` | `MultiContent.chrome` | `template.entity.ts` |
| `NavMeta` | `MenuEntry` / `SingleMenuEntry` (모양 개정 — §3) | `template.entity.ts` |
| `allSections()` | `allBlocks()` | `template.entity.ts` |
| `Field` union (`TextField`/`SelectField`/`ImageField`/`ArrayField`) | `FieldDescriptor` = **스키마 서술자 전용**, 인스턴스 데이터는 `ValuesOf<S>` 로 추론 | `template.entity.ts` (§4) |
| `getFieldValue()` | **삭제** (865 회 호출 전부 제거) | `template.entity.ts` |
| `SectionComponentMeta` | `BlockComponentMeta` | `templates/types.ts` |
| legacy Section field schema | `FieldsSchema` (제네릭 아님 — §4-1) | `template.entity.ts` / `templates/types.ts` |
| `SectionComponent` | `BlockComponent` | `templates/types.ts` |
| `TemplateSectionProps` | `TemplateBlockProps` | `templates/types.ts` |
| `NavSectionProps` | `NavBlockProps` | `templates/types.ts` |

**바뀌지 않는 것:** `block.fields` 의 **키 이름 `fields` 는 유지**(migration 022 가 이미 `data`→`fields` 를 끝냄). 담기는 것이 `Field` 객체 → **Value** 로 바뀔 뿐이다. `Block.type`/`Block.id`/`Block.visible`, `ContentModel`/`SingleContent`/`MultiContent`, `mode`, `isSingleContent`/`isMultiContent` 도 그대로다.

#### 기각된 리네임: `ContentModel → SiteContent`

초안(그리고 개정 전 본 ADR 제목)은 최상위 유니온을 `SiteContent` 로 바꾸자고 했다. **기각한다** — [ADR-0013](./0013-content-model-rename.md) 이 **이미 이 정확한 제안을 검토해서 반대로 결정했고, 구현·배포까지 끝났다**(migration 021). 근거는 지금도 유효하다: `Template` 과 `UserSite` **두 엔티티가 이 타입을 공유**하므로 한쪽 엔티티 이름을 박으면 `Template.content: SiteContent` 가 "Template 이 Site 를 담는다"로 읽힌다.

### 3. nav → menu 모델 개정 + 마이그레이션 매핑표

ADR-0007 은 모든 nav 소스에 `nav: { visible, label }` 를 **필수**로 두고 `nav.label` 이 (Multi 에선) 페이지 이름을 *겸하게* 했다. 이 결합과 중첩 불리언을 걷어낸다.

```ts
/** Multi Page 용 — 어느 nav 에 속하는지까지 표현한다. */
interface MenuEntry {
  label: string;
  placement?: 'header' | 'footer';   // 생략 = header
}

/** Single Block 용 — Single 에는 footer-nav 개념이 없다(§3-2). */
interface SingleMenuEntry {
  label: string;
}
```

- **Single 블록**: `menu?: SingleMenuEntry` — **존재 자체가 "메뉴에 등장"**.
- **Multi 페이지**: `name: string`(**필수** — 에디터 탭/페이지 이름, nav 소속과 무관) + `menu?: MenuEntry`. 페이지 이름과 nav 라벨은 **별개 필드**다. ADR-0007 이 폐기했던 "title 이 nav 라벨을 겸함" 결합을 뒷문으로 되살리지 않기 위함.
- **두 축 보존**: `block.visible`/`page.visible`(존재) × `menu?` 존재(메뉴 노출).

#### 3-1. 마이그레이션 매핑표 (이 표대로만 변환한다)

현재 `deriveFooterNav` 는 `pages.filter(p => p.visible && !p.nav.visible)` 다 — 즉 **Multi 의 `nav.visible:false` 는 "nav 에서 제외"가 아니라 "footer 링크"** 라는 뜻이다. 이를 `menu` 없음으로 옮기면 **기존 footer 링크가 전부 소실된다.**

| AS-IS | TO-BE |
|---|---|
| Single 블록 `nav.visible: true` | `menu: { label: nav.label }` |
| Single 블록 `nav.visible: false` | `menu` 없음 |
| Multi 페이지 (**모두**) | `name = nav.label` (필수 필드 신설) |
| Multi 페이지 `nav.visible: true` | `menu: { label: nav.label }` (placement 생략 = header) |
| Multi 페이지 `nav.visible: false` | `menu: { label: nav.label, placement: 'footer' }` |

**"어떤 메뉴에도 없음"(= `menu` 없는 Multi 페이지)은 마이그레이션이 만들어내지 않는다.** 그 상태는 기존 데이터 모델로 표현할 수 없었으므로(모든 `visible` 페이지가 header 아니면 footer 에 나타났다) 추론하면 없던 의도를 지어내는 것이 된다. 신규 저작에서만 도달 가능한 상태다.

`name` 과 `menu.label` 은 마이그레이션 시점에 **같은 값으로 시작**하고, 이후 독립적으로 편집된다.

#### 3-2. Single 에 `placement` 를 넣을 수 없게 한다

타입을 분리(`SingleMenuEntry`)하는 것으로 컴파일 타임에는 막힌다. 저장된 JSON 은 타입을 통과하지 않으므로 **validator 에 blocking 규칙**을 둔다: Single 블록의 `menu` 에 `placement` 키가 있으면 `SINGLE_MENU_PLACEMENT_UNSUPPORTED` 로 저장을 막는다(렌더러가 해석할 수 없는 값이므로 §6 의 "블로킹" 기준을 충족).

### 4. Field/Value 분리 — schema-first

Field 가 인스턴스마다 `{type, label, value}` 를 들고 다니는 구조를 버린다. **스키마가 유일한 SSOT** 이고, Block 이 들고 있는 데이터는 **Value** 다.

**왜 분리하는가.** `fieldsSchema` 가 이미 존재하는데 content 가 `type`/`label` 을 또 저장하면 drift 가 가능하다(`validate.ts` 의 `FIELD_TYPE_MISMATCH` 는 이 drift 를 막기 위해서만 존재하는 규칙이다). 변경 주기도 다르다 — 스키마는 개발자가 드물게, Value 는 사용자가 빈번히(배열 아이템 추가).

#### 4-1. schema-first: Content 타입은 **작성하지 않고 추론한다**

> **폐기된 방향.** 개정 전 본 ADR 은 `MenuContent` 인터페이스를 손으로 쓰고 제네릭 스키마 계약으로 연결하자고 했다. **실측 결과 이 보장은 거의 없었다** — `text|textarea|url|color|select` 가 전부 런타임 `string` 이라 `FieldDescriptor<T[K]>` 가 서로를 구분하지 못한다. 5 개 시나리오 중 **키 오타 1 개만** 잡히고, 본 ADR 이 동기로 든 `textarea`↔`text` drift 자체가 안 잡혔다. optional 키는 descriptor 도 optional 이 되어 통째로 누락 가능했고, `required` 와 optionality 도 연결되지 않았다. 수동 인터페이스를 유지하면 두 개의 진실이 남는다.

**스키마를 먼저 선언하고 Content 타입을 거기서 추론한다.** 수동 Content 인터페이스는 만들지 않는다.

```ts
// 저작: 스키마만 쓴다. `as const` 필수 — select 리터럴과 required:true 를 좁히기 위해.
const menuSchema = {
  eyebrow: { type: 'text',     label: '섹션 라벨' },
  title:   { type: 'textarea', label: '섹션 타이틀', required: true },
  tone:    { type: 'select',   label: '톤', options: ['light', 'dark'], required: true },
  columns: { type: 'number',   label: '열 수', default: 3, required: true },
  items:   { type: 'array',    label: '메뉴 항목', required: true, minItems: 1, maxItems: 6,
             itemSchema: {
               title: { type: 'text',  label: '제목', required: true },
               price: { type: 'text',  label: '가격' },
               image: { type: 'image', label: '이미지' },
             } },
} as const satisfies FieldsSchema;

type MenuContent = ValuesOf<typeof menuSchema>;
```

타입 이름은 **`FieldsSchema`** 로 둔다. Block component가 최상위 `fieldsSchema`를 소유하지만, 같은 스키마 구조는 `array` Field의 중첩 `itemSchema`에도 재귀적으로 쓰인다. Block 전용 이름은 실제 도메인 범위를 Block 소유로 잘못 좁힌다. Block 전용 불변식이 없는 현재 모델에서는 별도 alias도 두지 않는다.

추론 규칙:

| descriptor | 추론되는 Value |
|---|---|
| `text` / `textarea` / `url` / `color` | `string` |
| `select` + `options` | `options[number]` 리터럴 유니온 |
| `number` | `number` |
| `image` | `ImageValue` (`{ url: string; assetId?: string \| null }`) |
| `array` + `itemSchema` | `Array<{ id: string; fields: ValuesOf<itemSchema> }>` (재귀) |
| `required: true` | 키가 **필수** |
| `required` 없음/false | 키가 **optional** |

이 방향은 실측으로 검증했다 — `select` 리터럴 좁힘, `number` 실수 타입, `required` 기반 optionality, 배열 아이템의 중첩 `required` 까지 **전부 컴파일 타임에 잡힌다.** 스키마가 단일 진실이므로 drift 가 **구조적으로 불가능**하다.

**보장 범위의 정직한 서술:** 컴파일 타임이 보장하는 것은 "**코드 안에서** 스키마와 렌더러가 합치한다" 까지다. **DB 에 이미 저장된 JSON 이 새 스키마와 맞는지는 보장하지 않는다** — 그건 런타임 validator(유지)와 §6 의 호환성 규칙이 담당한다.

#### 4-2. 타입 배치

- **도메인(`ContentModel`/`Block.fields`)은 계속 loose**: `Record<string, unknown>`. Block 은 dispatcher 패턴(문자열 `type` → `library[type]`)이라 도메인은 어떤 Block 이 어떤 Value 모양인지 정적으로 알 수 없다. **추론된 타입은 컴포넌트 경계에서만** 쓴다.
- **런타임 validator 는 유지한다.** 컴파일 타임은 코드-내 정합만 보므로, 저장된 DB JSON 검증은 여전히 `validateContent` 의 몫이다.

#### 4-3. Value 모양

- **`number` descriptor 는 `default: number` 를 필수로 갖는다.** 빈 입력은 **에디터 경계에서 그 default 로 리셋**한다(렌더러는 `NaN`/`null` 을 보지 않음). default 없는 number 를 허용하면 "빈 입력을 무엇으로 리셋할지" 가 정의되지 않는다. 진짜 optional number 가 필요해지면 그때 nullable 정책을 별도 결정한다(YAGNI). **콘텐츠로 쓰는 number 필드는 현재 0 개 → 마이그레이션 0.**
- **`ImageValue` 는 객체 유지**: `{ url: string; assetId?: string | null }`. `assetId` 는 스키마 메타가 아니라 진짜 콘텐츠 데이터 — [ADR-0003](./0003-asset-upload-two-phase-cleanup.md) 의 참조 카운팅이 이 값을 원본으로 쓴다. **"모든 Value 는 스칼라"가 아니다** — 런타임 모양이 실제로 다른 경우는 그 모양을 유지하되, 스키마 메타(`type`/`label`)만 담지 않는다.
- **배열 아이템: `id` 는 Value 인터페이스 *바깥*.** `Array<{ id: string; fields: ValuesOf<S> }>` — Block 이 `{ id, type, fields }` 로 id 를 `fields` 밖에 두는 것과 동일 배치다. `itemSchema` 는 편집 가능한 키만 서술하므로 `id` 에 `FieldDescriptor` 를 요구하는 모순이 애초에 생기지 않는다.

#### 4-4. `item.id` 불변식

지금의 `_key` 주입/제거(`injectKeys`/`stripKeys`, `src/lib/template/keys.ts`)는 배열 아이템에 안정적 식별자가 없어 **가짜 Field 를 콘텐츠에 심었다 빼는** 우회로였다. 그 파일과 호출부는 제거하고, 대신 다음을 불변식으로 못박는다:

1. **생성은 `crypto.randomUUID()`** — 에디터의 "항목 추가" 와 마이그레이션 양쪽 모두.
2. **같은 배열 안에서 unique.** (전역 unique 는 요구하지 않는다 — 배열 스코프면 충분.)
3. **중첩 배열마다 재귀 검증.**
4. **누락 또는 중복 ID 는 blocking validation** (`ARRAY_ITEM_ID_MISSING` / `ARRAY_ITEM_ID_DUPLICATE`). 둘 다 React 재조정과 asset slot_key 를 깨뜨리므로 §6 의 블로킹 기준을 충족한다.
5. **마이그레이션은 멱등** — 재실행 시 **기존 ID 를 보존**하고 없는 것만 채운다.
6. **slot_key 인코딩**: `` `${blockPath}.${fieldKey}[${item.id}].${subKey}` ``. 배열 인덱스가 아니라 `item.id` 를 쓴다(인덱스는 재정렬 시 다른 아이템을 가리킨다). 중첩 배열은 같은 규칙을 재귀 적용한다.

### 5. 에셋 usage 수집 — 스키마 기반 + 계층 배치

Value 에서 `type` 이 사라지면 현재의 `f.type === 'image'` 순회는 성립하지 않는다. 스키마를 따라 걷도록 바꾼다:

- Field 스키마가 `type: 'image'` 인 키에서 `ImageValue.assetId` 수집
- `type: 'array'` 면 `itemSchema` 로 **재귀**
- slot_key 는 §4-4 의 `item.id` 인코딩

**계층 배치 — repository 가 Library 를 가져오면 안 된다.** [ADR-0008](./0008-keep-explicit-di-factories.md) 은 읽기 경로의 registry import 를 금지하고, Library 를 아는 것은 `site-content-write.ts` / `template-content-write.ts` 뿐이다. 그런데 지금은 data 레이어인 `SupabaseUserSiteRepositoryImpl.updateContent` 가 `collectAssetUsages(content)` 를 호출한다 — 여기에 Library 인자를 추가하면 data 레이어가 registry 에 의존하게 되어 계층이 뒤집힌다.

**따라서 usage 계산을 쓰기 경로 위로 올린다.** `SiteWriteUseCase` 는 이미 `LibraryAwareSiteContentValidator` 를 주입받고, 그 validator 가 `loadTemplate()` 으로 Library 를 로드한다. **같은 지점에서 usages 까지 계산해 repository 에 인자로 넘긴다** — Library 로딩이 한 번으로 줄고 계층 역전도 없다.

```
SiteWriteUseCase
  ├─ validator.validate(content)      ← Library 로드 (기존)
  ├─ collectAssetUsages(content, lib)  ← 같은 Library 재사용 (신규 위치)
  └─ repository.updateContent(id, content, usages, expectedUpdatedAt)
```

`updateContent` 의 시그니처에 `usages` 가 추가된다. RPC 호출부는 그대로다.

### 6. 렌더 경계는 unsafe cast — 그 전제가 되는 호환성 규칙

렌더러는 `block.fields` 를 추론된 Content 타입으로 **검증 없이 캐스팅**한다. 저장 경로가 이미 막았으므로 도달한 Value 는 유효하다고 신뢰한다 — "파싱은 경계에서 한 번".

**이 신뢰는 공짜가 아니다.** 컴파일 타임은 코드-내 정합만 본다. 또 `getFieldValue` 가 `if (!field) return ''` 로 메워주던 누락 필드 방어막이 사라진다. 따라서:

**배포된 Template 의 스키마 변경은 기본적으로 하위 호환(additive)이어야 한다.**

| 변경 | 판정 | 조건 |
|---|---|---|
| optional 필드 추가 | ✅ 허용 | 렌더러가 fallback (`?? ''`) 을 둔다 |
| `label` 변경, `required` 완화, `select options` **확장** | ✅ 허용 | Value 모양 불변 |
| 필드명 변경 | ⛔ 파괴적 | |
| 필수 필드 추가 | ⛔ 파괴적 | |
| 값 타입 변경 (`text`→`number` 등) | ⛔ 파괴적 | |
| `select options` **축소** | ⛔ 파괴적 | 기존 Value 가 유니온 밖으로 나감 |
| 배열 `itemSchema` 구조 변경 | ⛔ 파괴적 | |

**파괴적 변경을 하려면** `templates.content` + `user_sites.content` + `user_sites.snapshot` 세 컬럼을 **함께** 마이그레이션하고, 전 행을 새 Library 로 검증해 통과한 뒤에만 배포한다. migration 026/027이 이 절차의 선례다.

#### 6-1. 문서 규칙이 아니라 CI 게이트로 만든다

규칙을 산문으로만 두면 지켜지지 않는다. **schema manifest 스냅샷을 레포에 커밋하고, CI 가 현재 스키마와 비교해 파괴적 변경을 검출한다.**

- `pnpm schema:manifest` — 전 Template 의 `componentKey → fieldsSchema` 를 정규화해 `src/templates/_schema-manifest.json` 으로 기록
- CI 가 manifest 재생성 후 diff → 위 표의 ⛔ 항목이 검출되면 **실패**
- 의도적 파괴 변경은 manifest 갱신 커밋 + 마이그레이션 동반을 요구(리뷰에서 보임)

`.github/workflows/ci.yml` 의 `template:verify:ci` 다음 단계로 넣는다.

### 7. asset 배열 재귀 — 선행 수정 **완료**

> **정정.** 개정 전 본 문서는 이 항목을 "현재 라이브 데이터 손실 버그" 로 서술했다. **PR #126 (커밋 `ab923e2`) 로 이미 수정되어 main 에 머지됐다.** 현재 `src/lib/template/asset-usages.ts` 는 배열을 재귀하며 회귀 테스트 4 개가 이를 지킨다.

배경(왜 이 함수가 §5 의 대상인지): 배열 아이템 안의 이미지는 `asset_usages` 행이 생기지 않았고, `sweep_orphaned_assets`(migration 008)가 "1시간 경과 + usage 없음"을 고아로 판정해 cron 이 **바이너리와 `assets` 행을 함께 삭제**했다. 영향 Template 5 개(academy Teachers, cafe MenuBento, medical-clinic Doctors/Gallery, outdoor CollectionGrid). 프로덕션 실피해는 0 건이었다(업로드된 에셋 자체가 0). **본 ADR 구현 시 이 함수를 §5 의 스키마 기반으로 재작성**하며, 그때 slot_key 도 인덱스 → `item.id`(§4-4) 로 바뀐다.

#### 7-1. `reconcile:orphaned-assets` 로는 이 종류를 점검할 수 없다

`scripts/reconcile-orphaned-assets.ts` 는 **Storage ↔ `auth.users` ↔ `assets`** 만 대조하고 `user_sites.content` 나 `asset_usages` 를 읽지 않는다. 게다가 cron 이 바이너리와 `assets` 행을 둘 다 지우므로 이 종류는 잔여물조차 남기지 않는다. 그 스크립트가 재는 것은 [ADR-0014](./0014-account-erasure-tombstone-pipeline.md) 계정 삭제 누수라는 **다른 문제**다.

**별도 감사 스크립트가 필요하다** — 향후 `audit:asset-integrity`를 만든다면 콘텐츠의 `assetId` ↔ `assets` ↔ `asset_usages` ↔ Storage 4 자 대조로 다음을 보고해야 한다.

| 증상 | 의미 |
|---|---|
| 콘텐츠가 참조하는데 `assets` 행 없음 | 파괴됨 (복구 불가) |
| `assets` 행 있는데 `asset_usages` 없음 | 다음 sweep 대상 — usage 수집 누락 의심 |
| `asset_usages` 있는데 Storage 객체 없음 | 바이너리 유실 |
| Storage 있는데 콘텐츠 참조 없음 | 진짜 고아 |

### 8. 구현 및 데이터 전환

Registry의 모든 Template과 저장 JSON을 한 번에 전환했고 백워드 호환 레이어나 `schemaVersion`은 두지 않았다.

- migration 026: Field wrapper를 Value로 변환하고 배열 item ID를 채웠다. 자세한 검증·실행·복구 절차는 [`docs/migrations/026_field_to_value.md`](../migrations/026_field_to_value.md)에 있다.
- migration 027: `sections`/`shared`/`nav`를 `blocks`/`chrome`/`menu`로 변환했다. 자세한 절차는 [`docs/migrations/027_block_menu.md`](../migrations/027_block_menu.md)에 있다.
- 두 migration 모두 `templates.content`, `user_sites.content`, `user_sites.snapshot`을 메모리에서 먼저 변환·전수 검증한 뒤 원자적으로 기록한다. 실패 시 쓰지 않으며 롤백은 DB 복원과 코드 롤백을 함께 수행한다.

## Considered & Rejected

- **`ContentModel → SiteContent` 리네임** — ADR-0013 이 이미 기각·구현 완료. §2 하단.
- **수동 Content 인터페이스 + 제네릭 스키마 계약** — 실측 보장이 5 중 1(키 오타)뿐. string 계열 구분 불가, optional 키 누락 가능, `required` 미연결. 두 개의 진실이 남는다. §4-1.
- **Single = `pages:[Page]` 로 통일** — migration 018 이 이미 반대로 확정.
- **배열 아이템 `id` 를 Value 인터페이스 안에 두고 `Exclude<keyof T,'id'>` 로 제외** — 콘텐츠 인터페이스마다 "시스템 키" 를 의식해야 한다. `id` 를 형제로 두면 제외 규칙 자체가 불필요(§4-3).
- **렌더 경계에서 safe parse(매 렌더 재검증)** — 저장 시점에 이미 도는 스키마 워크를 렌더마다 반복. §6 의 호환성 규칙으로 전제를 보장한다.
- **`schemaVersion` + 하위 호환 레이어** — 유저 0 이라 변형 비용이 0 인 지금이 가장 싸다. 호환 레이어는 영구 부채.
- **호환성 규칙을 문서로만 유지** — 지켜지지 않는다. §6-1 의 CI manifest 게이트로 강제.
- **Collection 번들** — **연기.** (1) Collection 은 nav 에 Page/Block 이 아닌 항목을 넣어 projected nav 로 표현 불가 → 저장된 `navigation` SSOT 강제 → §3 과 충돌. (2) 순수 추가 인프라라 "유저 0" 타이밍 이득 없음. (3) 쓰는 템플릿 0 개. **미래 여지만 남긴다**: `ContentModel` 이 후일 top-level `collections`/`navigation` 을 받을 수 있게, Block dispatcher 가 Data Block 을 수용할 수 있게.

## Consequences

- `CONTEXT.md`의 Block/Chrome/Menu 및 Field/Value 어휘가 현재 코드와 저장 JSON의 진실이다.
- **§6 의 호환성 규칙은 상시 규칙**이며 schema manifest CI 게이트, `new-template` 스킬, `docs/TEMPLATE_SYSTEM.md`가 함께 강제한다.
- **`getFieldValue` 삭제로 누락 필드 방어막이 사라진다.** 각 렌더러의 fallback 이 대체재다(§6).
- 템플릿 작성자는 **스키마만** 쓴다. Content 타입을 손으로 쓰지 않으므로 저작 부담은 오히려 줄었다.
- **후일 Collection 착수 시 §3 의 projected-nav 를 재검토**해야 한다.
- ADR-0007 의 **구조 결정은 유효**하나 **nav 설계는 §3 으로 대체**된다.

## 관련

- [ADR-0013](./0013-content-model-rename.md) — `ContentModel` 명명(유지), migration 021/022. `SiteContent` 기각의 출처.
- [ADR-0007](./0007-single-multi-site-type-structural-union.md) — 구조적 유니온(유지) / nav(§3 이 개정).
- [ADR-0015](./0015-edit-loss-paths-exhaustive-defense.md) — 저장 시점 검증(§6 의 전제), 블로킹/경고 기준.
- [ADR-0008](./0008-keep-explicit-di-factories.md) — 읽기 경로의 registry 격리(§5 계층 배치의 근거).
- [ADR-0003](./0003-asset-upload-two-phase-cleanup.md) — asset slot_key / 참조 카운팅(§5, §7).
- Collection 연기: [`docs/plans/PLAN_crud_array_field.md`](../plans/PLAN_crud_array_field.md).
- [migration 026](../migrations/026_field_to_value.md) / [migration 027](../migrations/027_block_menu.md) — 구현·데이터 전환 기록.
