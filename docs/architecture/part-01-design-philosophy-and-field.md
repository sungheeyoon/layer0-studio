파일	내용
# Layer0 Studio Architecture Specification

> ⚠️ **이 문서는 초안이다. 확정형은 [ADR-0016](../adr/0016-block-rename-and-field-value-split.md) 을 따른다.**
> 그릴링으로 여러 결정이 초안과 달라졌다 — 특히 (1) ADR-0007 구조 유지(Single 은 `pages:[Page]` 가 아니라 `blocks[]` 직접, Chrome 은 Multi 전용), (2) nav→menu 모델(Multi 페이지 `name` 분리, `MenuEntry{label, placement?}`), (3) Collection(Part 5) 은 연기. 초안과 ADR 이 어긋나면 **ADR 이 우선**.

## Part 1. 설계 철학 · 전체 구조 · Field · Block

> Version 1.0
> Author: 성희윤
> 목적: Layer0 Studio의 Site Content 데이터 모델 설계 명세

---

# 1. 설계 철학 (Design Philosophy)

Layer0 Studio는 **노코드 웹사이트 빌더**이다.

사용자는 코드를 작성하지 않고 데이터를 수정하며,
렌더러는 그 데이터를 해석하여 화면을 그린다.

따라서 이 프로젝트에서 가장 중요한 것은

> **"데이터 모델이 얼마나 정직하고 단순한가"**

이다.

이 문서는 그 원칙을 정의한다.

---

## 핵심 원칙

### 1. 복잡함은 한 곳에만 둔다.

Single Site와 Multi Site는 분명 다르다.

하지만 그 차이가 렌더러 전체에 퍼지면

```ts
if (single) ...
else ...
```

가 프로젝트 전체를 오염시킨다.

따라서

> **모드 차이는 mode-aware 함수 두세 개에만 존재한다.**

그 외 모든 렌더러는 mode를 모른다.

---

### 2. 불가능한 상태는 타입으로 막는다.

좋은 타입은

> 런타임에서 검사하는 것이 아니라

애초에

> 잘못된 데이터를 만들 수 없게 만든다.

예시

```ts
pages: [Page]
```

Single인데

```ts
pages: [
   page1,
   page2,
   page3
]
```

라는 상태는

컴파일 자체가 되지 않는다.

---

### 3. 진실의 원천은 하나(SSOT)

같은 정보를 두 군데 저장하지 않는다.

예를 들어

```text
href
```

는 저장하지 않는다.

menu 정보로부터 항상 계산한다.

```
menu
    ↓
buildMenu()
    ↓
href 생성
```

파생 가능한 값은 저장하지 않는다.

---

### 4. 이름은 의도를 말해야 한다.

좋은 이름은 구현이 아니라

**도메인 의미**를 표현한다.

예시

❌

```
shared
```

↓

✅

```
chrome
```

왜냐하면

shared는 "공유된다"는 구현이고

chrome은

> 사이트의 고정 프레임

이라는 의미를 갖는다.

---

### 5. 파싱은 경계에서 한 번

DOM은 항상 문자열을 반환한다.

```html
<input type="number">
```

도

```
"42"
```

를 반환한다.

하지만 시스템 내부까지 문자열을 끌고 가지 않는다.

```
DOM

↓

Editor Boundary

↓

Number()

↓

number

↓

Domain
```

입력 경계에서 한 번만 파싱한다.

도메인 내부는 항상 정제된 타입만 다룬다.

---

### 6. YAGNI

필요하지 않은 기능은 만들지 않는다.

예를 들어

```
PageStatus

draft

published

archived
```

는 만들 수 있다.

하지만 현재 요구사항에 없다.

미래를 위해 복잡함을 미리 추가하지 않는다.

---

# 2. 전체 구조

Layer0의 데이터는 다음 계층을 가진다.

```
SiteContent
│
├── Chrome
│     ├── Header Blocks
│     └── Footer Blocks
│
└── Pages
      │
      └── Blocks
              │
              └── Fields
                      │
                      └── Value
```

즉

```
Site

↓

Page

↓

Block

↓

Field

↓

Value
```

라는 단방향 계층이다.

---

## 각 계층의 책임

| 계층    | 책임         |
| ----- | ---------- |
| Site  | 사이트 전체     |
| Page  | 라우팅 단위     |
| Block | 화면 콘텐츠 단위  |
| Field | 편집 가능한 데이터 |
| Value | 실제 값       |

각 계층은

**바로 아래 계층만 관리한다.**

Page는 Field를 모르고

Site는 Value를 모른다.

관심사가 명확히 분리된다.

---

# 3. Field

## 역할

Field는

> 사용자가 실제로 수정하는 최소 단위

이다.

예를 들어

```
Hero

↓

제목

부제목

버튼

이미지
```

여기서

```
제목

부제목

버튼

이미지
```

가 모두 Field이다.

---

## 왜 Discriminated Union인가?

초기 설계에서는

```ts
interface Field{
    type:string;
    value:string;
}
```

였다.

하지만

```
number

image

array
```

까지 모두 string으로 저장하면

