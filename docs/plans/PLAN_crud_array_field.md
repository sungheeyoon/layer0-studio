# Plan — Array Field (Phase 1) + Collections (Phase 2)

_의도: 템플릿은 잠긴 디자인 단위, 데이터(텍스트/이미지)만 변경. 단, 메뉴/공지/리뷰 같은 **반복 항목**은 사용자가 추가·삭제·순서변경 가능해야 함._
_관련: `docs/TEMPLATE_SYSTEM.md` (특히 §2.1 TemplateField, §6 validate, §9-G dataSchema 변경)_

---

## 0. 전제와 결정

- **템플릿 구조는 잠금**: 사용자 에디터에서 섹션 추가/삭제/순서변경 X (현 비-목표 §12 유지).
- **반복 콘텐츠만 CRUD 허용**: 새로 추가하는 `array` 필드 타입 1개로 메뉴·공지·리뷰·갤러리·FAQ 케이스를 흡수.
- **DB 스키마 변경 없음**: 여전히 `user_sites.site_json` JSONB. RLS / optimistic concurrency / sync 파이프라인 모두 그대로.
- **해결 안 하는 것 (→ Phase 2)**: 항목별 상세 페이지 URL (`/notice/[id]`), 페이지네이션, 검색, 외부 폼 제출 (사용자 인증 없는 리뷰 작성), 1000+ 항목.

---

## Phase 1 — 잔여 작업 (리뷰 발견)

> Phase 1 본 구현·문서·테스트는 완료. 리뷰 중 발견된 회귀/누락만 남김.

### 🔴 버그 — autosave가 `_key` 임시 필드를 DB에 영구화
- [ ] **`DynamicEditor.tsx:120` `scheduleAutoSave`가 `stripKeys`를 호출하지 않음**
  - 현재: `await saveSiteJsonAction(site.id, siteJsonRef.current, ...)` — raw JSON 그대로 전송
  - 명시 저장(`handleSave:223`, `handlePublish:240`)은 `stripKeys(siteJson)`로 감쌈 → 일관성 깨짐
  - 결과:
    1) 4초 idle 자동저장이 한 번이라도 발동하면 `_key` random text 필드가 DB에 박힘
    2) validate가 `UNKNOWN_DATA_FIELD` warning 누적
    3) MenuBento 등 렌더러에서 `getFieldValue(item._key)`가 명시저장/자동저장에 따라 다른 값을 돌려줌 → React key 비결정적
  - 수정: `scheduleAutoSave` 안에서도 `stripKeys(siteJsonRef.current)`로 전송 + 가능하면 `stripKeys`를 단일 헬퍼화하여 3곳에서 공통 사용

### 🟡 렌더러의 `_key` 의존 제거
- [ ] **`MenuBento.tsx:23` `getFieldValue(item._key) || String(idx)`** — `_key`는 에디터 in-memory only로 설계됨(저장 직전 strip). 위 autosave 버그 수정 후에는 항상 `String(idx)`로 떨어지므로 `_key` 참조 자체를 제거하거나, _key를 정식 데이터 필드로 정의하고 strip 로직을 제거하는 방향 중 하나로 정리 (현재는 두 모드가 섞여 있음).

### 🟡 회귀 테스트 보강
- [ ] **`UpdateSiteJsonUseCase.execute` array round-trip 테스트** — 에디터의 array CRUD 저장은 `execute` 경로(전체 교체)로 흐른다. 현재 `update-site-json.usecase.test.ts`는 `executeFieldUpdate`만 7개 테스트. array 필드를 포함한 `execute` 호출 후 `userSiteRepository.updateSiteJson`에 array가 그대로 통과되는지 검증 케이스 1개 추가.
- [ ] **`executeFieldUpdate` array 분기 테스트** — `update-site-json.usecase.ts:88`이 `TemplateError('UNSUPPORTED_FIELD_TYPE')`을 throw하지만 회귀 테스트가 없음. 1줄짜리 케이스 추가.

### 완료 기준 (재정의)
- [ ] autosave 경로에서도 `_key`가 DB에 들어가지 않음 (수동 검증: 에디터에서 4초 대기 → DB row의 `data.items.items[*]._key` 부재 확인)
- [ ] `pnpm test` 통과 (위 2개 테스트 추가 후 70/70)
- [ ] 렌더러의 `_key` 의존 제거 또는 정식화 결정 반영

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
