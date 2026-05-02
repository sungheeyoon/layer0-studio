# Template Pipeline — 구조 개선안

_작성: 2026-05-02_
_대상: 템플릿 추가 워크플로우 리팩터를 검토하는 메인테이너_

---

## 1. 현재 워크플로우의 문제점

새 템플릿 1개를 추가하기까지의 실제 단계:

| # | 단계 | 위치 | 자동화 정도 |
|---|---|---|---|
| 1 | HTML 목업 작성 | `templates-ui/<key>.html` | 수동 |
| 2 | 섹션별 React 컴포넌트로 포팅 | `src/themes/<key>/sections/*.tsx` | 수동 |
| 3 | `slots.ts` + `defaultTemplateJson` 작성 | `src/themes/<key>/slots.ts` | 수동 |
| 4 | `index.tsx` (renderer) 작성 | `src/themes/<key>/index.tsx` | 복붙 |
| 5 | `registry.ts`에 dynamic import 한 줄 추가 | `src/themes/registry.ts` | 수동 |
| 6 | Playwright로 hero 캡쳐 | 별도 스크립트 | 부분 자동 |
| 7 | 캡쳐 이미지 수동 리사이징 | 외부 도구 | 수동 |
| 8 | `/admin/templates` 진입 → 폼에 메타 입력 | 어드민 UI | 수동 |
| 9 | `defaultTemplateJson` **다시 복붙** → JSON textarea | 어드민 UI | 수동 |
| 10 | 썸네일 업로드 → Supabase Storage | 어드민 UI | 부분 자동 |
| 11 | Deploy 클릭 | 어드민 UI | 수동 |

### 1.1 핵심 통증

1. **Source-of-Truth가 3중 분기**
   - HTML(디자인) → React(렌더) → JSON(데이터). 한 항목 바뀌면 셋 다 손봐야 함.
2. **`defaultTemplateJson` 이중 입력**
   - `slots.ts`에 이미 완성된 JSON이 있는데, 어드민 UI textarea에서 **다시 손으로 붙여넣음**.
   - `TemplateEditorPanel.tsx:13` `DEFAULT_JSON`은 `corporate` 하드코딩 → 새 테마 선택해도 `themeKey`만 바뀌고 sections는 그대로 남음.
3. **검증이 너무 느슨**
   - `UpdateSiteJsonUseCase.validateJson`은 `pages` 비어있지 않음 + `globalStyles` 존재만 체크.
   - slot에 없는 `section.type`을 넣어도 통과 → 화면 텅 빔. 어드민 단계에서 잡힐 곳이 없음.
4. **썸네일이 별 행성**
   - Playwright 캡쳐 → 수동 리사이즈 → 어드민 업로드의 단절. 자산 명세(크기·포맷·hero seed)가 코드 어디에도 없음.
   - `public/thumbnails/`에 이미 `template-interior.jpg` 등이 있지만 DB 레코드와 자동 연결 안 됨.
5. **레지스트리 수동 유지**
   - 테마 7개 등록을 위해 `registry.ts`를 매번 편집. 누락 시 silent fallback (`'corporate'`).
6. **새 테마 디렉터리 보일러플레이트 복붙**
   - `index.tsx`는 사실상 동일 패턴(slots map → component map → render). 차이는 import만.
7. **어드민이 코드 변경 없이 만들 수 있는 것 vs 없는 것의 경계가 모호**
   - 시나리오 A(기존 테마, JSON만)와 시나리오 B(새 테마, 코드 PR)가 같은 UI를 쓰므로 운영자가 혼란.
8. **HTML 목업이 고립**
   - `templates-ui/`는 디자인 확정용이지만 한 번 포팅 후 **버전 추적·preview 링크·diff** 모두 없음. 디자인 수정 시 다시 수동 포팅.
9. **(가장 큰 제약) Theme이 단일 구조에 잠겨 있음**
   - 현재 `slots.ts`는 "이 테마가 가질 수 있는 섹션 종류 + 순서"를 못박음. cafe 테마가 [hero, menu, hours, contact, footer] 한 가지 모양만 가능.
   - 실제로는 같은 cafe라도 템플릿마다 구성이 완전히 달라야 함:
     - cafe-A: 영상 hero → 메뉴 그리드 → 예약 폼 → 위치
     - cafe-B: 풀스크린 갤러리 → 스토리 → 메뉴 리스트 → 푸터만
     - cafe-C: 한 장짜리 스티키 nav + 사진 갤러리만
   - 현재 구조에서는 "다른 모양 cafe"를 만들려면 새 테마(`cafe-modern`, `cafe-cozy`)를 따로 만들어야 함 → 컴포넌트 중복·관리 비용 폭증.
   - **이 한계가 §2.10에서 핵심적으로 해결됨.**

---

## 2. 제안하는 새 구조

핵심 전환:
> **"코드가 `templateJson`·썸네일의 진실, DB가 메타데이터의 진실"**
> 구조적 데이터(섹션·필드 스키마, 시각 자산)는 코드에서 시드되고 PR로 변경된다.
> 운영 메타(이름·설명·카테고리·status·노출 순서)는 DB가 책임지고, sync는 메타를 *덮어쓰지 않는다*.
> 어드민 UI는 *시드 발행 도구*가 아니라 *메타데이터 편집 + sync 트리거*가 된다.

### 2.0 책임 분리 (소유권 매트릭스)

