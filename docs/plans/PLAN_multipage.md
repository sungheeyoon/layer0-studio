# Plan — Multi-page Sites (전면 개정 v2)

_Single과 Multi를 **생성 시점에 결정되는 독립 Site Type**으로 재정의한다. 기존 RFC의 "single → multi 진화" 전제는 폐기._
_관련: [ADR-0007](../adr/0007-single-multi-site-type-structural-union.md) (이 RFC의 결정 요약), `CONTEXT.md` (Page/Section/Renderer, "composition" flagged ambiguity), `docs/TEMPLATE_SYSTEM.md`, [ADR-0001](../adr/0001-beta-model-template-isolation.md), [ADR-0002](../adr/0002-templates-source-of-truth-is-code.md), [ADR-0004](../adr/0004-optimistic-concurrency-via-rpc.md)_

> **이 문서는 v1을 대체합니다.** v1은 단일 사이트를 멀티페이지로 진화시키고, 모든 `user_sites`에서 nav/footer를 `sharedSections`로 들어올리는 위험한 이관을 전제했습니다. 그 전제와 다음 결정들은 **폐기**되었습니다: ~~결정 2 `page-link` 필드 타입~~, ~~Phase 2 전체 user_sites 이관~~, ~~Phase 5 페이지 추가/삭제/이름변경~~.

---

## 0. 프로젝트 정체성 (전제)

이 프로젝트는 Wix/Framer 류 범용 웹 빌더가 **아니다.** **템플릿 기반 노코드 웹사이트 생성 플랫폼**이다.

- **IA(정보 구조)는 템플릿 제작자가 정의한다** — 페이지 종류, 섹션 종류, 네비게이션 구성, 공유 헤더/푸터.
- **사용자는 구조 안에서 개인화만 한다** — 텍스트/이미지/색상/필드 수정, `visible` 토글, 섹션·페이지 **순서 변경**, Collection CRUD.
- **금지** — 새 페이지 생성, 새 섹션 생성, 드래그앤드롭 자유 배치, 사용자 정의 nav/레이아웃, IA 재설계.

---

## 1. 핵심 설계 결정 (확정)

| # | 결정 | 요지 |
|---|---|---|
| **D1** | Single/Multi = 독립 Site Type | 생성 시점에 `mode` 결정. **상호 진화 없음.** 구조적 유니온(`Template = SinglePageTemplate \| MultiPageTemplate`). 분기는 사이트 수준 엔트리포인트에 두고 섹션 수준 렌더는 재사용. |
| **D2** | base `TemplateSection` + `SingleSection extends`, 통일 `nav:{visible,label}` | nav 정보는 **projection 소스에만** 둔다. base = `{id,type,visible,data}` (섹션 콘텐츠 모양, 렌더 재사용). single은 섹션이 nav 구동 → `SingleSection extends { nav:{visible,label} }`. multi는 페이지가 nav 구동 → `TemplatePage.nav:{visible,label}`. **multi 내부 섹션엔 nav 없음.** `title` 제거(이름은 `nav.label`이 겸함), `editable` 제거(항상 true 죽은 필드). nav 객체 모양은 single·multi 동일. **죽은 필드 0.** |
| **D3** | nav = projection (통일 `deriveNav`) | nav는 독립 데이터가 아니라 소스의 투영. single=`sections`(앵커), multi=`pages`(slug). nav 객체·필터·라벨 출처(`nav.label`)는 동일, **진짜 다른 단 하나(href: 앵커 vs slug)만 다름.** 반영: **배열 순서** + **노출 자격**(`nav.visible`). `visible`/`nav.visible`은 **독립 축** — `visible:false`면 nav에서도 제외(일방향 가드)이나, `visible:true`라고 nav 노출이 강제되지 않음(보이지만 nav엔 숨김 가능). |
| **D4** | Single = `sections[]` 하나 | nav/footer를 별도 필드로 분리하지 않고 `sections[]` 안에 유지(= 하나의 스크롤 흐름). 제약은 에디터 **핀 고정**으로 표현(nav 최상단·footer 최하단·reorder 불가). |
| **D5** | Multi 페이지 2축 | `TemplatePage.visible`(라우팅 가능 여부) + `TemplatePage.nav.visible`(상단 메뉴 노출 여부). 독립 축. 약관/개인정보처리방침 = `visible:true, nav.visible:false`. |
| **D6** | 기존 single 데이터 마이그레이션 | 초기 단계라 타협 없이 구조 확정. `{pages:[home]}` → `{mode:'single', sections}`, `label`키→`eyebrow`, nav 섹션 `menu1~N` 제거, 각 single 섹션에 `nav:{visible,label}` 주입, `title`/`editable` 제거. |

