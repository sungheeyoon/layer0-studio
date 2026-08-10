# Part 3 — Renderer & Mode Isolation

> ⚠️ **초안. 확정형은 [ADR-0016](../adr/0016-block-rename-and-field-value-split.md).** 이 문서의 단일 mode-blind `renderSite()` 통일은 **기각**됐다 — `renderSingleSite`/`renderMultiSite` 2개를 유지한다(렌더러 통일은 목표 아님). `buildMenu`/`activePage`/`allBlocks` 같은 mode-aware 헬퍼는 리네임하며 유지. 어긋나면 ADR 우선.

> **목표**
>
> Single과 Multi의 차이는 최소한의 함수에만 가두고,
> 렌더러는 어떤 모드인지 전혀 모르는(mode-blind) 구조를 만든다.

---

# 1. 설계 목표

데이터 모델만 좋아서는 충분하지 않다.

다음과 같은 코드가 프로젝트 곳곳에 퍼지면 구조는 금방 무너진다.

```ts
if(site.mode === "single"){
    ...
}

if(site.mode === "multi"){
    ...
}
```

mode 분기가

- 렌더러
- 컴포넌트
- 훅
- 유틸

전체로 퍼지는 것을 막아야 한다.

우리가 원하는 것은

```
mode를 아는 곳
↓

아주 적음

↓

나머지는 mode를 모름
```

이다.

---

# 2. Mode-aware 함수

Layer0에서는 mode를 아는 함수는 의도적으로 두 개만 둔다.

```
buildMenu()

activePage()
```

이 두 함수가

Single과 Multi의 차이를 모두 흡수한다.

---

# 3. buildMenu()

메뉴는 두 모드에서 본질적으로 다르다.

Single

```
메뉴 클릭

↓

같은 페이지 스크롤

↓

#about
```

Multi

```
메뉴 클릭

↓

페이지 이동

↓

/about
```

즉

출처도 다르고

링크도 다르다.

이를 한 곳에서 해결한다.

```ts
function buildMenu(site: SiteContent): MenuLink[] {
    if (isSingle(site)) {
        return site.pages[0].blocks
            .filter(
                (b): b is Block & { menu: MenuEntry } =>
                    b.visible && !!b.menu
            )
            .map((b) => ({
                label: b.menu.label,
                placement: b.menu.placement,
                href: `#block-${b.id}`,
            }));
    }

    return site.pages
        .filter(
            (p): p is Page & { menu: MenuEntry } =>
                p.visible && !!p.menu
        )
        .map((p) => ({
            label: p.menu.label,
            placement: p.menu.placement,
            href: `/${p.slug}`,
        }));
}
```

---

## 왜 좋은가?

Single과 Multi의 차이가

이 함수 하나에만 존재한다.

호출부는

```ts
const menu = buildMenu(site);
```

만 알면 된다.

---

# 4. activePage()

현재 렌더해야 할 Page를 결정한다.

```ts
function activePage(
    site: SiteContent,
    slug: string
): Page | undefined {

    if (isSingle(site))
        return site.pages[0];

    if (slug === "")
        return site.pages[0];

    return site.pages.find(
        p => p.slug === slug && p.visible
    );
}
```

---

## 왜 undefined를 반환하는가?

이전에는

```
없는 slug

↓

홈 페이지 반환
```

이었다.

예를 들어

```
/abc
```

가 존재하지 않아도

```
/

홈
```

을 보여줬다.

이는

- SEO 중복
- UX 혼란
- 잘못된 200 응답

을 만든다.

이제는

```
못 찾음

↓

undefined

↓

404
```

가 된다.

---

# 5. resolvePageSeo()

SEO도 Page 하나만 보면 된다.

```ts
function resolvePageSeo(
    site: SiteContent,
    slug: string
){
    return activePage(site, slug)?.seo;
}
```

Single과 Multi의 차이가 완전히 사라진다.

이는

Part2에서

```
SingleSite.seo 제거

↓

Page.seo 하나만 유지
```

를 했기 때문에 가능해졌다.

---

# 6. allBlocks()

어떤 작업은

현재 페이지가 아니라

사이트 전체 블록이 필요하다.

예를 들어

- asset 수집
- validator
- 이미지 참조 확인
- export

등이다.

이를 위해

```ts
function allBlocks(
    site: SiteContent
): Block[] {

    const pageBlocks =
        site.pages.flatMap(
            page => page.blocks
        );

    return [
        ...site.chrome.header,
        ...site.chrome.footer,
        ...pageBlocks,
    ];
}
```

를 제공한다.

---

## 왜 필요한가?

호출부는

```ts
for(const block of allBlocks(site)){
    ...
}
```

만 사용하면 된다.

mode를 알 필요가 없다.

---

# 7. Renderer

이제 렌더러를 보자.

```ts
function renderSite(
    site: SiteContent,
    slug: string
) {
    const menu = buildMenu(site);

    const page = activePage(site, slug);

    if (!page)
        return <NotFound />;

    return (
        <Root>
            <ChromeStrip />

            <Body blocks={page.blocks}/>

            <ChromeStrip />
        </Root>
    );
}
```

여기에는

```
single

multi
```

라는 단어가 단 한 번도 등장하지 않는다.

---

# 8. Body

Body는 더욱 단순하다.

```ts
function Body({
    blocks
}:{
    blocks: Block[]
}) {

    return (
        <>
            {blocks.map(block => {

                if(!block.visible)
                    return null;

                const entry =
                    library[block.type];

                if(!entry)
                    return null;

                const Component =
                    entry.Component;

                return (
                    <Component
                        fields={block.fields}
                    />
                );

            })}
        </>
    );
}
```

Body가 하는 일은 단 하나이다.

```
Block

↓

Component 선택

↓

렌더
```

mode를 전혀 모른다.

---

# 9. Dispatcher Pattern

Body는

```ts
library[block.type]
```

를 통해 컴포넌트를 선택한다.

이를

Dispatcher Pattern이라고 볼 수 있다.

```
type

↓

registry 조회

↓

Component

↓

render
```

새로운 Block을 추가해도

Body는 수정되지 않는다.

Open-Closed Principle에도 잘 맞는 구조이다.

---

# 10. 왜 이렇게 설계했는가?

복잡함은 없앨 수 없다.

하지만

어디에 둘지는 선택할 수 있다.

Layer0에서는

```
mode 차이

↓

buildMenu()

activePage()

↓

끝
```

으로 제한한다.

그 결과

렌더러

Body

Component

Hook

Utility

모두 mode를 모르게 된다.

---

# 11. 적용 원칙

## ① Mode Isolation

mode 분기를 프로젝트 전체에 퍼뜨리지 않는다.

---

## ② Single Responsibility

buildMenu

↓

메뉴만 담당

activePage

↓

라우팅만 담당

renderSite

↓

렌더만 담당

역할을 분리한다.

---

## ③ SSOT

메뉴 링크는 저장하지 않는다.

```
menu

↓

buildMenu()

↓

href 생성
```

항상 한 곳에서 계산한다.

---

## ④ Dispatcher Pattern

type으로 Component를 선택한다.

새 Block 추가 시

Renderer는 수정하지 않는다.

---

## ⑤ Mode-blind Rendering

렌더러는

Single인지

Multi인지

알지 못한다.

이미 mode-aware 함수가 모두 해결했기 때문이다.

---

