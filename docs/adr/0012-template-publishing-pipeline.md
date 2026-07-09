# 템플릿 퍼블리싱 파이프라인 — 등록은 배포 후 자동, 공개는 머지로

> **Status: Accepted.** `new-template` 스킬로 저작한 Template 의 **등록(Register)** 과 **공개(Publish)** 를 분리하되, 둘 다 사람의 수동 단계에서 걷어낸다. 등록은 **프로덕션 배포 성공 직후 CI 가 자동**(`template:sync --apply`)으로 수행하고, 첫 공개는 **PR 머지 = 승인**으로 보아 신규 행을 곧바로 `active` 로 만든다. 운영 중 긴급 내림(takedown)·재공개만 `canPublishTemplates` 런타임 토글로 남긴다. 현행 어드민 "Sync from Code → Apply Sync" 수동 2단계를 폐기(비상용으로 축소)한다. ADR-0002(코드가 source of truth)·ADR-0006(canPublishTemplates 분리)를 잇고 후자의 스코프를 재정의한다.

## 맥락

`outdoor-default`(능선) 저작 경험에서 드러난 마찰: 스킬로 사이트를 만들고 프리뷰로 검증까지 끝냈는데도, 카탈로그에 올리려면 **어드민에 로그인해 `Sync from Code` → `Apply Sync` 를 손으로 눌러야** 했다.

핵심 진단은 **하나의 `Apply Sync` 버튼이 성격이 다른 두 행위를 섞고 있다**는 것이다:

| 행위 | 성격 | 사람이 필요한가 |
|---|---|---|
| **등록(Register)** — 코드의 견본을 DB/런타임이 알게 함 | 기계적·결정적·되돌릴 수 있음 | ❌ 이미 PR 리뷰 + CI 를 통과한 코드다 |
| **공개(Publish)** — 사용자에게 노출(`active`) | 외부로 나가는 의미 있는 결정 | ✅ 단, 그 결정은 **머지** 시점에 이미 내려진다 |

게이트가 거꾸로 걸려 있었다 — 코드에서 확인했듯 강한 권한(`canPublishTemplates`)이 **기계적인 등록**(`actions.ts:167`)을 막고, 정작 의미 있는 **공개 토글**은 admin 역할이면 통과했다.

## 결정

기본 모델은 제안서의 **A안**(등록 자동, 공개는 코드/머지로)을 채택하되, 그릴링으로 다음 6개 가지를 확정했다.

### 1. 카탈로그 source of truth = DB 행을 유지 (B안 기각)

카탈로그는 계속 `templates` 테이블을 읽는다. **운영 상태(공개/내림·노출 순서·이름)는 배포 없이 바꿀 수 있어야** 하므로(특히 새벽 긴급 takedown), 런타임에서 변경 가능한 DB 계층이 필요하다. 경계: **Template 자체(디자인·구조) = 코드가 진실**(ADR-0002), **운영 상태 = DB 가 진실**.

### 2. `status` 는 순수 DB 소유, CREATE 기본값 = `active`

- 프리셋에 `status`/`initialStatus` 필드를 두지 **않는다**(제안서의 "코드에 status 필드" 안 기각 — 매번 sync 가 덮어써 takedown 을 되살리는 모순).
- sync CREATE 시 신규 행을 **`active`** 로 만든다(기존 `'draft'` 하드코딩을 변경). 근거: Template 은 이미 개발 → 로컬 검증 → PR → 리뷰 → 머지 → 배포를 거친다. **머지 자체가 공개 승인**이므로 별도 status 변경 단계가 불필요하다.
- sync **UPDATE 는 status 를 절대 건드리지 않는다**(현행 유지). 이로써 운영 토글이 이후 sync 에도 살아남는다.

### 3. 등록 시점 = 프로덕션 배포 **성공 직후** (머지 직후 아님)

카드(DB 행)와 렌더러 코드(번들)는 분리돼 있다. 머지 직후 등록하면 **"카드는 떴는데 렌더러는 아직 배포 안 됨"** 창이 열려 사용자 클릭 시 크래시한다. 따라서 **코드가 먼저 라이브 → 그다음 등록** 순서를 이벤트로 보장한다.

