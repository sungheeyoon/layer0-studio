# Block 리네임 + Field/Value 분리 — ADR-0007 구조는 유지, nav 모델은 개정

> **Status: Accepted — 미구현 (설계 확정, 구현 대기).** 단일 파괴적 JSONB 마이그레이션 + codemod 로 일괄 적용 예정.
>
> **이력:** `docs/architecture/` Part 1–4 초안을 그릴링으로 확정한 결과이며, 원본 초안과는 특히 nav/menu 모델에서 차이가 있다(§3). 2026-08-10 그릴링에서 두 가지가 더 바뀌었다 — (1) §4(Field 정직화)를 **스키마/Value 분리**로 확장했고, (2) 초안이 물려준 `→ SiteContent` 리네임을 **취소**했다(§2 하단 "기각된 리네임"). 취소 전까지 이 ADR 의 제목은 "SiteContent 리네임" 이었다.
>
> **읽는 법:** 아래 AS-IS 서술이 **현재 코드/DB 의 진실**이고, TO-BE 가 목표다. `CONTEXT.md` 는 이번엔 예외적으로 구현 전에 TO-BE 어휘로 갱신되어 있다(Consequences 참고) — 즉 CONTEXT.md 와 코드가 지금 어긋나 있는 것은 의도된 상태다.

## Context

`docs/architecture/` Part 1–4 는 현재 데이터 모델의 재설계를 제안했다. 초안은 두 종류의 변경을 한 봉투에 섞었다: (A) **순수 리네임/정직화** 와 (B) **구조 통일**(Single 을 `pages:[Page]` 로, Chrome 을 양쪽 공통으로, 단일 mode-blind 렌더러). 초안 (B) 는 [ADR-0007](./0007-single-multi-site-type-structural-union.md) + migration 018 이 *의도적으로 반대 방향으로* 이미 확정한 결정(`{pages:[home]}` → `{mode:'single', sections}` 평탄화)을 자각 없이 되돌리는 것이었다.

이 재설계의 **1순위 목표는 데이터 모델의 정직성/명명 정리**이며, 렌더러 통일이 아니다. 따라서 (B) 는 기각하고 (A) 만 채택한다. "지금이 가장 싼 시기"라는 타이밍 논거는 **기존 콘텐츠 JSONB 를 변형하는 마이그레이션**에만 유효하다(유저 0 → 변형 비용 0). Collection 같은 순수 추가 인프라에는 이 이득이 없으므로 별도 판단한다([Part 5 appendix](../architecture/appendix-open-questions.md), 연기).

**초안이 ADR 을 앞선다는 사실 자체가 이 ADR 의 반복된 함정이었다.** 초안은 ADR-0007 과 ADR-0013 이전에 쓰였고, 두 번 모두 "초안이 제안 → ADR 이 이미 반대로 결정" 이 발생했다: (B) 구조 통일(ADR-0007 이 기각)과 `→ SiteContent` 리네임(ADR-0013 이 기각, §2 하단). 초안에서 무언가를 물려올 때는 그 항목을 이미 다룬 ADR 이 있는지 먼저 확인할 것.

## Decision

### 1. ADR-0007 구조는 그대로 유지 — 통일하지 않는다

`mode` 판별 구조적 유니온을 유지한다. **Single = `blocks[]` 직접(Page 없음), Multi = `pages[]` + `chrome`.** 렌더러는 `renderSingleSite` / `renderMultiSite` **2개를 그대로** 둔다. 다음 초안 제안은 **기각**:

- ❌ Single = `pages:[Page]` (튜플) — migration 018 을 되감고 죽은 필드(slug/visible/페이지 menu) 부활. churn.
- ❌ Chrome 을 `SiteBase` 공통으로(Single 에도) — Single 의 nav/footer 는 계속 `blocks[]` 안 인라인(에디터가 상/하단 고정).
- ❌ 단일 mode-blind `renderSite()` — 통일은 목표가 아님. 단 mode-aware 헬퍼(`deriveNav`/`allBlocks` 등)는 리네임하며 유지.

### 2. 어휘 리네임 (도메인 의미 반영)

