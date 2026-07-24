# Studio UI 를 shadcn 시맨틱 토큰 + Pretendard 로 재설계하고 블루프린트 컨셉을 폐기한다

> **Status: Accepted, font delivery amended 2026-07-24.** Studio chrome(마케팅 랜딩·인증·대시보드·에디터·설정·admin)의 비주얼 시스템을 전면 재설계한다. 도면(블루프린트/크로스헤어/제로-radius) 컨셉을 폐기하고 관습적 SaaS 룩으로 전환, 컬러 어휘를 **shadcn 식 시맨틱 토큰** 하나로 통일, 한글 1차 타겟에 맞춰 **Pretendard** + 한글 최적 타입 스케일을 도입한다. 라이트/다크 양 테마, lucide 아이콘, primary = Indigo. 발행 Site / Template(`src/templates/*`)은 범위 외. `redesign/studio-ui` 브랜치에서 빅뱅으로 작업하고 완성 후 1회 머지한다.

## 맥락

i18n(ADR-0010) 적용 과정에서 Studio chrome 의 비주얼 시스템이 한계에 도달했음이 드러났다. 진단:

1. **컬러 어휘가 둘로 충돌** — `src/app/globals.css` 의 `@theme` 에는 Material Design 3 토큰이 50여 개 덤프되어 있으나(`--color-on-secondary-container`, `--color-surface-tint` …), 실제 컴포넌트는 그 토큰을 거의 안 쓰고 **raw Tailwind 회색**(`text-zinc-400` 63회, `text-neutral-400` 64회, `zinc-500`/`neutral-500` …)으로 색을 칠한다. 시맨틱 토큰 시스템이 깔려 있는데도 우회당하는 상태.
2. **대비(가시성) 미달** — 가장 많이 쓰인 보조 텍스트 클래스 `text-outline`(=`#777777`)는 `#f9f9f9` 배경에서 약 4.4:1 로 **WCAG AA(4.5:1) 미달**, 무려 **113회** 사용. `text-zinc-400`(≈2.8:1)은 더 심각.
3. **한글이 어색** — 폰트가 `Inter`(latin subset)뿐이라 **한글은 시스템 폰트로 폴백**된다. weight 도 `100/300/500/700` 으로 얇은 쪽에 쏠려, 얇은 한글이 깨져 보인다. line-height/letter-spacing 도 영문 기준이라 한글 가독성이 떨어진다.
4. **컨셉이 전달성을 해치고, 그나마 일관성도 깨짐** — 전역 `cursor: crosshair`, 블루프린트 그리드 유틸, `--radius: 0px` 의 "도면" 정체성은 "일하는 화면"의 명료함을 떨어뜨린다. 게다가 `--radius:0` 인데도 `rounded-full/xl/lg/2xl` 이 60여 회 쓰여 제로-radius 규칙이 이미 방치됐다.

즉 문제는 "토큰이 없어서"가 아니라 **두 컬러 어휘가 병존하고, 어느 것도 AA 를 보증하지 않으며, 한글 폰트 인프라가 없고, 컨셉이 반쯤 무너진** 데 있다. 부분 보정으로는 재발하므로 시스템을 통째로 교체한다.

## 결정

### 1. 범위 — Studio chrome 만

랜딩·인증·대시보드·에디터·설정·admin 등 **Studio 자체 화면**(`src/app`, `src/components`, 단 `src/templates` 제외)에만 적용한다.

- **발행 Site / Template(`src/templates/*`)은 제외** — 사용자가 편집하는 데이터·코드이지 제품 chrome 이 아니다(다른 축). Template 의 디자인 토큰과 시각 정체성은 [ADR-0005](./0005-design-tokens-gradual-migration.md)의 별도 축이다. 단, 루트에서 이미 제공하는 Pretendard와 동일한 외부 폰트 import는 중복 네트워크 요청을 막기 위해 제거할 수 있다.

### 2. 도면 컨셉 폐기 → 관습적 SaaS

블루프린트 그리드, 전역 `crosshair`, 제로-radius 정체성을 **전부 제거**한다. 랜딩을 포함한 전 화면을 평범하고 명료한 SaaS 룩으로. 적당한 radius(토큰화)와 표준 커서를 쓴다.

### 3. 컬러 어휘 — shadcn 식 시맨틱 토큰으로 단일화

`background`/`foreground`/`card`/`popover`/`muted`/`muted-foreground`/`border`/`input`/`ring`/`primary`/`primary-foreground`/`secondary`/`accent`/`destructive` 등 **소수의 관습적 시맨틱 토큰**만 정의하고 그것만 쓴다.

