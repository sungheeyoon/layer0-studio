# 공유 콘텐츠 형태 타입에서 엔티티 이름을 걷어낸다 — `TemplateJson` → `ContentModel`

> **Status: Accepted — 구현 완료** (코드 리팩터 병합, migration **021**(컬럼 rename + RPC 재작성) + **022**(section `data`→`fields` 백필) 프로덕션 적용). 이 문서는 *어떤 이름으로, 왜* 를 고정하기 위한 결정 기록이다.

`Template`(디자이너 청사진, `templates` 행)과 `Site`(사용자 인스턴스, `user_sites` 행)는 **두 축에서 별개 엔티티**다(axis A: 코드=Template, axis B: 데이터=Site — [ADR-0001](./0001-beta-model-template-isolation.md)). 그런데 둘이 **같은 콘텐츠 형태 타입 하나**를 공유한다: `TemplateJson` 은 `Template.templateJson`, `UserSite.siteJson`, `UserSite.templateSnapshot` 세 필드가 모두 들고 있다. 이 타입 이름에 `Template` 이 박혀 있어, 그것을 들고 있는 `Site` 쪽에서 읽으면 "왜 Site 가 TemplateJson 을?" 하는 인지 마찰이 생긴다.

**결정: 두 엔티티가 공유하는 "콘텐츠 형태" 타입에서만 엔티티 이름을 걷어내 중립화한다.** 진짜로 한쪽 엔티티에 속한 코드(Renderer·admin Template 편집기·`template_assets`)는 건드리지 않는다.

```ts
type ContentModel = SingleContent | MultiContent;   // was TemplateJson / SinglePageTemplate / MultiPageTemplate
interface SingleContent { mode: 'single'; templateKey; globalStyles; sections: SingleSection[]; }
interface MultiContent  { mode: 'multi';  templateKey; globalStyles; shared: { header: Section[]; footer: Section[] }; pages: Page[]; }

interface Template { content: ContentModel; /* … */ }              // col: content
interface UserSite { content: ContentModel; snapshot: ContentModel; /* … */ }  // cols: content, snapshot
```

## 핵심 원칙 두 개

1. **엔티티 이름은 공유 타입에 새지 않는다.** 그래서 최상위 union 은 `SiteContent` 가 아니라 **엔티티 중립적인** `ContentModel` 이다 — `Template.content` 로 읽어도, `UserSite.content` 로 읽어도 어느 엔티티 이름도 상대에게 새지 않는다.
2. **variant 이름은 새 명사를 끌어오지 말고 최상위 union 의 head-noun 에서 파생한다.** `ContentModel` → `SingleContent`/`MultiContent`. 이렇게 하면 `if (isSingleContent(x)) { x /* : SingleContent */ }` 로 좁혀도 "Site" 누수가 없다. (중립 최상위명 + Site 접두 variant 는 누수를 한 단계 아래로 숨길 뿐이다.)

## Considered Options — 기각된 원안과 이유

최초 제안은 `Template*` 를 일괄 `Site*` 로 스왑하는 것이었다. 스왑은 **Template ≠ Site** 경계를 반대 방향으로 다시 깨서 다음을 각각 기각했다:

| 원안 | 채택 | 기각 이유 |
|---|---|---|
| `TemplateJson → SiteContent` | **`ContentModel`** | `Site` 는 이 타입을 *공유하는 두 엔티티 중 하나*일 뿐. `Template.content: SiteContent` 는 "Template 이 Site 를 담는다"로 읽힘 |
| `Single/MultiSite` (variant) | **`Single/MultiContent`** | (1) 좁히면 "Site" 누수 재발 (2) `MultiSite` 는 업계에서 *여러 웹사이트*(WP/Drupal Multisite)를 뜻해 — 여기 Multi 는 *한 사이트의 여러 Page* |
| `SingleLayout/MultiLayout` | 기각 | "layout" 은 이 레포에서 이미 예약: Next.js `layout.tsx` 도처 + `GlobalStyles.layout` 필드 |
| `SingleComposition/…` | 기각 | "composition" 은 CONTEXT.md 에서 **폐기된 용어**(레거시 `RenderComposition` 제거됨) |
| `SinglePage/MultiPage` | 기각(2순위) | `Page` 엔티티와 충돌 — `SinglePage` 는 Page 를 0개 가짐 |
| `Section → Block` | **`Section`** | CONTEXT.md `Avoid: block`. 유비쿼터스 언어를 뒤집는 별개 결정이라 스코프 밖 |
| `shared → chrome` | **`shared`** | "chrome" = **Studio 앱 껍데기**(published site 의 반대 진영, DESIGN_SYSTEM.md/ESLint 스코프) |
| `nav → menu`, `NavMeta → MenuEntry` | **`nav`/`NavMeta`** | "menu" = **카페 메뉴 콘텐츠**(menu Section, array Field)와 충돌. `nav` 는 접두어도 없어 스코프 밖 |
| `TemplateRenderer → SiteRenderer` | **`TemplateRenderer`** | Renderer 는 per-Template, **never per-Site**(axis A) |
| `TemplateEditorPanel → SiteEditor` | **유지** | admin 의 진짜 *Template* 편집기(사용자 Editor 와 별개) |
| `TemplateAsset → SiteAsset` | **`template_assets` 유지** | 템플릿용 AI/스톡 이미지 ≠ Site 의 `Asset`(`user_assets`) |
| `Template` 엔티티 제거 | **유지** | 청사진 엔티티는 그대로. 이건 리네이밍이지 엔티티 통합이 아님 |

