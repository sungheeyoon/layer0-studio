# Appendix — Open Questions & Future Design

> 이 문서는 현재 설계에서 **의도적으로 아직 결정하지 않은 부분**을 기록한다.
> 이는 설계의 결함이 아니라 앞으로 확장될 기능에 대한 설계 메모이다.
>
> **Status:** Future Architecture (Not implemented). Collections는 현재
> 프로젝트가 의도적으로 연기한 Phase 2다 — 착수 트리거 조건은
> `docs/plans/PLAN_crud_array_field.md` 참고.
>
> ⚠️ **Collection 착수 시 [ADR-0016](../adr/0016-block-rename-and-field-value-split.md) §3 의 projected-nav 를 재검토해야 한다** — Collection 은 nav 에 Page/Block 이 아닌 항목(예: "Products" → 컬렉션 목록)을 넣어 projected nav 로 표현 불가하며, 저장된 `navigation` SSOT 를 강제해 ADR-0016 의 projected-nav 결정과 충돌한다. nav 재설계(projected → stored/hybrid)를 Collection 작업에 포함한다.

---

## 심각도 분류 (Triage)

모든 Open Question이 같은 무게는 아니다. "이미 방향이 잡힌 것"과
"진짜 고민이 필요한 것", "스코프에서 잘라낼 것"을 구분한다.

| # | 항목 | 상태 | 요약 |
|---|------|------|------|
| 1 | Collection Detail Layout | ✅ 방향 확정 | `detailLayout` 필요 — 단 "아이템 컨텍스트 바인딩" 개념 딸려옴 |
| 2 | Collection Item 저장 전략 | ✅ 방향 확정 | 정의=siteJson / 아이템=별도 테이블 (ADR 수준) |
| 3 | Data Block ↔ Collection 연결 | ✅ 방향 확정 | `collectionId` 바인딩 — 단 dangling 정책은 열림 |
| 4 | Product / Blog / **Board** | ❌ 스코프 밖 | Board = Visitor CMS. Layer0(Owner CMS)와 다른 시스템 → 제외 |
| 5 | Single Site + Collection Detail | 🤔 열림 | 상세 표현 방식(페이지/모달/프리뷰) 미결 — 요구사항 대기 |
| 6 | Query Pipeline | 🤔 열림 | 검색·필터·정렬·페이지네이션 — 사실상 별도 프로젝트 |
| 7 | Collection Schema Migration | 🤔 열림 | itemSchema 변경 시 기존 아이템 처리 정책 |
| — | CollectionBlock (범용 Data Block) | 🔭 북극성 | 지금 만들지 말 것(YAGNI). rule of three 후 추출 |

---

# 1. Collection Detail Layout ✅ 방향 확정

## 현재 상태

Collection은 데이터만 관리한다.

```text
Collection
 ├── itemSchema
 └── items
```

하지만 실제 서비스에서는 아래와 같은 상세 페이지가 필요하다.

```text
/products/macbook-pro

/blog/clean-architecture

/posts/123
```

그러면 질문이 생긴다.

> Collection에는 레이아웃이 없는데
> 상세 페이지는 누가 렌더링하는가?

---

## 결정 방향

Collection마다 두 종류의 레이아웃을 둔다.

```text
Collection
 ├── itemSchema
 ├── listLayout      → /products,  /blog
 └── detailLayout    → /products/macbook-pro,  /blog/clean-architecture
```

"상세 레이아웃이 필요하냐?"는 이미 답이 나왔다. 필요하다.
남은 것은 **이름 수준**의 결정(`listLayout`/`detailLayout` vs `listTemplate`/`detailTemplate`)이다.

### ⚠️ 단, 완전한 "이름만" 문제는 아니다 — 아이템 컨텍스트 바인딩

`detailLayout`은 새 개념을 하나 데려온다. 상세 페이지는 **아이템 1개**를 그리므로,
그 안의 Block은 "지금 라우팅된 아이템"의 필드를 읽어야 한다.

```text
Data Block      : collectionId 로 컬렉션을 "조회"           (목록)
Detail Block    : currentItem.data.price 처럼 "현재 아이템"을 읽음  (상세)  ← 새 바인딩 모드
```

즉 detailLayout의 블록은 컬렉션을 쿼리하는 게 아니라 **라우트가 주입한 단일 아이템**에
바인딩된다. 이 "아이템 컨텍스트"를 어떻게 주입할지는 detailLayout 확정 시 함께 정한다.

---

# 2. Collection Item 저장 전략 ✅ 방향 확정 (ADR 수준)

Collection의 **정의**와 **데이터(Item)** 는 반드시 분리한다.

## Collection Definition — siteJson(JSONB)에 저장 가능