| 필드 | 코드(preset) | DB(어드민) | sync 정책 |
|---|---|---|---|
| `slug` | ✅ 진실 (변경 금지 = upsert 키) | — | 일치 보장 |
| `composition` (※§2.10) | ✅ 진실 | — | 항상 코드값으로 덮어씀 |
| 각 section의 `data` | ✅ 진실 (시드값) | — | 항상 코드값으로 덮어씀 (사용자 사이트는 별도) |
| `globalStyles` 오버라이드 | ✅ 진실 | — | 항상 코드값으로 덮어씀 |
| `thumbnailPath` → Storage URL | ✅ 진실 (해시 변경 시) | — | 해시 다르면 재업로드 |
| `name` | 기본값(첫 시드 시만) | ✅ 진실 | DB에 값 있으면 유지 |
| `description` | 기본값(첫 시드 시만) | ✅ 진실 | DB에 값 있으면 유지 |
| `category` | 기본값(첫 시드 시만) | ✅ 진실 | DB에 값 있으면 유지 |
| `status` | — | ✅ 진실 | sync는 절대 건드리지 않음 |
| `version` | ✅ 진실 (semver 비교) | — | 코드 버전이 더 높으면 업데이트 |

운영자가 어드민에서 description을 바꾼 뒤 다음 sync가 그걸 코드값으로 되돌리는 사고를 원천 차단. **단, composition·data·thumbnail은 항상 코드 진실 — 어드민에서 절대 편집할 수 없음** (편집 가능 영역은 메타 4종만).

### 2.1 디렉터리 재편

```
src/themes/<key>/
├── index.tsx              ← (변경 없음) renderer
├── slots.ts               ← (변경 없음) slot 정의
├── presets/               ← ★신규: 이 테마가 제공하는 시드 템플릿들
│   ├── default.preset.ts  ← TemplatePreset 객체 1개
│   └── minimal.preset.ts  ← (선택) 같은 테마, 다른 색감/카피
├── thumbnail.config.ts    ← ★신규: Playwright 캡쳐 설정 (URL, viewport, selector)
└── sections/...
```

`TemplatePreset` 타입(신규):

> **§2.10이 이 인터페이스를 supersede 합니다** — 아래 정의는 "Theme이 단일 구조를 강제"하는 임시 버전. 최종 형태는 §2.10의 `composition` 기반 인터페이스를 채택. 이 항목은 단계적 마이그레이션의 출발점으로만 참고.

```ts
// src/themes/types.ts (§2.10에서 교체됨)
export interface TemplatePreset {
  /** DB row의 slug — upsert 키. 변경 금지 */
  slug: string;

  // ─── 코드가 진실 (sync가 항상 덮어씀) ───────────────────
  /** 코드에서 직접 작성하는 JSON. slots.ts의 defaultTemplateJson을 출발점으로 */
  templateJson: TemplateJson;
  /** public/thumbnails/<file> 또는 외부 URL */
  thumbnailPath: string;
  /** semver. DB.version보다 높을 때만 templateJson 업데이트 (옵션) */
  version: string;

  // ─── 기본값 only (DB에 값 있으면 유지) ─────────────────
  defaults: {
    name: string;
    description: string;
    category: string;
  };
}
```

**주의**: `name`/`description`/`category`를 최상위에 두지 않고 `defaults` 네임스페이스로 분리한 이유 — "기본값일 뿐 덮어쓰지 않는다"를 코드 레벨에서 명시. 리뷰어가 "왜 어드민 수정이 안 사라지지?"를 즉시 이해 가능.

### 2.2 자동 발견 레지스트리 — codegen 채택

`import.meta.glob`은 Vite 전용. Next.js App Router(webpack/turbopack 둘 다)에서는 미지원이고, `require.context`도 webpack 의존이라 turbopack 전환 시 깨짐.

→ **빌드 타임 codegen이 가장 안정적**:

```bash
pnpm generate:themes   # src/themes/_generated.ts 출력
```

생성기 (`scripts/generate-themes.ts`):
1. `src/themes/*/index.tsx` 디렉터리 스캔
2. `src/themes/_generated.ts`에 dynamic import 매핑 출력
3. `prebuild`/`predev` npm script에 자동 endrope

```ts
// src/themes/_generated.ts (생성됨, 커밋함)
// AUTO-GENERATED by `pnpm generate:themes` — DO NOT EDIT
export const themeMap = {
  cafe:      () => import('./cafe'),
  corporate: () => import('./corporate'),
  fitness:   () => import('./fitness'),
  // ...
} as const;
```

`registry.ts`는 위 파일을 import만 함. 생성 파일을 커밋하는 이유: CI 환경에서 generate 누락 시 빌드가 즉시 깨지도록 (silent drift 방지). `lint:check-generated` 스크립트로 PR 시 재실행 후 diff 확인.

### 2.3 Preset 동기화 CLI — dry-run 기본, apply 명시

**파괴적 작업이므로 기본 동작은 미리보기**. `--apply` 명시해야 실제 반영:

```bash
pnpm template:sync                # default = dry-run, diff만 출력
pnpm template:sync --apply        # 실제 DB/Storage 반영
pnpm template:sync cafe           # 특정 테마만 (dry-run)
pnpm template:sync cafe --apply   # 특정 테마만 적용
```

PR 같은 형식의 diff 출력 (예시):

