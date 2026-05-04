---
title: UI 문제 해결 체크리스트
status: in-progress
last-updated: 2026-05-04
owner: layer0-studio
---

# UI 문제 해결 체크리스트

이 문서는 현재 식별된 4가지 UI 문제를 절차적으로 해결하기 위한 워크리스트다.
각 항목은 **진단 → 원인 → 해결방안(체크박스) → 검증** 순서로 구성되어 있다.
한 항목씩 위에서 아래로 처리하고, 완료된 체크박스는 `[x]`로 갱신할 것.

---

## 1. 에디터 라이브 프리뷰 — `position: fixed` 누출 ✅ 해결됨

> 증상: cafe/fitness 테마의 `position: fixed` navbar 가 viewport 에 anchor 되어 좌측 패널·dashboard 사이드바·시스템 chrome 위로 떠 버리는 문제.

### 결론

`sticky` 테마(medical / wedding / legal)는 **원래 정상 동작**했고 (스크롤 조상인 프리뷰 컨테이너에 anchor), 진짜 문제는 `position: fixed`(cafe / fitness) 뿐이었다.

### 적용된 해결책 — `fix/editor-fixed-navbar-containment` (main 대비 2줄)

`src/components/editor/DynamicEditor.tsx:455-460`:

```diff
- <section className="... overflow-hidden flex flex-col">
+ <section className="... overflow-hidden flex flex-col p-6">
   <div className="absolute top-0 left-0 ... LIVE PREVIEW">…</div>

-  <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
+  <div className="flex-grow overflow-y-auto custom-scrollbar transform-gpu">
     <div style={themeVariables} className="min-h-full bg-white shadow-2xl">
```

- [x] 스크롤 래퍼에 `transform-gpu` 추가 → descendant `position: fixed` 의 containing block 을 viewport 에서 스크롤 래퍼로 끌어옴
- [x] `p-6` 을 스크롤 래퍼에서 outer `<section>` 으로 한 단계 위로 이동 → `fixed` 가 transform 조상의 *padding box 외곽선* 에 anchor 하므로, 스크롤 래퍼 자체에 padding 이 있으면 navbar 가 흰 카드 밖으로 튀어나감

### 왜 이게 충분한가

1. CSS 스펙 상 descendant `position: fixed` 의 containing block 을 viewport 에서 빼앗아 오는 방법은 `transform` / `filter` / `perspective` / `contain: layout|paint` / `will-change: transform` 뿐. `overflow: hidden` 으로는 절대 안 됨.
2. `position: fixed` 는 transform 조상의 *padding box* 가장자리(= 테두리 안쪽)에 anchor — padding 두께를 무시하므로 padding 은 *바깥* 으로 옮겨야 함.
3. `position: sticky` 는 가장 가까운 *스크롤 조상* 기준 — `transform` 은 스크롤 조상이 되지 않으므로 sticky 테마는 영향 없음.
4. LIVE PREVIEW 라벨은 `absolute top-0 left-0` 인데, absolute 는 padding box 에 anchor 되므로 section padding 영향 받지 않음 → 종전 코너 위치 그대로.

### 의식적으로 *하지 않은 것*

- ❌ `:where(.navbar, .navWrap)` 글로벌 selector 로 `position: sticky !important` 강제 — sticky 테마까지 무의미하게 override
- ❌ DOM 재편 (스크롤을 흰 카드로 이전, `absolute inset-0` 2단 구조) — 이전 회귀 원인
- ❌ 테마 모듈 CSS 직접 수정 — 발행 사이트(`/site/[domain]`) 동작에 영향

### 검증 결과

- [x] cafe / fitness: navbar 가 흰 카드 상단 가장자리에 정확히 anchor, 외부 chrome 침범 없음
- [x] medical / wedding / legal: 종전 sticky 동작 그대로 (회귀 0)
- [x] LIVE PREVIEW 라벨: 종전 코너 위치 유지
- [x] 발행 사이트: `transform-gpu` 미적용 → 테마 원본 `fixed` / `sticky` 동작 보존