```text
Collection
 id
 slug
 itemSchema
 (설정)
```

정의는 사이트 구조의 일부이며 크기가 유한하므로 JSON에 포함될 수 있다.

## Collection Items — 절대 siteJson에 저장하지 않는다

```text
❌ siteJson.collections.products = [ Product1, Product2, ... ]   // 금지
```

Item은 계속 증가하는 CRUD 데이터이므로 별도 테이블을 사용한다.

```text
collection_items
 id
 collection_id
 site_id
 slug            -- /products/:slug 라우팅용 (컬렉션 내 unique)
 status          -- draft / published (필터·인덱스용)
 published_at    -- 정렬용
 sort_order      -- 수동 정렬용
 data (JSONB)    -- 나머지 스키마별 필드
 created_at
 updated_at
```

> **핵심:** slug / status / published_at / sort_order 처럼 **자주 쿼리·라우팅하는 값**은
> `data(JSONB)` 안이 아니라 **first-class 컬럼으로 승격**한다. JSONB 내부는 인덱스가
> 어려워 slug 라우팅·상태 필터·날짜 정렬이 느려진다. "무엇을 컬럼으로 뺄까 =
> 무엇으로 쿼리·라우팅할까"가 설계 판단이다.

### 왜 분리하는가

- 상품 하나 수정에 siteJson 전체(수 MB) 재작성 방지
- siteJson 낙관적 락(`expectedUpdatedAt`, ADR-0004)과의 **쓰기 충돌 방지**
  (상품 수정과 페이지 편집이 같은 JSON을 건드리면 충돌)
- 페이지네이션 / 검색 / 인덱스 / 대량 데이터 처리 가능

이 원칙은 Collection 설계의 핵심이며, 사실상 ADR 수준으로 확정이다.

---

# 3. Data Block ↔ Collection 연결 ✅ 방향 확정 (일부 열림)

Data Block은 어느 Collection을 표시할지 알아야 한다.

```text
ProductGridBlock  →  Products Collection
```

Block의 fields에 바인딩·쿼리 설정을 둔다.

```ts
fields: {
  collectionId: "products",
  sort: "price_desc",
  limit: 12,
  filter: {}
}
```

결국 Block은 두 종류로 나뉜다(타입이 아니라 역할의 차이):

```text
Static Block   : 자기 fields 를 렌더 (Hero, Text, Gallery, Map...)
Data Block     : collectionId 로 Collection 을 조회해 렌더 (ProductGrid, PostList...)
```

### ⚠️ 열린 하위 질문 — 참조 무결성 (dangling)

Products Collection을 삭제하면 이를 바인딩한 Data Block이 허공을 가리킨다
(navigation의 dangling target과 동일한 문제).

- 삭제 정책 (cascade: 컬렉션 삭제 시 바인딩 블록 정리 or 경고)
- 렌더 시 fallback (target 미해결 시 emptyState / 조용히 스킵)

바인딩 방향은 확정, 무결성 정책은 열림.

---

# 4. Board — ❌ 스코프 밖 (Out of Scope)

이전 버전은 Product / Blog / **Board**를 "같은 Collection 구조"로 묶었으나,
인증 모델이 정반대라 **Board는 스코프에서 제외한다.**

```text
Product / Blog   →  Owner Only CRUD    (사이트 관리자만 작성)   ← Layer0 대상
Board            →  Public CRUD        (방문자가 작성)          ← 다른 시스템
```

Board(방문자 UGC)는 스팸 / 신고 / 모더레이션 / 방문자 권한 관리가 추가로 필요한
**Visitor CMS**다. Layer0가 지향하는 **Owner CMS**와 근본적으로 다른 시스템이므로,
지금 문서에 넣으면 오히려 Collection 설계를 흐린다.

> **결정:** Board는 Collection의 예시에서 제외한다. 방문자 작성 콘텐츠가 실제
> 요구사항이 되면 별도 축(Visitor CMS)으로 설계한다.

---

# 5. Single Site + Collection Detail 🤔 열림

Single Site에서도 Data Block으로 Collection을 삽입할 수 있다.

```text
Landing → ProductGridBlock → Products Collection
```

문제: Single은 **라우팅이 없는 단일 페이지**인데, 아이템 상세(`/products/123`)는
**라우팅이 필요**하다. 상품을 클릭하면 어디로 가나?

가능한 방향:

- 별도 상세 페이지 (Single의 정체와 충돌 — 라우팅 도입)
- Modal
- Drawer
- **Preview Only** (클릭 상세 없음 — Single의 성격과 가장 정합적)

요구사항이 없으므로 지금 정하지 않는다. 현실적 1순위 후보는 **Preview Only**.

