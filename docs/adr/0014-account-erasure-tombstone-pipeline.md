# Account Erasure 는 Tombstone 을 먼저 남기는 원자적 커밋 지점 + 재개 가능한 파이프라인

계정 삭제는 DB·Storage·Auth 세 시스템에 걸친 비가역 연산이라 단일 트랜잭션으로 표현할 수 없다. 그래서 **커밋 지점 하나**(요청 기록 + 행 삭제 + **Tombstone** 발행을 한 트랜잭션에 묶음)를 정의하고, 나머지(스토리지 드레인 → auth principal 파기)는 그 뒤에 오는 **멱등·재개 가능한 단계**로 둔다. 커밋 지점을 통과한 순간 사용자는 잠기고 Site 는 어두워지며, 이후 단계가 아직 안 돌았어도 그 사실은 변하지 않는다.

## 배경 — 무엇이 실제로 깨져 있었나

`deleteAccountAction` 은 admin 클라이언트로 `user_sites` / `assets` 행을 직접 지우고 `auth.admin.deleteUser` 를 호출했다. 여기서 두 가지가 동시에 일어났다.

1. **스토리지 영구 누수.** `sweep_orphaned_assets` (migration 008) 는 `public.assets` 를 스캔해서 고아를 찾는다. 행이 **먼저** 사라지면 그 에셋은 영원히 청소 대상이 되지 못한다. cron 은 asset 행에서 경로를 조립하므로(`/api/cron/cleanup-assets` (C)) 행이 없으면 경로를 복원할 방법도 없다. `user_assets` 는 public 버킷이라, 파기했다고 알린 사용자의 이미지가 URL 을 아는 사람에게 계속 열려 있었다.
2. **관리자 계정의 부분 파괴.** `templates.created_by` (001) 와 `template_sync_audit.performed_by` (011) 는 `auth.users` 를 참조하면서 `ON DELETE` 규칙이 없다. 템플릿을 발행한 적 있는 계정을 삭제하면 앞의 두 DELETE 는 커밋된 뒤 `auth.admin.deleteUser` 만 FK 위반으로 실패한다 → 사이트와 에셋은 사라지고 계정은 살아있으며 UI 는 `UNKNOWN` 만 띄운다.

핵심은 이게 "삭제 경로에 설계 예산을 덜 줬다"가 아니라는 점이다. 단일 Site 삭제 경로(`SupabaseUserSiteRepo.delete`)는 **정확했다** — 행을 지우면 `asset_usages` 가 CASCADE 되고, 에셋은 고아가 되고, sweep 이 찾아내고, cron 이 스토리지를 지운다. 시스템 전체가 **"asset 행은 자기 스토리지 객체보다 오래 산다"** 는 불변식 위에 서 있었고, 계정 삭제는 그 불변식을 깬 유일한 지점이었다.

그리고 그 불변식은 이름이 없었다. 도메인 모델에 "죽어야 할 Asset" 을 가리키는 말이 없어서 코드가 대용품을 발명했다 — *"`asset_usages` 에 참조가 없는 행"*. 이 개념은 **행이 있는 동안에만 존재한다.** 행이 사라지면 개념이 증발한다. 결함의 뿌리는 예산이 아니라 **어휘 공백**이다.

## 결정

### 1. Tombstone — 참조하던 행보다 오래 사는 파기 기록

스토리지 경로만 담고 asset 을 참조하지 않는 별도 테이블을 두고, `assets` 에 `BEFORE DELETE` 트리거를 걸어 행이 사라지기 **전에** 경로를 복사해 넣는다. 이로써 "행이 없는데 파일은 있다" 는 상태를 모델이 처음으로 표현할 수 있게 된다.

기존 `cleanup_queue` 를 확장하지 않은 이유: `cleanup_queue.asset_id` 는 `assets` 를 `ON DELETE CASCADE` 로 참조한다(006:37). **큐가 자기가 지울 대상에 의존하고 있어서**, asset 행이 죽으면 큐 항목도 같이 죽는다. 재사용하려면 FK 와 UNIQUE 를 둘 다 약화시켜야 했다.

### 2. 불변식은 규약이 아니라 DB 가 강제한다

Tombstone 이 트리거로 선기록되므로 `assets.user_id` / `user_sites.user_id` 에 `ON DELETE CASCADE` 를 **안전하게** 붙일 수 있다. 앞으로 어떤 코드 경로가 asset 행을 지우든 — 계정 삭제든, 미래에 누가 새로 짜는 경로든 — 스토리지는 새지 않는다. 이 결함을 만든 건 "규약을 안 지킨 코드" 였으므로, 규약을 지킬 필요 자체를 없애는 것이 재발 방지다.

