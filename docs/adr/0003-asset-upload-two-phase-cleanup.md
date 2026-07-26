# Asset 업로드는 Reserve-Confirm + 일일 orphan cleanup (현재 무료 플랜 제약)

> **Status: Accepted — 구현 완료.** `initUploadAction`/`confirmUploadAction` (에디터 Server Actions) + `/api/cron/cleanup-assets` 일일 크론.

> 파일명에 남은 `two-phase` 는 작성 시점 용어. 정확한 명칭은 **Reserve-Confirm** (init = reserve, confirm = activate). 분산 트랜잭션 프로토콜인 2-Phase Commit (2PC) 과는 다르다.

이미지 업로드는 `initUploadAction` (pending row 생성) → 클라이언트가 Supabase Storage 에 직접 업로드 → `confirmUploadAction` (row 를 active 로 마킹) 의 **Reserve-Confirm 패턴**을 쓴다. 네트워크 단절·세션 만료·창 닫힘 등으로 발생하는 orphan 파일 정리를 *전제로 한* 설계이다.

orphan cleanup 은 `/api/cron/cleanup-assets` 가 `sweep_orphaned_assets` 와 `claim_cleanup_task` RPC 를 호출하는 방식으로 처리한다.

## Constraint

현재 β 환경은 Vercel Hobby (무료) 플랜의 **1 cron/day** 제약을 받아, cleanup 은 매일 03:00 UTC 에 한 번만 실행된다. 즉 최대 24h 동안 orphan 파일이 storage 에 남을 수 있다.

## Future direction

유료 플랜 전환 시 더 잦은 주기 (예: 시간당) 로 올리는 게 자연스러운 다음 단계. cron 스케줄을 바꾸는 것 외에 코드 변경은 필요 없도록 설계됨.
