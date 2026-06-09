# Plan — Multi-page Sites

_Site/Template 이 현재 단일 페이지(`home`)만 실질 지원. 본 문서는 멀티페이지 확장의 출발 RFC._
_관련: `CONTEXT.md` (Page/Section/Renderer 항목, "composition" flagged ambiguity), `docs/TEMPLATE_SYSTEM.md`, [ADR-0001](../adr/0001-beta-model-template-isolation.md), [ADR-0002](../adr/0002-templates-source-of-truth-is-code.md), [ADR-0004](../adr/0004-optimistic-concurrency-via-rpc.md)_

---

## 동기

- 사용자가 멀티페이지 사이트(홈 + 소개 + 메뉴 + 문의 등)를 만들고 싶어함.
- 현 구조는 `TemplateJson.pages[]` 타입은 배열이지만, 프리셋이 `composition` 축약 문법을 쓰는데 이게 **단일 `home` 페이지로 하드코딩**되어 멀티페이지를 표현할 수 없음 (`src/lib/template/preset.ts:34-48`).

## 현재 상태 — 이미 준비된 부분 (좋은 소식)

| 구간 | 상태 | 근거 |
|---|---|---|
| 데이터 모델 | ✅ `pages[]` 이미 배열 | `template.entity.ts` `TemplateJson.pages` |
| 에디터 페이지 전환 | ✅ 이미 구현 | `DynamicEditor.tsx:27,303-321` (`activePageId` + 페이지 탭 UI) |
| 렌더러 페이지별 렌더 | ✅ 이미 구현 | `renderComposition.tsx:34-38` (`activePageId`로 해당 페이지 섹션만) |
| 깊은복사 | ✅ 자동 지원 | `structuredClone`은 트리 전체 복사 |

## 진짜 막힌 곳 (작업 대상)

| # | 막힌 곳 | 현재 |
|---|---|---|
| A | 프리셋이 단일 페이지만 정의 | `composition` → `home` 하드코딩 |
| B | 공개 라우팅이 홈만 서빙 | `/site/[domain]/page.tsx`가 `homePage`만 렌더, 다른 경로 없음 |
| C | 페이지 간 네비게이션 링크 없음 | nav menu1~4가 텍스트, 페이지로 못 감 |
| D | 에디터에 페이지 추가/삭제/이름변경 없음 | 전환만 가능 |

---

## 확정된 설계 결정

### 결정 1 — 공통 헤더/푸터: **사이트 레벨 공유 섹션**
nav/footer를 페이지 밖으로 빼서 `TemplateJson`에 `sharedSections`로. 모든 페이지가 공유, 한 번 편집하면 전체 반영.

### 결정 2 — 페이지 링크: **새 Field 타입 `page-link` + 페이지 선택기**
메뉴 항목이 `page-link` 타입을 갖고, 에디터에서 드롭다운으로 사이트 페이지를 고름. **value에 페이지 slug가 아니라 페이지 id를 저장** → slug(이름)를 바꿔도 링크가 안 깨짐. 렌더 시점에 id→slug로 해석.

### 데이터 모델 변경 (`src/domain/entities/template.entity.ts`)
```typescript
export interface TemplateJson {
  templateKey: string;
  globalStyles: TemplateGlobalStyles;
  sharedSections: {                    // 🆕 결정 1
    header: TemplateSection[];         //   모든 페이지 위에 렌더
    footer: TemplateSection[];         //   모든 페이지 아래에 렌더
  };
  pages: TemplatePage[];               // 페이지 고유 섹션만
}

export type TemplateFieldType = ... | 'page-link';   // 🆕 결정 2
export interface PageLinkTemplateField extends BaseTemplateField {
  type: 'page-link';
  value: string;   // 페이지 id (slug 아님)
}
```

---

## Phase 0 — 기반: `composition` 제거 (전제)

멀티페이지의 필수 전제. composition은 단일 페이지밖에 못 펼침.

- `src/templates/types.ts` — `TemplatePreset`에서 `composition`/`PresetSection` 제거, `templateJson` 필수화
- `src/lib/template/preset.ts` — `deriveTemplateJsonFromPreset` 삭제 (preset이 곧 templateJson)
- 호출부 정리: `src/lib/template/sync.ts:109`, `scripts/lib/validate-and-capture.ts:134`, `src/app/preview/preset/[...key]/page.tsx:30`
- 9× `src/templates/<cat>/<leaf>/template.ts` — full `templateJson`(+ `sharedSections`)으로 변환
- 테스트 갱신: `src/lib/template/__tests__/sync.test.ts`, `validate.test.ts`