```
Scanning 8 presets across 7 themes...

[UPDATE] cafe-default
  templateJson:
    + pages[0].sections[2].data.subtitle.value:
        "Fresh roasted daily" → "Hand-roasted in Seoul"
  thumbnail:
    + hash changed (a3f2... → b91c...) → re-upload pending
  description: NO CHANGE (DB 우선, preset.defaults 무시됨)

[NO CHANGE] fitness-default

[NEW] interior-default
  Will create row with status=draft

────────────────────────────────────────
Summary: 1 update, 1 new, 6 unchanged.
Run with --apply to commit changes.
```

내부 로직:
1. codegen된 `_generated.ts`로 전체 preset 수집 (registry와 같은 방식)
2. 각 preset → `validateTemplateJson` (다음 항목) → 실패하면 그 preset만 skip하고 에러 누적, 종료 시 비-zero exit
3. 썸네일 해시 비교 → 다르면 `public/thumbnails/<file>` → Supabase Storage 업로드 (해시 suffix 파일명으로 멱등)
4. `templates` upsert by `slug`:
   - `templateJson`/`thumbnailUrl`/`version`: 항상 코드값
   - `name`/`description`/`category`: **DB row 존재하면 무시, 없을 때만 `defaults`로 시드**
   - `status`: 절대 건드리지 않음 (신규 row만 `draft`)
5. dry-run이면 4단계 없이 diff만 stdout, exit 0
6. `--apply`면 4단계 실행 후 affected slug 리스트 stdout

> **추가 안전장치**: `--apply` 단독 사용 시 5초 카운트다운 + 변경 row 수 표시. CI에선 `--apply --yes`로 우회.

### 2.4 Slot 기반 강한 검증

`src/lib/template/validate.ts` 신규:

```ts
export function validateTemplateJson(json: TemplateJson): ValidationResult {
  // ─── 구조 검증 ─────────────────────────────────
  // 1. themeKey가 registry(_generated.ts)에 존재
  // 2. 각 page.section.type이 그 테마의 slots[].type 안에 존재
  // 3. required: true인 slot은 모든 page에 최소 1개
  // 4. page 내 section.id 유일성
  // 5. data 필드 value/type/label 필수

  // ─── 라우팅·렌더 검증 (추가) ────────────────────
  // 6. pages 배열 전체에서 page.slug 유일 (라우팅 충돌 방지)
  // 7. globalStyles 타입 검증:
  //    - primaryColor/secondaryColor: hex(#rgb|#rrggbb) 또는 CSS named color
  //    - fontSize: CSS length (px/rem/em)
  //    - layout: 알려진 값 ('wide' | 'narrow' | 'asymmetric' 등) — 화이트리스트
  // 8. data[].value가 string인지 (number 타입도 string 저장 — 가이드 4.5)

  // ─── 미정의 동작 경고 (warning, error 아님) ─────
  // 9. section.order는 현재 렌더러가 무시 (가이드 4.3) — schema에서 deprecated 표시,
  //    혼란 방지 위해 sync 시 warn 출력. 차후 PR로 필드 자체 제거 권장.
  // 10. image 필드의 외부 URL이 https인지 (mixed-content 방지) — warn
}

interface ValidationResult {
  errors: ValidationIssue[];   // 종료 코드 비-zero
  warnings: ValidationIssue[]; // 출력만, 통과
}
```

호출 지점:
- `pnpm template:sync` 실행 시 (errors 있으면 즉시 종료, warnings는 stderr 출력)
- 어드민 UI `Save Draft`/`Deploy` 직전 (현재 `validateJson`을 이걸로 교체)
- `pnpm test`에 추가하여 CI에서 모든 preset 자동 검증 (errors=0 보장)
- (선택) `pre-commit` hook: `src/themes/**/preset*` 변경 시 자동 실행

> **section.order 처리 결정 필요**: 현재 렌더러는 `slots[]` 순서를 따르므로 `order` 필드는 noise. 옵션:
> - **A**. validate에서 monotonic 강제 → 의미 있는 정렬 가능 (렌더러도 `sort` 추가 필요)
> - **B**. schema에서 `order` 제거 → 깔끔하지만 마이그레이션 필요 (DB JSONB 정리)
>
> 1차 PR은 **A의 전 단계 — warn만**. B는 별도 마이그레이션 PR로.

### 2.5 Playwright 썸네일 자동화 — React preview를 정본 source로

HTML 목업과 React 결과는 미묘하게 다를 수밖에 없음(폰트 로딩, CSS 변수 주입, 이미지 최적화). **사용자에게 보일 화면이 카탈로그 썸네일이어야** 하므로 source는 React preview를 우선:

```ts
// src/themes/<key>/thumbnail.config.ts
export default {
  // 단계별 정책:
  //   포팅 전 (React 컴포넌트 부재): 'templates-ui/<key>.html'
  //   포팅 후 (기본/권장):           'preview://<key>-default'
  //                                  → 내부적으로 http://localhost:3000/preview/<seedId>
  source: 'preview://interior-default',
  viewport: { width: 1600, height: 1000 },
  /** 전체 페이지 vs hero만 vs 사용자 정의 selector */
  capture: 'fullpage',                              // 'hero' | 'fullpage' | css selector
  output: 'public/thumbnails/template-interior.webp',
  resize: { width: 800, height: 500 },              // 카탈로그 카드 비율
  /** 폰트 로딩·이미지 lazy-load 안정화용 */
  waitFor: { fonts: true, networkIdle: true, minDelay: 500 },
};
```

CLI:

```bash
pnpm template:capture interior      # 단일 (자동으로 dev server 띄움)
pnpm template:capture --all         # 전체 재생성
pnpm template:capture --check       # 변경 없이 현재 파일 해시만 검증 (CI용)
```

내부:
1. `preview://` 스킴이면 임시 dev server 부팅 → preset의 `templateJson`을 in-memory render
2. Playwright headless 실행 + `waitFor` 조건 만족까지 대기
3. capture 영역 캡쳐 (`hero` = `data-thumbnail-anchor="hero"` 우선, 없으면 첫 section)
4. sharp로 webp 변환 + 리사이즈 + perceptual hash 계산
5. `public/thumbnails/`에 저장 (파일명에 hash suffix 포함하여 캐시 무효화)
6. `template:sync`가 이 파일을 Storage에 업로드 + DB의 `thumbnailUrl` 갱신

> **HTML 단계 fallback**: React 포팅 전엔 `templates-ui/<key>.html`을 source로. capture 후 React 포팅 완료되면 config의 source만 `preview://`로 교체. 두 source 간 이미지 diff가 일정 임계값 이상이면 sync warn.

### 2.6 어드민 UI 역할 재정의 + sync 안전 가드

**Before**: 자유 형식 JSON 입력 + 썸네일 업로드 + Deploy
**After**: DB에 동기화된 preset 카드 목록 + (메타 보정 / 상태 토글 / Manual override)

구체적으로:
- "+ New Template" 버튼은 **Manual one-off**용으로 격하 (예: 시즌 프로모션). 시드는 더이상 어드민에서 만들지 않음.
- 카드 클릭 → 메타데이터 폼 (name/description/category/status/thumbnail-replace)만 보임. JSON은 read-only collapsible.
- 코드에 있는 preset인지 ad-hoc인지 배지로 구분 (`code` / `manual`).

**"Sync from code" 흐름 — 2단계 게이트**:

```
[1. Preview Sync]  ← 누구나 볼 수 있음 (admin)
  → /api/admin/template-sync?dryRun=true
  → diff modal (CLI와 동일 포맷)

[2. Apply Sync]    ← 의도 확인 후 별도 클릭
  → /api/admin/template-sync?apply=true
  → 진행 중 spinner + affected slug 리스트
  → 성공 후 카탈로그 자동 새로고침
```

권한:
- `Preview Sync`: `app_metadata.role === 'admin'`
- `Apply Sync`: `app_metadata.role === 'admin'` **+ `app_metadata.canPublishTemplates === true`** (별도 플래그). 운영 안정성 위해 super-admin 1~2명에게만 부여.
- 두 액션 모두 audit log 테이블에 기록 (`who`, `when`, `affected_slugs`, `dry_run`).

> Apply는 idempotent하게 설계. 같은 코드 상태에서 두 번 실행해도 두 번째는 NO-OP. 실수로 두 번 클릭해도 안전.

### 2.7 HTML 목업의 위치

`templates-ui/`는 **디자인 픽스처 + Playwright 캡쳐 소스**로 명시적으로 격상:

- `pnpm dev:mocks` 명령이 `templates-ui/`를 8081 포트로 정적 서빙 → 디자이너가 React 빌드 없이 iterate
- 각 HTML은 헤더에 `<meta name="theme-key" content="interior">` 표기 → `template:capture`가 source 자동 매칭
- HTML이 React 포팅보다 앞서 변경되면 CI에서 경고 (마지막 캡쳐 해시와 비교)

### 2.8 용어 정의 — Preset vs Variant (혼란 방지)

원본 제안에서 `presets/default.preset.ts` + `presets/minimal.preset.ts` 같은 **여러 preset**을 한 테마에 두려 했지만, 이 경우 운영자가 카탈로그에서 "왜 같은 테마가 두 카드로 보이지?"를 혼란스러워 함. 용어를 lock-in:

| 개념 | 정의 | DB row | 카탈로그 노출 | 사용자 선택 시 |
|---|---|---|---|---|
| **Preset** | 1 preset = 1 카탈로그 카드 = **1 templates row** | 1개 | 별도 카드 | 그 preset의 templateJson으로 사이트 생성 |
| **Variant** (미래) | 같은 preset 안의 색감/카피 옵션. 카탈로그엔 1장만 보이고 "스타일 선택" UI에서 분기 | 여전히 1개 | 1장 | preset row + 선택된 variant key가 합쳐져 사이트 생성 |

**1차 PR의 약속**:
- preset만 지원. 한 테마에 preset 여러 개 가능 (예: `interior-luxury`, `interior-minimal`)이지만, 그 경우 **각각 카탈로그에 별도 카드로 노출**됨을 명시.
- variant 개념은 **이번 리팩터에선 안 함** (§6 비-목표).
- preset 파일명 규칙: `presets/<slug-suffix>.preset.ts` (slug에서 `<themeKey>-` 접두는 자동 prepend → `presets/luxury.preset.ts` → DB slug `interior-luxury`).

### 2.10 ★ Theme = 시각 톤 + 섹션 라이브러리, Preset = 자유 조합

**가장 중요한 구조 변경.** 이 섹션은 §2.1·§2.4·§2.6의 일부 정의를 *덮어씀*(supersede). 위에서 가볍게 본 후, 이 절을 진실로 채택.

#### 문제 재진술

§1.1.9에서 본 한계: `slots.ts`가 "테마=고정 슬롯 배열"을 강제 → 같은 cafe 안에서도 구조가 다른 템플릿(cafe-modern, cafe-cozy, cafe-minimal …)을 표현할 수 없음. 이를 새 테마 추가로 우회하면 컴포넌트가 폭발적으로 중복됨.

