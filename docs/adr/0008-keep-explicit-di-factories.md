# DI 컨테이너는 명시적 per-use-case 팩토리로 유지한다 — generic resolver 로 접지 않는다

> **Status: Accepted** (#61). 코드 변경 없음 — `src/lib/di/container.ts` 의 현재 형태(use case 당 하나의 `create*UseCase(supabase)` 팩토리)를 **의도적으로 유지**한다는 결정을 기록한다.

`src/lib/di/container.ts` 는 19개 use case 를 감싸는 ~19개의 거의 동일한 팩토리로 이루어져 있다. 각 팩토리는 사실상 `new SomeRepoImpl(supabase); new SomeUseCase(repo)` 두 줄이다. 보일러플레이트처럼 보이고, 아키텍처 리뷰는 주기적으로 "29개 얕은 어댑터를 하나의 깊은 resolver 로 접어라"라고 재제안할 것이다(#61). 이 ADR 은 그 제안을 **명시적으로 기각**해 재논의를 차단한다.

## 컨테이너는 진짜 seam 이다 (얕지만)

deletion test: 컨테이너를 지우면 각 호출부에 ~2줄이 추가될 뿐이다 — 하지만 그 2줄은 **concrete Supabase repository 클래스(`*RepositoryImpl`)를 app 레이어로 누출**시킨다. 즉 컨테이너는 "app 레이어가 concrete repo 를 모르게 한다"는 Clean Architecture 경계를 지키는 **진짜 seam** 이며, 단지 그 seam 이 29개 얕은 어댑터로 표현되어 있을 뿐이다. seam 자체는 가치가 있다.

(#58 이후 app 레이어에는 `RepositoryImpl` 직접 참조가 0개다 — 직접 우회가 제거되어 이 seam 은 더 이상 침식되지 않고, 오히려 굳힐 가치가 분명해졌다.)

## 왜 generic resolver 로 접지 않는가

검토한 대안:

- **(b) 단일 generic resolver** — 모든 use case 를 `UseCase → { repo, deps }` 레지스트리 뒤로 통합. TypeScript 에서 이를 **타입 안전하게** 만들기 어렵다(use case 마다 생성자 시그니처가 다르고, validator·repo 2개 주입 같은 변형이 있음 → 광범위한 제네릭/캐스팅 필요). 또 `resolve(supabase, LoginUseCase)` 는 "이 use case 가 어떤 repo·의존성으로 조립되는지"를 **grep 으로 추적할 수 없게** 만든다. 줄 수 절감(~140줄)의 대가로 타입 안전성·greppability·명료함을 잃는다.
- **(c) 중간안: repo 빌더 헬퍼** — per-use-case 팩토리는 grep 가능하게 두되 `new RepoImpl(supabase)` 보일러플레이트만 작은 헬퍼로 축약. 절감 효과가 미미(팩토리당 0~1줄)하면서 간접 계층만 하나 더 생긴다.

선택: **(a) 현재 형태 유지.** 명시적 팩토리는 (1) 호출부에서 use case 이름으로 바로 grep 가능, (2) 생성자 의존성이 코드에 그대로 드러나 타입 체커가 전부 검증, (3) `siteContentValidator` 주입이나 `createCreateSiteFromTemplateUseCase` 의 repo 2개 주입 같은 **변형을 특수 케이스 없이 자연스럽게 수용**, (4) magic/indirection 0. "29개 팩토리"는 보일러플레이트로 보이지만, TS 에서 generic resolver 는 그 보일러플레이트를 제거하는 대신 더 비싼 것(타입 안전성·추적성)을 지불한다.

## Consequences

- 코드 변경 없음. 새 use case 를 추가할 때는 기존과 동일하게 `create*UseCase(supabase)` 팩토리를 한 개 손으로 추가한다.
- **per-request Supabase client scoping 유지** — 싱글톤 컨테이너 없음. 매 요청마다 fresh Supabase client 가 팩토리에 주입되어 cross-request 공유가 발생하지 않는다(현재 보장 그대로).
- app 레이어는 오직 `create*UseCase` 팩토리만 호출하며, concrete `*RepositoryImpl` 을 직접 참조하지 않는다(#58 에서 정리 완료, 본 결정으로 유지).
- 미래 아키텍처 리뷰가 "resolver 로 접어라"를 재제안하면 본 ADR 로 회신한다.
- 팩토리 수가 크게 늘거나(예: 수백 개) 조립 규칙이 진짜로 균일해지면 재검토 트리거가 될 수 있으나, 현 규모(19개)에서는 해당 없음.

## 관련

- #61 — 본 결정의 출처 이슈.
- #58 — 직접 repo 우회 제거(app 레이어 `RepositoryImpl` 참조 0). 이 seam 이 더 이상 침식되지 않게 만든 선행 작업.
- CLAUDE.md "DI pattern" — 매 요청 fresh client 주입·싱글톤 컨테이너 없음 서술과 일치.