## Phase 1 — 타입 + 검증

- `template.entity.ts` — `sharedSections` 추가, `PageLinkTemplateField` 추가, `TemplateField` 유니온/`getFieldValue`에 `page-link` 반영
- 페이지 slug 검증: 사이트 내 유일, URL 안전 문자, `'/'` = 홈
- `validateJson`(`update-site-json.usecase.ts`)에 `sharedSections` 존재 검사 추가

## Phase 2 — 🚨 데이터 마이그레이션 (가장 위험)

JSONB 3컬럼(`templates.template_json`, `user_sites.site_json`, `user_sites.template_snapshot`) — migration 012 선례.

- `docs/migrations/015_multipage_shared_sections.sql`
- 각 row의 `pages[0].sections`에서 nav/footer 섹션을 `sharedSections.header/footer`로 들어올림
- `sharedSections` 없는 row에 빈 기본값 주입
- ⚠️ 템플릿(코드 진실)은 재sync로 끝나지만 **user_sites는 진짜 이관 필요** — 백업 + 드라이런 필수

## Phase 3 — 공개 + 프리뷰 라우팅 (막힌 곳 B)

- `src/app/site/[domain]/page.tsx` → `src/app/site/[domain]/[[...slug]]/page.tsx` (optional catch-all)
- slug로 페이지 resolve, 없으면 `notFound()`
- 렌더 순서: `sharedSections.header` → `page.sections` → `sharedSections.footer`
- `renderComposition.tsx` — 공유 섹션 렌더 지원
- `src/app/preview/[id]/page.tsx` 동일 처리

## Phase 4 — page-link 렌더 + 에디터 선택기 (막힌 곳 C)

- 렌더러: `page-link` 필드 → 페이지 id를 slug로 해석해 `<a href>` 생성
- 에디터: `page-link` 필드 위젯 = 사이트 페이지 드롭다운
- 9× `Navigation.tsx` + `.meta` — menu 필드를 `page-link`로 전환

## Phase 5 — 에디터 페이지 관리 UI (막힌 곳 D)

- `DynamicEditor.tsx` 페이지 탭(303-321) 확장: 추가/삭제/이름변경/순서변경
- 공유 섹션 편집 모드 ("모든 페이지에 적용됨" 표시)
- 가드: 마지막 페이지·홈 삭제 금지
- 섹션 선택 로직 분기: 공유 섹션은 페이지에 안 속하므로 `activePageId` 외 별도 경로

## Phase 6 — 마무리

- 페이지별 SEO(title/meta), 사이트맵에 전 페이지 포함
- 자동저장 RPC가 새 스키마 통과 확인

---

## 트레이서 불릿 (먼저 이걸로 전체 관통 검증)

한 템플릿(예: cafe-default)을 2페이지로 만들어 **공개 URL 렌더 + nav 링크 작동 + 공유 헤더**까지 관통. Phase 0·2·3·4의 최소 슬라이스로 구조를 증명한 뒤 나머지 채움.

## 핵심 리스크

1. **Phase 2 마이그레이션** — user_sites 이관 실패 시 사용자 사이트 깨짐. 백업 + 드라이런 필수.
2. **공유 섹션 + 자동저장 RPC** — `save_site_template_with_lock`가 `sharedSections`를 통과시키는지, `updateSiteJson`(`supabase-user-site.repository.impl.ts:129-149`)의 asset usage 수집 루프가 공유 섹션도 훑는지 확인. slot_key 네임스페이스(`${page.id}.${section.id}.${key}`)를 공유 섹션용으로 확장 필요.
3. **에디터 섹션 선택 로직** — 현재 `activePageId`로 페이지 섹션만 탐색(`DynamicEditor.tsx:149-150`). 공유 섹션 선택 분기 추가 필요.

## 작업량 추정 (대략)

- Phase 0: 중 (9개 템플릿 변환 + 호출부)
- Phase 1: 소
- Phase 2: 중~대 (마이그레이션 + 검증)
- Phase 3: 소~중
- Phase 4: 중 (9개 nav + 에디터 위젯 + 렌더)
- Phase 5: 중~대 (에디터 UI)
- Phase 6: 소