**AS-IS 열은 지금 코드에 실재하는 식별자다** — codemod 가 대상으로 삼을 수 있도록 검증했다(`src/domain/entities/template.entity.ts`, `src/templates/types.ts` 기준, 2026-08-10).

| AS-IS (현재 코드) | TO-BE | 위치 |
|---|---|---|
| `Section` | `Block` | `template.entity.ts` |
| `SingleSection` | `SingleBlock` | `template.entity.ts` |
| `SingleContent.sections` | `SingleContent.blocks` | `template.entity.ts` |
| `Page.sections` | `Page.blocks` | `template.entity.ts` |
| `MultiContent.shared` | `MultiContent.chrome` | `template.entity.ts` |
| `NavMeta` | `MenuEntry` (모양도 개정 — §3) | `template.entity.ts` |
| `allSections()` | `allBlocks()` | `template.entity.ts` |
| `Field` union (`TextField`/`SelectField`/`ImageField`/`ArrayField`) | `Field` = **스키마 서술자 전용**, 인스턴스 데이터는 `Value` 계열로 분리 | `template.entity.ts` (§4) |
| `getFieldValue()` | **삭제** — Value 가 이미 순수 값이라 벗길 래퍼가 없음 | `template.entity.ts` |
| `SectionComponentMeta` | `BlockComponentMeta` | `templates/types.ts` |
| `SectionFieldsSchema` | `BlockFieldsSchema<T>` (제네릭 — §4) | `templates/types.ts` |
| `SectionComponent` | `BlockComponent` | `templates/types.ts` |
| `TemplateSectionProps` | `TemplateBlockProps` | `templates/types.ts` |
| `NavSectionProps` | `NavBlockProps` | `templates/types.ts` |

**바뀌지 않는 것:** `block.fields` 의 **키 이름 `fields` 는 유지**된다(migration 022 가 이미 `data`→`fields` 를 끝냄). 다만 그 안에 담기는 것이 `Field` 객체에서 **Value** 로 바뀐다 — 키는 그대로, 내용물의 의미가 바뀌는 것이다. `Block.type`(componentKey dispatcher), `Block.id`, `Block.visible`, `ContentModel`/`SingleContent`/`MultiContent`, `mode` 판별자, `isSingleContent`/`isMultiContent` 도 그대로다.

"Section" 은 완전히 은퇴하고 **Block** 이 유일한 최소 콘텐츠 단위가 된다. `chrome` 은 Multi 전용이며 `shared` 의 리네임일 뿐(양쪽 공통 아님).

#### 기각된 리네임: `ContentModel → SiteContent`

초안(그리고 2026-08-10 이전의 본 ADR 제목)은 최상위 유니온을 `SiteContent` 로 바꾸자고 했다. **기각한다** — [ADR-0013](./0013-content-model-rename.md) 이 **이미 이 정확한 제안을 검토해서 반대로 결정했고, 구현·배포까지 끝났다**(migration 021 이 컬럼을 `content`/`snapshot` 으로 리네임). 그 근거는 지금도 유효하다: `Template` 과 `UserSite` **두 엔티티가 이 타입을 공유**하므로, 한쪽 엔티티 이름을 타입에 박으면 `Template.content: SiteContent` 가 "Template 이 Site 를 담는다"로 읽힌다. `ContentModel` 은 그래서 엔티티 중립적으로 고른 이름이다.

### 3. nav → menu 모델 개정 (ADR-0007 의 nav 설계를 대체)

ADR-0007 은 모든 nav 소스에 `nav: { visible, label }` 를 **필수**로 두고 `nav.label` 이 (Multi 에선) 페이지 이름을 *겸하게* 했다. 이 결합과 중첩 불리언을 걷어낸다.

```ts
interface MenuEntry {
  label: string;                    // 양쪽 필수. Single 블록의 유일한 텍스트, Multi 에선 page.name 과 별개
  placement?: 'header' | 'footer';  // 생략 = header
}
```