---

## 2. 데이터 모델

`src/domain/entities/template.entity.ts`. `TemplateJson`이 구조적 유니온이 된다.

```typescript
// ── base: 섹션 "콘텐츠 모양" (single·multi 공통, 섹션 렌더 재사용) ──
interface TemplateSection {
  id: string;                                 // immutable (재생성 코드 0건, 검증 완료). 앵커/slot_key 기준
  type: string;                               // library componentKey 매칭
  visible: boolean;                           // 화면 노출 여부 (사용자)
  data: Record<string, TemplateField>;        // data.eyebrow.value = 화면 상단 키커(구 data.label)
  // title/editable 없음 — 이름은 nav.label(SingleSection)/page.nav.label이 담당, multi 내부 섹션은 에디터에서 type 표시(현재와 동일).
  // editable: 모든 프리셋에서 항상 true였던 죽은 필드라 제거. 필드 레벨 field.editable은 유지.
}

// ── single 전용: 섹션이 nav를 구동 → 통일 nav 객체 추가 ──────
interface SingleSection extends TemplateSection {
  nav: { visible: boolean; label: string };   // single nav 소스. visible=노출 자격, label=nav 텍스트.
}

// ── multi 전용: page ──────────────────────────────────────
interface PageSeo { title: string; description: string; }   // 🔮 Phase 6 자리표시

interface TemplatePage {
  id: string;
  slug: string;
  visible: boolean;                           // 라우팅 가능 여부 (false → 404, 데이터는 보존)
  nav: { visible: boolean; label: string };   // multi nav 소스. label=페이지 이름 겸 nav 텍스트(에디터 탭에도 사용).
  sections: TemplateSection[];                // base — nav 구동 안 함
  seo?: PageSeo;                              // 🔮 Phase 6
  // title 없음 — 페이지 이름은 nav.label이 겸함 (nav.visible:false여도 label은 에디터 탭에 표시)
  // order 없음 — pages[] 배열 순서 = nav/렌더 순서 (migration 012의 "배열 순서 = 렌더 순서"와 일관)
}

// ── Site Type 유니온 ─────────────────────────────────────
interface TemplateBase {
  templateKey: string;                        // 렌더러 선택 (공유 코드)
  globalStyles: TemplateGlobalStyles;
}

interface SinglePageTemplate extends TemplateBase {
  mode: 'single';
  sections: SingleSection[];                  // nav/footer 포함, 에디터에서 핀 고정
  seo?: PageSeo;                             // 🔮 Phase 6 (single은 페이지가 하나 → 사이트 레벨)
}

interface MultiPageTemplate extends TemplateBase {
  mode: 'multi';
  shared: { header: TemplateSection[]; footer: TemplateSection[] };
  pages: TemplatePage[];
}

type TemplateJson = SinglePageTemplate | MultiPageTemplate;   // mode 판별자
```

**원칙 한 줄: _nav 정보는 통일 `nav:{visible,label}`로 projection 소스에만 붙는다._** single은 **섹션**(`SingleSection.nav`) + 앵커(`#section-${id}`), multi는 **페이지**(`page.nav`) + slug가 소스. nav 객체 모양·필터 규칙·라벨 출처(`nav.label`)는 양쪽 동일하고, **진짜 다른 단 하나(앵커 vs slug)만 다르다.** `title`은 없다(이름은 `nav.label`이 겸함). **죽은 필드 0.**

---

## 3. 네비게이션 전략

### 3.0 통일 projection

nav 객체·필터·라벨 출처가 양쪽 동일 → 한 함수로 합쳐지고, **진짜 다른 단 하나(href: 앵커 vs slug)만 파라미터.**
```typescript
function deriveNav<T extends { visible: boolean; nav: { visible: boolean; label: string } }>(
  source: T[], hrefOf: (x: T) => string,
) {
  return source
    .filter(x => x.visible && x.nav.visible)   // visible=false면 nav도 제외(일방향), visible=true라도 nav.visible 독립
    .map(x => ({ label: x.nav.label, href: hrefOf(x) }));
}
```

### 3.1 Single — sections의 projection (앵커 이동)

```typescript
const navItems = deriveNav(sections, s => `#section-${s.id}`);
```
- 섹션 순서 = nav 순서. `href = #section-${id}`는 `renderComposition.tsx`가 이미 DOM에 렌더하는 앵커(id 고정 → reorder에 안 깨짐).
- **`nav.visible` 자격이 필수인 이유:** visible 섹션이라고 다 nav 타깃이 아니다. cafe-default는 9개 섹션 중 4개(menu/story/space/visit)만 nav 대상 — nav바·hero·marquee·testimonials·footer는 visible이지만 nav 제외. `visible`만으로 파생하면 nav바 자신까지 메뉴에 유입됨.

