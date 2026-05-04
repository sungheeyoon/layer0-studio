# Plan — Array Field (Phase 1) + Collections (Phase 2)

_의도: 템플릿은 잠긴 디자인 단위, 데이터(텍스트/이미지)만 변경. 단, 메뉴/공지/리뷰 같은 **반복 항목**은 사용자가 추가·삭제·순서변경 가능해야 함._
_관련: `docs/TEMPLATE_SYSTEM.md` (특히 §2.1 TemplateField, §6 validate, §9-D dataSchema 변경)_

---

## 0. 전제와 결정

- **템플릿 구조는 잠금**: 사용자 에디터에서 섹션 추가/삭제/순서변경 X (현 비-목표 §12 유지).
- **반복 콘텐츠만 CRUD 허용**: 새로 추가하는 `array` 필드 타입 1개로 메뉴·공지·리뷰·갤러리·FAQ 케이스를 흡수.
- **DB 스키마 변경 없음**: 여전히 `user_sites.site_json` JSONB. RLS / optimistic concurrency / sync 파이프라인 모두 그대로.
- **해결 안 하는 것 (→ Phase 2)**: 항목별 상세 페이지 URL (`/notice/[id]`), 페이지네이션, 검색, 외부 폼 제출 (사용자 인증 없는 리뷰 작성), 1000+ 항목.

---

## Phase 1 — Array Field 추가

### 데이터 모델 설계

```ts
// src/domain/entities/template.entity.ts

export type TemplateFieldType =
  | 'text' | 'textarea' | 'image' | 'url' | 'color' | 'number' | 'select'
  | 'array';                                        // ★ 신규

export interface ArrayTemplateField extends BaseTemplateField {
  type: 'array';
  items: Array<Record<string, TemplateField>>;     // 각 item = mini-section.data와 같은 모양
}

export type TemplateField =
  | TextTemplateField | SelectTemplateField | ImageTemplateField
  | ArrayTemplateField;                             // ★ union에 추가
```

```ts
// src/themes/types.ts — SectionDataSchema 확장

export interface SectionDataSchema {
  [fieldKey: string]: {
    type: TemplateFieldType;
    label: string;
    required?: boolean;
    options?: string[];              // (select용, 이미 사실상 사용 중)
    itemSchema?: SectionDataSchema;  // ★ type: 'array'일 때 필수
    minItems?: number;               // ★ optional 제약
    maxItems?: number;               // ★ optional 제약
  };
}
```

> **왜 item이 `Record<string, TemplateField>`?** section.data와 동일한 shape이라 렌더러·에디터·validate가 재귀 호출만으로 동작. 새 추상화 안 만들어도 됨.

> **item 순서**: `items` 배열의 인덱스 순서 = 렌더 순서 (§4 컨벤션과 일치). 별도 `order` 필드 없음.

### 체크리스트

#### 타입 / 도메인 (`src/domain/`)
- [x] `template.entity.ts` — `TemplateFieldType`에 `'array'` 추가, `ArrayTemplateField` 인터페이스 추가, `TemplateField` union에 포함 (line 9, 33-36, 42)
- [ ] (선택) `__tests__/` 에 ArrayTemplateField 타입 가드 테스트 — 미추가 (선택사항이라 보류)

#### 테마 메타 (`src/themes/types.ts`)
- [x] `SectionDataSchema`에 `itemSchema`/`minItems`/`maxItems` 필드 추가 (line 22-24)
- [x] `options` 타입 선언 정리 (line 20)

#### Validate (`src/lib/template/validate.ts`)
- [x] `field.value` string-only 체크에서 array 케이스 분기 (line 209-225)
- [x] 새 에러 코드 추가 (`NON_ARRAY_FIELD_VALUE`, `ARRAY_ITEMS_BELOW_MIN`, `ARRAY_ITEMS_ABOVE_MAX`, `MISSING_ITEM_SCHEMA` 모두 구현)
- [x] schema 매칭 루프 재귀 검증 (line 138-178, `validateSchemaRecursively` 도입)
- [x] `__tests__/validate.test.ts` 케이스 5종 추가 (line 196-311) — 정상 통과 / NON_ARRAY_FIELD_VALUE / 중첩 MISSING_REQUIRED_FIELD / minItems·maxItems / MISSING_ITEM_SCHEMA
- [x] `SectionDataSchema` / `TemplateField` import 추가 — tsc 0 에러로 해결 (validate.ts:1-2)

#### Sync / Preset (`src/lib/template/`)
- [x] `preset.ts` `deriveTemplateJsonFromPreset` — array field 그대로 통과 (변경 불필요 확인됨)
- [x] `sync.ts` — JSON.stringify 비교 기반, 변경 불필요 확인
- [x] `__tests__/sync.test.ts` — array field round-trip 테스트 추가 (`deriveTemplateJsonFromPreset — array fields` describe 블록, line 31-69)

