# Part 5 — Collections (Future Architecture)

> **Status**
>
> Future Architecture (Not implemented)
>
> 이 문서는 현재 Layer0 구조를 변경하기 위한 것이 아니라,
> 상품, 블로그, 게시판 같은 CRUD 데이터를 지원하기 위한
> 미래 확장 방향을 정리한 문서이다.
>
> ⚠️ **Collection 착수 시 [ADR-0016](../adr/0016-block-rename-and-field-value-split.md) §3 의 projected-nav 를 재검토해야 한다** — 이 문서의 top-level `navigation`(저장된 SSOT)은 ADR-0016 이 확정한 "nav 는 projection, 저장 안 함"과 충돌하므로, Collection 도입 시 nav 를 projected → stored/hybrid 로 재설계하는 작업을 함께 포함한다.

---

# 왜 Collection이 필요한가?

현재 Layer0는 **Page 중심** 구조이다.

Page는 사람이 직접 만드는 화면이다.

예를 들어

- Home
- About
- Contact
- Company

같은 화면은
블록을 배치하여 완성한다.

하지만 모든 데이터가 Page인 것은 아니다.

다음과 같은 데이터는 성격이 완전히 다르다.

- Product
- Blog Post
- Board Article
- Gallery Image
- Notice

이들은

- 개수가 계속 증가하고
- CRUD가 발생하며
- 여러 화면에서 재사용된다.

즉,

Page와는 생명주기가 다르다.

따라서 별도의 Collection이라는 개념이 필요하다.

---

# Page와 Collection의 차이

| Page | Collection |
|-------|------------|
| 화면(Layout) | 데이터(Data) |
| 사람이 직접 디자인 | CRUD 대상 |
| Block을 배치 | Item을 저장 |
| 개수가 적다 | 계속 증가한다 |
| URL 하나 | 수백~수천 개의 Item |

예를 들어

```
Home
About
Contact
```

는 Page이다.

반면

```
상품 500개

블로그 글 1,000개

게시글 30,000개
```

는 Collection이다.

---

# 최종 Site 구조

```text
Site
│
├── chrome
│   ├── header
│   └── footer
│
├── navigation
│
├── pages
│
├── collections
│
└── globalStyles
```

각자의 역할은 다음과 같다.

## chrome

모든 페이지에서 공통으로 사용하는 영역

예)

- Header
- Footer
- Navigation Bar

---

## navigation

메뉴 순서의 SSOT(Source of Truth)

Page와 Collection을 원하는 순서대로 배치한다.

예)

```
Home

Products

About

Blog

Contact
```

navigation만 수정하면 메뉴 순서가 변경된다.

---

## pages

사람이 직접 만드는 화면

예)

```
Home

About

Contact

Company
```

Page는 Block을 배치하여 화면을 구성한다.

---

## collections

CRUD되는 데이터 저장소

예)

```
Products

BlogPosts

Boards

Gallery

Notices
```

Collection에는 Layout이 없다.

오직 데이터만 존재한다.

---

# Collection은 화면이 아니다

많이 헷갈리는 부분이다.

Blog Collection은

```
Post1

Post2

Post3
```

만 가지고 있다.

검색창도 없고

필터도 없고

Hero도 없다.

왜냐하면

Collection은

**데이터 저장소**

이기 때문이다.

---

반대로

Blog Page는

```
Hero

↓

Search

↓

Category Filter

↓

Post List

↓

Pagination

↓

Footer
```

같은

화면(Layout)을 가진다.

즉

```
Blog Page
```

가

```
Blog Collection
```

을 조회하여

렌더링하는 것이다.

---

# Collection을 읽는 Block

Block은 두 종류가 있는 것이 아니다.

여전히 하나의 Block이다.

다만 역할이 다르다.

## Static Block

자기 자신의 데이터를 렌더링한다.

예)

```
Hero

Text

Gallery

Video

Map
```

---

## Data Block

Collection을 조회하여 렌더링한다.

예)

```
ProductGridBlock

PostListBlock

BoardListBlock

RecentPostsBlock

ProductCarouselBlock
```

예를 들어

```
ProductGridBlock
```

은

```
Products Collection
```

을 조회하여

상품 목록을 화면에 출력한다.

---

# Single Site에서 Collection 사용

Single Site는

페이지가 하나뿐이다.

```
Home

↓

Hero

↓

Company

↓

ProductGridBlock

↓

Review

↓

BlogPreviewBlock

↓

Map

↓

Footer
```

여기서

```
ProductGridBlock
```

은

```
Products Collection
```

을 읽는다.

