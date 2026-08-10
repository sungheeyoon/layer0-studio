# Part 2 — Site Model & Mode Architecture

> ⚠️ **초안. 확정형은 [ADR-0016](../adr/0016-block-rename-and-field-value-split.md).** 이 문서의 `SingleSite = pages:[Page]`, `Chrome` 을 `SiteBase` 공통으로 두는 제안은 **기각**됐다 — ADR-0007 구조를 유지해 Single 은 `blocks[]` 를 직접 갖고 Chrome 은 Multi 전용이다. nav 도 `menu?` + Multi 페이지 `name` 분리로 개정. 어긋나면 ADR 우선.

> **목표**
>
> Single Page와 Multi Page를 하나의 렌더러로 처리하기 위한 데이터 모델을 정의한다.
> 복잡한 모드 차이는 최소한의 함수에만 가두고, 나머지 시스템은 mode를 모르는 구조를 목표로 한다.

---

# 1. 설계 목표

Layer0 Studio는 두 가지 사이트 형태를 지원한다.

- Single Page
- Multi Page

두 모드는 화면 동작은 다르지만, 최대한 같은 데이터 구조를 사용해야 한다.

우리가 원하는 것은

- 렌더러는 mode를 몰라야 한다.
- mode 차이는 한 곳에만 존재해야 한다.
- "Single인데 여러 페이지" 같은 불가능한 상태는 타입이 막아야 한다.

---

# 2. Page

Page는 라우팅 가능한 하나의 문서를 의미한다.

```ts
interface Page {
  id: string;
  slug: string;
  visible: boolean;
  blocks: Block[];
  menu?: MenuEntry;
  seo?: Seo;
}
```

## 역할

Page는

- URL
- 블록 목록
- SEO
- 메뉴 노출

을 관리하는 가장 작은 라우팅 단위이다.

---

# 3. Chrome

콘텐츠와 별개로 항상 존재하는 UI이다.

```ts
interface Chrome {
  header: Block[];
  footer: Block[];
}
```

여기에는

- Logo
- Navigation
- Footer

등이 위치한다.

---

## 왜 따로 분리했는가?

기존 구조에서는

```text
Section(type='nav')
```

같은 특수 블록이 존재했다.

즉

```
렌더러

if(type==="nav")
```

같은 예외가 생겼다.

Chrome으로 분리하면

```
콘텐츠(Block)

고정 UI(Chrome)
```

가 완전히 분리된다.

렌더러는 이제

```
Body = Block만 렌더
Chrome = Chrome만 렌더
```

하면 된다.

---

# 4. SiteBase

두 모드가 공통으로 갖는 부분이다.

```ts
interface SiteBase {
    templateKey:string;
    globalStyles:GlobalStyles;
    chrome:Chrome;
}
```

공통 요소만 존재한다.

- Template
- Style
- Chrome

---

# 5. SingleSite

```ts
interface SingleSite extends SiteBase{
    mode:"single";
    pages:[Page];
}
```

가장 중요한 점은

```
pages:[Page]
```

이다.

배열처럼 사용할 수 있지만

TypeScript는

```
정확히 하나
```

만 허용한다.

즉

```
❌ single + pages 3개

불가능
```

를 타입이 막아준다.

---

## 왜 Page 하나를 바로 두지 않았는가?

예를 들면

```ts
page: Page
```

도 가능하다.

하지만 그렇게 하면

Multi와 API가 달라진다.

```
single.page

multi.pages
```

모든 코드가 분기한다.

반대로

```
pages:[Page]
```

를 사용하면

```
site.pages
```

로 완전히 동일하게 접근할 수 있다.

즉

- 런타임 API 통일
- 컴파일 타임 안전성

둘 다 얻는다.

---

# 6. MultiSite

```ts
interface MultiSite extends SiteBase{
    mode:"multi";
    pages:Page[];
}
```

여러 개의 Page를 가진다.

Single과 동일한 구조를 유지한다.

---

# 7. SiteContent

최상위 데이터 모델이다.

```ts
type SiteContent =
    | SingleSite
    | MultiSite;
```

mode가

Discriminated Union의 판별자가 된다.

```ts
if(site.mode==="single"){
    ...
}
```

이후에는 TypeScript가 자동으로 타입을 좁혀준다.

---

# 8. Type Guard

mode 비교를 매번 쓰지 않기 위해

```ts
function isSingle(
    site:SiteContent
):site is SingleSite{
    return site.mode==="single";
}
```

를 제공한다.

사용 예시는

```ts
if(isSingle(site)){
    site.pages[0];
}
```

처럼 읽기 쉬워진다.

---

# 9. 왜 mode 차이를 여기까지만 허용하는가?

mode는 구조적인 차이이다.

렌더러가 mode를 알기 시작하면

```
if(single)

if(multi)

...

...

...
```

가 프로젝트 전체로 퍼진다.

그래서

mode를 아는 코드는

- buildMenu()
- activePage()

정도만 허용한다.

나머지는 모두

```
mode-blind
```

가 목표이다.

---

# 10. 설계 원칙

이번 파트에서 적용한 핵심 원칙은 다음과 같다.

## ① 불가능한 상태를 표현하지 않는다

```ts
pages:[Page]
```

으로

```
Single인데 여러 페이지
```

를 컴파일 타임에 제거했다.

---

## ② 공통 구조를 유지한다

Single과 Multi 모두

```ts
pages
```

를 사용한다.

렌더러는 mode를 몰라도 된다.

---

## ③ 구조적 차이는 타입으로 표현한다

Single과 Multi는

```
mode
```

하나만 다르다.

나머지는 모두 공유한다.

---

## ④ Chrome은 콘텐츠가 아니다

Header/Footer는

콘텐츠(Block)가 아니라

고정 UI(Chrome)이다.

이를 구조적으로 분리했다.

---

# 다음 파트

다음 문서에서는

- buildMenu()
- activePage()
- renderSite()
- allBlocks()

를 통해

**mode-aware 함수와 mode-blind 렌더러**를 어떻게 구성하는지 설명한다.