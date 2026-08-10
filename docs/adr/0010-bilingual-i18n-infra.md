# Studio 빌더 UI 는 쿠키 기반 ko/en 양방향 i18n 으로 서빙한다

> **Status: Accepted — 구현 완료** (`src/lib/i18n/messages/{ko,en}.ts`, 기본 `ko`). Studio 빌더 제품(마케팅 랜딩·인증·대시보드·에디터·설정)의 UI 카피를 `src/lib/i18n` 의 **타입드 딕셔너리**(ko canonical + en 동일 타입)로 중앙화한다. locale 은 **쿠키 기반**으로 결정·영속화하며 **URL 을 바꾸지 않는다**. 발행 Site/Template 콘텐츠와 admin 은 범위 외. PRD #79, 이슈 #80–#84 로 구현 완료.

## 맥락

1차 타겟은 한국 사용자이지만 Studio 빌더의 UI 카피가 한 파일 안에서도 문자열 단위로 한/영이 **혼재**되어 있었다. 새 문자열을 추가할 때 "이건 영어인가 한국어인가"의 기준이 없어 혼재가 계속 누적됐고, 한/영 전환을 지원할 인프라 자체가 없었다. 장기적으로 영어권 사용자도 받되, 지금 당장은 일관성과 "반쪽 번역" 방지가 핵심이다.

## 결정

### 1. 범위 — Studio 빌더 chrome 에만

ko/en 양방향 i18n 은 **빌더 제품**(랜딩, 인증, 대시보드, 에디터, 설정, 템플릿 카탈로그 chrome)에만 적용한다.

- **발행 Site / Template 콘텐츠는 제외** — 사용자가 편집하는 데이터이지 제품 chrome 이 아니다(다른 축). 에디터의 chrome(탭·버튼·에러)만 i18n, 편집 대상 섹션 데이터는 손대지 않는다.
- **admin(`/admin/*`)은 범위 외** — 내부 운영 도구. 영어 유지, 억지 ko 백필 안 함. 에러 레지스트리의 `ADMIN_*` 도 마찬가지.

### 2. 라이브러리 없는 경량 타입드 딕셔너리 — 패리티를 컴파일타임에 강제

`src/lib/i18n/` 에 직접 구현(i18next 등 미도입).

- `messages/ko.ts` 가 **canonical**: `export type Messages = typeof ko` 로 타입 원천. `en.ts` 는 `const en: Messages` 로 동일 타입을 만족 → **ko 에 키를 추가하고 en 에 안 넣으면 컴파일 실패.** "반쪽 번역"이 구조적으로 막힌다(User Story 9).
- 표면별 **네임스페이스 중첩**: `auth`, `landing`, `nav`, `dashboard`, `editor`, `settings`.
- **접근은 타입드 객체 직접 접근**(`dict.dashboard.projects.title`), 문자열 키 `t('...')` 아님 — 오타가 런타임까지 새지 않고 자동완성이 된다(User Story 10).
- 한국어는 복수형이 없어 ICU MessageFormat 불필요.

### 3. 메시지는 문자열 전용 — 보간은 prefix/suffix

딕셔너리 값은 **순수 문자열만**. 함수형 보간값(`greeting(name)`)을 쓰지 않는다.

- 이유: 서버가 활성 locale 딕셔너리를 Client Provider 에 **prop 으로 직렬화**해 넘기는데, 함수는 RSC 경계를 못 넘는다.
- 보간이 필요하면 `xPrefix`/`xSuffix` 키로 분할해 호출부에서 합성한다(예: `Theme "` + key + `" not found.`).

### 4. 쿠키 기반 locale, URL 무변경

- 우선순위: `NEXT_LOCALE` 쿠키 → `Accept-Language` → 기본 `ko`. 이 로직은 순수 함수 `resolveLocale(cookieValue, acceptLanguage)` 로 격리해 vitest 단위 테스트(User Story 11).
- 전환: 토글이 쿠키(만료 1년) set 후 `router.refresh()` 로 서버 컴포넌트 재렌더. 쿠키 set 은 `document.cookie` 직접 대입이 React Compiler lint(immutability)에 걸려 **서버 액션 `setLocaleAction`** 으로 처리.
- **URL 에 `[locale]` 경로 프리픽스를 도입하지 않는다** — 북마크·공유 링크가 언어와 무관하게 동일(User Story 3). 서버는 활성 locale 딕셔너리**만** 주입해 클라 번들에 한 언어만 적재(User Story 16). `<html lang>` 은 루트 레이아웃에서 동적화(User Story 7).

### 5. 미들웨어 불변

경로 프리픽스를 안 쓰므로 locale 결정을 위해 `src/middleware.ts` 를 **변경하지 않는다**. locale 해석은 서버의 쿠키/헤더 처리와 전환용 서버 액션에 머물며 routing 관심사와 섞이지 않는다.

### 6. 에러 레지스트리는 별도 모듈로 유지

`src/lib/errors/messages.ts` 를 UI 딕셔너리에 흡수하지 않는다(도메인 코드 ↔ 표시 문자열 디커플링 보존 — chrome 카피와 다른 축).

- 각 항목 값을 `string → { ko, en }` 으로 변경, getter 를 `getAuthError(code, locale)` / `getSiteError(code, locale, fallback)` / `getDomainError(code, locale)` 로 확장. UNKNOWN 폴백 유지.

## 대안 검토

- **(b) i18next/next-intl 도입** — 키 패리티를 `typeof` 로 공짜로 얻는 타입드 객체 접근이 목표였고, 런타임 메시지 포맷·복수형 엔진이 (한국어엔) 불필요. 라이브러리 무게 대비 이득 없어 기각.
- **(c) `[locale]` 경로 프리픽스 라우팅(next-intl 기본)** — locale-aware routing 이 추가되고 북마크 URL 도 언어에 종속된다. 쿠키 방식으로 기각.
- **(d) 문자열 키 `t('dashboard.title')`** — 오타가 런타임까지 샌다. 타입드 객체 접근으로 기각.
- **(e) 장식성 영문까지 전부 ko 번역** — 로그인 `ACCESS_GATE`, 설정 `SYS_UID`/빌드rev/mock 빌링값 등은 디자인 정체성(테크노 스타일)이지 카피가 아니다. 번역 대상에서 제외(en 도 그대로 유지).

## Consequences

- **새 카피 추가 절차**: `ko.ts` 에 키 추가 → `en.ts` 에 동일 키(안 넣으면 빌드 깨짐). 서버는 `getDictionary(await getLocale())`, 클라는 `useDictionary()` + `useLocale()`.
- **테스트는 deep 모듈 둘만** — `resolveLocale` 우선순위·폴백 + 에러 getter. (나머지 카피는 타입이 보증.)
- **JSX gotcha**: children 안의 `//` 구분자는 `react/jsx-no-comment-textnodes` lint 에 걸린다 → 템플릿 리터럴(``{`${a} // ${b}`}``)로 감쌀 것.
- **확장**: 3번째 언어는 `messages/<lang>.ts` 추가 + `LOCALES`/`resolveLocale` 갱신으로 구조 변경 없이 가능(User Story 17). DB 프로필 동기화는 향후 별도 이슈 — 쿠키가 단일 소스.
- **DB 변경 없음** — 순수 프론트/서버 렌더 계층.

## 관련

- PRD #79 / 이슈 #80(인프라+로그인 tracer bullet)·#81(랜딩)·#82(인증)·#83(대시보드)·#84(에디터+설정) — 구현 단위.
- CLAUDE.md "src/lib/errors" — 도메인 코드 → 표시 문자열 매핑이 locale-aware 로 확장됨.
