# Rich Design Tokens — 점진적 마이그레이션 (cafe-default 부터)

> **Status: Accepted — 부분 구현 (의도).** rich 패턴을 쓰는 Template 와 legacy `.module.css` 를 쓰는 Template 가 공존한다. **여기서 "부분"은 결함이 아니라 결정의 내용 그 자체** — "전부 전환됨"이 목표 상태가 아니다.
>
> **현황은 문서가 아니라 코드에서 확인한다:** `grep -l designTokens src/templates/*/*/tokens.ts`. (이 목록을 문서에 박아두면 반드시 낡는다 — 실제로 2026-07-26 감사 시점에 이 ADR·CLAUDE.md·CONTEXT.md·TEMPLATE_SYSTEM.md 가 모두 "cafe-default 만" 이라고 적고 있었으나 실제로는 **네 개**가 전환을 마친 상태였다. 결정이 예측한 대로 굴러갔는데 문서만 멈춰 있었다.)

Rich Design Tokens 패턴 (`tokens.ts` 에서 `designTokens` 객체를 export → 렌더러가 prop 으로 받아 `tokensToCssVars()` 로 CSS 변수 펼침) 과 legacy per-Template `.module.css` 패턴은 **의도적으로 공존한다.** 미완성 상태가 아니라 점진 전환 (gradual migration) 이다.

## Why not bulk-migrate

전체 일괄 마이그가 가능했지만 다음 비용을 감수해야 했다:

- 한 PR 의 diff 가 전 Template × 수십 개 파일로 거대해짐
- 시각 회귀 (regression) 검증을 모든 Template 에 동시에 해야 함
- 검수자가 무엇이 의도된 변화이고 무엇이 사고인지 구분하기 어려움

대신 각 Template 가 *다른 이유로* 수정될 때 (디자인 업데이트, 사용자 피드백 반영, 새 Template 저작) 자연스럽게 새 패턴으로 전환하는 방식을 택했다.

**이 방식은 실제로 작동했다.** 2026-07-26 감사 기준 네 개 Template(`academy-default`, `cafe-default`, `medical-clinic`, `outdoor-default`)이 `designTokens` 를 export 하고 렌더러에 전달하며, 그중 `medical-clinic`·`outdoor-default` 는 `.module.css` 를 하나도 갖지 않는 **완전 전환** 상태다. 나머지는 legacy 를 유지한다. 이 숫자는 앞으로도 계속 움직이므로 위의 grep 이 유일한 권위다.

## Consequence

- **새 Template 는 무조건 rich 패턴으로 저작한다** (`new-template` 스킬) — 마이그 부담이 늘지 않도록.
- 기존 Template 를 어떤 이유로든 크게 손댄다면 그 PR 에서 rich 로 전환하는 것이 기본값이다. 다만 "전환만을 위한 PR" 은 이 ADR 이 기각한 것에 해당한다.
- Studio chrome 의 시각 시스템([ADR-0011](./0011-studio-ui-redesign-shadcn-pretendard.md))은 **별개 축**이다. Template 의 토큰과 chrome 의 토큰을 섞지 않는다.
