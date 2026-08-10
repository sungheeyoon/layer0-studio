# β 모델 — Template 단위 isolation 우선 (DRY 위배)

> **Status: Accepted — 구현 완료.** 레지스트리의 모든 Template 이 `src/templates/<category>/<leaf>/` 아래에 `tokens.ts`·`library/`·`template.ts`·`index.tsx` 를 자체 보유한다. (개수는 문서에 박지 않는다 — `ls -d src/templates/*/*/` 가 유일한 권위다.)
>
> **용어 note (ADR-0016 이후):** 아래 본문의 "Section component" 는 결정 당시 이름이다. 현재 이름은 **Block component** 이며 결정 내용은 그대로다([ADR-0016](./0016-block-rename-and-field-value-split.md) §2).

β 아키텍처는 최대 재사용(DRY)보다 **Template 단위 독립성(isolation)** 을 우선한다. 각 Template 는 하나의 독립적인 작은 앱처럼 동작하며, 디자인마다 레이아웃 구조·텍스트 스타일·컴포넌트 계층·시각적 방향성이 크게 달라질 수 있다. 따라서 일부 Section component 는 Template 간 중복되어 존재할 수 있으며, 이는 의도된 설계 선택이다.

## Future direction

multi-page 는 **데이터 모델 차원**에서 이미 출시됐다([ADR-0007](./0007-single-multi-site-type-structural-union.md) — `ContentModel`(구 `TemplateJson`) 유니온, `renderMultiSite`). 다만 그 작업은 평탄한 `library/` 를 그대로 쓰며, 디렉터리를 `src/templates/<templateKey>/pages/<page>/blocks/` 로 옮기는 **코드 구조 재편은 여전히 미결**이다. 그래서 `library/` 라는 디렉터리 이름은 *과도기 아티팩트* 로 다루며, CONTEXT.md 글로서리에 도메인 용어로 굳히지 않는다.

## Consequences

- "Hero 컴포넌트가 9 곳에 복제돼 있는데 추출해야 하지 않나" 라는 미래 PR 제안은 이 ADR 을 근거로 거절한다 — *의도된 중복* 임.
- Section component 라이브러리에 cross-Template 변경이 필요하면, 모든 Template 의 사본을 각각 패치해야 한다.