그리고

```
BlogPreviewBlock
```

은

```
Blog Collection
```

을 읽는다.

즉

Single에서는

Collection이

Block을 통해

페이지 안에 삽입된다.

---

# Multi Site에서 Collection 사용

Multi에서는

Collection을 여러 Page가 공유할 수 있다.

예를 들어

```
Home

↓

ProductPreviewBlock
```

↓

Products Collection

그리고

```
Products Page

↓

Hero

↓

Filter

↓

ProductGridBlock
```

↓

Products Collection

둘 다

동일한 Collection을 사용한다.

데이터는 하나만 존재한다.

---

# Collection Item Detail

Collection에는

목록만 있는 것이 아니다.

각 Item은

자신만의 상세 페이지를 가진다.

예)

```
/products

→ 상품 목록

/products/macbook-pro

→ 상품 상세

/blog

→ 블로그 목록

/blog/clean-architecture

→ 글 상세
```

목록과 상세는

동일한 Collection 데이터를 사용한다.

---

# Collection의 장점

하나의 데이터를

여러 화면에서 재사용할 수 있다.

예)

Products Collection

↓

Home

↓

추천상품

↓

베스트상품

↓

전체상품

↓

검색결과

모두 같은 데이터를 사용한다.

데이터는 한 번만 수정하면 된다.

---

# 설계 원칙

Collection 도입 이후 역할은 명확하게 분리된다.

```
Page
=
화면(Layout)

Collection
=
데이터(Data)

Block
=
표현(Presentation)
```

의존성은 항상 한 방향이다.

```
Page
    │
    ▼
Block
    │
    ▼
Collection
    │
    ▼
Items
```

Block은 Collection을 조회하지만,

Collection은 Block이나 Page를 알지 못한다.

이 단방향 의존성을 유지함으로써

데이터와 화면을 독립적으로 발전시킬 수 있다.

---

# 향후 확장 가능성

Collection 구조가 도입되면

새로운 콘텐츠 타입을 거의 동일한 방식으로 추가할 수 있다.

예)

- Products
- Blog Posts
- Boards
- Gallery
- FAQ
- Notices
- Events
- Careers
- Portfolio

모두 동일한 CRUD 구조를 공유한다.

Page는 화면을 만들고,

Collection은 데이터를 저장하며,

Block은 데이터를 표현하는 역할만 담당한다.

이 구조는 Single Site와 Multi Site 모두에서 동일하게 적용되며,
향후 CMS 규모가 커져도 자연스럽게 확장할 수 있는 아키텍처를 목표로 한다.

---

# Storage Architecture (Important)

> Collection은 Item을 저장하지 않는다.
> Collection은 Item의 **종류와 규칙**만 정의한다.

많이 오해하기 쉬운 부분이다.

다음 구조를 보면

```text
Site
│
├── pages
├── collections
```

Collection 안에

```
Product #1
Product #2
Product #3
```

까지 저장한다고 생각하기 쉽다.

하지만 실제 저장 구조는 다르다.

## siteJson

```text
siteJson

pages

chrome

navigation

collections
    id
    slug
    itemSchema
```

여기에는 Collection의 **정의**만 저장한다.

즉

- id
- slug
- itemSchema
- 설정

등만 존재한다.

---

실제 데이터(Item)는 별도의 저장소에 존재한다.

```text
collection_items

id

collection_id

site_id

data(JSONB)

created_at

updated_at
```

예를 들면

```
Products Collection
```

은

```
collection_items

Product #1

Product #2

Product #3
```

를 참조한다.

---

## 왜 분리하는가?

상품 하나를 수정했다고

siteJson 전체를 다시 저장해서는 안 된다.

잘못된 구조

```
siteJson (10MB)

↓

상품 하나 수정

↓

siteJson 전체 UPDATE
```

올바른 구조

```
Product #135

↓

UPDATE

끝
```

---

또한 Layer0는 siteJson 저장에 낙관적 락(expectedUpdatedAt)을 사용한다.

만약 Collection Item도 siteJson에 저장하면

- 상품 수정
- 페이지 수정

이 서로 같은 JSON을 수정하게 되어 충돌한다.

Collection Item을 별도 저장소로 분리하면

```
siteJson
```

과

```
collection_items
```

가 독립적으로 변경되므로
충돌 없이 확장할 수 있다.

---

## 최종 원칙

```
Page
=
Layout

Collection
=
Data Definition

Collection Item
=
Actual Data
```

즉,

Collection은 데이터를 저장하는 곳이 아니라,

데이터의 구조와 규칙을 정의하는 객체이다.