**Single 2축:**
| `visible` | `nav.visible` | 결과 |
|---|---|---|
| false | — | 화면·nav 둘 다 제외 |
| true | false | 화면엔 보이되 nav 제외 |
| true | true | 둘 다 노출 |

### 3.2 Multi — pages의 projection (페이지 이동)

```typescript
const navItems = deriveNav(pages, p => p.slug);   // pages[] 배열 순서 = nav 순서
```
- 라벨 = `page.nav.label`.

**Multi 2축:**
| 상태 | `visible` | `nav.visible` | 의미 |
|---|---|---|---|
| 일반 페이지 | true | true | 접근 가능 + 상단 nav 노출 |
| 약관/개인정보 | true | false | 접근 가능, 상단 nav 미노출 (footer 등으로만 도달) |
| "삭제"(비공개) | false | false | 404, nav 미노출, 데이터 보존 |

### 3.3 배관 — navItems 주입 (D3)

nav 컴포넌트는 형제(섹션/페이지)에서 파생된 목록이 필요하나 `TemplateSectionProps`는 자기 `section`만 준다. **렌더러가 알려진 nav(`type === 'nav'`)에 navItems를 직접 주입**한다. `meta.category` 탐색 같은 추가 추상화는 두지 않는다(과한 추상화).

```typescript
interface NavItem { label: string; href: string; }
interface NavSectionProps extends TemplateSectionProps {
  navItems: NavItem[];                        // required (옵셔널 아님)
}
// 사이트 렌더러:
//   single: renderSingleSite가 sections projection → type==='nav' 섹션에 navItems 주입
//   multi:  renderMultiSite가 pages projection   → shared.header의 nav에 주입
//   그 외 섹션: 기존 TemplateSectionProps 그대로
```

---

## 4. 마이그레이션 (기존 single 데이터)

`docs/migrations/015_single_site_type.sql`. 대상: `user_sites.site_json`, `user_sites.template_snapshot`. (`templates.template_json`은 코드가 진실 → 재sync로 해결.)

각 row 변환:
1. `{ pages: [home], templateKey, globalStyles }` → `{ mode:'single', templateKey, globalStyles, sections }` (home.sections를 최상위 sections로 승격, 페이지 래퍼 제거).
2. 각 섹션: `data.label` 키 → `data.eyebrow` 키로 리네임.
3. nav 섹션(`type==='nav'`): `menu1~N` 필드 제거.
4. 각 single 섹션에 `nav:{visible,label}` 주입, `title`/`editable` 제거 — 기존 nav의 `menuN` 값으로 대상 섹션 `nav.label`을 채우고 `nav.visible:true`; nav 대상이 아닌 섹션은 `nav:{visible:false, label:<섹션 이름(eyebrow/type 기반)>}`.
5. **slot_key 네임스페이스 변경**: `${page.id}.${section.id}.${key}` → `${section.id}.${key}`. 다음 저장 시 RPC가 `site_json`에서 재계산하므로 self-heal(asset_id 동일 → orphan 오삭제 없음). 마이그레이션 노트에 명시.

⚠️ 백업 + 드라이런 필수. 단, v1과 달리 **nav/footer를 들어올리는 구조 이관이 아니라 래퍼 평탄화 + 필드 리네임**이라 위험이 현저히 낮다.

---

## 5. 단계별 계획

### Phase 0 — 기반: `composition` 제거 + 타입 유니온 도입
- `src/templates/types.ts` — `TemplatePreset`에서 `composition`/`PresetSection` 제거, `mode` 판별 `templateJson` 필수화.
- `src/lib/template/preset.ts` — `deriveTemplateJsonFromPreset` 삭제(preset이 곧 templateJson).
- `template.entity.ts` — §2 유니온 도입(base `TemplateSection`(`title`/`editable` 없음) + `SingleSection extends {nav:{visible,label}}` + `TemplatePage{nav:{visible,label}}` / 유니온 `TemplateJson`).
- `DynamicEditor.tsx:357` — 죽은 섹션 `editable` 게이트 제거.
- 호출부 정리: `sync.ts:109`, `scripts/lib/validate-and-capture.ts:134`, `preview/preset/[...key]/page.tsx:30`.
- 6개 single 템플릿 `template.ts` → `{ mode:'single', sections }`로 변환(eyebrow, 섹션별 `nav:{visible,label}`).