- 트리거: 보호된 등록 엔드포인트 `POST /api/admin/sync-templates`(Bearer `TEMPLATE_SYNC_SECRET` + `createAdminClient`, `thumbnailBaseUrl=SITE_URL`). **구현된 배선**(`.github/workflows/register-templates.yml`): GitHub Actions `deployment_status` 이벤트 — Vercel Git 연동이 프로덕션 배포 성공 시 GitHub Deployment 상태를 `success`로 갱신하면, 워크플로가 `environment_url`로 엔드포인트를 curl. (Vercel 네이티브 웹훅은 커스텀 `Authorization` 헤더를 못 실어 Bearer 엔드포인트와 안 맞으므로 deployment_status 경로를 택함. GH Actions secret `TEMPLATE_SYNC_SECRET` = Vercel env 동일값.)
- **프리뷰 배포는 절대 prod DB 에 쓰지 않는다**(프로덕션 배포만 트리거).
- **키 분리**: GitHub Actions = **검문소(검증)만**, prod service role 키 없음. DB 쓰기는 Vercel 서버 런타임(이미 키 보유)에서만.

### 4. CI 검증을 진짜 차단 게이트로 (자동화의 신뢰 전제)

- **`schema-jsx-consistency` 의 array 거짓 양성을 고친다**(끄거나 warn 으로 강등하지 않음 — 이건 CI 만 잡는 가장 가치 있는 "스키마↔화면 어긋남" 검사다). `type === 'array'` 필드는 스칼라 `getFieldValue` 를 요구하지 않고, `itemSchema` 키를 항목 레벨 참조 검증 대상으로 끌어온다(`scripts/lib/validate-and-capture.ts:232` 근방).
- CI 의 PR 워크플로 = `tsc + eslint + template:verify --skip-capture`. 통과 못 하면 머지 차단.
- 썸네일은 **저작 시 로컬에서 캡처 → repo 에 커밋**, CI 는 `thumbnail-path` 로 **파일 존재만 확인**(CI 에서 재캡처하지 않음 — 브라우저/dev 서버 의존을 피함).

### 5. 권한: `canPublishTemplates` 를 등록 게이트 → **운영 공개/내림 토글** 게이트로 재배치

- **첫 공개** = GitHub **머지 권한**이 자연스러운 게이트(코드가 라이브로 가면 active). 별도 status 단계 없음.
- **운영 중 공개/내림/보관(takedown·재공개)** = 런타임 토글, `canPublishTemplates` 로 게이트. 배포 불필요.
- **게이트 정밀 규칙**(구현, `admin/templates/actions.ts`): status 를 **`active`(공개) 또는 `archived`(명시적 보관)** 로 바꾸는 것만 `canPublishTemplates` 요구 — `draft` 저장(콘텐츠 편집·숨김)은 admin 누구나 허용(노출이 아니라 숨김이라 저위험·복구가능). 가드 대상 액션: `activate`/`archive`/`revertToDraft`/`update(status=active|archived)`/`create(status=active)`. UI 도 동일하게 리스트 토글 + 에디터 "Deploy" 버튼을 `canPublish` 로 가린다(서버가 보안 경계, UI 는 정합성).
- ADR-0006 은 유지하되 그 권한이 막는 대상이 **"Apply Sync(등록)" → "라이브 status 토글"** 로 이동한다(스코프 재정의, ADR-0006 에 포인터 추가).
- 어드민 수동 sync UI 는 **비상용 "강제 재동기화(Force re-sync)"로 축소**(웹훅 실패 등), 멱등, `canPublishTemplates` 게이트.

### 6. 안전 가드 (자동화의 안전벨트)