- **Single 블록**: `menu?: MenuEntry` — **존재 자체가 "메뉴에 등장"**. `placement` 생략(Single nav = 헤더 앵커뿐, footer-nav 개념 없음).
- **Multi 페이지**: `name: string`(**필수** — 에디터 탭/페이지 이름, nav 소속과 무관) + `menu?: MenuEntry`(nav 소속만). 페이지 이름과 nav 라벨은 **별개 필드**다(짧은 nav 라벨 vs 긴 페이지 이름 허용). ADR-0007 이 폐기했던 "title 이 nav 라벨을 겸함" 결합을 뒷문으로 되살리지 않기 위함.
- **두 축은 보존**: `block.visible`/`page.visible`(존재) × `menu?` 존재(메뉴 노출). `menu` 없음 = 존재하되 어떤 nav 에도 없음.
- **`placement` 는 순개선**: 기존 Multi footer nav 는 `visible && !nav.visible` **부정 파생**이라 "footer 에 링크 노출"과 "아무 nav 에도 없음(URL 로만 도달)"을 구분하지 못했다. `placement:'footer'` = footer nav, `menu` 없음 = 어떤 nav 에도 없음 — 이 구분이 명시적으로 생긴다. `deriveFooterNav` 의 negation 제거.

### 4. Field 정직화 — 스키마/Value 분리 (2026-08-10 그릴링 개정)

Field 가 인스턴스마다 `{type, label, value}` 를 함께 들고 다니는 구조 자체를 버린다. **Field 는 이제 스키마 서술자로만 존재**한다 — `BlockFieldsSchema` 안에서 한 키의 `type`/`label`/`required`/`options`/`itemSchema` 를 선언하는 것이 Field 의 유일한 역할이다. Block 이 실제로 들고 있는 데이터는 **Value** 라 부른다: 인스턴스마다 `type`/`label` 을 중복 저장하지 않고, 스키마가 아는 타입에 맞는 값만 들고 있다.

**왜 분리하는가.** `fieldsSchema` 는 이미 SSOT 로 존재하는데 content 쪽 Field 가 `type`/`label` 을 또 저장하면 drift 가 생긴다(schema 는 `textarea` 인데 content 는 `text` 로 박혀 있는 상태가 지금은 컴파일도, 저장도 된다 — `validate.ts` 의 `FIELD_TYPE_MISMATCH` 규칙이 이 drift 를 막기 위해서만 존재한다). schema 변경 주기(개발자, 드묾)와 content 변경 주기(사용자, 빈번 — 특히 배열 아이템 추가)가 다르므로 분리가 자연스럽다.

#### 4-1. 타입 배치

- **도메인 레벨(`ContentModel`/`Block.fields`)은 계속 loose**: `Record<string, unknown>` 로 유지한다. Block 은 dispatcher 패턴(문자열 `type` → `library[type]`)으로 컴포넌트를 찾으므로, 도메인은 어떤 Block 이 어떤 Value 모양인지 정적으로 알 수 없다(Data-driven 시스템의 본질, Part 1 §3). 강타입은 **각 컴포넌트 파일의 경계에서만** 존재한다 — 컴포넌트가 자신의 `<Name>Content` 인터페이스로 캐스팅한다.
- **컴파일 타임 연결**: 새 제네릭 매핑 타입을 도입한다.

  ```ts
  type BlockFieldsSchema<T> = { [K in keyof T]: FieldDescriptor<T[K]> };

  const menuSchema = { /* … */ } satisfies BlockFieldsSchema<MenuContent>;
  ```

  스키마 키가 콘텐츠 인터페이스와 안 맞으면(오타, 타입 불일치) 컴파일 에러가 난다. `validateContent` 의 런타임 검증은 유지(저장 시점 방어), 컴파일 타임 검증은 그 위의 추가 계층.

#### 4-2. Value 모양

