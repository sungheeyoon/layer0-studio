# Template Authoring Guide — Layer0 Studio

_대상: 새 템플릿 또는 새 테마를 추가하려는 개발자_
_파이프라인 리팩터(Phase 1~4) 반영본 — 2026-05-02_

---

## 0. 핵심 개념: Theme · Preset · Template · UserSite

| 용어 | 무엇 | 어디 산다 | 누가 만든다 |
|---|---|---|---|
| **Theme** | React 렌더러 + slot 정의 + section 컴포넌트 | `src/themes/<key>/` | 개발자 (코드 PR) |
| **Preset** | 코드가 진실인 시드 템플릿. `templateJson`/썸네일/버전을 코드에서 관리 | `src/themes/<key>/presets/*.preset.ts` | 개발자 (코드 PR) |
| **Template (DB row)** | `templates` 테이블의 한 행. preset에서 시드되거나 어드민이 manual로 만듦 | DB | sync CLI 또는 어드민 |
| **UserSite** | Template을 복사해 사용자가 편집한 인스턴스 | DB `user_sites` | 일반 사용자 |

**소유권 매트릭스 (sync 정책)**:

| 필드 | 코드(preset) | DB(어드민) | sync 동작 |
|---|---|---|---|
| `slug` | ✅ (upsert 키, 변경 금지) | — | 일치 보장 |
| `templateJson` | ✅ | — | 항상 코드값으로 덮어씀 |
| `thumbnailUrl` | ✅ (해시 기반) | — | 해시 다르면 재업로드 |
| `version` | ✅ (semver) | — | 코드값으로 덮어씀 |
| `name`/`description`/`category` | 신규 row 시드값 only | ✅ | DB에 값 있으면 유지 |
| `status` | — | ✅ | sync 절대 안 건드림 (신규 row만 `draft`) |

> **핵심 약속**: 운영자가 어드민에서 description을 바꿔도 다음 sync가 코드값으로 되돌리지 않는다. 단 `templateJson`/썸네일/버전은 *항상 코드 진실* — 어드민에서 편집 불가(코드 preset row는 read-only).

---

## 1. TemplateJson 구조

```ts
// src/domain/entities/template.entity.ts
TemplateJson = {
  themeKey: "corporate",
  globalStyles: {
    primaryColor: "#1a1a2e",     // hex 권장 (validate가 warn)
    secondaryColor: "#e94560",
    fontFamily: "'Inter', sans-serif",
    fontSize: "16px",            // CSS length
    layout: "wide",              // 'wide'|'narrow'|'asymmetric'|'default'|'full'
  },
  pages: [
    {
      id: "home",
      title: "Home",
      slug: "/",                 // 모든 페이지에서 unique
      order: 0,
      sections: [
        {
          id: "hero-001",        // 페이지 내 unique
          type: "hero",          // theme.slots[].type 중 하나
          order: 1,              // ⚠️ deprecated — 렌더러는 slots[] 순서를 따름
          visible: true,
          editable: true,
          data: {
            title: { value: "...", type: "text", label: "Main Title", editable: true },
            // 모든 value는 string. number/image도 마찬가지.
          },
        },
      ],
    },
  ],
}
```

### 필드 타입

| `type` | 입력 UI | 비고 |
|---|---|---|
| `text` / `textarea` / `url` / `color` / `number` | 자명 | `number`도 string 저장 |
| `select` | dropdown | `options: string[]` 필요 |
| `image` | URL + 업로드 | 업로드 시 `assetId` 자동 부여 |

---

## 2. 시나리오 A — 기존 테마로 새 preset 추가 (가장 흔함)

PR 한 개로 끝남. CLI 두 줄.

### 단계

1. **preset 파일 작성** — `src/themes/<theme>/presets/<slug-suffix>.preset.ts`
   ```ts
   import { TemplatePreset } from '../../types';

   const preset: TemplatePreset = {
     slug: 'corporate-modern',           // DB upsert 키, 영원히 변경 금지
     templateJson: {
       themeKey: 'corporate',
       globalStyles: { /* ... */ },
       pages: [{ /* ... */ }],
     },
     thumbnailPath: 'public/thumbnails/template-corporate-modern.webp',
     version: '1.0.0',
     defaults: {
       name: 'Modern Corporate',
       description: '...',
       category: 'business',
     },
   };
   export default preset;
   ```