### 폐기된 시도 — `fix/editor-preview-position-leak` 브랜치 (원격 보존)

회귀 사례로 보존. 실패 원인 요약:

1. `:where(.navbar, .navWrap) { position: sticky !important }` — sticky 테마까지 영향 + CSS Modules 해시 클래스와의 selector 매칭 신뢰성 문제
2. 스크롤 컨테이너를 흰 카드로 이전 + `absolute inset-0` 2단 구조 — 레이아웃·스크롤 회귀 누적
3. 5개 시도 커밋 (`d411fef`~`52a23a0`) — main 머지 안 함

→ 핵심 교훈: **sticky 는 원래 잘 동작하고 있었다. fixed 만 격리하면 됐을 일을 sticky 까지 건드리며 일을 키웠다.** 다음 작업에서도 *"이미 동작하는 것은 건드리지 말 것"* 원칙을 우선시할 것.

---

## 2. 로그인 입력 폼 — 좌우 패딩 부재로 글자 밀착

> 증상: `/login` 의 이메일·비밀번호 인풋에 좌우 패딩이 없어 placeholder/입력 글자가 좌측 경계에 딱 붙는다.

### 진단
- [ ] `src/app/login/page.tsx:60` — email 인풋: `w-full h-10 bg-transparent border-0 border-b ... font-body text-sm font-light tracking-widest` — *수평 패딩 클래스 없음*
- [ ] `src/app/login/page.tsx:82` — password 인풋: 동일 패턴, 동일 문제
- [ ] 라벨(line 53, 75)도 인풋과 동일한 좌측 정렬, 별도 패딩 없음

### 원인
- 디자인 의도는 "border-bottom 만 있는 미니멀 인풋" 인데, 시각 균형을 위한 최소 좌측 인셋이 빠져 있어 placeholder 의 첫 글자가 라벨/외곽과 충돌하는 인상.
- `tracking-widest` 가 첫 글자 좌측 spacing 을 깎아 더 붙어 보임.

### 해결방안

**전략: 인풋의 의미적 구조(border-bottom only)를 유지하면서 좌우 인셋만 부여한다.**

- [ ] email 인풋(60)에 `px-2` 추가 → `... border-b border-outline-variant px-2 focus:ring-0 focus:border-primary ...`
- [ ] password 인풋(82)에 동일하게 `px-2` 추가
- [ ] 라벨 정렬도 인풋과 어긋나지 않도록 라벨에 `pl-2` 추가 (line 53, 75)
- [ ] 우측 status dot (line 68, 89) 위치가 `right-0` 인데 인풋 내부 `pr-2` 와 겹치지 않도록 dot 을 `right-2` 로 이동
- [ ] 동일 패턴이 `/signup`, `/forgot-password`, `/update-password` 에 있는지 확인 후 일괄 수정

### 검증
- [ ] `pnpm dev` 후 `/login` 진입 → 이메일/비밀번호 placeholder 가 라벨과 같은 들여쓰기에서 시작하는지 확인
- [ ] 한국어 IME 입력 시에도 첫 글자가 시각적으로 충분한 여백을 갖는지 확인
- [ ] 포커스 시 우측 dot 이 인풋 내부 텍스트 위로 침범하지 않는지 확인

---

## 3. 에디터 라이브 프리뷰가 좁다 — 대시보드 사이드바 중복

> 증상: 에디터에서 라이브 프리뷰 폭이 좁게 느껴진다. 좌측에 대시보드 `Sidebar` 까지 함께 떠 있어 가용 폭이 더 줄어든다.