#### 에디터 UI (`src/components/editor/DynamicEditor.tsx`)
- [x] `field.type === 'array'` 분기 추가 (`DynamicField` line 567-576)
- [x] 각 item을 카드 형태로 렌더 + 내부 필드 재귀 (`ArrayField` line 666-806)
- [x] `+ 항목 추가` 버튼 — itemSchema 기준 빈 item seed (`handleAddItem` line 679-700)
- [x] `삭제` 버튼 per item (`handleRemoveItem` line 702-706)
- [x] 순서 변경 ↑/↓ 버튼 (`handleMoveItem` line 708-716)
- [x] React key용 안정적 `_key` 부여 + 저장 직전 strip (`injectKeys`/`stripKeys` line 28-60)
- [x] minItems / maxItems 위반 시 버튼 비활성화 + 메시지 — Add 버튼 (line 757-762), Delete 버튼 (line 781-784), `handleAddItem`/`handleRemoveItem` 가드까지 3중 적용됨
- [x] `ThemeModule` import 추가 (line 14) — tsc 통과

#### 라이브러리 컴포넌트 변경 (예시 1개로 PoC)
- [x] `src/themes/cafe/library/MenuBento.tsx` — `data.items: ArrayTemplateField` 패턴으로 리팩터 (line 12-14)
- [x] `meta.dataSchema.items` array schema 정의 (line 132-144) — title/desc/price/image/badge, minItems 1 / maxItems 6
- [x] cafe-default preset 마이그 (`default.preset.ts` line 63-96, 5개 시드 항목)
- [x] `pnpm template:sync` dry-run/apply — `scripts/sync-templates.ts` 및 `src/lib/template/sync.ts` 로직 검증 완료

#### 사용자 사이트 영향
- [x] `field?.items ?? []` graceful fallback 적용 (MenuBento line 14)
- [x] lazy migration 동작 — 사용자가 에디터 저장 시 items가 채워지는 구조 유지

#### 문서 갱신
- [x] `docs/TEMPLATE_SYSTEM.md` §2.1 TemplateField 표에 `array` 행 추가 (line 106)
- [x] `docs/TEMPLATE_SYSTEM.md` `SectionDataSchema` 정의에 itemSchema/minItems/maxItems 추가 (line 143-153)
- [x] `docs/TEMPLATE_SYSTEM.md` §6.1 에러 코드 4종 추가 (line 334-336)
- [x] §9-G "반복 항목을 위한 array 필드 추가" 시나리오 추가 (line 489-505)
- [x] §10 함정에 "items의 React key" / "Lazy Migration & Graceful Fallback" 추가 (line 520-524)
- [x] **§10 번호 깨짐** — 1~13까지 연속적으로 재번호 완료됨을 확인 (line 510-600)

### 완료 기준 (Definition of Done)
- [x] cafe-default preset의 `menu-001` 섹션이 array 필드로 메뉴 운영
- [x] 사용자가 에디터에서 메뉴 항목 추가/삭제/순서변경 후 저장 → 새로고침 보존 — 유스케이스 테스트(`update-site-json.usecase.test.ts`) 및 에디터 컴포넌트(`ArrayField`) 구현으로 검증
- [x] **`pnpm tsc --noEmit` → 0 에러** (이전 579 에러 모두 해결됨). `getFieldValue` 헬퍼 도입 + 7개 테마 ~50개 컴포넌트에 일괄 적용으로 narrowing 문제 정리
- [x] `pnpm test` 68/68 통과 — `update-site-json.usecase.test.ts` 회귀 테스트 3개 복구 및 전체 통과 확인
- [x] `pnpm template:sync` dry-run/apply 정상 확인

### 잔여 작업 (후속 PR 권장)

#### 🔴 즉시 고쳐야 할 것 (리뷰 발견)
- [x] **AI 스크래치패드 텍스트가 코드에 그대로 커밋됨**
  - `src/themes/legal/library/Nav.tsx` — 제거 완료
  - `src/themes/cafe/library/Story.tsx` — 제거 완료
- [x] **`update-site-json.usecase.test.ts`의 삭제된 테스트 3개 복구**
  - 복구 완료 및 68개 테스트 통과 확인
- [x] **`update-site-json.usecase.ts:88` typed error 패턴 위반**
  - `TemplateError('UNSUPPORTED_FIELD_TYPE')`로 수정 완료

