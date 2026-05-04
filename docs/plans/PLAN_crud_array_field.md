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

## Phase 1 — 잔여 작업 (리뷰 발견) ✅ 완료

> Phase 1 본 구현·문서·테스트는 완료. 리뷰 중 발견된 회귀/누락 수정 완료.

### 🔴 버그 — autosave가 `_key` 임시 필드를 DB에 영구화
- [x] **`DynamicEditor.tsx:120` `scheduleAutoSave`가 `stripKeys`를 호출하지 않음**
  - 현재: `await saveSiteJsonAction(site.id, siteJsonRef.current, ...)` — raw JSON 그대로 전송
  - 명시 저장(`handleSave:223`, `handlePublish:240`)은 `stripKeys(siteJson)`로 감쌈 → 일관성 깨짐
  - 수정 완료: `src/lib/template/keys.ts`로 로직 분리 및 `scheduleAutoSave` 적용

### 🟡 렌더러의 `_key` 의존 제거
- [x] **`MenuBento.tsx:23` `getFieldValue(item._key) || String(idx)`** — `_key`는 에디터 in-memory only로 설계됨(저장 직전 strip). 렌더러에서 `_key` 참조를 완전히 제거하고 `String(idx)`를 stable key로 사용하도록 정규화.

### 🟡 회귀 테스트 보강
- [x] **`UpdateSiteJsonUseCase.execute` array round-trip 테스트** — array 필드를 포함한 `execute` 호출 후 `userSiteRepository.updateSiteJson`에 데이터가 온전히 전달되는지 검증 완료.
- [x] **`executeFieldUpdate` array 분기 테스트** — array 필드에 대한 직접 필드 업데이트 시도 시 `UNSUPPORTED_FIELD_TYPE` 에러 발생 검증 완료.

### 완료 기준 (재정의)
- [x] autosave 경로에서도 `_key`가 DB에 들어가지 않음
- [x] `pnpm test` 통과 (전체 테스트 및 신규 추가 테스트 10/10 통과)
- [x] 렌더러의 `_key` 의존 제거 완료

### ✅ Phase 1 작업 결과 요약 (2026-05-04)
- **키 관리 로직 일원화**: `src/lib/template/keys.ts`에 `injectKeys`, `stripKeys`를 구현하여 에디터 전반에서 동일한 로직을 사용하도록 개선.
- **Autosave 버그 수정**: `DynamicEditor.tsx`의 자동 저장 경로에서도 `stripKeys`를 적용하여 임시 필드(`_key`)가 DB에 저장되지 않도록 수정.
- **렌더러 정규화**: `MenuBento.tsx` 등 테마 컴포넌트에서 에디터 전용 필드인 `_key` 참조를 제거하고 `idx` 기반의 stable key 전략 채택.
- **테스트 커버리지**: `UpdateSiteJsonUseCase`에 array 필드 누락/회귀 방지를 위한 2개 케이스 추가 완료.

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
