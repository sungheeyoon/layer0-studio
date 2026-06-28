# 템플릿 저작 마찰 기록 (new-template 워크플로우 개선용)

_작성: 2026-06-27 — `outdoor-default`(능선, 멀티페이지 아웃도어) 제작 중 실제로 막혔던 지점 모음._
_목적: `new-template` 스킬 / 검증·동기화 도구 체인을 개선하기 위한 근거. 각 항목은 **증상 → 원인 → 영향 → 제안**._

---

> 퍼블리싱 단계 버그 2건(draft→active 발견성 / Apply Sync 썸네일 회귀)은 2026-06-27 해결됨(PR #92~#95). 아래는 `outdoor-default` 저작 과정에서 **불필요하게 시간을 쓴 지점**들이다. 등록·공개 파이프라인 개편은 `docs/proposals/ideal-template-publishing.md` 참고.

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