- **NumberValue 는 진짜 `number`**: 빈 입력은 **에디터 경계에서 스키마 default 로 리셋**(렌더러는 `NaN`/`null` 을 보지 않음). 파싱은 경계에서 한 번(`Number()` 를 렌더러가 호출하지 않음). 진짜 optional number 가 나오면 그때 nullable 추가(YAGNI). **콘텐츠로 쓰는 number 필드는 현재 0개 → 마이그레이션 0.**
- **ImageValue 는 예외적으로 여전히 객체**: `{ url: string; assetId?: string | null }`. `assetId` 는 스키마 메타데이터가 아니라 진짜 콘텐츠 데이터 — [ADR-0003](./0003-asset-upload-two-phase-cleanup.md) 의 참조 카운팅/orphan 정리가 이 값을 원본으로 쓴다. **Field 정직화가 "모든 Value 는 스칼라"를 뜻하지 않는다** — 런타임 모양이 실제로 다른 경우는 그 모양을 유지한다. 다만 그 모양이 스키마 메타데이터(`type`/`label`)를 더는 담지 않을 뿐이다.
- **배열 아이템: `id` 는 콘텐츠 인터페이스 *바깥*에 둔다.**

  ```ts
  interface MenuItem { title: string; price: string; image: ImageValue }   // 편집 가능한 키만
  type ArrayValue<T> = Array<{ id: string; fields: T }>;                   // id 는 형제, 안이 아님
  ```

  **이 배치가 Block 과 동일하다** — Block 도 `{ id, type, fields }` 로 id 를 `fields` 밖에 둔다. 배열 아이템만 `id` 를 콘텐츠 인터페이스 *안*에 넣으면 `BlockFieldsSchema<T>` 가 `keyof T` 전체를 매핑하므로 **`id` 에도 편집 UI 서술자(`FieldDescriptor`)를 요구**하게 된다 — `id` 는 저장되는 Value 이지만 사용자가 편집하는 Field 가 아니므로 모순이다. `Exclude<keyof T, 'id'>` 같은 시스템 키 제외 매크로로도 풀 수 있지만, 그러면 콘텐츠 인터페이스마다 "이 키는 시스템 키"를 다시 의식해야 한다. **id 를 형제로 두면 제외 규칙 자체가 필요 없다.**

  `id` 를 두는 이유는 Block 의 `id` 와 같다(React key, DnD 순서, 참조 — Part 1 §4). 지금의 `_key` 주입/제거(`injectKeys`/`stripKeys`, `src/lib/template/keys.ts`)는 배열 아이템에 안정적 식별자가 없어서 **가짜 `_key` Field 를 콘텐츠에 몰래 심었다 빼는** 우회로였다. 그 파일과 호출부는 이번 마이그레이션에서 완전히 제거한다.

이 §4 는 2026-08-10 이전 본 ADR 이 적었던 **"ImageField / ArrayField 는 변경 없음"을 철회**한다 — 런타임 모양은 유지되지만, 두 필드 다 인스턴스가 들고 있던 `label`/`type` 은 제거된다.

### 5. 렌더 경계는 unsafe cast — 그 전제가 되는 스키마 호환성 규칙

렌더러는 `block.fields` 를 자기 `<Name>Content` 로 **검증 없이 캐스팅**한다. 저장 경로(`LibraryAwareSiteContentValidator`, [ADR-0015](./0015-edit-loss-paths-exhaustive-defense.md))가 이미 막았으므로 렌더러에 도달한 Value 는 유효하다고 신뢰한다 — "파싱은 경계에서 한 번"(Part 1 §2.5).

**이 신뢰는 공짜가 아니다.** TypeScript 는 *코드 안의* 스키마와 콘텐츠 인터페이스 관계만 본다. **이미 DB 에 저장된 JSON 이 새 코드의 스키마와 맞는지는 아무도 확인해주지 않는다.** 게다가 지금 `getFieldValue` 가 `if (!field) return ''` 로 조용히 메워주던 누락 필드 방어막이 사라진다(`template.entity.ts:52`) — 캐스팅 후에는 누락 키가 `undefined` 로 그대로 렌더러에 들어간다. 따라서 다음을 **규칙으로 못박는다**:

**배포된 Template 의 스키마 변경은 기본적으로 하위 호환(additive)이어야 한다.**

