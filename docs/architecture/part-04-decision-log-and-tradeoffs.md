````md
# Part 4 — Decision Log, Trade-offs & Future Evolution

> ⚠️ **초안. 확정형은 [ADR-0016](../adr/0016-block-rename-and-field-value-split.md).** AS-IS→TO-BE 표의 `sections → pages:[Page]` 는 **기각**(ADR-0007 구조 유지). `nav → menu?` 는 채택하되 Multi 페이지 `name` 분리 + `placement` 로 개정. Collection 은 연기. 어긋나면 ADR 우선.

> **목표**
>
> 이번 데이터 모델 재설계에서 어떤 결정을 내렸고,
> 왜 그렇게 결정했는지,
> 그리고 의도적으로 남겨둔 한계와 미래 확장 포인트를 정리한다.

---

# 1. 설계 결정 요약

이번 재설계에서 가장 중요한 목표는

> **복잡함을 없애는 것이 아니라, 한 곳에 가두는 것**이었다.

이를 위해 다음 원칙을 적용했다.

- 불가능한 상태를 타입으로 제거
- mode 분기 최소화
- SSOT 유지
- 명확한 도메인 이름 사용
- Renderer 단순화

---

# 2. AS-IS → TO-BE

| AS-IS | TO-BE | 이유 |
|--------|--------|------|
| TemplateJson | SiteContent | Template뿐 아니라 실제 Site 데이터도 표현 |
| SinglePageTemplate | SingleSite | 도메인 의미 명확화 |
| MultiPageTemplate | MultiSite | 동일 |
| TemplatePage | Page | Document/Template 혼란 제거 |
| TemplateSection | Block | Section 과부하 제거 |
| TemplateField | Field | 접두사 제거 |
| section.data | block.fields | 실제 의미 반영 |
| NavMeta | MenuEntry | 행동 중심 이름 |
| section.nav(boolean) | menu? | 존재 자체가 의미 |
| nav.visible | placement | 부정 파생 제거 |
| shared | chrome | "고정 UI" 의미 명확 |
| type="nav" Block | chrome.header | 구조적으로 분리 |
| deriveNav + deriveFooterNav | buildMenu | 하나의 함수 |
| number:string | number:number | 타입이 진실을 말함 |
| image.value | value + assetId | 렌더와 참조 분리 |
| sections | pages:[Page] | Single/Multi API 통일 |
| SingleSite.seo | Page.seo | 중복 제거 |
| activePage fallback | undefined → 404 | 잘못된 홈 반환 제거 |
| menu! | Type Predicate | non-null assertion 제거 |

---

# 3. 핵심 설계 결정

## 3.1 Single = pages:[Page]

가장 중요한 결정이다.

처음에는

```ts
page: Page
```

도 고려했다.

하지만 그렇게 되면

```ts
single.page

multi.pages
```

가 되어

모든 코드가 분기한다.

반대로

```ts
pages:[Page]
```

는

런타임에서는 배열

컴파일 타임에서는

```
정확히 하나
```

를 강제한다.

즉

- API 통일

- 타입 안전성

둘 다 얻는다.

---

## 3.2 menu? 로 표현

예전에는

```ts
nav:true

nav.visible
```

같은 boolean이 있었다.

하지만

```
boolean

↓

또 다른 boolean

↓

if (!hidden && visible)
```

같은 코드가 생겼다.

그래서

```ts
menu?
```

의 존재 자체를

"메뉴에 등장"

으로 정의했다.

Boolean 하나가 사라지고

의도가 더 명확해졌다.

---

## 3.3 placement

예전에는

```
header인지

footer인지
```

를

부정으로 계산했다.

```ts
!nav.visible
```

같은 코드가 생겼다.

이를

```ts
placement

↓

header

footer
```

로 명시했다.

명시적인 enum이

boolean보다 훨씬 읽기 쉽다.

---

## 3.4 Chrome 분리

예전에는

Navigation도 Block이었다.

즉

```ts
type==="nav"
```

같은 특수 처리가 필요했다.

Chrome으로 분리하면

```
Chrome

↓

항상 존재

Body

↓

콘텐츠만
```

으로 역할이 분리된다.

---

## 3.5 Field Union

Field는

Discriminated Union으로 구성했다.

```ts
switch(field.type)
```

만으로

TypeScript가

자동으로 타입을 좁혀준다.

예를 들어

```ts
case "number":
    field.value
```

는

자동으로

```ts
number
```