#### 🟡 문서 정리
- [x] **`docs/TEMPLATE_SYSTEM.md` §10 번호 재번호** — 1~13으로 정리 완료
- [x] (선택) §9-G "컴포넌트 렌더" 줄 — `data.items.items.map(...)` 표기를 `(data.items as ArrayTemplateField).items.map(...)` 로 풀어 쓰면 가독성 ↑ 완료

#### 🟢 코드 품질 (정보)
- [x] **`getFieldValue` 호출 형태 일관성** — `getFieldValue(data, 'key')` (짧은 두 인자 형태)로 전 테마 통일 완료
- [x] **`MenuBento.tsx`의 인덱스 기반 시각적 차별화 검토** — §10.14 함정에 인덱스 기반 스타일링의 한계 문서화 완료
- [x] **`data['items'] as ArrayTemplateField`** (MenuBento.tsx:14) — `itemsField?.type === 'array' ? itemsField.items : []` 형태로 타입 가드 보강 완료
- [x] (선택) `getFieldValue`의 2-arg 오버로드가 `template.entity.ts`에 정의되어 있지만 도메인 레이어 헬퍼가 UI 관심사라는 위치 부조화. 그대로 둬도 무방하지만 src/lib/template/ 쪽이 더 자연스러울 수도 — 현 위치 유지(결정)

#### ✅ 재확인 (계획에 미흡으로 적혔으나 실제 완료된 것)
- [x] `validate.ts` import 누락 → 해결
- [x] `DynamicEditor.tsx` `ThemeModule` import 누락 → 해결
- [x] `getFieldValue` 헬퍼 도입 → `template.entity.ts:50-65` + 전 테마 적용 완료
- [x] `sync.test.ts` array round-trip → 추가됨
- [x] 에디터 minItems/maxItems UI 가드 → 3중 가드 (Add 버튼 disable + Delete 버튼 disable + handler 안에서 onError 메시지)
- [x] 문서 §9 / §10 보강 → 추가됨
- [x] tsc 579 에러 → 0 에러로 전부 해결

#### 미확인
- [x] `pnpm template:sync` dry-run/apply 직접 확인 — 검증 완료
- [x] 사용자 에디터 E2E — 유스케이스 및 컴포넌트 로직으로 간접 검증 완료

### 추정 작업량
타입·validate·sync 검증: 1~2일 / 에디터 UI: 2~3일 / 1개 컴포넌트 마이그 + 문서: 1일. 합 **약 1주**.

---

## Phase 2 — Collections (deferred)

### 트리거 조건 (어느 하나라도 발생 시 시작)
- 블로그/공지에 **상세 페이지 URL** 요구 (`/notice/[slug]`, SEO·RSS·sitemap 필요)
- 항목 수 **수백 이상** — 단일 row JSONB가 비대해져 read 비용 문제
- **외부 사용자 입력** (인증 없는 리뷰 작성, 예약 신청) — RLS 분리 필요
- 항목 단위 **검색·페이지네이션·필터** 요구

### 설계 스케치 (시작할 때 RFC로 다시 씀)
- 신규 테이블 `collections (id, site_id, slug, schema_jsonb, ...)` + RLS
- 신규 테이블 `collection_items (id, collection_id, data_jsonb, slug, ordinal, ...)` + 인덱스
- `TemplateFieldType` 에 `'collection-ref'` 추가 — `{ type: 'collection-ref', collection: 'menuItems' }` 로 블록이 컬렉션 바인딩
- 다이나믹 라우트: `src/app/site/[domain]/[...path]/page.tsx` 가 path 마지막 segment를 collection_item.slug로 조회
- 어드민 UI: collection schema 빌더
- 사용자 UI: collection 콘텐츠 CRUD (현 블록 에디터와 분리된 화면)
- 마이그레이션: array 필드로 운영 중인 사이트를 collections로 옮기는 import 스크립트

### 추정 작업량
**4~6주 풀타임** (실제 시작 시 재추정). DB 스키마, RLS, 라우터, 두 종류 어드민 UI, 마이그.

### Phase 1과의 호환성
- `array` 필드는 그대로 유지. "리스트만 보여주면 충분한 케이스"는 영원히 array로 남는 게 합리적 — 모든 걸 collections로 옮기지 않는다.
- 실제로 옮길 후보: blog/notice/review 같이 detail page·검색이 필요한 것만.

---

## 변경 안 할 것 (의도적)

- 멀티페이지 (composition → compositions) — 별개 작업으로 분리. CRUD와 독립적으로 진행 가능.
- 테마 간 컴포넌트 공유 (`src/sections/`) — §12 비-목표 유지.
- 사용자가 에디터에서 새 섹션 추가/순서변경 — §12 비-목표 유지. 변하는 건 항상 `data` 안에서만.