#### 새 정의

| 개념 | 새 정의 | 책임 |
|---|---|---|
| **Theme** | 시각 톤(컬러·폰트·여백 토큰) + **재사용 가능한 섹션 컴포넌트 라이브러리** | "어떤 카드들을 손에 쥐고 있는가" |
| **Section Component** | 자기 자신의 메타(label/category/dataSchema)를 export하는 self-describing 컴포넌트 | "내가 어떤 데이터로 어떻게 그려지는가" |
| **Preset** | 라이브러리에서 골라 배열한 **composition** + 각 슬라이스의 데이터 + 시각 토큰 오버라이드 | "이 카드들을 이 순서로 이 데이터로 조합한 한 페이지" |

`slots.ts`의 고정 배열·`required` 플래그는 사라짐. **렌더 순서·종류·필수 여부는 모두 preset이 결정**.

#### 디렉터리 (revised)

```
src/themes/cafe/
├── tokens.ts                    ← ★변경: globalStyles 시드 + 시각 토큰 카탈로그
├── library/                     ← ★신규: 섹션 컴포넌트 라이브러리 (자기 메타 동봉)
│   ├── index.ts                 ←   import 해서 컴포넌트 키→컴포넌트 매핑 export
│   ├── HeroVideo.tsx            ←   componentKey='hero-video', dataSchema 동봉
│   ├── HeroImage.tsx            ←   componentKey='hero-image'
│   ├── HeroSplit.tsx            ←   componentKey='hero-split'
│   ├── MenuList.tsx             ←   componentKey='menu-list'
│   ├── MenuGrid.tsx             ←   componentKey='menu-grid'
│   ├── Reservation.tsx
│   ├── Gallery.tsx
│   └── ...
├── presets/                     ← preset마다 자유 composition
│   ├── modern.preset.ts         ←   composition: [hero-video, menu-grid, reservation, location]
│   ├── cozy.preset.ts           ←   composition: [hero-image, story, menu-list, gallery]
│   └── minimal.preset.ts        ←   composition: [hero-image, menu-list]
├── thumbnail.config.ts
└── index.tsx                    ← 얇아짐: 라이브러리·토큰만 묶어 ThemeModule export
```

**`slots.ts`/`defaultTemplateJson` 폐기.** 그 두 파일이 들고 있던 책임은 `library/`(컴포넌트 카탈로그) + `presets/*.preset.ts`(시드 composition)으로 분리됨.

#### Self-describing Section Component

```ts
// src/themes/cafe/library/HeroVideo.tsx
import type { SectionComponent, SectionDataSchema } from '../../types';

const dataSchema: SectionDataSchema = {
  videoUrl: { type: 'url',      required: true,  label: '영상 URL' },
  title:    { type: 'text',     required: true,  label: '제목' },
  subtitle: { type: 'textarea', required: false, label: '부제' },
  ctaText:  { type: 'text',     required: false, label: 'CTA 텍스트' },
  ctaUrl:   { type: 'url',      required: false, label: 'CTA 링크' },
};

const HeroVideo: SectionComponent = ({ data }) => {
  return (
    <section>
      <video src={data.videoUrl?.value} autoPlay muted loop />
      <h1>{data.title?.value}</h1>
      {/* ... */}
    </section>
  );
};

HeroVideo.meta = {
  componentKey: 'hero-video',
  category: 'hero',
  label: 'Hero (Video Background)',
  description: '풀스크린 비디오 배경 + 중앙 카피',
  dataSchema,
  // (선택) 미리보기 썸네일 — 어드민 라이브러리 카탈로그용
  previewImage: '/component-previews/cafe/hero-video.webp',
};

export default HeroVideo;
```

`library/index.ts`:

```ts
import HeroVideo from './HeroVideo';
import HeroImage from './HeroImage';
import MenuList from './MenuList';
// ...

export const sectionLibrary = {
  [HeroVideo.meta.componentKey]: HeroVideo,
  [HeroImage.meta.componentKey]: HeroImage,
  [MenuList.meta.componentKey]: MenuList,
  // ...
} as const;
```

#### Preset 인터페이스 (revised)

```ts
// src/themes/types.ts (§2.1을 supersede)
export interface TemplatePreset {
  slug: string;

  // 코드가 진실 ─────────────────────────────────
  /** 시각 토큰 오버라이드. 비우면 theme.tokens 그대로 */
  globalStyles?: Partial<GlobalStyles>;
  /** ★자유 composition: 이 preset이 가지는 섹션들의 종류·순서·데이터 */
  composition: PresetSection[];
  thumbnailPath: string;
  version: string;

  // 시드 only (DB가 이후 진실) ───────────────────
  defaults: { name: string; description: string; category: string };
}

export interface PresetSection {
  /** preset 내 unique. 사용자 사이트에서도 보존됨 (안정 ID) */
  id: string;
  /** library 키. 검증 시 theme.library에 존재해야 함 */
  componentKey: string;
  /** 표시/숨김. composition 안에 있으면 default true */
  visible?: boolean;
  /** dataSchema 만족하는 필드 맵 */
  data: Record<string, TemplateField>;
}
```

`pages` 다중 페이지 표현은 그대로 유지하되, 각 page도 자체 `composition`을 가짐:

```ts
// templateJson 안의 page (revised)
interface PageJson {
  id: string;
  slug: string;
  title: string;
  composition: PresetSection[];   // ← 여기로 이동
}
```

#### Renderer 변경

기존 (`corporate/index.tsx:39-43` 류):
```ts
slots.map((slot) => {
  const section = sections.find((s) => s.type === slot.type);
  // ...
});
```

새 코드:
```ts
page.composition.map((section) => {
  const Component = theme.library[section.componentKey];
  if (!Component) return null;  // 검증에서 이미 걸렸어야 함
  return <Component key={section.id} data={section.data} />;
});
```

부수 효과로 가이드 4.3 gotcha("section.order는 사실상 무시")가 **자동 해소** — 순서가 곧 배열 순서.

#### 검증 규칙 (revised, §2.4 보강)

기존 §2.4의 1~2번이 아래로 교체됨:

```
1. themeKey가 _generated.ts에 존재
2. 각 composition[i].componentKey가 그 theme.library에 존재
2-bis. composition[i].data가 그 컴포넌트의 dataSchema 만족
       - dataSchema.required=true 필드 누락 시 error
       - 알려지지 않은 키는 warning (오타 캐치)
       - 타입 일치 (url 필드는 https URL, color는 hex 등)
```

3~10번은 그대로 유지(특히 `page.slug` unique, section.id unique).

`section.order` 필드는 **즉시 schema에서 제거** (이전엔 deprecation warn이었지만, composition 모델에서는 의미 자체가 없음).

#### 어드민/에디터 영향

- **어드민 카탈로그 페이지**: preset 카드 + 그 preset의 composition 미니 다이어그램(컴포넌트 키 칩 나열) 표시. "어떤 모양의 cafe인지" 즉시 파악.
- **사용자 에디터(`DynamicEditor`)**: 사용자가 섹션을 추가하려 할 때, 현재 theme의 `library` 전체를 카테고리별 카탈로그로 보여줌. **사용자가 자기 사이트 구조를 직접 늘리거나 줄일 수 있음** (현재는 preset 구조 고정).
  - 1차에서는 사용자 추가/제거 비활성화하고 preset 구조 유지 정책으로 시작 → 안정화 후 오픈 가능.
- 어드민 manual one-off 생성 시에도 composition을 코드 라이브러리에서 골라 조합하는 UI(드래그 카드)로 가능.

#### 마이그레이션 영향

기존 7개 테마(corporate, cafe, fitness, …)가 `slots.ts` 기반이므로 **점진 어댑터** 필요:

1. **Phase 6a (어댑터)** — 기존 `slots.ts`를 자동으로 `library` 형태로 감싸는 어댑터 추가. 모든 기존 테마는 즉시 새 모델 위에서 동작 (단, 한 테마당 컴포넌트 1개씩만 보유).
2. **Phase 6b (라이브러리 확장)** — 한 테마당 같은 카테고리에 variant 컴포넌트 추가 (예: cafe에 `HeroVideo`, `HeroImage`, `HeroSplit` 셋).
3. **Phase 6c (preset 분화)** — 새 컴포넌트를 활용한 추가 preset 작성 (`cafe-modern`, `cafe-cozy`).
4. **Phase 6d (정리)** — `slots.ts` 완전 제거, 어댑터 삭제.

각 단계는 독립 머지 가능. 사용자 사이트 데이터는 어댑터가 `section.type` → `componentKey`로 1:1 매핑하여 무손실 호환.

#### 트레이드오프

- ✅ 같은 theme 안에서 구조 자유도 무한 확보
- ✅ 컴포넌트 재사용 극대화 (cafe·restaurant·hotel이 같은 `HeroVideo`를 공유 가능 — §2.11 참고)
- ✅ 사용자 에디터에서 섹션 추가/순서 변경 가능성 열림
- ⚠️ Theme 폴더가 더 두꺼워짐 (한 카테고리에 컴포넌트 여러 개)
- ⚠️ 각 컴포넌트의 dataSchema 작성 비용 (그러나 이건 *어차피* 어딘가에 정의해야 할 정보였고 — 현재는 암묵적이라 검증 불가)
- ⚠️ 마이그레이션 비용 (Phase 6a~d, 각 1~2일 추정)

### 2.11 (전망) 크로스-테마 섹션 공유

§2.10의 자연스러운 다음 단계. cafe의 `HeroVideo`와 restaurant의 `HeroVideo`가 같은 코드라면, 한 단계 위로 끌어올려 공용 라이브러리로:

```
src/sections/                      ← ★전 테마가 공유하는 섹션 풀
├── hero/
│   ├── HeroVideo.tsx              tags: ['cafe','restaurant','hotel','fashion']
│   └── HeroSplit.tsx              tags: ['corporate','agency']
├── menu/
│   └── MenuGrid.tsx               tags: ['cafe','restaurant']
└── ...

src/themes/cafe/
└── theme.ts                       ← 토큰 + "이 테마가 노출하는 섹션 키 목록" (tag 필터)
```

이 단계는 **이번 PR 범위 밖**. §2.10 정착 후 별도 RFC.

### 2.12 (선택) HTML → slots 스캐폴드

```bash
pnpm template:scaffold interior --from templates-ui/interior.html
```

`<section data-slot="hero">` 같은 attribute가 있으면 자동으로 `slots.ts` skeleton + sections/HeroSection.tsx stub 생성. 디자인-개발 인계 시간을 크게 줄임. (1차 PR 범위 외, 검증 후 도입)