2. **`pnpm test`** — preset이 `validateTemplateJson` 10개 규칙을 통과하는지 자동 검증

3. **썸네일 캡처** — `pnpm template:capture <theme>` 또는 직접 `public/thumbnails/`에 저장
   - `src/themes/<theme>/thumbnail.config.ts`의 `output` 경로와 preset의 `thumbnailPath`를 **동일하게 맞출 것** (`.webp` ↔ `.jpg` mismatch 흔함)

4. **sync dry-run** — `pnpm template:sync` (변경 사항만 출력, DB 미반영)

5. **PR 머지 → prod sync** — 어드민 UI "Sync from Code" → Preview Sync → Apply Sync (super-admin: `app_metadata.canPublishTemplates === true`)

6. **(선택) 메타 보정 + 활성화** — 어드민에서 status를 `active`로 토글

### 어드민 UI에서 직접 만드는 manual one-off

시즌 프로모션 등 일회성 시드는 여전히 `+ New Template` 버튼으로 가능. 카드 옆 `Manual` 배지로 구분되며 JSON textarea 직접 편집이 허용됨.

---

## 3. 시나리오 B — 새 테마 추가

`src/themes/<key>/` 디렉터리만 만들면 codegen이 자동 발견:

```
src/themes/cafe/
├── index.tsx              # ThemeRenderer + ThemeModule export
├── slots.ts               # slots + defaultTemplateJson
├── presets/
│   └── default.preset.ts  # ★ 최소 1개 필요
├── thumbnail.config.ts    # Playwright 캡처 설정
└── sections/
    ├── HeroSection.tsx
    └── ...
```

### 4단계

1. **`slots.ts`** — slot 정의 + `defaultTemplateJson`
2. **`sections/*.tsx`** — `ThemeSectionProps`를 받는 컴포넌트들
3. **`index.tsx`** — 기존 테마 복사 후 `sectionComponentMap`만 교체
4. **`presets/default.preset.ts`** — 위 시나리오 A의 preset 형식, `templateJson: defaultTemplateJson`로 시드

5. **`pnpm dev` 또는 `pnpm build`** — `predev`/`prebuild` 훅이 자동으로 `pnpm generate:themes` 실행 → `src/themes/_generated.ts` 갱신 (registry는 더 이상 수동 편집 안 함)

> `registry.ts`는 `_generated.ts`를 import만 함. 디렉터리 추가가 곧 등록.

---

## 4. CLI 한 장 요약

```bash
pnpm generate:themes            # _generated.ts 재생성 (predev/prebuild에 자동 연결)
pnpm template:capture <theme>   # Playwright + sharp로 썸네일 캡처 → .webp 저장
pnpm template:capture           # 모든 테마 일괄 (templates-ui/<key>.html이 source 기본)
pnpm template:sync              # ★ default = dry-run, diff만 출력
pnpm template:sync --apply      # 실제 DB upsert + Storage 업로드 + audit log
pnpm template:sync cafe         # 특정 테마만 (dry-run)
pnpm test                       # validate 규칙으로 모든 preset 자동 검증
```

---

## 5. Validate 규칙 (`src/lib/template/validate.ts`)

sync 전·`pnpm test`·어드민 Save에서 모두 호출됨.

**Errors (블로킹)**
1. `themeKey`가 registry에 존재
2. `section.type`이 theme의 slot 목록에 존재 (slot 옵션 전달 시)
3. required slot은 모든 page에 최소 1개
4. page 내 `section.id` unique
5. `data` 필드의 `type`/`label`/`value` 누락 금지
6. `pages` 비어있지 않음 + `page.slug` unique
7. `globalStyles.primaryColor`/`secondaryColor` 필수, `fontSize` CSS length, `layout` 화이트리스트
8. `data[].value`는 string

**Warnings (통과하지만 stderr)**
9. `section.order` 사용 (deprecated — 배열 순서가 곧 렌더 순서)
10. `image`/`url` 필드의 `http://` (mixed-content 위험)
11. 색상이 hex가 아님 (CSS named color는 통과)

---

## 6. 자주 빠지는 함정