| 변경 | 판정 | 조건 |
|---|---|---|
| optional 필드 추가 | ✅ 허용 | 렌더러가 반드시 fallback (`?? ''`, `?? 0`) 을 둔다 |
| `label` 변경, `required` 완화, `options` 확장 | ✅ 허용 | Value 모양이 안 바뀜 |
| 필드명 변경 | ⛔ 파괴적 | |
| 필수 필드 추가 | ⛔ 파괴적 | |
| 값 타입 변경 (`text`→`number` 등) | ⛔ 파괴적 | |
| 배열 `itemSchema` 구조 변경 | ⛔ 파괴적 | |

**파괴적 변경을 하려면** `templates.content` + `user_sites.content` + `user_sites.snapshot` 세 컬럼을 **함께** 마이그레이션하고, 전 행을 현재 Template Library 스키마로 검증해 통과한 뒤에만 배포한다(§7 "실행 절차").

이 규칙은 CLAUDE.md 의 기존 "렌더러 변경은 additive 여야 한다" 를 **필드 수준까지 확장**한 것이다. 기존 규칙은 componentKey 삭제/리네임(→ 섹션이 조용히 사라짐)만 다뤘고, 필드 추가 시 렌더러 fallback 의무는 명시돼 있지 않았다.

### 6. 에셋 참조 탐색을 스키마 기반으로 전환

현재 `collectAssetUsages(content)` 는 콘텐츠만 순회하며 `field.type === 'image' && field.assetId` 로 이미지를 찾는다(`src/lib/template/asset-usages.ts:30-33`). **Value 에서 `type` 이 사라지면 이 방식은 그대로 깨진다.** 스키마를 함께 받아 스키마를 따라 걷도록 바꾼다:

```ts
collectAssetUsages(content, templateLibrary)
```

- Field 스키마가 `type: 'image'` 인 키에서 `ImageValue.assetId` 수집
- `type: 'array'` 면 `itemSchema` 로 **재귀** 탐색
- slot_key 에 **배열 인덱스 대신 영구 `item.id`** 사용 (인덱스는 재정렬 시 다른 아이템을 가리킴)

#### ⚠️ 이 전환은 **현재 라이브 데이터 손실 버그**를 함께 닫는다 — 별도 선행 수정 권장

지금 구현은 `section.fields` 최상위만 훑고 **배열 아이템 안의 이미지를 아예 추적하지 않는다**(array 필드는 `f.type === 'image'` 검사에서 그냥 탈락, 재귀 없음). 전체 체인을 따라가면 데이터 손실로 끝난다:

1. 사용자가 배열 아이템에 이미지 업로드 → `assets` 행 `active`, 렌더링 정상
2. `collectAssetUsages` 가 못 보므로 **`asset_usages` 행이 영원히 생기지 않는다** (업로드 confirm 경로는 usage 를 만들지 않는다 — usage 의 유일한 생산자는 저장 시점의 `collectAssetUsages`)
3. `sweep_orphaned_assets` 는 "생성 1시간 경과 + `asset_usages` 행 없음" 을 고아로 판정해 `cleanup_queue` 에 넣는다 (`docs/migrations/008_cleanup_worker_rpc.sql:52-59`)
4. 일 1회 cron 이 큐를 비우며 **스토리지 바이너리를 삭제**
5. 사용자 Site 에는 죽은 CDN URL 을 가리키는 `ImageValue` 만 남는다 (깨진 이미지)

**영향 Template 5개** (배열 `itemSchema` 안에 `image` 를 선언):
`academy-default/Teachers` · `cafe-default/MenuBento` · `medical-clinic/Doctors` · `medical-clinic/Gallery`(`required` + `minItems:1`) · `outdoor-default/CollectionGrid`.

`src/lib/template/__tests__/asset-usages.test.ts` 에 배열 케이스가 없어 회귀 테스트로도 잡히지 않았다.

**이 ADR 의 빅뱅을 기다릴 이유가 없다.** 스키마 기반 재귀 탐색(위)은 Value 분리 없이도 현재 구조(`field.type === 'array'` → `field.items` 재귀)로 지금 고칠 수 있다. **선행 버그 수정 PR 로 분리**하고, 본 ADR 구현 때 그 함수를 스키마 기반으로 다시 쓰는 것을 권장한다. 고아 판정이 이미 지나간 에셋은 되살릴 수 없으므로 `pnpm reconcile:orphaned-assets` 로 현황 확인이 필요하다.