### 진단
- [ ] `src/app/dashboard/layout.tsx:18` — `<Sidebar />` (256px, `ml-64`)
- [ ] `src/app/dashboard/layout.tsx:20` — `<TopNavBar />` 와 `<main className="flex-1 p-12 ...">` (`p-12` = 48px 패딩)
- [ ] `src/components/editor/DynamicEditor.tsx:280` — 에디터 자체 좌측 패널 `w-[280px]`
- [ ] `src/app/dashboard/editor/page.tsx:50` — 에디터 컨테이너 `<main className="p-4 h-[calc(100vh-124px)] flex gap-4">`
- [ ] **합계**: 좌측에 사이드바 256 + main 패딩 48 + 에디터 패널 280 + gap 16 + 에디터 main 패딩 16 = **약 616px** 이 라이브 프리뷰 *왼쪽* 에 점유됨. 1440px 화면에서 프리뷰 가용 폭은 ~800px → 데스크톱 미리보기로는 좁음.

### 원인
- 에디터는 *전용 풀폭 작업공간* 이 되어야 하는데, 일반 dashboard 페이지용 chrome(사이드바 + 큰 패딩)을 그대로 상속받고 있다.
- 라우트가 `/dashboard/editor` 라 `dashboard/layout.tsx` 가 자동 적용된 것이 원인.

### 해결방안

**전략: 에디터 라우트에 한해 dashboard chrome 을 우회한다. Next.js App Router 의 *route group* 을 사용해 같은 인증을 유지하면서 다른 레이아웃을 적용.**

- [ ] 옵션 A — **Route Group 분리 (권장)**:
  - [ ] `src/app/dashboard/editor/` 를 `src/app/(authenticated)/editor/` 로 이전하거나, `src/app/dashboard/(editor)/editor/` 로 그룹 만들고 그룹 안에 자체 `layout.tsx` 정의
  - [ ] 그룹 layout 은 `getCurrentUser()` 호출 + `redirect('/login')` 만 수행, `<Sidebar />` 와 `<TopNavBar />` 는 호출하지 않음
  - [ ] 에디터 자체 `<main>` 패딩을 `p-0` 또는 `p-2` 로 축소, height 를 `h-screen` 으로 변경 (TopNavBar 가 사라지므로 124px 차감 불필요)
- [ ] 옵션 B — **사이드바 토글 (간이)**:
  - [ ] `usePathname()` 으로 `dashboard/layout.tsx` 에서 `/dashboard/editor` 일 때 `<Sidebar />` 를 숨기고 `ml-64` 도 제거
  - [ ] 단점: 인라인 분기, layout.tsx 가 client 컴포넌트로 변경되어야 할 수도 있음 (현재 server)
- [ ] 결정: **옵션 A** 를 우선 채택. 옵션 B는 polish-단계 임시방편으로만 고려.
- [ ] 라이브 프리뷰 카드 `<div className="min-h-full bg-white shadow-2xl">` (461) 에 데스크톱 디바이스 폭(예: `max-w-[1280px] mx-auto`) 옵션을 향후 도입 가능하도록 메모만 남겨둘 것 (이번 PR 범위 밖)
- [ ] 좌측 패널 `w-[280px]` 은 유지 (콘텐츠/디자인 탭 + 폼 필드가 들어가야 해서 그 이하로 줄이기 어려움). 향후 collapsible 로 만들 가능성을 별도 이슈로 백로그 등록.

### 검증
- [ ] `pnpm dev` 후 `/dashboard/editor?siteId=...` 진입 → 좌측에 dashboard 사이드바 없음, 라이브 프리뷰 폭이 시각적으로 넓어졌는지 확인
- [ ] `/dashboard` (대시보드 홈), `/dashboard/templates`, `/dashboard/settings` 등 *다른* dashboard 경로는 사이드바·TopNavBar가 그대로 보이는지 회귀 확인
- [ ] 인증 가드: 비로그인 상태로 `/dashboard/editor` 접속 시 `/login` 으로 redirect 되는지 확인 (옵션 A 의 새 layout 이 인증 체크를 제대로 가지고 있는지)

---

## 4. `/dashboard/templates` 썸네일 잘림 — `/templates` 와 비율 불일치

> 증상: 공개 페이지 `/templates` 에서는 썸네일이 비율 맞게 보이는데, `/dashboard/templates` 에서는 썸네일이 위·아래 또는 좌·우가 잘려 보인다.