- **피해 반경 한정**: 사용자 사이트는 생성 시 `structuredClone` 으로 `content`(구 siteJson) 를 깊은 복사하므로(ADR-0007 흐름), 나쁜 Template UPDATE 의 피해는 **카탈로그 카드 + 신규 인스턴스화**로 한정되고 기존 라이브 사이트엔 번지지 않는다.
- **CREATE 썸네일 필수 가드**: 첫 공개가 곧장 `active` 이므로, CREATE 에서 썸네일(배포된 public URL 에서 fetch → `template-thumbnails` 버킷 업로드)을 못 구하면 **등록을 실패시킨다**(썸네일 없는 카드를 라이브로 내보내지 않음). UPDATE 는 현행 가드(기존 썸네일 유지) 유지.
- **롤백 2레인**:
  - (1) **빠른 숨김** = `status` → `archived` 토글(배포 불필요). 결정 2 에 의해 이후 sync 가 되살리지 않음.
  - (2) **내용 복구** = **git revert + 재배포**. sync 는 version 단조 증가가 아니라 **"json/version/thumbnail 이 다르면 적용"** 이므로(`sync.ts:177`), revert 가 그대로 롤백으로 동작한다.
- **가드를 깨지지 않게 박는다**: ① `types.ts` 의 "version exceeds the DB version" 주석을 **현실("어떤 diff 든 적용 — 그래서 revert 롤백이 가능")에 맞게 정정**하고 그 의도를 명시(미래에 단조 가드로 '고쳐서' revert 롤백을 깨뜨리는 것 방지). ② **"archived/draft 로 내린 Template 은 이후 sync UPDATE 가 절대 재활성화하지 않는다"** 회귀 테스트 추가.

### 썸네일 흐름 (정리)

1. **저작(로컬):** capture → `public/thumbnails/<key>.webp` 생성 → **커밋**.
2. **CI:** `verify --skip-capture` → 파일 존재만 확인.
3. **등록(sync, 배포 후 엔드포인트):** 배포된 **공개 URL**(`https://<deploy>/thumbnails/<key>.webp`)에서 **fetch** → `template-thumbnails` 버킷 업로드 → DB `thumbnail_url` 저장. (서버리스 함수에서 `public/` 디스크 읽기가 불확실하므로 `fs.readFileSync` → `fetch` 로 변경. 버킷은 유지 — 어드민 커스텀 썸네일 자리 + 안정 URL.)

## Consequences

- 사람 손이 **4번(어드민 로그인 → Sync → Apply → active 토글) → 1번(머지)** 으로 준다. 머지 후 배포가 끝나면 카탈로그에 `active` 로 자동 등장.
- 자동 등록의 안전은 **CI 검증이 진짜 차단 게이트**라는 전제에 달려 있다 → schema-jsx array 거짓 양성 수정이 **선행 필수**.
- default 가 `active` 라 위험 방향이 "실수로 미공개" → "실수로 조기 공개"로 뒤집힌다. 방어: 준비될 때까지 머지하지 않음(사람 통제) + CREATE 썸네일 필수 가드(기계 통제) + 머지 후 어드민 draft 토글(사후 통제).
- ADR-0002("코드가 진실")와 충돌하지 않는다 — 사람이 DB JSON 을 손으로 만드는 경로를 늘리지 않고 오히려 줄인다.
- **구현 완료(2026-06-28, PR #97 머지·프로덕션 배포됨):** schema-jsx 게이트 수정, sync 변경, 등록 엔드포인트(`/api/admin/sync-templates`), CI 워크플로(`ci.yml` + `register-templates.yml`), 권한 재배치, 롤백 가드. 운영 설정만 별도: `TEMPLATE_SYNC_SECRET` 을 GitHub Actions secret + Vercel env 에 **동일값**으로 설정(완료). `template_sync_audit` 감사 로그 유지.

## 관련

- 잇는 결정: [ADR-0002](./0002-templates-source-of-truth-is-code.md)(코드 = source of truth), [ADR-0006](./0006-canpublishtemplates-separate-from-admin.md)(canPublishTemplates 분리 — 스코프 재정의), [ADR-0007](./0007-single-multi-site-type-structural-union.md)(`content` 깊은 복사 = 피해 반경 한정).
- 저작 단계: `new-template` 스킬, `docs/TEMPLATE_SYSTEM.md`.