---

## 3. 마이그레이션 단계 (점진적)

기존 코드 박살내지 않고 단계 진행:

### Phase 1 — 기반 (1~2일)
- [x] `TemplatePreset` 타입 신규 (`templateJson`/`thumbnailPath`/`version` 코드-진실, `defaults.*` 시드-only)
- [x] 기존 7개 테마에 `presets/default.preset.ts` 추가 (각 테마의 `defaultTemplateJson` + 현재 DB row의 메타를 `defaults`로 복사)
- [x] `validateTemplateJson` 함수 구현 (§2.4의 1~10번 규칙 + warning/error 분리) + vitest 테스트
- [x] `pnpm test`에서 모든 preset 검증 (errors=0 보장)
- [x] codegen `scripts/generate-themes.mjs` + `_generated.ts` 커밋 + `predev`/`prebuild` 자동 실행

### Phase 2 — 동기화 (2~3일)
- [x] `pnpm template:sync` CLI 구현 (**default = dry-run**, `--apply` 명시 시만 반영)
- [x] sync 시 **메타 보존 정책** 구현 (DB에 값 있으면 `defaults` 무시) + 테스트
- [x] PR-style diff 출력 포맷 (UPDATE/NEW/NO CHANGE 구분, JSON 필드별 변경 표시)
- [x] `/api/admin/template-sync` 엔드포인트 (`?dryRun=true|false`)
- [x] audit log 테이블 마이그레이션 (`011_template_sync_audit.sql`)

### Phase 3 — 썸네일 (1~2일)
- [x] `thumbnail.config.ts` 7개 테마에 추가 — source는 일단 HTML, 포팅 검증 후 `preview://`로 교체
- [x] `pnpm template:capture` CLI 구현 (Playwright + sharp + perceptual hash)
- [x] `preview://` 스킴 핸들러 (임시 dev server + in-memory render)
- [x] `template:sync`가 캡쳐 파일을 Storage로 자동 업로드 (해시 기반 멱등)

### Phase 4 — 레지스트리/UI 정리 (1~2일)
- [x] `registry.ts`를 `_generated.ts` import로 교체
- [x] 어드민 UI: 카드 클릭 시 JSON textarea를 collapsible **read-only**로 (preset 코드 row), manual row만 편집 가능
- [x] 어드민 UI: **Preview Sync → Apply Sync 2단계** 버튼 + super-admin 게이트 (`canPublishTemplates` 플래그)
- [x] `TemplateEditorPanel`의 `DEFAULT_JSON` 제거 — manual 생성은 빈 폼에서 시작
- [x] 카드에 `code` / `manual` 배지 표시

### Phase 5 — 문서/정리 (1일)
- [ ] `TEMPLATE_AUTHORING_GUIDE.md` 갱신 — 새 흐름 반영 (composition 모델 포함)
- [ ] `section.order` 처리 결정 (composition 모델에서 자동 해소되므로 §2.10 도입 시 즉시 제거)
- [ ] (선택) `pnpm template:scaffold` PoC

### Phase 6 — Composition 모델 전환 (§2.10, 가장 큰 작업: 5~8일)
> 이 단계가 §1.1.9 한계의 실제 해소. Phase 1~5가 데이터/파이프라인 인프라라면 Phase 6은 Theme의 정의 자체를 바꿈.

**Phase 6a — 어댑터 (1~2일)**
- [ ] `SectionComponent.meta` / `SectionDataSchema` 타입 신설
- [ ] `library/` 어댑터 함수: 기존 `slots.ts` + `sectionComponentMap`을 자동으로 라이브러리 형태로 감쌈
- [ ] Renderer를 composition-walking 방식으로 교체 (어댑터 거쳐 기존 7테마 무중단)
- [ ] preset의 `composition` 필드를 `defaultTemplateJson.pages[].sections`로부터 자동 변환

**Phase 6b — 라이브러리 확장 (2~3일, 테마별 분산 가능)**
- [ ] 우선 1개 테마(cafe 권장)에서 동일 카테고리에 variant 컴포넌트 2~3개 추가 (예: `HeroVideo`/`HeroImage`/`HeroSplit`)
- [ ] 각 컴포넌트에 `meta`(componentKey/category/dataSchema) 동봉
- [ ] 어드민 카탈로그에 composition 다이어그램 표시 (preset이 어떤 컴포넌트들로 구성됐는지)

**Phase 6c — Preset 분화 (1~2일)**
- [ ] cafe에 새 preset 2개 추가 (`cafe-modern`, `cafe-cozy`) — composition이 서로 다른 것을 시연
- [ ] §2.10의 트레이드오프 검증 (DX, 검증 비용)

**Phase 6d — 정리 (1일)**
- [ ] `slots.ts` 완전 제거, 어댑터 삭제
- [ ] `section.order` 필드 schema에서 제거 (DB JSONB 정리 마이그레이션 포함)
- [ ] 기존 6개 테마의 라이브러리 확장은 별도 후속 PR (cafe 한 테마 검증 후)

---

## 4. 변경 후 워크플로우 비교

### Before (현재)
```
HTML 목업 → React 포팅 → slots.ts 작성 → registry.ts 수정
  → Playwright 별도 실행 → 이미지 리사이즈
  → /admin → 폼 입력 → JSON textarea 붙여넣기 → 썸네일 업로드 → Deploy
(11단계, 모두 수동)
```