- **MD3 50토큰 덤프 폐기**, **raw `zinc/neutral/gray` 클래스 폐기**, `text-outline` 폐기.
- **대비는 토큰 값에 내장** — 보조 텍스트는 `muted-foreground` 단일 토큰으로 치환하고, 그 값은 **흰 배경 4.5:1 이상**(≈ `#71717a`/zinc-500, 4.6:1)으로 못 박는다. 113개 `text-outline` 이 이 토큰으로 치환되며 대비 문제가 일괄 해소된다(가시성은 #3 의 파생 결과이지 별도 작업이 아니다).

### 4. shadcn — 라이브러리까지 도입

토큰 컨벤션만이 아니라 **컴포넌트 라이브러리**까지 도입한다(`npx shadcn init` + radix + cva + `cn()`/`tailwind-merge`). Button/Input/Dialog/Select/Card 등 **실제 사용처 기반**으로 프리미티브를 깔고 화면을 그 위에 재구성한다.

- 현 코드에는 shadcn 흔적이 전무(`components.json`·radix·cva·`src/components/ui`·`cn()` 없음)하므로 신규 도입이다.
- Tailwind v4 + Next 16 + React 19 조합을 지원하나, init 시 `@theme` 토큰과 shadcn CSS 변수 매핑을 `globals.css` 에서 **하나로 정리**해야 한다(이중 정의 금지).

### 5. 한글 폰트 — Pretendard 단일(ko+en), unicode-range 동적 서브셋

`Inter` 를 폐기하고 **Pretendard** 를 단일 UI 폰트로 쓴다. 라틴+한글을 한 폰트로 커버하며 라틴 모양이 Inter 와 유사해 영문 품질 손실이 없다.

- 최초에는 `next/font/local`로 2.01MB 전체 가변 폰트 파일을 루트에서 preload했다. 이는 한 페이지에 필요한 글자 수와 무관하게 전체 파일을 초기 요청에 포함하므로 모바일 초기 로딩 비용이 컸다.
- `pretendard` 공식 패키지의 `pretendardvariable-dynamic-subset.css`를 빌드에 포함한다. 92개 `unicode-range` 조각 중 현재 페이지의 글자 범위만 브라우저가 요청하며, 개별 빌드 산출물은 최대 약 44KB다.
- CSS와 폰트 파일은 Next.js 빌드 산출물로 **자체 호스팅**한다. 외부 CDN 요청은 없고 `font-display: swap`을 유지한다. `--font-sans` 토큰은 `"Pretendard Variable"`에 연결한다.
- 루트에서 전체 폰트를 preload하지 않는다. Template CSS가 같은 Pretendard를 jsDelivr에서 다시 import하지 않도록 한다.

### 6. 타이포 — 한글 최적 시맨틱 타입 스케일

전역 값 보정에 그치지 않고 `display`/`heading`/`body`/`caption` 같은 **시맨틱 타입 프리셋**을 정의해 한글 최적값을 내장한다.

- body: `line-height ~1.6`, `letter-spacing -0.01em`, weight 400
- heading: `line-height ~1.3`, `letter-spacing -0.02em`, weight 600/700
- weight 램프에서 **100/300 제거** → `400/500/600/700`. (얇은 한글 깨짐 방지)

### 7. 브랜드색 — Indigo primary, 텍스트는 중립 유지

`--color-primary: #000000`(순검정)을 폐기하고 **Indigo**(`#4F46E5`, primary / hover `#4338CA` / ring `#6366F1`)를 브랜드 액센트로 둔다.

- primary 는 **액션(CTA·포커스·선택 상태)에만**. 본문 텍스트는 계속 중립 그레이(`foreground`/`muted-foreground`). 흰 배경 CTA 대비 AA 통과.

### 8. 다크모드 — 이번에 함께 구축

현재 `<html className="light">` 하드코딩 + 토글 부재 상태에서 스튜디오에 `dark:` 클래스가 **250곳** 쓰여 있으나 전부 죽은(never 활성) 스타일이다. 빅뱅으로 전 파일을 어차피 건드리므로 이참에 정식 구축한다.

- `next-themes` + 테마 토글 도입, shadcn dark 토큰 와이어링, 250개 죽은 `dark:` 를 **새 시맨틱 팔레트 기준으로 재검수**.
- 비용 인지: 모든 surface 를 **라이트/다크 2테마로 검증**해야 한다(머지 게이트에 반영).

### 9. 아이콘 — Material Symbols → lucide

Google Fonts `<link>`(렌더 블로킹) 로 불러오던 Material Symbols(15개 파일)를 **lucide** 로 교체한다. stroke 방식이라 `currentColor` 로 다크모드를 자동 추종하고 shadcn 과 짝이 맞는다.

### 10. 마이그레이션 — 빅뱅 일괄 교체, 단일 머지

토큰/폰트/타입스케일/shadcn 기반은 전역 공통이고 화면 이전도 66개 파일 규모다. surface 별 점진 대신 **`redesign/studio-ui` 브랜치에서 빅뱅으로** 진행하고, 완성·테스트 후 **메인에 1회 대형 머지**한다(작업 중 메인 미반영 — 코드 혼입 방지).

- 거대 단일 PR 의 리뷰·롤백 난이도를 상쇄하기 위해 **머지 게이트**: `pnpm tsc --noEmit` + `pnpm lint` 통과 + 주요 surface 스크린샷(라이트/다크 2장씩).

### 11. 회귀 방지 — eslint 로 raw 색 클래스 CI 차단

빅뱅 후 raw 회색이 다시 스며드는 것을 구조적으로 막는다. `no-restricted-syntax`(또는 동등 규칙)로 `text-zinc-*`/`neutral-*`/`gray-*`, `text-outline`, MD3 `--color-*` 클래스를 **금지**하고 시맨틱 토큰만 통과시킨다.

## 대안 검토

- **(a) 컨셉 유지, 접근성만 보정** — `text-outline` 값과 한글만 고침. "전달성 부족"이라는 근본 불만이 남고, 두 컬러 어휘 병존도 안 풀려 재발. 기각.
- **(b) MD3 토큰 이름 유지, 값·사용만 수리** — 클래스명 churn 은 적으나 난해한 50토큰 어휘가 남고 raw 회색 금지로 어차피 전 사용처를 건드린다. 관습적 SaaS 표준(shadcn) 대비 유지보수·생태계 이점 없어 기각.
- **(c) shadcn 토큰 컨벤션만, 라이브러리 미도입** — 가볍지만 프리미티브 일관성·접근성을 직접 떠안아야 함. 빅뱅으로 어차피 재구성하므로 라이브러리까지 도입이 총비용 우위. 기각.
- **(d) Inter+Pretendard 페어링 / Noto Sans KR** — 페어링은 두 폰트 로딩·관리 복잡, Noto Sans KR 은 본문체 성격·용량 큼. UI 단일 폰트로 Pretendard 채택, 나머지 기각.
- **(e) 무채색 미니멀(검/흰) primary** — 간결하나 노코드 빌더에서 CTA·상태 구분이 약함. 신뢰·명료함 위해 Indigo 액센트 채택, 기각.
- **(f) surface 별 점진 마이그(i18n 방식)** — 토큰·폰트가 전역이라 과도기 두 룩 공존 기간이 길고 시각적 일관성이 깨진다. 사용자가 코드 혼입 방지를 위해 빅뱅·단일머지를 명시 선택. 기각.
- **(g) 다크모드 보류** — 죽은 `dark:` 250개를 그대로 두면 옛 팔레트 기준이 섞여 나중에 전수 전수가 더 비싸진다. 빅뱅 시점에 함께 처리.

## Consequences

- **단일 거대 머지** — 작업 기간 동안 메인과 분리(`redesign/studio-ui`). 완성 전 부분 머지 안 함. 머지 게이트(tsc/lint/2테마 스크린샷) 통과가 조건.
- **신규 의존성** — radix-ui, cva, `tailwind-merge`/`clsx`, lucide-react, next-themes 추가. Material Symbols `<link>` 제거.
- **`globals.css` 전면 재작성** — MD3 `@theme` 덤프 제거, shadcn 시맨틱 토큰(라이트/다크) 정의, `--font-sans`=Pretendard, 타입 스케일·radius 토큰. `cursor: crosshair`·blueprint 유틸 삭제.
- **`src/app/layout.tsx` / `globals.css`** — Inter 및 `next/font/local` 전체 파일 preload 제거→공식 Pretendard 동적 서브셋을 전역 CSS에 포함, `<html className="light">` 하드코딩 제거→`next-themes` provider, Material Symbols `<link>` 제거.
- **폰트 회귀 게이트** — `scripts/verify-initial-assets.ts`가 루트 전체 Pretendard preload와 초기 CSS 내부 외부 Pretendard import를 실패 처리한다.
- **컴포넌트 전수 수정(~66 tsx)** — raw 색·`text-outline`·아이콘·프리미티브 교체. eslint 가드가 회귀 차단.
- **i18n(ADR-0010) 무영향** — 카피/딕셔너리 계층은 그대로. 단 ADR-0010 (e) 의 "장식성 영문(테크노 정체성)" 일부는 본 재설계로 시각적 컨텍스트가 바뀌므로 화면별로 재검토.
- **DB 변경 없음** — 순수 프론트/렌더 계층.
- **범위 밖 확인** — 사용자 Template 비주얼은 불변. 사용자가 만든 사이트의 룩앤필은 이 결정과 무관.

## 관련

- [ADR-0005](./0005-design-tokens-gradual-migration.md) — Template 디자인 토큰은 별도 축이다. 본 결정은 Studio chrome 을 다루며, Template 파일은 시각 정체성을 변경하지 않고 중복 외부 Pretendard import 제거와 `"Pretendard Variable"` family 호환에 필요한 범위만 수정한다.
- [ADR-0010](./0010-bilingual-i18n-infra.md) — i18n chrome 카피. 본 재설계는 그 카피 계층 위의 비주얼만 교체(무충돌).
- CLAUDE.md "Environment variables / 디자인" — `globals.css` 토큰 체계가 MD3→shadcn 으로 전환됨.
- 작업 브랜치: `redesign/studio-ui` (빅뱅, 완성 후 메인 1회 머지).