타입이 거짓말을 한다.

예를 들어

```
number

↓

"42"
```

가 된다.

숫자인데 문자열이다.

또한

```
number

↓

"abc"
```

도 컴파일된다.

잘못된 상태를 막지 못한다.

---

그래서

Field는

type을 기준으로 나뉘는 Union으로 변경한다.

```ts
type Field =
    | TextField
    | NumberField
    | SelectField
    | ImageField
    | ArrayField;
```

type이 판별자가 된다.

---

## Field 종류

### TextField

```ts
interface TextField extends BaseField {
    type:
        | "text"
        | "textarea"
        | "url"
        | "color";

    value: string;
}
```

문자열 계열은

모두 string 하나로 충분하다.

---

### NumberField

```ts
interface NumberField extends BaseField {
    type: "number";
    value: number;
}
```

value는

문자열이 아니라

진짜 number이다.

입력 시

```
DOM

↓

"42"

↓

Editor

↓

42

↓

Field.value
```

로 변환된다.

렌더러는 Number()를 호출하지 않는다.

---

### SelectField

```ts
interface SelectField extends BaseField {
    type: "select";
    value: string;
    options: string[];
}
```

선택 가능한 값은

options가 정의한다.

value는

그중 하나이다.

---

### ImageField

이미지는

URL과 Asset을

같은 것으로 취급하면 안 된다.

둘은 역할이 다르다.

```ts
interface ImageField extends BaseField {
    type: "image";

    value: string;

    assetId?: string | null;
}
```

#### value

렌더러가

```tsx
<img src={field.value} />
```

에 사용하는 CDN URL이다.

---

#### assetId

에셋 관리용 UUID이다.

렌더링에는 사용하지 않는다.

참조 카운팅,

고아 에셋 삭제,

스토리지 정리에 사용된다.

따라서

```
value

↓

렌더링

assetId

↓

스토리지 관리
```

역할이 완전히 다르다.

하나로 합치지 않는다.

---

### ArrayField

ArrayField는

Field 중 유일하게

value를 갖지 않는다.

```ts
interface ArrayField extends BaseField {

    type:"array";

    items: Record<string, Field>[];

}
```

이것이

Field를 Union으로 만든

가장 큰 이유이다.

모든 Field가

```
value
```

를 갖는 것이 아니기 때문이다.

---

## 왜 Record<string, Field>[] 인가?

처음 보면

너무 범용적으로 보인다.

하지만

Layer0는

**노코드 시스템**이다.

배열 아이템의 구조는

코드가 아니라

런타임 스키마에 있다.

예를 들어

```
FAQ

↓

question

answer
```

일 수도 있고

```
Menu

↓

title

icon

url
```

일 수도 있다.

이 구조는

컴파일 시점에는 알 수 없다.

따라서

TypeScript는

정적으로 좁힐 수 없다.

제약은

```
itemSchema

↓

Runtime Validator
```

가 담당한다.

즉

이 범용성은

설계 실수가 아니라

**Data-driven 시스템의 본질적인 특성**이다.

---

# 4. Block

## 역할

Block은

> 화면을 구성하는 최소 콘텐츠 단위

이다.

예를 들어

```
Hero

Gallery

Menu

Story

Review

Contact
```

모두 Block이다.

---

## Block 구조

```ts
interface Block {

    id:string;

    type:string;

    visible:boolean;

    fields:Record<string,Field>;

    menu?:MenuEntry;

}
```

---

### id

Block의

영구 식별자이다.

사용 용도

* React key
* Anchor Target
* Drag & Drop
* 순서 변경 추적
* Block 참조

---

### type

type은

렌더러가

컴포넌트를 찾기 위한 키이다.

```
type

↓

library[type]

↓

Component
```

Block은

컴포넌트를 직접 참조하지 않는다.

문자열 키만 가진다.

이를 통해

새로운 Block을 추가해도

Block 타입은 변하지 않는다.

library registry만 추가된다.

이 구조는

Dispatcher Pattern을 따른다.

---

### visible

렌더 여부를 결정한다.

```ts
visible:true
```

↓

렌더

```ts
visible:false
```

↓

렌더하지 않음

과거의

```
hidden
```

보다

긍정 극성이라

이중 부정이 사라진다.

---

### fields

Block이 가진

모든 편집 데이터를 담는다.

```
Hero

↓

title

subtitle

button

image
```

↓

```
fields
```

과거 이름인

```
data
```

보다

실제 의미를 더 잘 표현한다.

---

### menu

```ts
menu?: MenuEntry
```

menu가

존재한다

↓

메뉴에 등장한다.

존재하지 않는다

↓

메뉴에 등장하지 않는다.

별도의

```
isMenu

showMenu

navVisible
```

같은 boolean이 필요 없다.

**존재 자체가 의미**가 된다.

---

## Block의 책임

Block은

오직

콘텐츠와

편집 데이터만 책임진다.

Block은

* 라우팅을 모르고
* Site를 모르고
* 메뉴 생성도 모른다.

이 책임들은

상위 계층이 담당한다.

---

