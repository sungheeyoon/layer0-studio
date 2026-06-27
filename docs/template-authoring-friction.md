# 템플릿 저작 마찰 기록 (new-template 워크플로우 개선용)

_작성: 2026-06-27 — `outdoor-default`(능선, 멀티페이지 아웃도어) 제작 중 실제로 막혔던 지점 모음._
_목적: `new-template` 스킬 / 검증·동기화 도구 체인을 개선하기 위한 근거. 각 항목은 **증상 → 원인 → 영향 → 제안**._

---

## 🔴 미해결 — 다음 세션 TODO (퍼블리싱 단계에서 실제로 막힌 버그)

_2026-06-27, 어드민에서 `outdoor-default`를 Apply Sync 한 직후 발견. 위쪽 1~6은 "저작" 마찰, 아래 둘은 "퍼블리싱/런타임" 버그._

### TODO-1. Draft → Active 전환 경로를 못 찾음 ✅ 해결 (2026-06-27)
> **해결 요약(2026-06-27, PR #94)**: 리스트 **draft 행에 항상 보이는 primary "Activate" 버튼** 추가(`TemplateListPanel.tsx`, Edit/Archive/Delete는 기존대로 hover 노출). `activateTemplateAction`은 기존 `updateTemplateAction(status:'active')` 경로 재사용(어드민 권한만 요구 — 에디터 Deploy와 동일 게이트, 새 권한 미도입). 공개 전 확인 다이얼로그 1단계. 능선(outdoor-default)도 active 전환해 prod 카탈로그 노출 확인. 근본(공개를 코드 status로)은 `docs/proposals/ideal-template-publishing.md` A안으로 잔존.


- **증상**: Apply Sync로 `draft` 등록까지는 됐는데, 어드민에서 **active로 바꾸는 방법이 보이지 않음**.
- **원인(코드 확인 완료)**: active 전환 경로는 **존재함** — `리스트에서 Edit → 에디터 하단 "Deploy template" 버튼 → 확인`이 status를 active로 만든다(`TemplateEditorPanel.tsx:428` `handleSubmit(fd,'active')`). 그런데:
  - 리스트 행(`TemplateListPanel.tsx:192~228`)의 액션은 **Edit / Archive / Delete 뿐 — "Activate" 버튼이 없음.**
  - Code(preset) 행은 에디터가 **read-only**(`isCodePreset` → 이름/JSON 입력 비활성, `TemplateEditorPanel.tsx:50,212,358`)라 사용자가 "여긴 손댈 게 없네" 하고 닫게 됨. 하지만 하단 "Deploy template" 버튼은 preset에도 **활성**이라 사실은 누를 수 있음.
  - 버튼 이름이 "Deploy template"이라 "공개(activate)"와 연결이 안 됨.
- **영향**: 등록은 했는데 공개를 못 함 → 사용자 카탈로그에 영영 안 뜸.
- **제안(다음 세션)**: (1) 리스트 draft 행에 **"Activate(공개)" 버튼 직접 추가** — Edit 안 들어가도 한 번에. (2) 또는 "Deploy template" 라벨을 "Activate / 공개"로 변경하고 preset도 잘 되는지 확인. (3) 근본적으로는 `docs/proposals/ideal-template-publishing.md` A안(공개를 코드 `status`로) 방향.

### TODO-2. Apply Sync가 기존 템플릿 썸네일을 전부 깨뜨림 ✅ 해결 (2026-06-27)
> **해결 요약(2026-06-27)**: ① 근본 가드는 PR #92(`sync.ts` 138~152, c52bfec)로 머지·**프로덕션 배포 확인 완료**. ② 썸네일 실복구: 전 템플릿(11개) `thumbnail.config.ts` source를 `preview://<key>`로 통일(정적 `templates-ui/*.html`은 `file://`로 CSS/레이아웃이 안 실려 빈/깨진 캡처가 났음) → 전 템플릿 재-capture → preset `thumbnailPath`를 β슬러그(`template-<cat>-<leaf>.webp`)로 정정, config `output`과 1:1 일치. `corporate-multipage`엔 없던 `thumbnail.config.ts` 신규 추가. 미참조 레거시 `template-cafe.webp`/`template-corporate.webp` 삭제. ③ 재발 방지: `validate-and-capture.ts`에 **`thumbnail-path` 차단 스텝** 추가 — `preset.thumbnailPath === config.output` + 파일 실존을 검증(capture 직후 실행). dry-run = 11 updates / 0 errors, templateJson 차이는 전부 key-order뿐(semantic 동일). **남은 것: 어드민/CLI로 prod에 Apply.**


- **증상**: 어드민 리스트 + 공개 카탈로그(템플릿 카드)에서 **능선(outdoor-default)만 제외하고 나머지 템플릿 썸네일이 전부 깨짐**. 실제 사이트 렌더는 정상(라이브 렌더라 썸네일과 무관). 사용자가 어드민에서 **Apply Sync(=전체 프리셋 sync)를 누른 직후** 발생.
- **확정 원인**:
  1. **β 템플릿들의 썸네일 소스 webp가 repo에 없음.** `public/thumbnails/`에 실제 존재하는 파일은 `template-cafe.webp`, `template-corporate.webp`, `template-outdoor-default.webp` **셋뿐**. 그런데 preset들은 `template-fitness.webp` / `template-interior.webp` / `template-legal.webp` / `template-medical.webp` / `template-wedding.webp` / `template-corporate-multipage.webp` 등 **존재하지 않는 파일**을 `thumbnailPath`로 가리킴. (게다가 cafe/corporate는 β 슬러그(`template-cafe-default.webp`)가 아니라 레거시 이름을 가리킴.)
  2. **`sync.ts`에 가드가 없음** (`src/lib/template/sync.ts:127~135` + UPDATE 분기 ~161,170): 로컬 파일이 **없으면** `thumbnailUrl`이 업로드된 storage URL이 아니라 `"public/thumbnails/template-fitness.webp"` **문자열 그대로** 남는다. 그리고 `existing.thumbnail_url !== thumbnailUrl`이면 UPDATE → **기존의 정상 storage URL을 그 깨진 로컬 경로 문자열로 덮어씀.** `<img src="public/thumbnails/...">`는 현재 페이지 기준 상대경로라 404 → 깨짐.
  3. 능선만 멀쩡한 이유: 능선 webp는 실제로 존재(방금 capture+commit) → 정상 업로드 → 유효 URL.
- **영향**: **프로덕션 카탈로그/어드민의 기존 템플릿 썸네일이 죄다 깨진 상태**(라이브 회귀). 사용자가 누른 Apply Sync가 기존 정상 URL들을 클로버함.
- **수정 계획(다음 세션)**:
  1. **`sync.ts` 하드닝 (근본 + 우선)**: 업로드가 안 일어났을 때(= `thumbnailUrl`이 여전히 `public/`로 시작) **기존 `existing.thumbnail_url`을 유지**하고 절대 깨진 로컬 경로로 덮어쓰지 말 것. 신규 행이면 빈 값/플레이스홀더로.
  2. **썸네일 복구**: 모든 템플릿을 `pnpm template:capture <key>`로 재생성(파일 생성 → 커밋) 후 재-sync로 storage 재업로드. preset의 `thumbnailPath`도 β 슬러그(`template-<cat>-<leaf>.webp`)로 정정.
  3. **재발 방지 가드**: verify/CI에서 "preset.thumbnailPath 파일이 실제 존재하는지"를 체크(없으면 경고/실패).
- **주의**: 2번 재-sync는 **프로덕션 DB에 쓰는 작업**이라, 1번 가드를 먼저 머지/배포한 뒤 진행해야 또 클로버하지 않는다.


> 결과적으로 템플릿은 정상 완성됐다(차단 게이트 전부 통과 + 썸네일 렌더 + sync dry-run 깨끗). 아래는 그 과정에서 **불필요하게 시간을 쓴 지점**들이다.

---

## 1. `template:verify`의 schema-jsx-consistency가 array 필드에서 거짓 실패 ⚠️ (가장 큰 마찰)

- **증상**: 검증 게이트가 `❌ Gate failed`로 중단. `items` 같은 `array` 필드마다 `"items declared in dataSchema but never read"`, 항목 내부 필드(`name`/`price`...)마다 `"read but not declared"` 위반을 쏟아냄.
- **원인**: 일관성 검사기가 **정규식 기반**이라 (1) `array` 필드를 `data['items']`로 직접 읽는 패턴을 인식 못 하고, (2) `itemSchema` 안의 중첩 키를 "선언된 것"으로 못 봄. 즉 array를 쓰는 모든 컴포넌트가 구조적으로 실패한다. **참조 템플릿 cafe-default(MenuBento)조차 동일하게 실패**한다 — 실제로는 차단이 아니라 정보성 단계인데, 게이트는 exit 1로 중단시킨다.
- **영향**: 스킬 지침("all green까지 self-fix")과 충돌. 개발자가 "내가 뭘 잘못했나" 추적하느라 시간 낭비. 진짜 차단 게이트(tsc/eslint/validate-json/validate-files)와 거짓 실패가 같은 무게로 표시됨.
- **제안**:
  - (단기) 게이트 출력에 "이 단계는 array 필드에서 거짓 양성이 알려져 있음. 차단 아님"을 명시하거나, array 필드를 화이트리스트 처리.
  - (근본) 검사기가 `type:'array'` + `itemSchema`를 인지하도록 개선. 또는 단일 인자 `getFieldValue(item.field)` 호출도 referenced로 집계.
  - 회피법(현재 채택): 항목 필드는 `getFieldValue(item, 'x')`(2-인자) 대신 **`getFieldValue(item.x)`(1-인자)** 로 읽으면 절반(undeclared)이 사라짐. 나머지 `items` 거짓 양성은 참조 템플릿과 동일하게 잔존.

## 2. `pnpm template:sync`가 `.env.local`을 로드하지 않음

- **증상**: `pnpm template:sync outdoor-default` → `NEXT_PUBLIC_SUPABASE_URL ... are required` 에러로 즉시 실패.
- **원인**: package.json의 `template:sync` 스크립트는 `tsx scripts/sync-templates.ts`로 호출 — **`--env-file=.env.local`이 빠져 있음**. 반면 `template:image`는 `--env-file=.env.local`이 붙어 있어 잘 됨(일관성 없음).
- **영향**: dry-run 한 번 돌리는데 막힘. 회피: `pnpm exec tsx --env-file=.env.local scripts/sync-templates.ts <key>`.
- **제안**: package.json `template:sync`(및 `template:verify` 등 DB/모듈 로딩 스크립트)에 `--env-file=.env.local` 추가해 다른 명령과 통일.

## 3. `template:capture`가 macOS에서 dev 서버를 못 띄움

- **증상**: 서버가 없을 때 capture 실행 → `🚀 Starting dev server...` 후 `Error: Timeout waiting for dev server`.
- **원인**: `ensureDevServer`가 **`pnpm.cmd`(Windows 전용 실행 파일)** 를 spawn함. macOS/Linux엔 `pnpm.cmd`가 없어 서버가 영영 안 뜨고 30초 후 타임아웃.
- **영향**: 썸네일 캡처 단계가 무조건 실패하는 것처럼 보임. 회피: **`pnpm dev`를 먼저 백그라운드로 띄워두면** `isServerRunning(3000)`이 true가 되어 자체 spawn을 건너뛰고 정상 캡처됨.
- **제안**: spawn 대상을 OS에 따라 `pnpm`/`pnpm.cmd`로 분기(`process.platform === 'win32'`). 또는 `npx`/`pnpm exec` 사용.

## 4. 이미지 API 키 부재 → 테마와 무관한 placeholder

- **증상**: `pnpm template:image <key> "mountain trail" wide` → `Empty pool ... using picsum fallback`. picsum은 **주제 무관 랜덤 사진**(인물/음식/건물 등)이라 아웃도어 브랜드에 안 어울림.
- **원인**: 이 환경에 `UNSPLASH_ACCESS_KEY`/`PEXELS_API_KEY`가 없음. 키 없으면 항상 picsum.
- **영향**: 도구가 주는 이미지를 쓰면 브랜드 무드가 망가짐. 회피: 안정적인 `images.unsplash.com/photo-<id>?...` 직접 URL을 골라(각각 curl로 200 확인 후) `template.ts`에 하드코딩.
- **제안**: 키 부재 시 picsum 대신 **주제 일관성 있는 fallback**(예: `source.unsplash.com` 류 키워드 기반, 혹은 큐레이션된 로컬 이미지 풀)을 쓰거나, 키 부재를 더 강하게 경고.

## 5. 프리뷰가 클라이언트에서 렌더 → `curl`로 결과 확인 불가

- **증상**: `curl /preview/preset/<key>` 결과에 섹션 DOM이 없고 직렬화된 JSON만 보임. "렌더 안 되나?" 오해.
- **원인**: `TemplateClientWrapper`가 `loadTemplate()`를 **useEffect에서 동적 import** → 렌더는 브라우저(JS 실행) 후. SSR HTML엔 props JSON만 들어감.
- **영향**: 텍스트 기반(curl)으로는 실제 렌더/레이아웃을 검증할 수 없음. 진짜 확인은 Playwright capture(또는 브라우저).
- **제안**: 문서(TEMPLATE_SYSTEM.md §7.1)에 "프리뷰 렌더 검증은 capture로, curl로는 안 됨"을 명시.

## 6. 신규 top-level 카테고리(`outdoor`)에 대한 사람 승인 흐름이 모호

- **증상**: `outdoor`는 기존에 없는 새 카테고리. 스킬 규칙상 "사람 명시적 승인 필요"인데, 사용자의 "아웃도어 브랜드 만들어줘"가 그 승인인지 경계가 불분명.
- **영향**: 진행/중단 판단을 작업자가 스스로 내려야 함(이번엔 브리프가 명백히 아웃도어라 진행).
- **제안**: 스킬이 새 카테고리 생성 직전에 1줄 확인(또는 "브리프에 카테고리명이 명시되면 자동 승인" 규칙)을 명문화.

---

## 한 줄 요약
실제 코드/데이터 작업보다 **도구 체인의 환경 차이(Windows 가정·env-file 누락)와 거짓 양성 검증**에서 시간이 더 들었다. 차단 게이트와 정보성 게이트를 구분 표기하고, 스크립트 환경 로딩을 통일하고, capture의 OS 분기를 고치면 다음 템플릿 저작이 훨씬 매끄러워진다.
