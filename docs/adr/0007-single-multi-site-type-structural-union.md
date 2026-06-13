# Single / Multi 는 구조적으로 분리된 Site Type — nav 는 projection

Site 는 **Single** 과 **Multi** 두 개의 독립적인 Site Type 으로 나뉘며, 어느 쪽인지는 **생성(프리셋) 시점에 `mode` 로 고정**된다. Single → Multi 로 *진화* 하는 개념은 존재하지 않는다. `TemplateJson` 은 `mode` 를 판별자로 하는 **구조적 유니온**이다.

```ts
interface TemplateSection {                    // base — 섹션 콘텐츠 모양 (양쪽 공통, 섹션 렌더 재사용)
  id; type; visible; data;                     // title·editable 없음
}
interface SingleSection extends TemplateSection {
  nav: { visible: boolean; label: string };    // single nav 소스
}
interface TemplatePage {
  id; slug; visible;
  nav: { visible: boolean; label: string };    // multi nav 소스 (label = 페이지 이름 겸)
  sections: TemplateSection[];
}
type TemplateJson =
  | { mode: 'single'; templateKey; globalStyles; sections: SingleSection[] }
  | { mode: 'multi';  templateKey; globalStyles; shared: { header: TemplateSection[]; footer: TemplateSection[] }; pages: TemplatePage[] };
```

이 프로젝트는 범용 웹 빌더가 아니라 **템플릿 기반 노코드 생성 플랫폼**이다 — IA(페이지·섹션·nav 구성)는 템플릿 제작자가 정의하고, 사용자는 그 안에서 콘텐츠 편집 / `visible` 토글 / 순서 변경 / Collection CRUD 만 한다. "하나의 스크롤 경험(Single)" 과 "여러 페이지의 집합(Multi)" 은 본질적으로 다른 도메인이므로 타입 수준에서 분리한다. 프로젝트 초기(템플릿 ~6개)가 이 구조를 확정하기에 가장 저렴한 시기라는 판단으로, 기존 Single 데이터 마이그레이션 비용을 감수한다.

## nav 는 저장하지 않는다 — projection

nav 는 독립 데이터가 아니라 **소스의 투영**이며, nav 정보(`nav: { visible, label }`)는 **projection 소스에만** 둔다.

- **Single**: 소스 = **섹션**. `deriveNav(sections, s => '#section-' + s.id)` — 앵커 스크롤. 섹션 순서 = nav 순서, 섹션을 옮기면 nav 도 따라 옮겨진다.
- **Multi**: 소스 = **페이지**. `deriveNav(pages, p => p.slug)` — 페이지 이동. `pages[]` 배열 순서 = nav 순서.

nav 객체 모양·필터 규칙(`visible && nav.visible`)·라벨 출처(`nav.label`)는 양쪽 **동일**하고, **진짜 다른 단 하나(href: 앵커 vs slug)만 `hrefOf` 파라미터로 분리**된다. 그래서 multi 내부 섹션(base `TemplateSection`)은 nav 정보를 갖지 않는다 — nav 를 구동하지 않기 때문. (죽은 필드 0.)

`visible` 과 `nav.visible` 은 **독립 축**이다: `visible:false` 면 nav 에서도 제외되지만(일방향 가드), `visible:true` 라고 nav 노출이 강제되지는 않는다. 즉 *"존재하지만 상단 nav 엔 없는"* 항목이 가능하다 — Single 에선 화면엔 보이되 메뉴엔 없는 섹션, Multi 에선 접근은 되지만 메뉴엔 없는 페이지(개인정보처리방침·약관, footer 로만 도달).

## 왜 `title` 이 없는가

이전 초안은 `title` 을 두고 그것이 nav 라벨을 *겸한다* 는 주석으로 결합을 메웠다. 이는 암묵 결합이라 폐기했다. 항목의 이름이자 nav 텍스트는 `nav.label` 하나로 명시한다. Multi 페이지의 경우 `nav.visible:false` 여도 `nav.label` 은 존재하며 에디터 탭의 페이지 이름으로 쓰인다. (`data.eyebrow` — 섹션 화면 상단 키커 — 는 nav 와 무관한 별개 콘텐츠 필드다.)

## Consequences

- **기존 Single `user_sites` 마이그레이션 필요** (migration 015): `{ pages:[home] }` → `{ mode:'single', sections }` 평탄화, `data.label` 키 → `eyebrow`, nav 섹션 `menu1~N` 제거, 각 섹션 `nav:{visible,label}` 주입, `editable` 제거, slot_key `${page.id}.${section.id}.${key}` → `${section.id}.${key}` (다음 저장 시 RPC self-heal). 위험은 낮음(평탄화+리네임, nav/footer 들어올리기 아님).
- **`mode` 분기는 사이트 수준 엔트리포인트에 모으되**, 실제로는 렌더·에디터·검증·영속화(asset slot_key)·키주입 ~5개 축에서 mode-aware fork 가 발생한다 — "의도된 분기"로 수용.
- **Multi 는 기존 6개 Single 템플릿을 개조하지 않고 새 템플릿으로 출시.** Single 은 새 구조로 마이그레이션되지만 디자인은 유지.
- nav 컴포넌트는 `type === 'nav'` 로 식별해 `navItems` 를 직접 주입(메타 카테고리 탐색 같은 추가 추상화 없음).

## 관련

- 설계 원문: [`docs/plans/PLAN_multipage.md`](../plans/PLAN_multipage.md)
- [ADR-0001](./0001-beta-model-template-isolation.md) — Template isolation. 0001 의 "Future direction"(디렉터리 `pages/<page>/sections/` 발전)은 *디렉터리/렌더러 코드* 차원의 미해결 항목으로 남으며, 본 ADR 은 그와 독립인 **데이터 모델(TemplateJson)** 차원의 결정이다.
- [ADR-0004](./0004-optimistic-concurrency-via-rpc.md) — 저장 RPC 가 유니온 스키마(특히 multi `shared`)를 통과시키는지 확인 필요.
- CONTEXT.md — Site Type(single/multi), nav projection, `visible`/`nav.visible` 2축, "composition"·"page" flagged ambiguity 갱신 대상.