신설: `SiteMode = 'single' | 'multi'`(현재 이름 없는 판별자 유니온에 이름 부여, "Site Type" 유비쿼터스 언어와 정합).

## Consequences

- **순수 타입 리네임(DB 영향 0)**: `TemplateJson→ContentModel`, `SinglePageTemplate→SingleContent`, `MultiPageTemplate→MultiContent`, `TemplateBase→ContentModelBase`, `TemplateSection→Section`, `TemplateField→Field`, `TemplateFieldType→FieldType`, 필드 변형 `Base/Text/Select/Image/ArrayTemplateField→Base/Text/Select/Image/ArrayField`(접두어 제거 일관 적용), `TemplatePage→Page`, `TemplateGlobalStyles→GlobalStyles`, `isSingleTemplate/isMultiTemplate→isSingleContent/isMultiContent`, 신설 `SiteMode = ContentModel['mode']`. 타입명은 직렬화되지 않으므로 마이그레이션 불필요.
  - 충돌 해소 1건: `DynamicEditor.tsx` 의 기존 편집기 컴포넌트 `ArrayField`(배열 필드 UI)를 `ArrayFieldEditor` 로 개명해, 타입 `ArrayTemplateField→ArrayField` 와의 동일 파일 이름 충돌을 제거.
- **DB 컬럼까지 일치시킨다 → migration 021 + 022** (코드-DB 이름 완전 일치를 택함; 원안은 1 개 마이그레이션이었으나 컬럼 rename 과 JSONB 백필을 분리해 각각 021/022 로 적용):
  - **021 (`021_rename_content_columns.sql`)** — `templates.template_json → content`, `user_sites.site_json → content`, `user_sites.template_snapshot → snapshot` (`RENAME COLUMN`). **RPC 재작성** — `save_site_template_with_lock`(010)이 `site_json` 을 직접 참조. `RENAME COLUMN` 은 RLS 정책은 자동 승계하지만 함수 본문은 텍스트 컴파일이라 `CREATE OR REPLACE` 로 `content` 기준 재생성.
  - **022 (`022_rename_section_data_to_fields.sql`)** — JSONB 내부 키 `data → fields` 백필. Section 의 `data` 키를 `content`/`content`/`snapshot` 세 컬럼 전 행에서 `fields` 로 리라이트(single `sections[]`; multi `shared.header`/`shared.footer` + `pages[].sections[]`). 멱등(`data` 있을 때만 rename). component 의 `.meta.dataSchema → .meta.fieldsSchema` 코드 개명과 짝.
  - `src/data/repositories/supabase-{template,user-site}.repository.impl.ts` 매퍼, `src/types/database.ts`(재생성) 갱신.
- **왜 컬럼까지 바꾸나** — Clean Architecture 상 도메인 프로퍼티명과 DB 컬럼명은 원래 독립이라 "매퍼가 흡수(컬럼 유지)"도 유효했으나, 지금(데이터 소량·초기)이 코드-DB 이름을 한 번에 맞추기 가장 싼 시점이라는 판단으로 RPC 재작성 비용을 감수한다. (같은 판단이 ADR-0007 migration 018 에서도 적용됐다.)

## 관련

- [ADR-0001](./0001-beta-model-template-isolation.md) — axis A(Template 코드 격리). 본 ADR 이 "Renderer/편집기/template_assets 를 Site 로 바꾸지 않는" 근거.
- [ADR-0007](./0007-single-multi-site-type-structural-union.md) — Single/Multi 구조 유니온. 본 ADR 은 그 유니온의 *이름*만 바꾸며 구조·`mode` 판별·nav projection 은 불변.
- [ADR-0004](./0004-optimistic-concurrency-via-rpc.md) — 저장 RPC. migration 021 이 이 RPC 를 `content` 컬럼 기준으로 재작성.
- CONTEXT.md Flagged ambiguities — 코드 식별자 주석(`TemplateJson → ContentModel` 등) 갱신 대상. glossary 용어(Section/Field/Page/nav/Shared sections)는 **불변**.