---

# 6. Query Pipeline 🤔 열림 (사실상 별도 프로젝트)

Collection 조회는 단순 조회가 아니다.

```text
Search → Filter → Sort → Pagination → Collection Query → Result
```

여기엔 Filter/Search 블록이 고른 값을 List 블록으로 전달하는 **쿼리 상태 배관**
(URL 쿼리파라미터 ↔ 클라이언트 상태 ↔ 서버 쿼리)이 숨어 있다. CMS에서 이건
거의 하나의 프로젝트 규모다. **Future Work**로 남긴다.

---

# 7. Collection Schema Migration 🤔 열림

itemSchema는 시간이 지나며 변경된다.

```text
기존:   title
신규:   title, price, thumbnail
```

이미 저장된 수천 개 Item은 새 필드가 없다. 필요 정책:

- 기본값 적용 (읽을 때 누락 필드 보정)
- 마이그레이션 (일괄 백필)
- 버전 관리 (schemaVersion)

실제 CMS의 단골 고통 지점. 정책 TBD.

---

# 🔭 CollectionBlock — 범용 Data Block (Future North Star)

`ProductGridBlock`, `PostListBlock`처럼 종류별 블록을 여러 개 두는 대신,
"컬렉션을 어떻게 조회해 어떻게 표현할지"를 설정하는 **범용 Data Block**으로
발전시킬 수 있다. (Webflow / Framer / Builder.io의 "Collection List" 방식.)

## 설계 시 두 가지 원칙 적용

### (1) 조회는 공유, 표현은 판별 union (일반화가 차이를 지우지 않게)

`view`를 단순 enum으로 두면 view마다 다른 표현 설정(grid=columns, carousel=autoplay)이
평평하게 섞여 무의미 상태가 생긴다. 조회 설정은 진짜 공유되니 통합하고, 표현 설정은
`view`로 갈리는 **discriminated union**으로 둔다. (SiteContent.mode / Field.type과 동일 패턴.)

```ts
interface CollectionBlock {
  // 공유 조회 core (모든 view 공통)
  collectionId: string;
  sort: string;
  filter: Filter;
  limit: number;
  pagination: boolean;
  emptyState: string;

  // view별 표현 = 판별 union
  display:
    | { view: 'grid';     columns: number }
    | { view: 'carousel'; autoplay: boolean; interval: number }
    | { view: 'list';     divider: boolean };
}
```

> 참고: config 모양을 하나로 합쳐도 grid/carousel의 **렌더 컴포넌트는 여전히 다르다.**
> `view`로 디스패치(library 조회처럼). "블록 하나로 다 된다"가 아니라
> "config는 하나, 렌더는 분기"가 정확한 그림.

### (2) 지금 만들지 않는다 (YAGNI / rule of three)

만능 `CollectionBlock`을 선설계하면 안 쓸 옵션을 만들고 정작 필요한 걸 놓친다.

```text
1. 구체 블록 먼저:  ProductGridBlock, PostListBlock  (각자 필요한 것만)
2. 공통 패턴이 3번 반복되면
3. 그때 CollectionBlock 으로 추출  (rule of three)
```

지금은 **북극성으로만** 문서에 남기고, 실제 착수는 구체 사례가 쌓인 뒤로 미룬다.

---

# Summary

현재 설계 목표:

- **Page** = 고정 레이아웃 (사람이 Block 배치)
- **Collection** = 반복 데이터의 **정의**(itemSchema)만 관리 — 저장소 아님
- **Collection Item** = 별도 테이블(`collection_items`)의 실제 데이터
- **Block** = 표현 담당 (Static = 자기 데이터 / Data = Collection 조회)
- **Renderer** = Collection을 데이터 소스로만 사용, 단방향 의존
  (`Page → Block → Collection → Items`; Collection은 Block/Page를 모름)
- **Site 구조**는 최대한 단순하게 유지

## 이 문서의 상태 요약

- ✅ **방향 확정 (1·2·3):** Decision으로 승격 가능. 각각의 열린 하위 질문
  (아이템 컨텍스트 바인딩 / dangling 정책)만 착수 시 마무리.
- ❌ **스코프 밖 (4 Board):** Owner CMS ≠ Visitor CMS. 제외.
- 🤔 **열림 (5·6·7):** 요구사항 대기 (Single 상세 표현 / Query Pipeline / Schema Migration).
- 🔭 **북극성 (CollectionBlock):** YAGNI로 지금 미룸, rule of three 후 추출.

위 항목들은 현재 요구사항에 포함되지 않는 미래 확장을 위한 설계 메모이며,
기능이 실제로 필요해질 때 구체적인 아키텍처를 결정한다.