### 진단
- [ ] `src/components/templates/PublicTemplateGrid.tsx:95` — 썸네일 컨테이너 `aspect-video` (= 16:9 = 16/9)
- [ ] `src/components/templates/DynamicTemplateGrid.tsx:128` — 썸네일 컨테이너 `aspect-[16/10]` (= 16:10)
- [ ] 양쪽 모두 `<img className="... object-cover ...">` 사용 → *컨테이너 비율* 에 맞춰 이미지가 잘림
- [ ] 썸네일 캡처 스크립트: `pnpm template:capture` (Playwright) — 캡처 해상도 확인 필요 (`scripts/template-capture*.ts` 위치할 것으로 추정)

### 원인
1. 두 그리드의 컨테이너 종횡비가 **다르다** (`16/9` vs `16/10`).
2. 캡처된 썸네일 원본은 한 가지 해상도(추정 16:9)인데 `/dashboard/templates` 는 16:10 컨테이너에 `object-cover` 로 채우므로 *위/아래가 잘림*.
3. `/templates` 는 캡처 비율과 컨테이너 비율이 일치 → 잘림 없음.

### 해결방안

**전략: 그리드 컨테이너 비율을 캡처 원본 비율과 일치시킨다. 양쪽 그리드 모두 `aspect-video` 로 정렬.**

- [ ] 캡처 스크립트가 사용하는 viewport/스크린샷 해상도 확인 (`scripts/` 또는 `pnpm template:capture` 정의)
  - [ ] 만약 캡처가 1280×720 (16:9) → 그리드를 16:9로 통일
  - [ ] 만약 캡처가 1280×800 (16:10) → 그리드를 16:10으로 통일
  - [ ] 만약 임의의 해상도 → 캡처 스크립트를 16:9로 *고정* 한 뒤 재생성
- [ ] `DynamicTemplateGrid.tsx:128` 의 `aspect-[16/10]` 을 `aspect-video` 로 변경 (캡처 기준이 16:9 일 경우)
- [ ] `PublicTemplateGrid.tsx:95` 는 그대로 유지 (이미 일치)
- [ ] 썸네일 누락 시 placeholder div(line 104, 137) 의 비율도 동일한 컨테이너를 그대로 쓰므로 자동 일치
- [ ] `<img>` 는 그대로 `object-cover` 유지 (의도적인 cover 의도 — 비율이 맞으면 잘림 없음)
- [ ] 만약 *모든 잘림을 완전히 막고 싶다* 면 `object-contain bg-neutral-100` 으로 전환하는 옵션도 메모. 단 컨테이너에 빈 여백이 생기므로 디자인 영향 큼 → 기본은 위 비율 일치 방식 채택.

### 검증
- [ ] `/templates` 와 `/dashboard/templates` 양쪽에서 동일 템플릿이 동일하게 잘리지 않고 보이는지 좌우 비교
- [ ] 7개 테마(`corporate, cafe, fitness, interior, legal, medical, wedding`) 썸네일 모두 위·아래 잘림 없이 1차 hero 영역까지 노출되는지 확인
- [ ] 모바일 뷰포트(좁은 컬럼)에서도 비율이 유지되는지 확인 (Tailwind `aspect-video` 는 반응형으로 동작 — 별도 미디어쿼리 불필요)
- [ ] 신규 캡처 시 `pnpm template:capture` 결과 해상도가 의도한 비율과 일치하는지 한 번 더 검증

---

## 작업 순서 권고

1. ✅ **#1 fixed navbar 격리** — 완료 (`fix/editor-fixed-navbar-containment`, 2줄 수정)
2. **#2 로그인 패딩** ← 다음 (블라스트 반경 가장 작음, 즉시 효과)
3. **#4 썸네일 비율** (한 줄 수정 + 시각 검증, 회귀 위험 적음)
4. **#3 사이드바 분리** (route group 변경 — 인증 가드 회귀 위험이 가장 크므로 마지막)

각 항목은 *별도 브랜치 / 별도 PR* 로 분리해 회귀 시 bisect 가 쉽도록 한다.