**주의 — 트리거 없이 CASCADE 만 붙이면 이 버그의 DB 판이 된다.** auth 사용자 삭제가 asset 행을 조용히 쓸어버리고 스토리지는 또 고아가 된다. 순서가 본질이다: 트리거가 먼저, CASCADE 는 그 다음.

감사 성격의 FK 는 CASCADE 가 아니라 **`ON DELETE SET NULL`** 로 간다 (`templates.created_by`, `template_sync_audit.performed_by` — 둘 다 nullable). 사용자는 사라져도 "이 템플릿이 언제 발행됐는가" 라는 기록은 남아야 한다.

### 3. 인라인 즉시 파기 + 큐는 안전망

Storage 경로가 `${user_id}/${asset_id}/${filename}` — 사용자별 프리픽스라, 한 사용자의 전 자산은 재귀 `list` 1회 + 배치 `remove` 1회로 지워진다. 그래서 파기는 Server Action 안에서 즉시 시도하고, 큐는 **실패했을 때만** 동작하는 안전망으로 둔다.

순수 비동기(예약만 하고 워커에 위임)를 택하지 않은 이유는 워커 처리량이다: `claim_cleanup_task` 는 `LIMIT 1` (008:31), 라우트는 `claimData[0]` 하나만 처리하고 리턴하며, cron 은 하루 1회다(`vercel.json`). 즉 **전 시스템 통틀어 에셋 1건/일**. 에셋 50개짜리 계정이면 파기에 50일이 걸린다 — "삭제했다"고 말할 수 없는 수치다. 이 처리량 미달은 계정 삭제와 **무관하게** 이미 존재하는 문제이므로 워커 배치화를 같은 작업에 포함한다.

### 4. 유예 기간은 내부 전용

사용자 관점에서 Erasure 는 버튼을 누르는 순간 끝이다. 복구 창을 노출하지 않는다 — 그건 버그 수정이 아니라 제품 기능이고, 로그인 가드·복원 액션·사이트 재공개·이메일 재사용 정책을 전부 끌고 온다. 나중에 같은 `account_deletions` 레코드 위에 얹을 수 있게 레코드를 seam 으로 남겨둔다.

### 5. 잠금은 `app_metadata.deletedAt`

정상 경로에서 auth 행 생존 시간은 0초지만, 후속 단계가 실패하면 다음 cron 까지 최대 24시간 살아있다. 그 창에서 다른 기기로 로그인하면 반쯤 파괴된 계정을 보게 된다. 커밋 지점에서 `app_metadata.deletedAt` 을 박고 기존 가드에서 읽는다 — `getCurrentUser()` 가 이미 `cache()` 로 요청당 1회 user 객체를 가져오므로(`src/lib/auth/current-user.ts`) **추가 DB 왕복이 0회**이고, `getUser()` 는 서버 검증이라 묵은 JWT 가 통과하지 못한다.

Supabase ban API (`ban_duration`) 도 후보였으나 이 설계에서 불필요하고, 로컬 `node_modules` 에 타입이 번들되어 있지 않아 존재 여부를 확인하지 못했다.

### 6. 오케스트레이션은 도메인 계층

`DeleteAccountUseCase` 와 `createDeleteAccountUseCase` 는 **호출자 0건인 죽은 코드**였고 액션이 아키텍처를 통째로 우회했다. 전용 포트로 재작성해 되살린다. 순서(스토리지 먼저, auth 마지막)가 회귀하면 안 되는 비즈니스 규칙이므로 `src/domain/__tests__/fakes.ts` 의 인메모리 페이크로 검증 가능해야 한다.

## Consequences

- **마이그레이션이 프로덕션 스키마를 건드린다** (트리거 + FK 규칙 변경). 되돌리는 비용이 있다.
- 안전망 최대 지연은 여전히 24시간 — Vercel Hobby 의 1 cron/일 제약은 배치화로 완화될 뿐 제거되지 않는다 ([ADR-0003](./0003-asset-upload-two-phase-cleanup.md) 과 같은 제약).
- 이미 누적된 고아는 자동으로 회수되지 않는다. `user_assets` 최상위 프리픽스 ↔ `auth.users` ↔ `assets` 3방향 대조로 두 종류의 고아(계정 삭제로 샌 것 / 다른 경로로 샌 것)를 분리 보고하는 일회성 dry-run 스크립트가 별도로 필요하다. 저장소의 기존 관례(`template:sync` 기본 dry-run, `buildDeletePlan`)를 따른다.
- Tombstone 드레인이 반복 실패할 때의 알림 경로가 없다 (현재 `console.error` 뿐). 미해결.