slot_key 네임스페이스도 그에 맞춰 확장한다(배열 아이템 경로 추가). 기존 slot_key 는 이번 빅뱅에서 함께 재생성되므로 호환 부담이 없다.

### 7. 롤아웃 — 스크립트화된 빅뱅

**Registry 의 모든 Template** 을 유지한다(개수를 문서에 박지 않는다 — 추가될 때마다 stale 해지므로). **단일 파괴적 JSONB 마이그레이션 + codemod**, 백워드 호환/`schemaVersion` 없음(솔로·유저 0). §4–6 도 같은 빅뱅에 합친다 — 어차피 같은 파일들을 건드리므로 두 번 churn 하지 않는다.

**영향 범위**: `template.entity.ts` · `src/templates/**`(preset + library + 렌더러) · 렌더러 2개 · 에디터(`DynamicEditor.tsx` 의 `FieldFactory` — `field.type` 대신 스키마에서 타입 조회) · `validate.ts`("content 가 자기 type/label 을 들고 있다" 전제의 규칙 재작성: `FIELD_TYPE_MISMATCH`/`MISSING_FIELD_TYPE`/`MISSING_FIELD_LABEL`/`UNKNOWN_DATA_FIELD`) · `src/lib/template/keys.ts`(삭제) · `src/lib/template/asset-usages.ts`(§6) · save RPC · sitemap · 테스트.

**DB 마이그레이션 대상 (migration 021 이후의 실제 컬럼명)**:

```text
templates.content
user_sites.content
user_sites.snapshot
```

#### 실행 절차

```text
1. pg_dump 백업
2. dry-run — 대상 행 수 확인
3. 세 컬럼 전체 변환
4. 변환된 전 행을 현재 Template Library 스키마로 전수 검증
5. 오류가 하나라도 있으면 중단 (부분 적용 금지)
6. 코드와 DB 를 같은 배포 단위로 전환 (coordinated deploy)
```

**롤백**: 코드만 `git revert` 해도 **이미 변환된 JSONB 는 돌아오지 않는다.** 복구 경로는 1번 백업 복원이다. 역변환 스크립트는 만들지 않는다 — 021/022(동종의 파괴적 마이그레이션)도 coordinated deploy + 백업으로만 처리한 선례이고, 유저 0 상태에서 역변환 스크립트를 유지보수할 이유가 없다.

## Considered & Rejected

- **`ContentModel → SiteContent` 리네임** — ADR-0013 이 같은 제안을 이미 기각·구현 완료. §2 하단 참조.
- **Single = `pages:[Page]` 로 통일** — migration 018 이 이미 반대로 확정. 되감으면 죽은 필드 부활 + 이중 마이그레이션. 렌더러 통일이 목표가 아니므로 이득 없음.
- **배열 아이템 `id` 를 콘텐츠 인터페이스 안에 두고 `Exclude<keyof T, 'id'>` 로 제외** — 동작은 하지만 콘텐츠 인터페이스마다 "시스템 키" 개념을 다시 의식해야 한다. `id` 를 `fields` 의 형제로 두면(= Block 과 동일 배치) 제외 규칙 자체가 불필요(§4-2).
- **렌더 경계에서 safe parse(매 렌더 재검증)** — 저장 시점에 이미 도는 스키마 워크를 렌더마다 반복. 대신 §5 의 호환성 규칙으로 전제를 보장한다.
- **`schemaVersion` + 하위 호환 레이어** — 유저 0 이라 변형 비용이 0 인 지금이 가장 싼 시기. 호환 레이어는 영구 유지보수 부채.
- **Collection(Part 5) 을 이번에 번들** — **연기.** 이유 세 가지: (1) Collection 은 nav 에 Page/Block 이 아닌 항목("Products" → 컬렉션 목록)을 넣어 **projected nav 로 표현 불가** → 저장된 `navigation` SSOT 를 강제 → **본 ADR §3 의 projected-nav 결정과 충돌.** (2) 순수 추가 인프라라 "유저 0" 타이밍 이득 없음. (3) 쓰는 템플릿 0개 + appendix 스스로 CollectionBlock 을 "rule of three 후" 로 못박음. **리네임 시 미래 여지만 남긴다**: `ContentModel` 이 후일 top-level `collections`/`navigation` 을 받을 수 있게, Block dispatcher 가 Data Block 을 수용할 수 있게. 테이블/CRUD/라우팅/쿼리는 만들지 않음.