### After (목표)
```
HTML 목업 → React 포팅 → slots.ts 작성 → presets/default.preset.ts 1개 추가
  → pnpm template:capture <key>
  → pnpm template:sync         (PR 머지로 prod 자동 동기화도 가능)
  → /admin에서 status를 active로 토글
(7단계, 4개는 CLI 한 줄)
```

추가 효과:
- preset이 코드에 있으므로 **PR 리뷰 가능**, **롤백 가능**, **CI 검증 가능**.
- 어드민이 "JSON 부수기"로 사고 칠 여지 제거.
- 디자이너의 HTML 수정 → React 포팅 → preset 갱신 → CLI 한 줄로 prod 반영.

---

## 5. 제거되는 것 / 보존되는 것

### 제거
- `TemplateEditorPanel.tsx`의 자유 JSON textarea (preset row는 read-only로 다운그레이드)
- `DEFAULT_JSON` 상수 (`TemplateEditorPanel.tsx:13`)
- 어드민 UI에서의 시드 템플릿 신규 작성 흐름 (manual one-off만 유지)
- `registry.ts`의 수동 매핑 (codegen으로 대체)
- **`slots.ts` + `defaultTemplateJson` 패턴 자체** (Phase 6d) — `library/` + `presets/` 조합으로 대체
- **`section.order` 필드** (composition 배열 순서가 곧 렌더 순서)

### 보존
- `TemplateJson` 타입 (필드 일부 변경: `pages[].sections` → `pages[].composition`)
- `templates` 테이블 스키마 (그대로 — sync가 upsert만 함, JSONB 내부 구조만 변경)
- 어드민의 메타데이터 편집(`name`/`description`/`category`)·status 토글·thumbnail replace (보존, **DB가 진실**)
- Manual one-off 생성 흐름 (보존, 시즌 프로모션 등 ad-hoc용)
- `defaults.*`은 신규 row의 시드값으로만 사용 (DB row 존재 시 절대 덮어쓰지 않음)
- 사용자 사이트 데이터 (Phase 6a 어댑터가 `section.type` → `componentKey` 무손실 매핑)

---

## 6. 비-목표 (이번 리팩터에서 안 함)

- 시각적 WYSIWYG preset 빌더 (Figma-like). 코드-PR 워크플로우가 의도된 게이트.
- 다중 페이지(`pages.length > 1`) 공개 사이트 네비게이션. 별도 이슈.
- 사용자별 커스텀 테마 업로드. 보안·격리 비용이 큼.
- **크로스-테마 섹션 공유 (§2.11)**. §2.10 정착 후 별도 RFC.
- **사용자 에디터에서 섹션 추가/삭제·순서 변경**. 데이터 모델은 §2.10에서 가능해지지만 UX·검증 비용이 추가로 큼. 1차에서는 preset 구조 고정 유지.

---

## 7. 한 줄 요약

> **Theme = "시각 톤 + 섹션 라이브러리", Preset = "그 라이브러리에서 자유롭게 골라 조합한 한 페이지".**
> `slots.ts`의 고정 슬롯이 사라지고, 같은 cafe 안에서도 구조가 완전히 다른 preset 여러 개가 가능해진다.
> 구조·composition·썸네일은 코드가 진실, 메타(이름·설명·카테고리·status)는 DB가 진실.
> `pnpm template:sync` (default = dry-run) 한 줄로 diff 확인, `--apply`로 반영.
> 어드민 UI는 *시드 도구*에서 *메타 도구 + sync 트리거*로 역할 축소.

---

## 8. 리뷰 반영 변경 내역 (2026-05-02)

초안 리뷰에서 식별된 7가지 리스크를 반영해 다음을 변경:

1. **소유권 분리 명시** (§2.0, §2.1) — `templateJson`/`thumbnail`/`version`만 코드 진실, 메타는 DB 진실. `TemplatePreset.defaults` 네임스페이스로 분리.
2. **dry-run 기본** (§2.3) — `pnpm template:sync`는 미리보기, `--apply` 명시 필요. PR-style diff 출력.
3. **검증 규칙 확장** (§2.4) — `page.slug` unique, `globalStyles` 타입 검증, 외부 URL https 권장 추가. `section.order`는 warn으로 유지하되 차후 제거 검토.
4. **썸네일 source 정책** (§2.5) — React preview(`preview://`)를 정본으로, HTML은 포팅 전 fallback. `data-thumbnail-anchor` 컨벤션 도입.
5. **registry codegen** (§2.2) — `import.meta.glob`은 Next.js 비호환 → `scripts/generate-themes.ts` codegen + `_generated.ts` 커밋.
6. **2단계 sync + super-admin** (§2.6) — Preview Sync / Apply Sync 분리, `canPublishTemplates` 플래그 게이트, audit log.
7. **Preset = 1 카탈로그 카드** (§2.8) — 1 preset = 1 DB row = 1 카드 lock-in. variant 개념은 미래 과제로 격하.
8. **★ Theme의 정의 자체 변경** (§2.10, §1.1.9) — 가장 큰 구조 변경. "Theme = 고정 슬롯 + renderer"에서 "Theme = 시각 톤 + 섹션 컴포넌트 라이브러리"로 전환. Preset이 라이브러리에서 자유롭게 composition을 구성. `slots.ts` 폐기, `library/` + `presets/*.preset.ts` 도입. 같은 cafe 안에서 구조가 다른 preset 여러 개 가능. Phase 6a~d로 점진 마이그레이션.