### 6.1 thumbnailPath 확장자 mismatch (★현재 코드에 미해결)
`thumbnail.config.ts`는 `.webp`로 출력하는데 preset이 `.jpg`를 가리키면, sync는 옛 `.jpg`를 업로드하거나(파일 존재 시) 로컬 경로 문자열을 그대로 DB에 박는다(파일 없으면). **preset 작성 시 두 경로를 일치시킬 것.**

### 6.2 `section.type`이 slot 목록에 없으면 안 보임
렌더러는 `slots[]`을 순회하며 매칭되는 section만 찾음 (`<theme>/index.tsx`). validate가 잡지만 slot 옵션을 안 넘기면 silent.

### 6.3 같은 page에 같은 `type`이 두 개면 첫 것만 렌더
`sections.find(s => s.type === slot.type)`. 두 개 두려면 slot type을 분리(`hero-primary`, `hero-secondary`)하거나 컴포넌트 분리.

### 6.4 `section.order` 무시
렌더 순서는 `slots[]` 배열 순서. validate가 warn 출력. 순서 바꾸려면 theme의 `slots` 배열을 바꿈.

### 6.5 모든 `value`는 string
`type: 'number'`도 string. 컴포넌트에서 `Number(field.value)` 필요.

### 6.6 `themeKey` 누락 → `'corporate'` 폴백
`site/[domain]/page.tsx`, `DynamicEditor.tsx`. 의도된 동작이지만 디버깅 시간 낭비 흔함.

### 6.7 Features 섹션의 카드는 임의 키로 생성
`FeaturesSection.tsx`가 `title`/`subtitle`/`heading` 외 모든 키를 카드로 취급. 카드 수 늘리려면 `data`에 키 추가.

### 6.8 Contact 섹션은 키 고정
`title`/`email`/`phone`/`address` 외 키는 무시. 추가 정보는 새 컴포넌트가 필요.

### 6.9 `editable: false`는 UI만 숨김
서버 가드 없음. 사용자가 JSON 직접 수정하면 변경 가능.

---

## 7. 코드 위치 맵

| 무엇을 보고 싶을 때 | 어디 |
|---|---|
| TemplateJson 타입 | `src/domain/entities/template.entity.ts` |
| TemplatePreset 타입 | `src/themes/types.ts` |
| 슬롯/모듈 인터페이스 | `src/themes/types.ts` |
| 자동생성 레지스트리 | `src/themes/_generated.ts` (커밋, 수정 금지) |
| Codegen 스크립트 | `scripts/generate-themes.mjs` |
| Validate 규칙 | `src/lib/template/validate.ts` (+ `__tests__/`) |
| Sync 코어 로직 | `src/lib/template/sync.ts` |
| Sync CLI | `scripts/sync-templates.ts` |
| Capture CLI | `scripts/capture-templates.ts` |
| Sync API 엔드포인트 | `src/app/api/admin/template-sync/route.ts` (※ UI는 server action 사용 — 7.1 참고) |
| Sync server action | `src/app/admin/templates/actions.ts` `syncTemplatesAction` |
| 어드민 UI (sync 버튼) | `src/app/admin/templates/TemplateListPanel.tsx` |
| 어드민 editor | `src/app/admin/templates/TemplateEditorPanel.tsx` |
| Preset preview (capture용) | `src/app/preview/preset/[...key]/page.tsx` |
| Audit log 테이블 | `docs/migrations/011_template_sync_audit.sql` |
| 참조 테마 | `src/themes/corporate/` |

### 7.1 Sync 진입점이 두 개인 이유 (현재 상태)
`/api/admin/template-sync` 라우트와 `syncTemplatesAction` server action이 둘 다 존재하지만 어드민 UI는 server action만 사용한다. 라우트는 외부 도구(curl/CI)용 보조 진입점이며 super-admin 플래그 검사가 없다 — 외부에서 호출하지 말 것. 정리 후보(Phase 5).

---

## 8. 한 줄 요약

> **새 시드 추가** = `presets/<name>.preset.ts` 1파일 + `pnpm template:capture` + `pnpm template:sync --apply`.
> **새 테마 추가** = 디렉터리만 만들면 codegen이 등록.
> **시드 데이터는 코드가 진실, 메타데이터는 DB가 진실.** 어드민 UI는 메타 편집과 sync 트리거만.
