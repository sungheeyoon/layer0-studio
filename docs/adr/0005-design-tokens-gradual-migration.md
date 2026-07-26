# Rich Design Tokens — 점진적 마이그레이션 (cafe-default 부터)

> **Status: Accepted — 부분 구현 (의도).** `cafe-default` 만 rich 패턴을 쓰고 나머지 Template 는 legacy `.module.css` 를 유지한다. **여기서 "부분"은 결함이 아니라 결정의 내용 그 자체** — "완료"로 바뀌는 것이 목표 상태가 아니다.

Rich Design Tokens 패턴 (`tokens.ts` 에서 `designTokens` 객체를 export → `tokensToCssVars()` 로 CSS 변수 펼침) 은 현재 **cafe-default Template 에만** 적용되어 있다. 나머지 10 개 legacy Template 는 기존의 per-Template `.module.css` 패턴을 유지한다. 이는 **미완성 상태가 아니라 의도적인 점진 전환 (gradual migration)** 이다.

## Why not bulk-migrate

전체 일괄 마이그가 가능했지만 다음 비용을 감수해야 했다:
- 한 PR 의 diff 가 9 개 Template × 수십 개 파일로 거대해짐
- 시각 회귀 (regression) 검증을 9 개 Template 에 동시에 해야 함
- 검수자가 무엇이 의도된 변화이고 무엇이 사고인지 구분하기 어려움

대신 각 Template 가 *다른 이유로* 수정될 때 (예: 디자인 업데이트, 사용자 피드백 반영) 자연스럽게 새 패턴으로 전환하는 방식을 택했다. 어느 시점까지는 두 패턴이 공존한다.

## Consequence

새 Template 를 **Generate** 로 만들 때는 무조건 rich 패턴으로 출력한다 — 마이그 부담이 늘지 않도록.