### Phase 1 — Single 경로 완성 (기존 가치 유지)
- `validate.ts` / `update-site-json.usecase` `validateJson` — `mode` 분기 검증. single: `sections` 존재 + 각 섹션 `nav:{visible,label}` 검증. multi: `pages` + 각 page `nav:{visible,label}`/`slug` 검증.
- `keys.ts` injectKeys/stripKeys — 유니온 대응.
- **nav projection + 직접 주입 배관**(§3.3), 6개 single `Navigation.tsx` 재작성 — `menu1~N` 하드코딩 앵커 폐기, `navItems` prop 소비.
- repository asset 루프(`supabase-user-site.repository.impl.ts:133`) — single slot_key `${section.id}.${key}`.
- **마이그레이션(015) 실행** (§4) — 백업·드라이런.
- 에디터(`DynamicEditor.tsx`) single: 섹션 reorder, nav/footer 핀 고정, `section.visible`/`section.nav.visible` 토글, `section.nav.label` 편집.

### Phase 2 — Multi 경로 (신규 능력)
- 라우팅: `src/app/site/[domain]/page.tsx` → `[[...slug]]/page.tsx` optional catch-all. slug resolve, `visible:false`→`notFound()`. `preview/[id]` 동일.
- `renderMultiSite` — `header → page.sections → footer` 조립, page projection nav 주입.
- 첫 multi 템플릿 1개 저작(`shared` + 다중 `pages`).
- 에디터 multi: 페이지 탭 + 순서변경 + `page.visible`/`page.nav.visible` 토글 + `page.nav.label` 편집. **페이지 추가/삭제는 금지(미구현).** (이름=`nav.label` 텍스트 편집은 콘텐츠 수정이라 허용; 금지는 페이지 생성·삭제·IA 재설계.)

### Phase 3 — 마무리
- `PageSeo` 분리(`generateMetadata`가 추출 대신 명시 필드 사용), 사이트맵 전 페이지 포함.
- **(E) Multi footer 페이지 링크** 결정·구현(§6).
- 자동저장 RPC가 새 스키마 통과 확인.

---

## 6. 미결 항목

- **(E) Multi footer 링크** _(Phase 3)_ — D5의 약관/개인정보(`visible:true, nav.visible:false`)는 "footer로만 접근"이므로 footer도 페이지 링크가 필요. 상단 nav와 **다른 projection**: `pages.filter(p => p.visible && p.nav.visible)`(상단) vs `pages.filter(p => p.visible && !p.nav.visible)`(footer) 같은 분리. multi footer 렌더 단계에서 확정.
- **Page SEO** _(Phase 3)_ — `PageSeo{title,description}`. multi=per-page, single=top-level. 지금은 `seo?` 자리표시.
- **(F) Multi `shared` 섹션 asset slot_key** _(Phase 2)_ — §4의 slot_key 재정의는 **single만** 다뤘다. multi `shared.header/footer` 섹션은 page에 안 속하므로 기존 `${page.id}.${section.id}.${key}` 네임스페이스가 안 맞는다. **추천:** page 섹션 = `${page.id}.${section.id}.${key}` 유지, shared 섹션 = `shared.${slot}.${section.id}.${key}`(slot = header|footer). asset 수집 루프(`updateSiteJson`)가 `shared`도 훑도록 확장. multi 저장 경로에서 확정.

---

## 7. 트레이서 불릿

한 **multi** 템플릿을 2페이지로 만들어 **공개 URL 렌더 + 페이지 nav 작동 + 공유 헤더**까지 관통(Phase 0·2의 최소 슬라이스). single 경로는 이미 출시 자산이 있으므로, multi 골격을 먼저 한 줄로 증명한 뒤 양쪽을 채운다.

## 8. 핵심 리스크

1. **유니온 도입 블라스트 반경** — `.pages`를 직접 읽는 곳 ~15군데(`renderComposition`, `DynamicEditor`, `site/[domain]`, repository asset 루프, `validate`, `keys`, create/update usecase, admin 패널 등). 모드 분기를 사이트 엔트리포인트로 모으되, 영속화·검증·키주입·에디터는 별도 fork 축임을 인지.
2. **공유 섹션 + 자동저장 RPC** — `save_site_template_with_lock`가 유니온 스키마(특히 multi `shared`)를 통과시키는지 확인. asset 루프가 `shared`도 훑는 문제는 §6 (F)로 격상(설계 미결).
3. **마이그레이션(015)** — 백업·드라이런. v1 대비 위험 낮음(평탄화+리네임).

## 9. 작업량 추정 (대략)

- Phase 0: 중 (6개 템플릿 변환 + 유니온 도입 + 호출부)
- Phase 1: 중~대 (nav 재작성 6개 + 배관 + 마이그레이션 + 에디터 핀/토글)
- Phase 2: 중~대 (라우팅 + multi 렌더 + 첫 multi 템플릿 + 에디터 페이지 관리)
- Phase 3: 소~중