가 된다.

---

## 3.6 NumberField

예전에는

```ts
value:string
```

이었다.

즉

```
"42"
```

를 저장했다.

새 구조는

```ts
value:number
```

이다.

파싱은

에디터 경계에서

한 번만 수행한다.

안쪽에서는

항상 number만 사용한다.

---

## 3.7 ImageField

Image는

value 하나만으로는 부족하다.

렌더링에는

```
CDN URL
```

이 필요하고

에셋 관리에는

```
assetId
```

가 필요하다.

그래서

```ts
value

assetId
```

둘 다 유지한다.

용도가 완전히 다르기 때문이다.

---

# 4. 적용한 설계 원칙

## ① SSOT

파생 가능한 값은 저장하지 않는다.

예를 들어

```
href

↓

menu

↓

buildMenu()
```

에서 계산한다.

---

## ② Mode Isolation

mode를 아는 함수는

```
buildMenu

activePage
```

뿐이다.

나머지는

mode를 모른다.

---

## ③ 불가능한 상태 제거

예를 들어

```
Single인데

페이지 5개
```

같은 상태는

타입으로 막는다.

---

## ④ 경계에서 파싱

폼은

항상 문자열을 반환한다.

하지만

도메인 모델은

정제된 타입만 가진다.

```
input

↓

parse

↓

Field

↓

Renderer
```

---

## ⑤ 이름으로 의도 표현

예를 들어

```
hidden

↓

visible
```

```
shared

↓

chrome
```

```
nav

↓

menu
```

처럼

도메인 의미가 이름에서 드러나도록 했다.

---

# 5. Trade-off

좋은 설계에는 항상 비용이 있다.

---

## ① Block.menu와 Page.menu 공존

Single에서는

Page.menu가 거의 사용되지 않는다.

Multi에서는

Block.menu가 거의 사용되지 않는다.

하지만

메뉴의 대상이

```
Single

↓

Block

Multi

↓

Page
```

로 본질적으로 다르기 때문에

이 정도 중복은 감수했다.

---

## ② ArrayField

```ts
Record<string, Field>[]
```

는

느슨해 보인다.

하지만

노코드 시스템에서는

itemSchema가

런타임 데이터이다.

즉

컴파일 타임에는

모양을 알 수 없다.

따라서

정적 타입보다

런타임 Validator가

실제 제약을 담당한다.

---

## ③ pages:Page[]

Multi는

타입상

페이지를

추가

삭제

할 수 있어 보인다.

하지만

실제 에디터 정책은

```
Template 고정

↓

토글

↓

재정렬
```

이다.

모든 정책을

타입으로 강제하지는 않는다.

---

# 6. YAGNI

YAGNI는

> **You Aren't Gonna Need It**

의 약자이다.

즉

필요해질 것 같다고

미리 만들지 않는다.

예를 들어

```ts
status

↓

draft

published

archived
```

같은 enum은

지금 요구사항에는 없다.

그래서

의도적으로 넣지 않았다.

복잡함은

필요할 때 추가한다.

---

# 7. 현재 한계

현재 구조에도 한계는 있다.

## Collections

블로그

게시판

상품

처럼

Page가 아닌

Collection이 생기면

구조를 다시 검토해야 한다.

---

## JSONB

현재

프로덕션 DB는

JSONB를 저장하고 있다.

즉

```
shared

↓

chrome
```

같은 이름 변경은

데이터 마이그레이션을 의미한다.

이상적인 설계라도

운영 비용이 더 크면

지금은 적용하지 않는다.

이는

**인지된 부채(Conscious Technical Debt)**

로 남긴다.

---

# 8. 최종 아키텍처

```
SiteContent
│
├── Chrome
│     ├── Header
│     └── Footer
│
└── Pages
      │
      └── Page
             │
             └── Blocks
                    │
                    └── Fields
```

Renderer는

```
mode

↓

모름
```

buildMenu()

activePage()

두 함수만

mode를 안다.

---

# 9. 최종 결론

이번 재설계의 핵심은

새로운 기능을 추가한 것이 아니다.

오히려

- 이름을 정리하고
- 책임을 분리하고
- 불가능한 상태를 타입으로 제거하고
- mode 분기를 두 함수로 격리하고
- Renderer를 단순하게 만드는 과정이었다.

좋은 아키텍처는

복잡함이 없는 구조가 아니라,

**복잡함이 한 곳에 모여 있는 구조**이다.
````
