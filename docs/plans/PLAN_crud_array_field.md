# Plan — Collections (Phase 2, deferred)

_Phase 1 (`array` 필드) 는 완료되어 main 에 머지됨. 본 문서는 Phase 2 인 Collections 작업이 시작될 때 RFC 의 출발점으로 사용._
_관련: `docs/TEMPLATE_SYSTEM.md` (특히 §2 데이터 모델, §6 validate, `fieldsSchema` 변경)_

---

## 트리거 조건 (어느 하나라도 발생 시 시작)

- 블로그/공지에 **상세 페이지 URL** 요구 (`/notice/[slug]`, SEO·RSS·sitemap 필요)
- 항목 수 **수백 이상** — 단일 row JSONB 가 비대해져 read 비용 문제
- **외부 사용자 입력** (인증 없는 리뷰 작성, 예약 신청) — RLS 분리 필요
- 항목 단위 **검색·페이지네이션·필터** 요구

---

## 설계 스케치 (시작할 때 RFC 로 다시 씀)

- 신규 테이블 `collections (id, site_id, slug, schema_jsonb, ...)` + RLS
- 신규 테이블 `collection_items (id, collection_id, data_jsonb, slug, ordinal, ...)` + 인덱스
- `FieldDescriptor` 에 collection 참조 descriptor 추가 — 구체적인 Value 모양과 참조 무결성은 착수 시 RFC 에서 결정
- 다이나믹 라우트: 기존 `src/app/site/[domain]/[[...slug]]/page.tsx` 가 slug 마지막 segment 를 `collection_item.slug` 로 조회 (Page 조회 실패 시의 폴백 분기 — 새 라우트 세그먼트를 추가하지 않는다)
- 어드민 UI: collection schema 빌더
- 사용자 UI: collection 콘텐츠 CRUD (현 블록 에디터와 분리된 화면)
- 마이그레이션: array 필드로 운영 중인 사이트를 collections 로 옮기는 import 스크립트

---

## 추정 작업량

**4~6 주 풀타임** (실제 시작 시 재추정). DB 스키마, RLS, 라우터, 두 종류 어드민 UI, 마이그.

---

## Phase 1 과의 호환성

- `array` 필드는 그대로 유지. "리스트만 보여주면 충분한 케이스" 는 영원히 array 로 남는 게 합리적 — 모든 걸 collections 로 옮기지 않는다.
- 실제로 옮길 후보: blog/notice/review 같이 detail page·검색이 필요한 것만.

---

## 변경 안 할 것 (의도적)

- 멀티페이지 — 별개 작업으로 분리 (이미 ADR-0007 로 출시됨: `ContentModel` `mode:'multi'` 유니온). CRUD 와 독립적으로 진행 가능.
- Template 간 Block component 공유 — `docs/TEMPLATE_SYSTEM.md` §12 비-목표 유지.
- 사용자가 에디터에서 새 Block 추가·삭제 — §12 비-목표 유지. Collections 는 Block 내부 Value 와 별개의 콘텐츠 저장 경로를 추가하는 작업이다.