## Consequences

- **(예외, 2026-08-10) CONTEXT.md 는 구현 전에 갱신했다** — 원래 방침("구현 시점에 수행, 미구현 상태에서 먼저 바꾸면 오도")에서 벗어난 결정. 어휘 변화가 누적되어 그릴링 없이는 따라가기 어려워졌다는 판단. **코드는 여전히 Section/`shared`/`NavMeta`/`{type,label,value}` Field 그대로**이므로, CONTEXT.md 는 문서 최상단 배너로 TO-BE 임을 밝힌다. 코드의 현재 진실은 본 ADR 의 §2 AS-IS 열이다.
- **§5 의 호환성 규칙은 이 ADR 구현 이후 상시 규칙**이다. `new-template` 스킬과 템플릿 저작 문서(`docs/TEMPLATE_SYSTEM.md`)에도 반영해야 한다 — "필드 추가 시 렌더러 fallback 필수".
- **`getFieldValue` 삭제로 누락 필드 방어막이 사라진다.** 각 렌더러가 자기 fallback 을 갖는 것이 그 대체재다(§5).
- **후일 Collection 착수 시 §3 의 projected-nav 를 재검토**해야 한다(projected → stored/hybrid). 그때 nav 모델 재설계를 Collection 작업에 포함한다.
- ADR-0007 의 **구조 결정은 유효**하나, 그 **nav 설계(`nav:{visible,label}` 필수)는 본 ADR §3 으로 대체**된다.

## 구현 순서

0. **(선행, 본 ADR 과 독립)** 배열 아이템 이미지 asset usage 누락 버그 수정 — §6 참조. 라이브 데이터 손실이므로 빅뱅을 기다리지 않는다.
1. 기반 타입 (`template.entity.ts`, `templates/types.ts` — `BlockFieldsSchema<T>`, `Value` 계열)
2. 템플릿 codemod (`src/templates/**` — preset + library + 렌더러, `satisfies` 부착)
3. 에디터 (`FieldFactory` 스키마 조회, `_key` 제거 → 배열 아이템 `id`)
4. validator + asset traversal (§6)
5. DB migration (§7 절차) — 변환 전/후 JSON fixture 로 계약 테스트 선행
6. 빌드 · `tsc --noEmit` · `pnpm test` · 전수 변환 검증 통과 후 coordinated deploy

## 관련

- [ADR-0013](./0013-content-model-rename.md) — `ContentModel` 명명(유지) + migration 021/022 의 컬럼·키 리네임. `SiteContent` 기각의 출처.
- [ADR-0007](./0007-single-multi-site-type-structural-union.md) — 구조적 유니온(유지) / nav projection(본 ADR §3 이 개정).
- [ADR-0015](./0015-edit-loss-paths-exhaustive-defense.md) — 저장 시점 검증(§5 unsafe cast 의 전제).
- [ADR-0004](./0004-optimistic-concurrency-via-rpc.md) — save RPC 가 리네임된 유니온 스키마를 통과시키는지 확인 필요.
- [ADR-0003](./0003-asset-upload-two-phase-cleanup.md) — asset slot_key + 스키마 기반 탐색(§6).
- 설계 초안: `docs/architecture/` Part 1–4 (본 ADR 이 확정형; nav/menu 모델과 `SiteContent` 는 초안과 다름).
- Collection 연기: `docs/architecture/appendix-open-questions.md`, `docs/plans/PLAN_crud_array_field.md`.
- migration 018/019/021/022 — 리네임 마이그레이션의 선례(패턴 재사용).
