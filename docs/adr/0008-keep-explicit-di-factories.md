# DI 조립은 명시적 per-use-case 팩토리로 유지하고 의존성 비용 경계로 분할한다

> **Status: Accepted — 구현 완료, amended 2026-07-24** (#61). use case 당 하나의 `create*UseCase(supabase)` 팩토리를 **의도적으로 유지**하되, 모든 팩토리를 한 파일에서 export하지 않고 의존성 비용과 read/write 경계에 따라 모듈을 나눈다.

최초 결정 당시 `src/lib/di/container.ts` 는 19개 use case 를 감싸는 거의 동일한 팩토리로 이루어져 있었다. 각 팩토리는 사실상 `new SomeRepoImpl(supabase); new SomeUseCase(repo)` 두 줄이다. 보일러플레이트처럼 보이고, 아키텍처 리뷰는 주기적으로 "여러 얕은 어댑터를 하나의 깊은 resolver 로 접어라"라고 재제안할 것이다(#61). 이 ADR 은 그 제안을 **명시적으로 기각**해 재논의를 차단한다.

## 컨테이너는 진짜 seam 이다 (얕지만)

deletion test: 컨테이너를 지우면 각 호출부에 ~2줄이 추가될 뿐이다 — 하지만 그 2줄은 **concrete Supabase repository 클래스(`*RepositoryImpl`)를 app 레이어로 누출**시킨다. 즉 컨테이너는 "app 레이어가 concrete repo 를 모르게 한다"는 Clean Architecture 경계를 지키는 **진짜 seam** 이며, 단지 그 seam 이 29개 얕은 어댑터로 표현되어 있을 뿐이다. seam 자체는 가치가 있다.

(#58 이후 app 레이어에는 `RepositoryImpl` 직접 참조가 0개다 — 직접 우회가 제거되어 이 seam 은 더 이상 침식되지 않고, 오히려 굳힐 가치가 분명해졌다.)

## 왜 generic resolver 로 접지 않는가

검토한 대안:

- **(b) 단일 generic resolver** — 모든 use case 를 `UseCase → { repo, deps }` 레지스트리 뒤로 통합. TypeScript 에서 이를 **타입 안전하게** 만들기 어렵다(use case 마다 생성자 시그니처가 다르고, validator·repo 2개 주입 같은 변형이 있음 → 광범위한 제네릭/캐스팅 필요). 또 `resolve(supabase, LoginUseCase)` 는 "이 use case 가 어떤 repo·의존성으로 조립되는지"를 **grep 으로 추적할 수 없게** 만든다. 줄 수 절감(~140줄)의 대가로 타입 안전성·greppability·명료함을 잃는다.
- **(c) 중간안: repo 빌더 헬퍼** — per-use-case 팩토리는 grep 가능하게 두되 `new RepoImpl(supabase)` 보일러플레이트만 작은 헬퍼로 축약. 절감 효과가 미미(팩토리당 0~1줄)하면서 간접 계층만 하나 더 생긴다.

선택: **(a) 명시적 형태 유지.** 명시적 팩토리는 (1) 호출부에서 use case 이름으로 바로 grep 가능, (2) 생성자 의존성이 코드에 그대로 드러나 타입 체커가 전부 검증, (3) `siteContentValidator` 주입이나 `createCreateSiteFromTemplateUseCase` 의 repo 2개 주입 같은 **변형을 특수 케이스 없이 자연스럽게 수용**, (4) magic/indirection 0. 여러 팩토리는 보일러플레이트로 보이지만, TS 에서 generic resolver 는 그 보일러플레이트를 제거하는 대신 더 비싼 것(타입 안전성·추적성)을 지불한다.

## 2026-07-24 보완 — 조립 코드도 의존성 비용 경계를 지킨다

단일 `container.ts` 는 논리적으로는 명시적이었지만, 번들러 관점에서는 모든 팩토리와 의존성을 하나의 import graph 로 묶었다. 루트 레이아웃이 `getCurrentUser()`를 import하면 같은 파일의 `getCurrentUserSites()`를 거쳐 컨테이너 전체가 연결됐고, 컨테이너의 `LibraryAwareSiteContentValidator`가 Template registry와 11개 Template CSS까지 도달했다. 그 결과 Template을 렌더하지 않는 랜딩 초기 HTML에도 스타일시트 링크가 11개 포함됐다.

따라서 **명시적 per-use-case 팩토리라는 seam은 유지하면서**, 조립 모듈은 아래처럼 의존성 비용과 read/write 책임으로 분할한다.

- `auth.ts` — 인증 use case
- `template-read.ts` / `template-write.ts` — Template 조회 / 검증이 필요 없는 변경
- `template-content-write.ts` — Template registry 기반 검증이 필요한 변경
- `site-read.ts` / `site-write.ts` — Site 조회 / 검증이 필요 없는 변경
- `site-content-write.ts` — Template registry 기반 검증이 필요한 Site content 저장
- `asset.ts` — Asset 업로드

또한 인증 사용자 조회만 담당하는 `current-user.ts`와 Site 목록 조회를 조립하는 `current-user-sites.ts`를 분리한다. 루트 인증 조회 경로는 Template registry 또는 `LibraryAwareSiteContentValidator`를 import하지 않아야 한다. 검증 비용이 필요한 write 경로만 해당 의존성을 가진다.

이 분할은 generic resolver 도입이 아니다. 호출부는 여전히 구체적인 `create*UseCase(supabase)`를 import하고, 조립 규칙은 코드에 그대로 드러난다.

## Consequences

- 새 use case 를 추가할 때는 기존과 동일하게 `create*UseCase(supabase)` 팩토리를 한 개 손으로 추가하고, 의존성 비용과 read/write 책임에 맞는 DI 모듈에 둔다.
- **per-request Supabase client scoping 유지** — 싱글톤 컨테이너 없음. 매 요청마다 fresh Supabase client 가 팩토리에 주입되어 cross-request 공유가 발생하지 않는다(현재 보장 그대로).
- app 레이어는 오직 `create*UseCase` 팩토리만 호출하며, concrete `*RepositoryImpl` 을 직접 참조하지 않는다(#58 에서 정리 완료, 본 결정으로 유지).
- 랜딩의 프로덕션 빌드 초기 스타일시트 링크는 이 분할만 적용했을 때 **11개에서 2개로 감소**했다(폰트 개선까지 적용한 최종값은 1개). `scripts/verify-initial-assets.ts`가 초기 스타일시트 1개를 상한으로 고정해 Template 전용 CSS의 재유입을 회귀 검사한다.
- 미래 아키텍처 리뷰가 "resolver 로 접어라"를 재제안하면 본 ADR 로 회신한다.
- 팩토리 수가 크게 늘거나(예: 수백 개) 조립 규칙이 진짜로 균일해지면 재검토 트리거가 될 수 있으나, 현 규모에서는 해당 없음.

## 관련

- #61 — 본 결정의 출처 이슈.
- #58 — 직접 repo 우회 제거(app 레이어 `RepositoryImpl` 참조 0). 이 seam 이 더 이상 침식되지 않게 만든 선행 작업.
- CLAUDE.md "DI pattern" — 매 요청 fresh client 주입·싱글톤 컨테이너 없음 서술과 일치.
